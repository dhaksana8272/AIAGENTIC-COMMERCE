from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as DBSession
from sqlalchemy import desc

from db.database import get_db
from db.models import Order

router = APIRouter(prefix="/orders", tags=["orders"])


# @router.get("")
# def list_orders(session_id: str | None = None, limit: int = 50, db: DBSession = Depends(get_db)):
#     """
#     Used for the buyer's purchase history panel. Pass session_id to scope
#     the history to a single buyer session (there's no separate auth/user
#     system in this build, so the browser session is the unit of "buyer").
#     """
#     q = db.query(Order).order_by(desc(Order.created_at))
#     if session_id:
#         q = q.filter(Order.session_id == session_id)
#     orders = q.limit(limit).all()
#     return [
#         {
#             "id": o.id,
#             "session_id": o.session_id,
#             "razorpay_order_id": o.razorpay_order_id,
#             "razorpay_payment_link_id": o.razorpay_payment_link_id,
#             "amount_inr": o.amount_inr,
#             "items_json": o.items_json,
#             "status": o.status,
#             "created_at": o.created_at.isoformat() if o.created_at else None,
#         }
#         for o in orders
#     ]
@router.get("")
def list_orders(session_id: str | None = None, user_id: str | None = None, limit: int = 50, db: DBSession = Depends(get_db)):
    """
    Used for the buyer's purchase history panel. Prefer user_id — it's
    tied to the account and persists across sessions/devices. session_id
    remains supported for backward compatibility / merchant-side lookups.
    """
    q = db.query(Order).order_by(desc(Order.created_at))
    if user_id:
        q = q.filter(Order.user_id == user_id)
    elif session_id:
        q = q.filter(Order.session_id == session_id)
    orders = q.limit(limit).all()
    return [
        {
            "id": o.id,
            "session_id": o.session_id,
            "user_id": o.user_id,
            "razorpay_order_id": o.razorpay_order_id,
            "razorpay_payment_link_id": o.razorpay_payment_link_id,
            "amount_inr": o.amount_inr,
            "items_json": o.items_json,
            "status": o.status,
            "created_at": o.created_at.isoformat() if o.created_at else None,
        }
        for o in orders
    ]