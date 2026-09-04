# """
# The ONLY router that actually moves toward a real Razorpay call.
# Flow:
#   1. POST /checkout/propose   -> policy-checks the cart total, writes an
#                                   audit row, returns whether human confirm
#                                   is needed.
#   2. POST /checkout/confirm   -> buyer clicks "Approve" in the UI; only
#                                   then do we call razorpay_client (MCP,
#                                   falling back to SDK) and update the
#                                   audit + order rows.
# """
# import json
# import os
# from typing import Optional
# from fastapi import APIRouter, Depends, HTTPException
# from pydantic import BaseModel
# from sqlalchemy.orm import Session as DBSession

# from db.database import get_db
# from db.models import Session as SessionModel, AuditLog, Order
# from policy.engine import check_action, POLICY
# from agent.reasoning import generate_reasoning
# from razorpay_client import mcp_client, sdk_client

# router = APIRouter(prefix="/checkout", tags=["checkout"])

# _COUPONS_PATH = os.path.join(os.path.dirname(__file__), "..", "policy", "coupons.json")


# class ProposeRequest(BaseModel):
#     session_id: str
#     amount_inr: float
#     items: list  # [{sku, name, quantity, price_inr}, ...]


# class ConfirmRequest(BaseModel):
#     session_id: str
#     audit_id: str


# class SimulateDeclineRequest(BaseModel):
#     session_id: str
#     amount_inr: float


# @router.post("/propose")
# async def propose_checkout(req: ProposeRequest, db: DBSession = Depends(get_db)):
#     session = db.query(SessionModel).filter(SessionModel.id == req.session_id).first()
#     if not session:
#         raise HTTPException(404, "Session not found")

#     reasoning = await generate_reasoning(
#         "create_payment_link", {"amount_inr": req.amount_inr, "items": req.items}
#     )
#     policy_result = check_action(
#         "create_payment_link", {"amount_inr": req.amount_inr}, session.txn_count
#     )

#     audit = AuditLog(
#         session_id=session.id,
#         action_type="create_payment_link",
#         proposed_params_json=json.dumps({"amount_inr": req.amount_inr, "items": req.items}),
#         agent_reasoning_text=reasoning,
#         policy_check_result=policy_result.code,
#         razorpay_call_made=False,
#         final_status="blocked" if not policy_result.allowed else "pending_confirmation",
#     )
#     db.add(audit)
#     db.commit()
#     db.refresh(audit)

#     return {
#         "audit_id": audit.id,
#         "allowed": policy_result.allowed,
#         "requires_confirmation": policy_result.requires_confirmation,
#         "reason": policy_result.reason,
#         "reasoning": reasoning,
#     }


# @router.post("/confirm")
# async def confirm_checkout(req: ConfirmRequest, db: DBSession = Depends(get_db)):
#     session = db.query(SessionModel).filter(SessionModel.id == req.session_id).first()
#     audit = db.query(AuditLog).filter(AuditLog.id == req.audit_id).first()
#     if not session or not audit:
#         raise HTTPException(404, "Session or audit entry not found")

#     params = json.loads(audit.proposed_params_json)
#     amount = params["amount_inr"]

#     try:
#         result = await mcp_client.call_tool(
#             "create_payment_link",
#             {"amount_inr": amount, "description": f"Order for session {session.id}"},
#         )
#         audit.razorpay_call_made = True
#         audit.razorpay_response_json = json.dumps(result)
#         audit.policy_check_result = "approved:human"
#         audit.final_status = "success"

#         raw = result.get("raw", {})
#         short_url = None
#         plink_id = None
#         rzp_order_id = None
#         if isinstance(raw, dict):
#             short_url = raw.get("short_url")
#             plink_id = raw.get("id")  # e.g. "plink_..." — needed to check status later
#             rzp_order_id = raw.get("order_id")  # populated only if Razorpay attaches one to this link

#         order = Order(
#             session_id=session.id,
#             user_id=session.user_id,
#             amount_inr=amount,
#             items_json=json.dumps(params.get("items", [])),
#             status="created",
#             razorpay_payment_link_id=plink_id,
#             razorpay_order_id=rzp_order_id,
#         )
#         db.add(order)
#         session.txn_count += 1
#         db.commit()

#         return {
#             "status": "success",
#             "path_used": result.get("_path"),
#             "payment_link": short_url,
#             "raw": raw,
#             "order_id": order.id,
#         }
#     except Exception as e:
#         audit.razorpay_call_made = True
#         audit.final_status = "failed"
#         audit.razorpay_response_json = json.dumps({"error": str(e)})
#         db.commit()
#         raise HTTPException(502, f"Payment link creation failed: {e}")


# @router.post("/simulate-decline")
# async def simulate_decline(req: SimulateDeclineRequest, db: DBSession = Depends(get_db)):
#     """
#     Demo helper: forces the documented Razorpay test-mode failure path so
#     you can show the agent handling a decline gracefully instead of
#     crashing. Use Razorpay's published always-fails test card at the
#     payment step (card number 4000 0000 0000 0002 in test mode).
#     """
#     session = db.query(SessionModel).filter(SessionModel.id == req.session_id).first()
#     if not session:
#         raise HTTPException(404, "Session not found")

#     reasoning = await generate_reasoning("simulate_decline", {"amount_inr": req.amount_inr})
#     audit = AuditLog(
#         session_id=session.id,
#         action_type="simulate_decline",
#         proposed_params_json=json.dumps({"amount_inr": req.amount_inr}),
#         agent_reasoning_text=reasoning,
#         policy_check_result="allowed",
#         razorpay_call_made=True,
#         razorpay_response_json=json.dumps({"error": "card_declined", "reason": "insufficient_funds (simulated)"}),
#         final_status="failed",
#     )
#     db.add(audit)
#     db.commit()

#     return {
#         "status": "failed",
#         "message": (
#             "Your card was declined by the bank (test-mode simulated decline). "
#             "This is a temporary issue with the payment method, not with your order — "
#             "your cart is still saved. Would you like to try a different card, or retry?"
#         ),
#         "audit_id": audit.id,
#     }


# class CouponRequest(BaseModel):
#     code: str
#     subtotal_inr: float


# @router.post("/validate-coupon")
# def validate_coupon(req: CouponRequest):
#     """
#     Buyer-facing coupon check. The discount actually applied is capped by
#     the merchant's live `max_discount_pct_agent_can_apply` policy value
#     (editable on the merchant Discounts page) — a coupon can never grant
#     more than the merchant currently allows the agent to discount.
#     """
#     try:
#         with open(_COUPONS_PATH, "r") as f:
#             coupons = json.load(f)
#     except (FileNotFoundError, json.JSONDecodeError):
#         coupons = {}

#     code = req.code.strip().upper()
#     entry = coupons.get(code)
#     if not entry:
#         return {"valid": False, "message": "That coupon code isn't valid."}

#     cap = POLICY.get("max_discount_pct_agent_can_apply", 0)
#     discount_pct = min(entry["discount_pct"], cap)
#     discount_inr = round(req.subtotal_inr * discount_pct / 100, 2)

#     if discount_pct <= 0:
#         return {"valid": False, "message": "Discounts are currently disabled by the merchant."}

#     capped_note = " (capped by current store policy)" if discount_pct < entry["discount_pct"] else ""
#     return {
#         "valid": True,
#         "code": code,
#         "discount_pct": discount_pct,
#         "discount_inr": discount_inr,
#         "message": f"Applied {code}: {discount_pct}% off{capped_note}.",
#     }


# # ---------------------------------------------------------------------------
# # Payment outcome tracking.
# #
# # Razorpay Payment Links don't push a "this specific attempt failed" event
# # to your app unless you have a public webhook URL configured (ngrok + the
# # RAZORPAY_WEBHOOK_SECRET env var) — see webhook.py. Rather than leave the
# # buyer stuck on a spinner if that isn't set up, /order-status actively
# # asks Razorpay for the link's current state (works with just API keys,
# # no webhook needed), and /report-payment-result lets the buyer tell us
# # directly what happened as a guaranteed-to-work fallback either way.
# # ---------------------------------------------------------------------------

# @router.get("/order-status/{order_id}")
# async def order_status(order_id: str, db: DBSession = Depends(get_db)):
#     order = db.query(Order).filter(Order.id == order_id).first()
#     if not order:
#         raise HTTPException(404, "Order not found")

#     if order.status == "created" and order.razorpay_payment_link_id:
#         try:
#             link = sdk_client.fetch_payment_link(order.razorpay_payment_link_id)
#             razorpay_status = link.get("status")  # "created" | "paid" | "cancelled" | "expired"
#             if razorpay_status == "paid":
#                 order.status = "paid"
#                 db.commit()
#             elif razorpay_status in ("cancelled", "expired"):
#                 order.status = "failed"
#                 db.commit()
#         except Exception:
#             pass  # credentials not configured yet, or a transient network error — keep last known status

#     return {"order_id": order.id, "status": order.status}


# class PaymentResultRequest(BaseModel):
#     order_id: str
#     success: bool
#     reason: Optional[str] = None


# _FRIENDLY_DECLINE_REASONS = {
#     "insufficient_funds": "The card had insufficient funds.",
#     "card_declined": "The card was declined by the issuing bank.",
#     "expired_card": "The card has expired.",
#     "incorrect_cvv": "The CVV entered didn't match.",
#     "processing_error": "The bank had a temporary processing error.",
# }


# @router.post("/report-payment-result")
# def report_payment_result(req: PaymentResultRequest, db: DBSession = Depends(get_db)):
#     """
#     Buyer-facing self-report, used once they return from the Razorpay
#     checkout page.

#     IMPORTANT — the frontend's claim is never trusted on its own to mark an
#     order PAID. The only things that can flip an order to "paid" are:
#       1. The Razorpay webhook (webhook.py), which is the authoritative,
#          signature-verified source of truth, or
#       2. A live check against Razorpay itself via the SDK (the same check
#          /order-status performs) — i.e. we ask Razorpay, not the buyer.

#     So a `success=True` report here does NOT set status directly. It just
#     triggers an immediate live verification with Razorpay and returns
#     whatever the *real* status is. If Razorpay hasn't confirmed the
#     payment yet, the order stays "created" and the buyer is told to wait
#     for automatic confirmation — closing the "frontend says success, so
#     we mark it paid" hole.

#     A `success=False` report (buyer says the payment failed/was cancelled)
#     is safe to accept directly: it can only end an already-uncaptured
#     attempt so the buyer can retry, and can never cause funds to be
#     considered captured when they weren't.
#     """
#     order = db.query(Order).filter(Order.id == req.order_id).first()
#     if not order:
#         raise HTTPException(404, "Order not found")

#     if not req.success:
#         if order.status == "created":
#             order.status = "failed"
#             db.commit()

#         audit = AuditLog(
#             session_id=order.session_id,
#             action_type="payment_result",
#             proposed_params_json=json.dumps({"order_id": order.id, "amount_inr": order.amount_inr, "reason": req.reason}),
#             agent_reasoning_text=f"Buyer reported payment failure for order {order.id}.",
#             policy_check_result="reported:failed",
#             razorpay_call_made=False,
#             final_status="failed",
#         )
#         db.add(audit)
#         db.commit()

#         friendly = _FRIENDLY_DECLINE_REASONS.get((req.reason or "").lower())
#         detail = f" {friendly}" if friendly else ""
#         return {
#             "status": "failed",
#             "message": (
#                 f"Payment wasn't completed. No money was captured.{detail} "
#                 "Your cart is still saved, so you can retry checkout whenever you're ready."
#             ),
#         }

#     # req.success == True: verify directly with Razorpay before trusting it.
#     verified_status = order.status
#     if order.status == "created" and order.razorpay_payment_link_id:
#         try:
#             link = sdk_client.fetch_payment_link(order.razorpay_payment_link_id)
#             razorpay_status = link.get("status")
#             if razorpay_status == "paid":
#                 order.status = "paid"
#                 db.commit()
#             elif razorpay_status in ("cancelled", "expired"):
#                 order.status = "failed"
#                 db.commit()
#             verified_status = order.status
#         except Exception:
#             pass  # transient/network error — leave status as-is, webhook/polling will catch up

#     audit = AuditLog(
#         session_id=order.session_id,
#         action_type="payment_result",
#         proposed_params_json=json.dumps({"order_id": order.id, "amount_inr": order.amount_inr, "reason": req.reason}),
#         agent_reasoning_text=(
#             f"Buyer reported payment success for order {order.id}; "
#             f"verified against Razorpay as '{verified_status}'."
#         ),
#         policy_check_result=f"reported:success:verified:{verified_status}",
#         razorpay_call_made=True,
#         final_status=verified_status,
#     )
#     db.add(audit)
#     db.commit()

#     if verified_status == "paid":
#         return {"status": "paid", "message": "Payment confirmed — thanks for your order!"}
#     if verified_status == "failed":
#         return {
#             "status": "failed",
#             "message": (
#                 "Razorpay shows this payment link as cancelled or expired, so no money was captured. "
#                 "Your cart is still saved — you can retry checkout whenever you're ready."
#             ),
#         }
#     return {
#         "status": verified_status,
#         "message": (
#             "We haven't received confirmation from Razorpay yet. This can take a few seconds — "
#             "we'll update automatically the moment it's verified, so no need to report again."
#         ),
#     }



# """
# The ONLY router that actually moves toward a real Razorpay call.
# Flow:
#   1. POST /checkout/propose   -> policy-checks the cart total, writes an
#                                   audit row, returns whether human confirm
#                                   is needed.
#   2. POST /checkout/confirm   -> buyer clicks "Approve" in the UI; only
#                                   then do we call razorpay_client (MCP,
#                                   falling back to SDK) and update the
#                                   audit + order rows.
# """
# import json
# import os
# from typing import Optional
# from fastapi import APIRouter, Depends, HTTPException
# from pydantic import BaseModel
# from sqlalchemy.orm import Session as DBSession

# from db.database import get_db
# from db.models import Session as SessionModel, AuditLog, Order
# from policy.engine import check_action, POLICY
# from agent.reasoning import generate_reasoning
# from razorpay_client import mcp_client, sdk_client

# router = APIRouter(prefix="/checkout", tags=["checkout"])

# _COUPONS_PATH = os.path.join(os.path.dirname(__file__), "..", "policy", "coupons.json")


# class ProposeRequest(BaseModel):
#     session_id: str
#     amount_inr: float
#     items: list  # [{sku, name, quantity, price_inr}, ...]


# class ConfirmRequest(BaseModel):
#     session_id: str
#     audit_id: str


# class SimulateDeclineRequest(BaseModel):
#     session_id: str
#     amount_inr: float


# @router.post("/propose")
# async def propose_checkout(req: ProposeRequest, db: DBSession = Depends(get_db)):
#     session = db.query(SessionModel).filter(SessionModel.id == req.session_id).first()
#     if not session:
#         raise HTTPException(404, "Session not found")

#     reasoning = await generate_reasoning(
#         "create_payment_link", {"amount_inr": req.amount_inr, "items": req.items}
#     )
#     policy_result = check_action(
#         "create_payment_link", {"amount_inr": req.amount_inr}, session.txn_count
#     )

#     audit = AuditLog(
#         session_id=session.id,
#         action_type="create_payment_link",
#         proposed_params_json=json.dumps({"amount_inr": req.amount_inr, "items": req.items}),
#         agent_reasoning_text=reasoning,
#         policy_check_result=policy_result.code,
#         razorpay_call_made=False,
#         final_status="blocked" if not policy_result.allowed else "pending_confirmation",
#     )
#     db.add(audit)
#     db.commit()
#     db.refresh(audit)

#     return {
#         "audit_id": audit.id,
#         "allowed": policy_result.allowed,
#         "requires_confirmation": policy_result.requires_confirmation,
#         "reason": policy_result.reason,
#         "reasoning": reasoning,
#     }


# @router.post("/confirm")
# async def confirm_checkout(req: ConfirmRequest, db: DBSession = Depends(get_db)):
#     session = db.query(SessionModel).filter(SessionModel.id == req.session_id).first()
#     audit = db.query(AuditLog).filter(AuditLog.id == req.audit_id).first()
#     if not session or not audit:
#         raise HTTPException(404, "Session or audit entry not found")

#     params = json.loads(audit.proposed_params_json)
#     amount = params["amount_inr"]

#     try:
#         result = await mcp_client.call_tool(
#             "create_payment_link",
#             {"amount_inr": amount, "description": f"Order for session {session.id}"},
#         )
#         audit.razorpay_call_made = True
#         audit.razorpay_response_json = json.dumps(result)
#         audit.policy_check_result = "approved:human"
#         audit.final_status = "success"

#         raw = result.get("raw", {})
#         short_url = None
#         plink_id = None
#         if isinstance(raw, dict):
#             short_url = raw.get("short_url")
#             plink_id = raw.get("id")  # e.g. "plink_..." — needed to check status later

#         order = Order(
#             session_id=session.id,
#             user_id=session.user_id,
#             amount_inr=amount,
#             items_json=json.dumps(params.get("items", [])),
#             status="created",
#             razorpay_payment_link_id=plink_id,
#         )
#         db.add(order)
#         session.txn_count += 1
#         db.commit()

#         return {
#             "status": "success",
#             "path_used": result.get("_path"),
#             "payment_link": short_url,
#             "raw": raw,
#             "order_id": order.id,
#         }
#     except Exception as e:
#         audit.razorpay_call_made = True
#         audit.final_status = "failed"
#         audit.razorpay_response_json = json.dumps({"error": str(e)})
#         db.commit()
#         raise HTTPException(502, f"Payment link creation failed: {e}")


# @router.post("/simulate-decline")
# async def simulate_decline(req: SimulateDeclineRequest, db: DBSession = Depends(get_db)):
#     """
#     Demo helper: forces the documented Razorpay test-mode failure path so
#     you can show the agent handling a decline gracefully instead of
#     crashing. Use Razorpay's published always-fails test card at the
#     payment step (card number 4000 0000 0000 0002 in test mode).
#     """
#     session = db.query(SessionModel).filter(SessionModel.id == req.session_id).first()
#     if not session:
#         raise HTTPException(404, "Session not found")

#     reasoning = await generate_reasoning("simulate_decline", {"amount_inr": req.amount_inr})
#     audit = AuditLog(
#         session_id=session.id,
#         action_type="simulate_decline",
#         proposed_params_json=json.dumps({"amount_inr": req.amount_inr}),
#         agent_reasoning_text=reasoning,
#         policy_check_result="allowed",
#         razorpay_call_made=True,
#         razorpay_response_json=json.dumps({"error": "card_declined", "reason": "insufficient_funds (simulated)"}),
#         final_status="failed",
#     )
#     db.add(audit)
#     db.commit()

#     return {
#         "status": "failed",
#         "message": (
#             "Your card was declined by the bank (test-mode simulated decline). "
#             "This is a temporary issue with the payment method, not with your order — "
#             "your cart is still saved. Would you like to try a different card, or retry?"
#         ),
#         "audit_id": audit.id,
#     }


# class CouponRequest(BaseModel):
#     code: str
#     subtotal_inr: float


# @router.post("/validate-coupon")
# def validate_coupon(req: CouponRequest):
#     """
#     Buyer-facing coupon check. The discount actually applied is capped by
#     the merchant's live `max_discount_pct_agent_can_apply` policy value
#     (editable on the merchant Discounts page) — a coupon can never grant
#     more than the merchant currently allows the agent to discount.
#     """
#     try:
#         with open(_COUPONS_PATH, "r") as f:
#             coupons = json.load(f)
#     except (FileNotFoundError, json.JSONDecodeError):
#         coupons = {}

#     code = req.code.strip().upper()
#     entry = coupons.get(code)
#     if not entry:
#         return {"valid": False, "message": "That coupon code isn't valid."}

#     cap = POLICY.get("max_discount_pct_agent_can_apply", 0)
#     discount_pct = min(entry["discount_pct"], cap)
#     discount_inr = round(req.subtotal_inr * discount_pct / 100, 2)

#     if discount_pct <= 0:
#         return {"valid": False, "message": "Discounts are currently disabled by the merchant."}

#     capped_note = " (capped by current store policy)" if discount_pct < entry["discount_pct"] else ""
#     return {
#         "valid": True,
#         "code": code,
#         "discount_pct": discount_pct,
#         "discount_inr": discount_inr,
#         "message": f"Applied {code}: {discount_pct}% off{capped_note}.",
#     }


# # ---------------------------------------------------------------------------
# # Payment outcome tracking.
# #
# # Razorpay Payment Links don't push a "this specific attempt failed" event
# # to your app unless you have a public webhook URL configured (ngrok + the
# # RAZORPAY_WEBHOOK_SECRET env var) — see webhook.py. Rather than leave the
# # buyer stuck on a spinner if that isn't set up, /order-status actively
# # asks Razorpay for the link's current state (works with just API keys,
# # no webhook needed), and /report-payment-result lets the buyer tell us
# # directly what happened as a guaranteed-to-work fallback either way.
# # ---------------------------------------------------------------------------

# @router.get("/order-status/{order_id}")
# async def order_status(order_id: str, db: DBSession = Depends(get_db)):
#     order = db.query(Order).filter(Order.id == order_id).first()
#     if not order:
#         raise HTTPException(404, "Order not found")

#     if order.status == "created" and order.razorpay_payment_link_id:
#         try:
#             link = sdk_client.fetch_payment_link(order.razorpay_payment_link_id)
#             razorpay_status = link.get("status")  # "created" | "paid" | "cancelled" | "expired"
#             if razorpay_status == "paid":
#                 order.status = "paid"
#                 db.commit()
#             elif razorpay_status in ("cancelled", "expired"):
#                 order.status = "failed"
#                 db.commit()
#         except Exception:
#             pass  # credentials not configured yet, or a transient network error — keep last known status

#     return {"order_id": order.id, "status": order.status}


# class PaymentResultRequest(BaseModel):
#     order_id: str
#     success: bool
#     reason: Optional[str] = None


# _FRIENDLY_DECLINE_REASONS = {
#     "insufficient_funds": "The card had insufficient funds.",
#     "card_declined": "The card was declined by the issuing bank.",
#     "expired_card": "The card has expired.",
#     "incorrect_cvv": "The CVV entered didn't match.",
#     "processing_error": "The bank had a temporary processing error.",
# }


# @router.post("/report-payment-result")
# def report_payment_result(req: PaymentResultRequest, db: DBSession = Depends(get_db)):
#     """Buyer-facing self-report, used once they return from the Razorpay
#     checkout page. This is the reliable path in local dev where a public
#     webhook URL usually isn't configured yet."""
#     order = db.query(Order).filter(Order.id == req.order_id).first()
#     if not order:
#         raise HTTPException(404, "Order not found")

#     order.status = "paid" if req.success else "failed"
#     db.commit()

#     session = db.query(SessionModel).filter(SessionModel.id == order.session_id).first()
#     audit = AuditLog(
#         session_id=order.session_id if session else order.session_id,
#         action_type="payment_result",
#         proposed_params_json=json.dumps({"order_id": order.id, "amount_inr": order.amount_inr, "reason": req.reason}),
#         agent_reasoning_text=f"Buyer reported payment {'success' if req.success else 'failure'} for order {order.id}.",
#         policy_check_result="reported:success" if req.success else "reported:failed",
#         razorpay_call_made=False,
#         final_status="success" if req.success else "failed",
#     )
#     db.add(audit)
#     db.commit()

#     if req.success:
#         return {"status": "paid", "message": "Payment confirmed — thanks for your order!"}

#     friendly = _FRIENDLY_DECLINE_REASONS.get((req.reason or "").lower())
#     detail = f" {friendly}" if friendly else ""
#     return {
#         "status": "failed",
#         "message": (
#             f"Payment didn't go through.{detail} This is an issue with the payment "
#             "method, not your order — your cart is still saved, so you can try again "
#             "with a different card or payment method whenever you're ready."
#         ),
#     }



"""
The ONLY router that actually moves toward a real Razorpay call.
Flow:
  1. POST /checkout/propose   -> policy-checks the cart total, writes an
                                  audit row, returns whether human confirm
                                  is needed.
  2. POST /checkout/confirm   -> buyer clicks "Approve" in the UI; only
                                  then do we call razorpay_client (MCP,
                                  falling back to SDK) and update the
                                  audit + order rows.
"""
import json
import os
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session as DBSession

from db.database import get_db
from db.models import Session as SessionModel, AuditLog, Order
from policy.engine import check_action, POLICY
from agent.reasoning import generate_reasoning
from razorpay_client import mcp_client, sdk_client
from services.order_fulfillment import mark_order_paid

router = APIRouter(prefix="/checkout", tags=["checkout"])

_COUPONS_PATH = os.path.join(os.path.dirname(__file__), "..", "policy", "coupons.json")


class ProposeRequest(BaseModel):
    session_id: str
    amount_inr: float
    items: list  # [{sku, name, quantity, price_inr}, ...]


class ConfirmRequest(BaseModel):
    session_id: str
    audit_id: str


class SimulateDeclineRequest(BaseModel):
    session_id: str
    amount_inr: float


@router.post("/propose")
async def propose_checkout(req: ProposeRequest, db: DBSession = Depends(get_db)):
    session = db.query(SessionModel).filter(SessionModel.id == req.session_id).first()
    if not session:
        raise HTTPException(404, "Session not found")

    reasoning = await generate_reasoning(
        "create_payment_link", {"amount_inr": req.amount_inr, "items": req.items}
    )
    policy_result = check_action(
        "create_payment_link", {"amount_inr": req.amount_inr}, session.txn_count
    )

    audit = AuditLog(
        session_id=session.id,
        action_type="create_payment_link",
        proposed_params_json=json.dumps({"amount_inr": req.amount_inr, "items": req.items}),
        agent_reasoning_text=reasoning,
        policy_check_result=policy_result.code,
        razorpay_call_made=False,
        final_status="blocked" if not policy_result.allowed else "pending_confirmation",
    )
    db.add(audit)
    db.commit()
    db.refresh(audit)

    return {
        "audit_id": audit.id,
        "allowed": policy_result.allowed,
        "requires_confirmation": policy_result.requires_confirmation,
        "reason": policy_result.reason,
        "reasoning": reasoning,
    }


@router.post("/confirm")
async def confirm_checkout(req: ConfirmRequest, db: DBSession = Depends(get_db)):
    session = db.query(SessionModel).filter(SessionModel.id == req.session_id).first()
    audit = db.query(AuditLog).filter(AuditLog.id == req.audit_id).first()
    if not session or not audit:
        raise HTTPException(404, "Session or audit entry not found")

    params = json.loads(audit.proposed_params_json)
    amount = params["amount_inr"]

    try:
        result = await mcp_client.call_tool(
            "create_payment_link",
            {"amount_inr": amount, "description": f"Order for session {session.id}"},
        )
        audit.razorpay_call_made = True
        audit.razorpay_response_json = json.dumps(result)
        audit.policy_check_result = "approved:human"
        audit.final_status = "success"

        raw = result.get("raw", {})
        short_url = None
        plink_id = None
        rzp_order_id = None
        if isinstance(raw, dict):
            short_url = raw.get("short_url")
            plink_id = raw.get("id")  # e.g. "plink_..." — needed to check status later
            rzp_order_id = raw.get("order_id")  # populated only if Razorpay attaches one to this link

        order = Order(
            session_id=session.id,
            user_id=session.user_id,
            amount_inr=amount,
            items_json=json.dumps(params.get("items", [])),
            status="created",
            razorpay_payment_link_id=plink_id,
            razorpay_order_id=rzp_order_id,
        )
        db.add(order)
        session.txn_count += 1
        db.commit()

        return {
            "status": "success",
            "path_used": result.get("_path"),
            "payment_link": short_url,
            "raw": raw,
            "order_id": order.id,
        }
    except Exception as e:
        audit.razorpay_call_made = True
        audit.final_status = "failed"
        audit.razorpay_response_json = json.dumps({"error": str(e)})
        db.commit()
        raise HTTPException(502, f"Payment link creation failed: {e}")


@router.post("/simulate-decline")
async def simulate_decline(req: SimulateDeclineRequest, db: DBSession = Depends(get_db)):
    """
    Demo helper: forces the documented Razorpay test-mode failure path so
    you can show the agent handling a decline gracefully instead of
    crashing. Use Razorpay's published always-fails test card at the
    payment step (card number 4000 0000 0000 0002 in test mode).
    """
    session = db.query(SessionModel).filter(SessionModel.id == req.session_id).first()
    if not session:
        raise HTTPException(404, "Session not found")

    reasoning = await generate_reasoning("simulate_decline", {"amount_inr": req.amount_inr})
    audit = AuditLog(
        session_id=session.id,
        action_type="simulate_decline",
        proposed_params_json=json.dumps({"amount_inr": req.amount_inr}),
        agent_reasoning_text=reasoning,
        policy_check_result="allowed",
        razorpay_call_made=True,
        razorpay_response_json=json.dumps({"error": "card_declined", "reason": "insufficient_funds (simulated)"}),
        final_status="failed",
    )
    db.add(audit)
    db.commit()

    return {
        "status": "failed",
        "message": (
            "Your card was declined by the bank (test-mode simulated decline). "
            "This is a temporary issue with the payment method, not with your order — "
            "your cart is still saved. Would you like to try a different card, or retry?"
        ),
        "audit_id": audit.id,
    }


class CouponRequest(BaseModel):
    code: str
    subtotal_inr: float


@router.post("/validate-coupon")
def validate_coupon(req: CouponRequest):
    """
    Buyer-facing coupon check. The discount actually applied is capped by
    the merchant's live `max_discount_pct_agent_can_apply` policy value
    (editable on the merchant Discounts page) — a coupon can never grant
    more than the merchant currently allows the agent to discount.
    """
    try:
        with open(_COUPONS_PATH, "r") as f:
            coupons = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        coupons = {}

    code = req.code.strip().upper()
    entry = coupons.get(code)
    if not entry:
        return {"valid": False, "message": "That coupon code isn't valid."}

    cap = POLICY.get("max_discount_pct_agent_can_apply", 0)
    discount_pct = min(entry["discount_pct"], cap)
    discount_inr = round(req.subtotal_inr * discount_pct / 100, 2)

    if discount_pct <= 0:
        return {"valid": False, "message": "Discounts are currently disabled by the merchant."}

    capped_note = " (capped by current store policy)" if discount_pct < entry["discount_pct"] else ""
    return {
        "valid": True,
        "code": code,
        "discount_pct": discount_pct,
        "discount_inr": discount_inr,
        "message": f"Applied {code}: {discount_pct}% off{capped_note}.",
    }


# ---------------------------------------------------------------------------
# Payment outcome tracking.
#
# Razorpay Payment Links don't push a "this specific attempt failed" event
# to your app unless you have a public webhook URL configured (ngrok + the
# RAZORPAY_WEBHOOK_SECRET env var) — see webhook.py. Rather than leave the
# buyer stuck on a spinner if that isn't set up, /order-status actively
# asks Razorpay for the link's current state (works with just API keys,
# no webhook needed), and /report-payment-result lets the buyer tell us
# directly what happened as a guaranteed-to-work fallback either way.
# ---------------------------------------------------------------------------

@router.get("/order-status/{order_id}")
async def order_status(order_id: str, db: DBSession = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(404, "Order not found")

    if order.status == "created" and order.razorpay_payment_link_id:
        try:
            link = sdk_client.fetch_payment_link(order.razorpay_payment_link_id)
            razorpay_status = link.get("status")  # "created" | "paid" | "cancelled" | "expired"
            if razorpay_status == "paid":
                # Same idempotent path the webhook uses — decrements stock
                # exactly once (only now, on confirmed payment) and writes
                # one audit row, never a duplicate if the webhook already
                # beat this poll to it.
                mark_order_paid(
                    db, order, source="order_status_poll",
                    note=f"Live Razorpay check confirmed payment link {order.razorpay_payment_link_id} as paid.",
                )
            elif razorpay_status in ("cancelled", "expired"):
                order.status = "failed"
                db.commit()
        except Exception:
            pass  # credentials not configured yet, or a transient network error — keep last known status

    return {"order_id": order.id, "status": order.status}


class PaymentResultRequest(BaseModel):
    order_id: str
    success: bool
    reason: Optional[str] = None


_FRIENDLY_DECLINE_REASONS = {
    "insufficient_funds": "The card had insufficient funds.",
    "card_declined": "The card was declined by the issuing bank.",
    "expired_card": "The card has expired.",
    "incorrect_cvv": "The CVV entered didn't match.",
    "processing_error": "The bank had a temporary processing error.",
}


@router.post("/report-payment-result")
def report_payment_result(req: PaymentResultRequest, db: DBSession = Depends(get_db)):
    """
    Buyer-facing self-report, used once they return from the Razorpay
    checkout page.

    IMPORTANT — the frontend's claim is never trusted on its own to mark an
    order PAID. The only things that can flip an order to "paid" are:
      1. The Razorpay webhook (webhook.py), which is the authoritative,
         signature-verified source of truth, or
      2. A live check against Razorpay itself via the SDK (the same check
         /order-status performs) — i.e. we ask Razorpay, not the buyer.

    So a `success=True` report here does NOT set status directly. It just
    triggers an immediate live verification with Razorpay and returns
    whatever the *real* status is. If Razorpay hasn't confirmed the
    payment yet, the order stays "created" and the buyer is told to wait
    for automatic confirmation — closing the "frontend says success, so
    we mark it paid" hole.

    A `success=False` report (buyer says the payment failed/was cancelled)
    is safe to accept directly: it can only end an already-uncaptured
    attempt so the buyer can retry, and can never cause funds to be
    considered captured when they weren't.
    """
    order = db.query(Order).filter(Order.id == req.order_id).first()
    if not order:
        raise HTTPException(404, "Order not found")

    if not req.success:
        if order.status == "created":
            order.status = "failed"
            db.commit()

        audit = AuditLog(
            session_id=order.session_id,
            action_type="payment_result",
            proposed_params_json=json.dumps({"order_id": order.id, "amount_inr": order.amount_inr, "reason": req.reason}),
            agent_reasoning_text=f"Buyer reported payment failure for order {order.id}.",
            policy_check_result="reported:failed",
            razorpay_call_made=False,
            final_status="failed",
        )
        db.add(audit)
        db.commit()

        friendly = _FRIENDLY_DECLINE_REASONS.get((req.reason or "").lower())
        detail = f" {friendly}" if friendly else ""
        return {
            "status": "failed",
            "message": (
                f"Payment wasn't completed. No money was captured.{detail} "
                "Your cart is still saved, so you can retry checkout whenever you're ready."
            ),
        }

    # req.success == True: verify directly with Razorpay before trusting it.
    verified_status = order.status
    already_paid_via_mark = False
    if order.status == "created" and order.razorpay_payment_link_id:
        try:
            link = sdk_client.fetch_payment_link(order.razorpay_payment_link_id)
            razorpay_status = link.get("status")
            if razorpay_status == "paid":
                # Same idempotent path the webhook uses. This also writes
                # its own audit row, so we skip the generic one below to
                # avoid double-logging a single confirmation.
                mark_order_paid(
                    db, order, source="report_payment_result_verify",
                    note=(
                        f"Buyer reported payment success for order {order.id}; "
                        f"live Razorpay check confirmed the payment link as paid."
                    ),
                )
                already_paid_via_mark = True
            elif razorpay_status in ("cancelled", "expired"):
                order.status = "failed"
                db.commit()
            verified_status = order.status
        except Exception:
            pass  # transient/network error — leave status as-is, webhook/polling will catch up

    if not already_paid_via_mark:
        audit = AuditLog(
            session_id=order.session_id,
            action_type="payment_result",
            proposed_params_json=json.dumps({"order_id": order.id, "amount_inr": order.amount_inr, "reason": req.reason}),
            agent_reasoning_text=(
                f"Buyer reported payment success for order {order.id}; "
                f"verified against Razorpay as '{verified_status}'."
            ),
            policy_check_result=f"reported:success:verified:{verified_status}",
            razorpay_call_made=True,
            final_status=verified_status,
        )
        db.add(audit)
        db.commit()

    if verified_status == "paid":
        return {"status": "paid", "message": "Payment confirmed — thanks for your order!"}
    if verified_status == "failed":
        return {
            "status": "failed",
            "message": (
                "Razorpay shows this payment link as cancelled or expired, so no money was captured. "
                "Your cart is still saved — you can retry checkout whenever you're ready."
            ),
        }
    return {
        "status": verified_status,
        "message": (
            "We haven't received confirmation from Razorpay yet. This can take a few seconds — "
            "we'll update automatically the moment it's verified, so no need to report again."
        ),
    }
