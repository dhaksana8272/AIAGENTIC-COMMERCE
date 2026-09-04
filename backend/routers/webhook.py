# """
# Receives Razorpay test-mode webhook events (payment_link.paid, etc).
# Requires a public URL during local dev — use ngrok and paste the
# forwarding URL into your Razorpay Dashboard > Webhooks config.
# """
# import os
# import hmac
# import hashlib
# import json
# from fastapi import APIRouter, Request, Header, HTTPException
# from sqlalchemy.orm import Session as DBSession

# from db.database import SessionLocal
# from db.models import Order, AuditLog

# router = APIRouter(prefix="/webhook", tags=["webhook"])

# WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET", "")

# FAILURE_MESSAGE = "Payment wasn't completed. No money was captured. You can retry checkout whenever you're ready."


# def _verify_signature(body: bytes, signature: str) -> None:
#     """Raises HTTPException unless the request is a genuinely valid,
#     signed Razorpay webhook. There is NO fallback path: a missing secret
#     on the server, a missing signature header on the request, or a
#     signature that doesn't match are all treated as rejections. A missing
#     secret must never be silently treated as "allow" — that would let
#     anyone POST a fake payment_link.paid and have it trusted.
#     """
#     if not WEBHOOK_SECRET:
#         # Server misconfiguration — RAZORPAY_WEBHOOK_SECRET must be set
#         # before this endpoint can accept any traffic at all.
#         raise HTTPException(503, "Webhook secret is not configured on the server; refusing to process webhook.")
#     if not signature:
#         raise HTTPException(400, "Missing X-Razorpay-Signature header.")
#     expected = hmac.new(WEBHOOK_SECRET.encode(), body, hashlib.sha256).hexdigest()
#     if not hmac.compare_digest(expected, signature):
#         raise HTTPException(400, "Invalid webhook signature.")


# def _log_status_change(db: DBSession, order: Order, event: str, new_status: str, note: str):
#     """Every webhook-driven status change gets its own audit row — this is
#     what lets a merchant (or buyer, via /audit) see *why* an order flipped
#     to paid/failed, not just that it did."""
#     audit = AuditLog(
#         session_id=order.session_id,
#         action_type="payment_status_update",
#         proposed_params_json=json.dumps({"order_id": order.id, "amount_inr": order.amount_inr, "razorpay_event": event}),
#         agent_reasoning_text=note,
#         policy_check_result=f"webhook:{new_status}",
#         razorpay_call_made=False,
#         final_status=new_status,
#     )
#     db.add(audit)


# @router.post("/razorpay")
# async def razorpay_webhook(request: Request, x_razorpay_signature: str = Header(default="")):
#     body = await request.body()
#     _verify_signature(body, x_razorpay_signature)  # raises on any failure — no fallback

#     payload = json.loads(body)
#     event = payload.get("event", "")

#     db: DBSession = SessionLocal()
#     try:
#         if event == "payment_link.paid":
#             plink_id = payload["payload"]["payment_link"]["entity"]["id"]
#             order = db.query(Order).filter(Order.razorpay_payment_link_id == plink_id).first()
#             if order and order.status != "paid":
#                 order.status = "paid"
#                 _log_status_change(db, order, event, "paid", f"Razorpay confirmed payment for payment link {plink_id}.")
#                 db.commit()

#         elif event in ("payment_link.cancelled", "payment_link.expired"):
#             plink_id = payload["payload"]["payment_link"]["entity"]["id"]
#             order = db.query(Order).filter(Order.razorpay_payment_link_id == plink_id).first()
#             if order and order.status == "created":
#                 order.status = "failed"
#                 _log_status_change(db, order, event, "failed", f"Payment link {plink_id} was {event.split('.')[-1]} before payment.")
#                 db.commit()

#         elif event == "payment.failed":
#             # Best-effort: a failed payment attempt is reported at the
#             # payment level, not the payment-link level, and Razorpay's
#             # exact field name for the associated link can vary by API
#             # version — this checks the couple of places it's commonly
#             # found. If it doesn't match your account's actual payload
#             # (check Razorpay Dashboard > Webhooks > this event's log),
#             # /checkout/order-status and /checkout/report-payment-result
#             # are the reliable paths that don't depend on this at all.
#             entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
#             plink_id = entity.get("payment_link_id") or entity.get("notes", {}).get("payment_link_id")
#             error_desc = entity.get("error_description") or entity.get("error_reason") or "declined by the bank"
#             if plink_id:
#                 order = db.query(Order).filter(Order.razorpay_payment_link_id == plink_id).first()
#                 if order and order.status == "created":
#                     order.status = "failed"
#                     _log_status_change(db, order, event, "failed", f"Payment attempt failed: {error_desc}.")
#                     db.commit()

#         return {"status": "ok"}
#     finally:
#         db.close()


"""
Receives Razorpay test-mode webhook events (payment_link.paid, etc).
Requires a public URL during local dev — use ngrok and paste the
forwarding URL into your Razorpay Dashboard > Webhooks config.

This is the authoritative source of truth for "an order is paid" — see
services/order_fulfillment.py for the idempotent stock-decrement + audit
logic shared with the (non-authoritative) live-verification paths in
checkout.py.
"""
import os
import hmac
import hashlib
import json
from fastapi import APIRouter, Request, Header, HTTPException
from sqlalchemy.orm import Session as DBSession
from sqlalchemy.exc import IntegrityError

from db.database import SessionLocal
from db.models import Order, AuditLog, WebhookEvent
from services.order_fulfillment import mark_order_paid

router = APIRouter(prefix="/webhook", tags=["webhook"])

WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET", "")

FAILURE_MESSAGE = "Payment wasn't completed. No money was captured. You can retry checkout whenever you're ready."


def _verify_signature(body: bytes, signature: str) -> None:
    """Raises HTTPException unless the request is a genuinely valid,
    signed Razorpay webhook. There is NO fallback path: a missing secret
    on the server, a missing signature header on the request, or a
    signature that doesn't match are all treated as rejections. A missing
    secret must never be silently treated as "allow" — that would let
    anyone POST a fake payment_link.paid and have it trusted.
    """
    if not WEBHOOK_SECRET:
        # Server misconfiguration — RAZORPAY_WEBHOOK_SECRET must be set
        # before this endpoint can accept any traffic at all.
        raise HTTPException(503, "Webhook secret is not configured on the server; refusing to process webhook.")
    if not signature:
        raise HTTPException(400, "Missing X-Razorpay-Signature header.")
    expected = hmac.new(WEBHOOK_SECRET.encode(), body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, signature):
        raise HTTPException(400, "Invalid webhook signature.")


def _webhook_event_key(request: Request, body: bytes) -> str:
    """
    Idempotency key for this delivery. Prefers Razorpay's own event id
    header when present (some webhook payload versions send
    X-Razorpay-Event-Id); falls back to a hash of the verified raw body,
    since a genuine retry of the same event redelivers byte-identical
    payload content. Either way, two deliveries of "the same event" map
    to the same key.
    """
    explicit_id = request.headers.get("x-razorpay-event-id")
    if explicit_id:
        return explicit_id
    return hashlib.sha256(body).hexdigest()


def _log_failed_status(db: DBSession, order: Order, event: str, note: str):
    """Failure-side status transitions (cancelled/expired/payment.failed)
    are simpler than the paid path — no stock was ever decremented for a
    non-paid order, so there's nothing to roll back, just the status flip
    and one audit row."""
    if order.status != "created":
        return  # already resolved (paid, or already marked failed) — no-op
    order.status = "failed"
    audit = AuditLog(
        session_id=order.session_id,
        action_type="payment_status_update",
        proposed_params_json=json.dumps({"order_id": order.id, "amount_inr": order.amount_inr, "razorpay_event": event}),
        agent_reasoning_text=note,
        policy_check_result="webhook:failed",
        razorpay_call_made=False,
        final_status="failed",
    )
    db.add(audit)
    db.commit()


@router.post("/razorpay")
async def razorpay_webhook(request: Request, x_razorpay_signature: str = Header(default="")):
    body = await request.body()
    _verify_signature(body, x_razorpay_signature)  # raises on any failure — no fallback

    event_key = _webhook_event_key(request, body)

    db: DBSession = SessionLocal()
    try:
        # --- Idempotency gate -------------------------------------------------
        # Recorded BEFORE any order/stock/audit mutation. The primary key
        # on webhook_events.id doubles as a DB-level unique constraint, so
        # even two concurrent deliveries of the same event racing each
        # other can't both get past this: whichever INSERT loses the race
        # hits an IntegrityError and is treated as "already processed"
        # rather than being allowed to re-run side effects.
        if db.query(WebhookEvent).filter(WebhookEvent.id == event_key).first():
            return {"status": "already_processed", "event_id": event_key}

        payload = json.loads(body)
        event = payload.get("event", "")

        try:
            db.add(WebhookEvent(id=event_key, event_type=event))
            db.commit()
        except IntegrityError:
            db.rollback()
            return {"status": "already_processed", "event_id": event_key}

        # --- Event processing ---------------------------------------------
        if event == "payment_link.paid":
            plink_id = payload["payload"]["payment_link"]["entity"]["id"]
            order = db.query(Order).filter(Order.razorpay_payment_link_id == plink_id).first()
            if order:
                mark_order_paid(
                    db, order, source="webhook",
                    note=f"Razorpay confirmed payment for payment link {plink_id} (event {event_key}).",
                )

        elif event in ("payment_link.cancelled", "payment_link.expired"):
            plink_id = payload["payload"]["payment_link"]["entity"]["id"]
            order = db.query(Order).filter(Order.razorpay_payment_link_id == plink_id).first()
            if order:
                _log_failed_status(
                    db, order, event,
                    f"Payment link {plink_id} was {event.split('.')[-1]} before payment.",
                )

        elif event == "payment.failed":
            # Best-effort: a failed payment attempt is reported at the
            # payment level, not the payment-link level, and Razorpay's
            # exact field name for the associated link can vary by API
            # version — this checks the couple of places it's commonly
            # found. If it doesn't match your account's actual payload
            # (check Razorpay Dashboard > Webhooks > this event's log),
            # /checkout/order-status and /checkout/report-payment-result
            # are the reliable paths that don't depend on this at all.
            entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
            plink_id = entity.get("payment_link_id") or entity.get("notes", {}).get("payment_link_id")
            error_desc = entity.get("error_description") or entity.get("error_reason") or "declined by the bank"
            if plink_id:
                order = db.query(Order).filter(Order.razorpay_payment_link_id == plink_id).first()
                if order:
                    _log_failed_status(db, order, event, f"Payment attempt failed: {error_desc}.")

        return {"status": "ok", "event_id": event_key}
    finally:
        db.close()