"""
Single, shared place where an Order actually gets marked "paid".

Three different code paths can learn that a payment succeeded — the
Razorpay webhook (authoritative), a live /order-status check against the
Razorpay SDK, and the buyer's "I completed payment" self-report (which
itself only trusts a live Razorpay check, not the buyer's word — see
checkout.py). All three must have IDENTICAL, IDEMPOTENT behavior:

  - Stock is only ever decremented on confirmed payment, never on
    payment-link creation.
  - Stock is decremented exactly once per order, floored at 0 (never
    negative), no matter how many times/paths call this.
  - Exactly one audit row is written for the transition, not one per call.

Centralizing this avoids three near-identical (and easy to accidentally
diverge) copies of "decrement stock + write audit" scattered across
webhook.py and checkout.py.
"""
import json
from sqlalchemy.orm import Session as DBSession

from db.models import Order, CatalogItem, AuditLog


def mark_order_paid(db: DBSession, order: Order, source: str, note: str) -> bool:
    """
    Idempotently transitions `order` to status="paid".

    Returns True if this call performed the transition (i.e. it was the
    first confirmation for this order), False if the order was already
    fully settled (status paid AND stock already decremented) and this
    call was a no-op duplicate. Callers can use the return value to avoid
    writing their own duplicate side effects (e.g. duplicate frontend
    notifications) on top of this.
    """
    already_settled = order.status == "paid" and order.stock_decremented
    if already_settled:
        return False

    order.status = "paid"

    if not order.stock_decremented:
        try:
            items = json.loads(order.items_json or "[]")
        except (json.JSONDecodeError, TypeError):
            items = []

        for item in items:
            sku = item.get("sku") if isinstance(item, dict) else None
            try:
                qty = int(item.get("quantity", 0))
            except (TypeError, ValueError, AttributeError):
                qty = 0
            if not sku or qty <= 0:
                continue
            catalog_item = db.query(CatalogItem).filter(CatalogItem.sku == sku).first()
            if catalog_item:
                # Floor at 0 — a confirmed payment must never be allowed to
                # push recorded stock negative, even if concurrent orders
                # or a manual catalog edit already ate into it.
                catalog_item.stock = max(0, catalog_item.stock - qty)

        order.stock_decremented = True

    audit = AuditLog(
        session_id=order.session_id,
        action_type="payment_status_update",
        proposed_params_json=json.dumps({
            "order_id": order.id,
            "amount_inr": order.amount_inr,
            "source": source,
        }),
        agent_reasoning_text=note,
        policy_check_result=f"{source}:paid",
        razorpay_call_made=(source != "webhook"),
        final_status="paid",
    )
    db.add(audit)
    db.commit()
    return True