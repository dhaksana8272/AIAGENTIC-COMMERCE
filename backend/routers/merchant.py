# """
# Everything the merchant dashboard needs, all backed by real rows in the
# same database the buyer-side chat/checkout flow writes to — no mock data.

#   GET  /merchant/stats                 headline cards (revenue, orders, ...)
#   GET  /merchant/sales-overview        daily revenue series for the chart
#   GET  /merchant/top-categories        revenue share by category (donut)
#   GET  /merchant/insights              rule-based "AI insights" (deterministic,
#                                         not an LLM call — see note below)
#   GET  /merchant/products              catalog with search/filter/pagination
#   POST /merchant/products              add a product
#   PUT  /merchant/products/{sku}        edit a product
#   DELETE /merchant/products/{sku}      remove a product
#   GET  /merchant/customers             buyers derived from Order/User rows
#   GET  /merchant/agent/status          live agent status + audit counters
#   GET  /merchant/agent/policy          current bounds the agent operates under
#   PUT  /merchant/agent/policy          edit those bounds (takes effect immediately)
# """
# import datetime as dt
# import json
# from collections import defaultdict
# from typing import Optional, List

# from fastapi import APIRouter, Depends, HTTPException, Query
# from pydantic import BaseModel
# from sqlalchemy.orm import Session as DBSession
# from sqlalchemy import desc

# from db.database import get_db
# from db.models import Order, Session as SessionModel, AuditLog, CatalogItem, User
# from policy.engine import POLICY, update_policy
# from agent.intent_parser import OLLAMA_MODEL, OLLAMA_URL

# router = APIRouter(prefix="/merchant", tags=["merchant"])

# LOW_STOCK_THRESHOLD = 20


# # ---------------------------------------------------------------------------
# # helpers
# # ---------------------------------------------------------------------------

# def _period_bounds(days: int):
#     now = dt.datetime.utcnow()
#     start = now - dt.timedelta(days=days)
#     prev_start = start - dt.timedelta(days=days)
#     return prev_start, start, now


# def _pct_change(current: float, previous: float) -> Optional[float]:
#     if previous <= 0:
#         return None if current == 0 else 100.0
#     return round((current - previous) / previous * 100, 1)


# def _order_items(order: Order) -> list:
#     try:
#         return json.loads(order.items_json or "[]")
#     except (json.JSONDecodeError, TypeError):
#         return []


# def _product_status(item: CatalogItem) -> str:
#     if item.stock <= 0:
#         return "inactive"
#     if item.stock <= LOW_STOCK_THRESHOLD:
#         return "low_stock"
#     return "active"


# # ---------------------------------------------------------------------------
# # dashboard stat cards
# # ---------------------------------------------------------------------------

# @router.get("/stats")
# def get_stats(days: int = 30, db: DBSession = Depends(get_db)):
#     prev_start, start, now = _period_bounds(days)

#     cur_orders = db.query(Order).filter(Order.created_at >= start).all()
#     prev_orders = db.query(Order).filter(Order.created_at >= prev_start, Order.created_at < start).all()

#     cur_revenue = sum(o.amount_inr for o in cur_orders)
#     prev_revenue = sum(o.amount_inr for o in prev_orders)

#     cur_sessions = db.query(SessionModel).filter(SessionModel.created_at >= start).count()
#     prev_sessions = db.query(SessionModel).filter(
#         SessionModel.created_at >= prev_start, SessionModel.created_at < start
#     ).count()

#     cur_customers = {o.user_id or o.session_id for o in cur_orders}
#     prev_customers = {o.user_id or o.session_id for o in prev_orders}

#     cur_conversion = (len(cur_orders) / cur_sessions * 100) if cur_sessions else 0.0
#     prev_conversion = (len(prev_orders) / prev_sessions * 100) if prev_sessions else 0.0

#     cur_aov = (cur_revenue / len(cur_orders)) if cur_orders else 0.0
#     prev_aov = (prev_revenue / len(prev_orders)) if prev_orders else 0.0

#     return {
#         "period_days": days,
#         "revenue": {"value": round(cur_revenue, 2), "change_pct": _pct_change(cur_revenue, prev_revenue)},
#         "orders_completed": {"value": len(cur_orders), "change_pct": _pct_change(len(cur_orders), len(prev_orders))},
#         "active_customers": {"value": len(cur_customers), "change_pct": _pct_change(len(cur_customers), len(prev_customers))},
#         "conversion_rate": {"value": round(cur_conversion, 1), "change_pct": _pct_change(cur_conversion, prev_conversion)},
#         "aov": {"value": round(cur_aov, 2), "change_pct": _pct_change(cur_aov, prev_aov)},
#     }


# @router.get("/sales-overview")
# def sales_overview(days: int = 30, db: DBSession = Depends(get_db)):
#     _, start, now = _period_bounds(days)
#     orders = db.query(Order).filter(Order.created_at >= start).all()

#     daily = defaultdict(float)
#     for o in orders:
#         key = (o.created_at or now).strftime("%Y-%m-%d")
#         daily[key] += o.amount_inr

#     points = []
#     for i in range(days, -1, -1):
#         day = (now - dt.timedelta(days=i)).strftime("%Y-%m-%d")
#         points.append({"date": day, "revenue": round(daily.get(day, 0.0), 2)})
#     return {"points": points}


# @router.get("/top-categories")
# def top_categories(days: int = 30, db: DBSession = Depends(get_db)):
#     _, start, _ = _period_bounds(days)
#     orders = db.query(Order).filter(Order.created_at >= start).all()
#     catalog_by_sku = {c.sku: c for c in db.query(CatalogItem).all()}

#     revenue_by_cat = defaultdict(float)
#     for o in orders:
#         for it in _order_items(o):
#             cat_item = catalog_by_sku.get(it.get("sku"))
#             category = cat_item.category if cat_item else it.get("category", "other")
#             revenue_by_cat[category] += float(it.get("price_inr", 0)) * int(it.get("quantity", 1))

#     total = sum(revenue_by_cat.values())
#     rows = [
#         {"category": cat, "revenue": round(rev, 2), "pct": round(rev / total * 100, 1) if total else 0}
#         for cat, rev in sorted(revenue_by_cat.items(), key=lambda kv: kv[1], reverse=True)
#     ]
#     return {"categories": rows, "total_revenue": round(total, 2)}


# @router.get("/insights")
# def insights(days: int = 30, db: DBSession = Depends(get_db)):
#     """
#     Deterministic, data-derived talking points (no LLM call — kept
#     reliable/fast for a dashboard that loads on every visit). Each
#     insight is only returned when the underlying data actually supports
#     it, so an empty list is a valid response on a quiet store.
#     """
#     prev_start, start, now = _period_bounds(days)
#     cur = top_categories(days=days, db=db)["categories"]
#     prev = top_categories(days=days * 2, db=db)["categories"]  # rough prior-window proxy
#     prev_by_cat = {c["category"]: c["revenue"] for c in prev}

#     out = []

#     # 1) fastest-growing category
#     best_growth = None
#     for c in cur:
#         prior = prev_by_cat.get(c["category"], 0)
#         growth = _pct_change(c["revenue"], max(prior - c["revenue"], 0))
#         if growth and (best_growth is None or growth > best_growth[1]):
#             best_growth = (c["category"], growth)
#     if best_growth:
#         out.append({
#             "type": "trend",
#             "text": f"{best_growth[0].title()} are trending with a {best_growth[1]:.0f}% sales increase.",
#         })

#     # 2) thin catalog coverage in a category that's actually selling
#     catalog_items = db.query(CatalogItem).all()
#     items_per_cat = defaultdict(int)
#     for c in catalog_items:
#         items_per_cat[c.category] += 1
#     if cur:
#         thin = min(cur, key=lambda c: items_per_cat.get(c["category"], 0))
#         if items_per_cat.get(thin["category"], 0) <= 3:
#             out.append({
#                 "type": "opportunity",
#                 "text": f"Consider adding more products in the {thin['category'].title()} category.",
#             })

#     # 3) conversion rate vs this store's own recent baseline
#     stats = get_stats(days=days, db=db)
#     cur_conv = stats["conversion_rate"]["value"]
#     change = stats["conversion_rate"]["change_pct"]
#     if change is not None and change > 0:
#         out.append({
#             "type": "performance",
#             "text": f"Your conversion rate is {cur_conv:.1f}%, up {change:.0f}% versus the previous period.",
#         })
#     elif change is not None and change < 0:
#         out.append({
#             "type": "performance",
#             "text": f"Your conversion rate dipped to {cur_conv:.1f}% ({change:.0f}% vs the previous period) — worth a look.",
#         })

#     # 4) low stock nudge
#     low_stock = [c for c in catalog_items if 0 < c.stock <= LOW_STOCK_THRESHOLD]
#     if low_stock:
#         names = ", ".join(c.name for c in low_stock[:3])
#         out.append({
#             "type": "alert",
#             "text": f"{len(low_stock)} product(s) running low on stock: {names}.",
#         })

#     return {"insights": out}


# # ---------------------------------------------------------------------------
# # products (catalog CRUD)
# # ---------------------------------------------------------------------------

# class ProductIn(BaseModel):
#     sku: str
#     name: str
#     category: str
#     price_inr: float
#     stock: int = 0
#     cross_sell_sku: Optional[str] = None


# class ProductUpdate(BaseModel):
#     name: Optional[str] = None
#     category: Optional[str] = None
#     price_inr: Optional[float] = None
#     stock: Optional[int] = None
#     cross_sell_sku: Optional[str] = None


# def _serialize_product(item: CatalogItem, sales_by_sku: dict) -> dict:
#     return {
#         "sku": item.sku,
#         "name": item.name,
#         "category": item.category,
#         "price_inr": item.price_inr,
#         "stock": item.stock,
#         "cross_sell_sku": item.cross_sell_sku,
#         "status": _product_status(item),
#         "sales": sales_by_sku.get(item.sku, 0),
#     }


# def _sales_by_sku(db: DBSession) -> dict:
#     sales = defaultdict(int)
#     for o in db.query(Order).all():
#         for it in _order_items(o):
#             sales[it.get("sku")] += int(it.get("quantity", 1))
#     return sales


# @router.get("/products")
# def list_products(
#     search: str = "",
#     category: Optional[str] = None,
#     status: Optional[str] = Query(None, description="active | inactive | low_stock"),
#     page: int = 1,
#     page_size: int = 5,
#     db: DBSession = Depends(get_db),
# ):
#     items = db.query(CatalogItem).order_by(CatalogItem.name).all()
#     sales_by_sku = _sales_by_sku(db)

#     rows = [_serialize_product(i, sales_by_sku) for i in items]

#     if search:
#         s = search.lower()
#         rows = [r for r in rows if s in r["name"].lower() or s in r["sku"].lower()]
#     if category:
#         rows = [r for r in rows if r["category"] == category]
#     if status:
#         rows = [r for r in rows if r["status"] == status]

#     total = len(rows)
#     start = (page - 1) * page_size
#     page_rows = rows[start:start + page_size]

#     return {
#         "products": page_rows,
#         "total": total,
#         "page": page,
#         "page_size": page_size,
#         "total_pages": max(1, (total + page_size - 1) // page_size),
#     }


# @router.post("/products")
# def create_product(payload: ProductIn, db: DBSession = Depends(get_db)):
#     if db.query(CatalogItem).filter(CatalogItem.sku == payload.sku).first():
#         raise HTTPException(409, f"SKU '{payload.sku}' already exists.")
#     item = CatalogItem(**payload.dict())
#     db.add(item)
#     db.commit()
#     db.refresh(item)
#     return _serialize_product(item, _sales_by_sku(db))


# @router.put("/products/{sku}")
# def update_product(sku: str, payload: ProductUpdate, db: DBSession = Depends(get_db)):
#     item = db.query(CatalogItem).filter(CatalogItem.sku == sku).first()
#     if not item:
#         raise HTTPException(404, "Product not found.")
#     for field, value in payload.dict(exclude_unset=True).items():
#         setattr(item, field, value)
#     db.commit()
#     db.refresh(item)
#     return _serialize_product(item, _sales_by_sku(db))


# @router.delete("/products/{sku}")
# def delete_product(sku: str, db: DBSession = Depends(get_db)):
#     item = db.query(CatalogItem).filter(CatalogItem.sku == sku).first()
#     if not item:
#         raise HTTPException(404, "Product not found.")
#     db.delete(item)
#     db.commit()
#     return {"deleted": sku}


# # ---------------------------------------------------------------------------
# # customers (derived — there's no separate "customer" table, buyers are Users
# # who have placed at least one order, or anonymous sessions that have)
# # ---------------------------------------------------------------------------

# @router.get("/customers")
# def list_customers(search: str = "", page: int = 1, page_size: int = 10, db: DBSession = Depends(get_db)):
#     orders = db.query(Order).order_by(desc(Order.created_at)).all()
#     users_by_id = {u.id: u for u in db.query(User).all()}

#     grouped = defaultdict(lambda: {"orders": 0, "total_spent": 0.0, "last_order": None})
#     for o in orders:
#         key = o.user_id or f"anon:{o.session_id}"
#         g = grouped[key]
#         g["orders"] += 1
#         g["total_spent"] += o.amount_inr
#         if not g["last_order"] or (o.created_at and o.created_at.isoformat() > g["last_order"]):
#             g["last_order"] = o.created_at.isoformat() if o.created_at else None

#     rows = []
#     for key, g in grouped.items():
#         if key.startswith("anon:"):
#             name, email = "Guest buyer", "—"
#         else:
#             u = users_by_id.get(key)
#             name, email = (u.name, u.email) if u else ("Unknown buyer", "—")
#         rows.append({
#             "id": key,
#             "name": name,
#             "email": email,
#             "orders": g["orders"],
#             "total_spent_inr": round(g["total_spent"], 2),
#             "last_order": g["last_order"],
#         })

#     if search:
#         s = search.lower()
#         rows = [r for r in rows if s in r["name"].lower() or s in r["email"].lower()]

#     rows.sort(key=lambda r: r["total_spent_inr"], reverse=True)

#     total = len(rows)
#     start = (page - 1) * page_size
#     page_rows = rows[start:start + page_size]

#     return {
#         "customers": page_rows,
#         "total": total,
#         "page": page,
#         "page_size": page_size,
#         "total_pages": max(1, (total + page_size - 1) // page_size),
#     }


# @router.get("/users")
# def list_users(db: DBSession = Depends(get_db)):
#     users = db.query(User).order_by(desc(User.created_at)).all()
#     return [
#         {
#             "id": u.id,
#             "name": u.name,
#             "email": u.email,
#             "role": u.role,
#             "created_at": u.created_at.isoformat() if u.created_at else None,
#         }
#         for u in users
#     ]


# # ---------------------------------------------------------------------------
# # AI agent status + live policy controls
# # ---------------------------------------------------------------------------

# @router.get("/agent/status")
# def agent_status(db: DBSession = Depends(get_db)):
#     total_actions = db.query(AuditLog).count()
#     auto_approved = db.query(AuditLog).filter(AuditLog.policy_check_result == "allowed").count()
#     human_gated = db.query(AuditLog).filter(AuditLog.policy_check_result == "blocked:gate_pending").count()
#     blocked = db.query(AuditLog).filter(AuditLog.policy_check_result == "blocked:bound").count()
#     recent = db.query(AuditLog).order_by(desc(AuditLog.timestamp)).limit(5).all()

#     return {
#         "status": "active",
#         "model": OLLAMA_MODEL,
#         "model_endpoint": OLLAMA_URL,
#         "total_actions_logged": total_actions,
#         "auto_approved": auto_approved,
#         "human_confirmation_required": human_gated,
#         "blocked_by_policy": blocked,
#         "recent_activity": [
#             {
#                 "id": a.id,
#                 "action_type": a.action_type,
#                 "policy_check_result": a.policy_check_result,
#                 "final_status": a.final_status,
#                 "timestamp": a.timestamp.isoformat() if a.timestamp else None,
#             }
#             for a in recent
#         ],
#     }


# @router.get("/agent/policy")
# def get_policy():
#     return POLICY


# class PolicyUpdate(BaseModel):
#     max_txn_amount_inr: float
#     max_txns_per_session: int
#     auto_approve_below_inr: float
#     requires_human_confirm_above_inr: float
#     allowed_categories: List[str]
#     max_discount_pct_agent_can_apply: float


# @router.put("/agent/policy")
# def put_policy(payload: PolicyUpdate):
#     try:
#         return update_policy(payload.dict())
#     except ValueError as e:
#         raise HTTPException(400, str(e))



"""
Everything the merchant dashboard needs, all backed by real rows in the
same database the buyer-side chat/checkout flow writes to — no mock data.

  GET  /merchant/stats                 headline cards (revenue, orders, ...)
  GET  /merchant/sales-overview        daily revenue series for the chart
  GET  /merchant/top-categories        revenue share by category (donut)
  GET  /merchant/insights              rule-based "AI insights" (deterministic,
                                        not an LLM call — see note below)
  GET  /merchant/products              catalog with search/filter/pagination
  POST /merchant/products              add a product
  PUT  /merchant/products/{sku}        edit a product
  DELETE /merchant/products/{sku}      remove a product
  GET  /merchant/customers             buyers derived from Order/User rows
  GET  /merchant/agent/status          live agent status + audit counters
  GET  /merchant/agent/policy          current bounds the agent operates under
  PUT  /merchant/agent/policy          edit those bounds (takes effect immediately)
"""
import datetime as dt
import json
from collections import defaultdict
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session as DBSession
from sqlalchemy import desc

from db.database import get_db
from db.models import Order, Session as SessionModel, AuditLog, CatalogItem, User
from policy.engine import POLICY, update_policy
from agent.intent_parser import OLLAMA_MODEL, OLLAMA_URL

router = APIRouter(prefix="/merchant", tags=["merchant"])

LOW_STOCK_THRESHOLD = 20


# ---------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------

def _period_bounds(days: int):
    now = dt.datetime.utcnow()
    start = now - dt.timedelta(days=days)
    prev_start = start - dt.timedelta(days=days)
    return prev_start, start, now


def _pct_change(current: float, previous: float) -> Optional[float]:
    if previous <= 0:
        return None if current == 0 else 100.0
    return round((current - previous) / previous * 100, 1)


def _order_items(order: Order) -> list:
    try:
        return json.loads(order.items_json or "[]")
    except (json.JSONDecodeError, TypeError):
        return []


def _product_status(item: CatalogItem) -> str:
    if item.stock <= 0:
        return "inactive"
    if item.stock <= LOW_STOCK_THRESHOLD:
        return "low_stock"
    return "active"


# ---------------------------------------------------------------------------
# dashboard stat cards
# ---------------------------------------------------------------------------

@router.get("/stats")
def get_stats(days: int = 30, db: DBSession = Depends(get_db)):
    prev_start, start, now = _period_bounds(days)

    cur_orders = db.query(Order).filter(Order.created_at >= start).all()
    prev_orders = db.query(Order).filter(Order.created_at >= prev_start, Order.created_at < start).all()

    # Revenue, "completed" orders, paying-customer counts, conversion, and
    # AOV must only reflect orders that actually resulted in a captured
    # payment. A payment link being created (status "created") is not
    # revenue — only status == "paid" (set exclusively by the Razorpay
    # webhook or a live Razorpay verification, never by the frontend's
    # say-so) counts.
    cur_paid = [o for o in cur_orders if o.status == "paid"]
    prev_paid = [o for o in prev_orders if o.status == "paid"]

    cur_revenue = sum(o.amount_inr for o in cur_paid)
    prev_revenue = sum(o.amount_inr for o in prev_paid)

    cur_sessions = db.query(SessionModel).filter(SessionModel.created_at >= start).count()
    prev_sessions = db.query(SessionModel).filter(
        SessionModel.created_at >= prev_start, SessionModel.created_at < start
    ).count()

    cur_customers = {o.user_id or o.session_id for o in cur_paid}
    prev_customers = {o.user_id or o.session_id for o in prev_paid}

    cur_conversion = (len(cur_paid) / cur_sessions * 100) if cur_sessions else 0.0
    prev_conversion = (len(prev_paid) / prev_sessions * 100) if prev_sessions else 0.0

    cur_aov = (cur_revenue / len(cur_paid)) if cur_paid else 0.0
    prev_aov = (prev_revenue / len(prev_paid)) if prev_paid else 0.0

    return {
        "period_days": days,
        "revenue": {"value": round(cur_revenue, 2), "change_pct": _pct_change(cur_revenue, prev_revenue)},
        "orders_completed": {"value": len(cur_paid), "change_pct": _pct_change(len(cur_paid), len(prev_paid))},
        "active_customers": {"value": len(cur_customers), "change_pct": _pct_change(len(cur_customers), len(prev_customers))},
        "conversion_rate": {"value": round(cur_conversion, 1), "change_pct": _pct_change(cur_conversion, prev_conversion)},
        "aov": {"value": round(cur_aov, 2), "change_pct": _pct_change(cur_aov, prev_aov)},
    }


@router.get("/sales-overview")
def sales_overview(days: int = 30, db: DBSession = Depends(get_db)):
    _, start, now = _period_bounds(days)
    # Only captured payments count toward the revenue chart — a created-
    # but-unpaid order must not show up as a day's sales.
    orders = db.query(Order).filter(Order.created_at >= start, Order.status == "paid").all()

    daily = defaultdict(float)
    for o in orders:
        key = (o.created_at or now).strftime("%Y-%m-%d")
        daily[key] += o.amount_inr

    points = []
    for i in range(days, -1, -1):
        day = (now - dt.timedelta(days=i)).strftime("%Y-%m-%d")
        points.append({"date": day, "revenue": round(daily.get(day, 0.0), 2)})
    return {"points": points}


@router.get("/top-categories")
def top_categories(days: int = 30, db: DBSession = Depends(get_db)):
    _, start, _ = _period_bounds(days)
    # Category revenue must only reflect paid orders — a failed or still-
    # pending order must never inflate a category's share.
    orders = db.query(Order).filter(Order.created_at >= start, Order.status == "paid").all()
    catalog_by_sku = {c.sku: c for c in db.query(CatalogItem).all()}

    revenue_by_cat = defaultdict(float)
    for o in orders:
        for it in _order_items(o):
            cat_item = catalog_by_sku.get(it.get("sku"))
            category = cat_item.category if cat_item else it.get("category", "other")
            revenue_by_cat[category] += float(it.get("price_inr", 0)) * int(it.get("quantity", 1))

    total = sum(revenue_by_cat.values())
    rows = [
        {"category": cat, "revenue": round(rev, 2), "pct": round(rev / total * 100, 1) if total else 0}
        for cat, rev in sorted(revenue_by_cat.items(), key=lambda kv: kv[1], reverse=True)
    ]
    return {"categories": rows, "total_revenue": round(total, 2)}


@router.get("/insights")
def insights(days: int = 30, db: DBSession = Depends(get_db)):
    """
    Deterministic, data-derived talking points (no LLM call — kept
    reliable/fast for a dashboard that loads on every visit). Each
    insight is only returned when the underlying data actually supports
    it, so an empty list is a valid response on a quiet store.
    """
    prev_start, start, now = _period_bounds(days)
    cur = top_categories(days=days, db=db)["categories"]
    prev = top_categories(days=days * 2, db=db)["categories"]  # rough prior-window proxy
    prev_by_cat = {c["category"]: c["revenue"] for c in prev}

    out = []

    # 1) fastest-growing category
    best_growth = None
    for c in cur:
        prior = prev_by_cat.get(c["category"], 0)
        growth = _pct_change(c["revenue"], max(prior - c["revenue"], 0))
        if growth and (best_growth is None or growth > best_growth[1]):
            best_growth = (c["category"], growth)
    if best_growth:
        out.append({
            "type": "trend",
            "text": f"{best_growth[0].title()} are trending with a {best_growth[1]:.0f}% sales increase.",
        })

    # 2) thin catalog coverage in a category that's actually selling
    catalog_items = db.query(CatalogItem).all()
    items_per_cat = defaultdict(int)
    for c in catalog_items:
        items_per_cat[c.category] += 1
    if cur:
        thin = min(cur, key=lambda c: items_per_cat.get(c["category"], 0))
        if items_per_cat.get(thin["category"], 0) <= 3:
            out.append({
                "type": "opportunity",
                "text": f"Consider adding more products in the {thin['category'].title()} category.",
            })

    # 3) conversion rate vs this store's own recent baseline
    stats = get_stats(days=days, db=db)
    cur_conv = stats["conversion_rate"]["value"]
    change = stats["conversion_rate"]["change_pct"]
    if change is not None and change > 0:
        out.append({
            "type": "performance",
            "text": f"Your conversion rate is {cur_conv:.1f}%, up {change:.0f}% versus the previous period.",
        })
    elif change is not None and change < 0:
        out.append({
            "type": "performance",
            "text": f"Your conversion rate dipped to {cur_conv:.1f}% ({change:.0f}% vs the previous period) — worth a look.",
        })

    # 4) low stock nudge
    low_stock = [c for c in catalog_items if 0 < c.stock <= LOW_STOCK_THRESHOLD]
    if low_stock:
        names = ", ".join(c.name for c in low_stock[:3])
        out.append({
            "type": "alert",
            "text": f"{len(low_stock)} product(s) running low on stock: {names}.",
        })

    return {"insights": out}


# ---------------------------------------------------------------------------
# products (catalog CRUD)
# ---------------------------------------------------------------------------

class ProductIn(BaseModel):
    sku: str
    name: str
    category: str
    price_inr: float
    stock: int = 0
    cross_sell_sku: Optional[str] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    price_inr: Optional[float] = None
    stock: Optional[int] = None
    cross_sell_sku: Optional[str] = None


def _serialize_product(item: CatalogItem, sales_by_sku: dict) -> dict:
    return {
        "sku": item.sku,
        "name": item.name,
        "category": item.category,
        "price_inr": item.price_inr,
        "stock": item.stock,
        "cross_sell_sku": item.cross_sell_sku,
        "status": _product_status(item),
        "sales": sales_by_sku.get(item.sku, 0),
    }


def _sales_by_sku(db: DBSession) -> dict:
    # "Sales" (units sold) should reflect actual paid orders, matching the
    # same principle as revenue/spending — a cart or pending checkout was
    # never actually sold.
    sales = defaultdict(int)
    for o in db.query(Order).filter(Order.status == "paid").all():
        for it in _order_items(o):
            sales[it.get("sku")] += int(it.get("quantity", 1))
    return sales


@router.get("/products")
def list_products(
    search: str = "",
    category: Optional[str] = None,
    status: Optional[str] = Query(None, description="active | inactive | low_stock"),
    page: int = 1,
    page_size: int = 5,
    db: DBSession = Depends(get_db),
):
    items = db.query(CatalogItem).order_by(CatalogItem.name).all()
    sales_by_sku = _sales_by_sku(db)

    rows = [_serialize_product(i, sales_by_sku) for i in items]

    if search:
        s = search.lower()
        rows = [r for r in rows if s in r["name"].lower() or s in r["sku"].lower()]
    if category:
        rows = [r for r in rows if r["category"] == category]
    if status:
        rows = [r for r in rows if r["status"] == status]

    total = len(rows)
    start = (page - 1) * page_size
    page_rows = rows[start:start + page_size]

    return {
        "products": page_rows,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": max(1, (total + page_size - 1) // page_size),
    }


@router.post("/products")
def create_product(payload: ProductIn, db: DBSession = Depends(get_db)):
    if db.query(CatalogItem).filter(CatalogItem.sku == payload.sku).first():
        raise HTTPException(409, f"SKU '{payload.sku}' already exists.")
    item = CatalogItem(**payload.dict())
    db.add(item)
    db.commit()
    db.refresh(item)
    return _serialize_product(item, _sales_by_sku(db))


@router.put("/products/{sku}")
def update_product(sku: str, payload: ProductUpdate, db: DBSession = Depends(get_db)):
    item = db.query(CatalogItem).filter(CatalogItem.sku == sku).first()
    if not item:
        raise HTTPException(404, "Product not found.")
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return _serialize_product(item, _sales_by_sku(db))


@router.delete("/products/{sku}")
def delete_product(sku: str, db: DBSession = Depends(get_db)):
    item = db.query(CatalogItem).filter(CatalogItem.sku == sku).first()
    if not item:
        raise HTTPException(404, "Product not found.")
    db.delete(item)
    db.commit()
    return {"deleted": sku}


# ---------------------------------------------------------------------------
# customers (derived — there's no separate "customer" table, buyers are Users
# who have placed at least one order, or anonymous sessions that have)
# ---------------------------------------------------------------------------

@router.get("/customers")
def list_customers(search: str = "", page: int = 1, page_size: int = 10, db: DBSession = Depends(get_db)):
    orders = db.query(Order).order_by(desc(Order.created_at)).all()
    users_by_id = {u.id: u for u in db.query(User).all()}

    grouped = defaultdict(lambda: {"orders": 0, "total_spent": 0.0, "last_order": None})
    for o in orders:
        key = o.user_id or f"anon:{o.session_id}"
        g = grouped[key]
        g["orders"] += 1
        # Spending must only ever reflect captured payments — a pending or
        # failed order must never inflate what a customer "spent". Order
        # *count* still reflects all attempts, which is a separate, honest
        # signal of engagement.
        if o.status == "paid":
            g["total_spent"] += o.amount_inr
        if not g["last_order"] or (o.created_at and o.created_at.isoformat() > g["last_order"]):
            g["last_order"] = o.created_at.isoformat() if o.created_at else None

    rows = []
    for key, g in grouped.items():
        if key.startswith("anon:"):
            name, email = "Guest buyer", "—"
        else:
            u = users_by_id.get(key)
            name, email = (u.name, u.email) if u else ("Unknown buyer", "—")
        rows.append({
            "id": key,
            "name": name,
            "email": email,
            "orders": g["orders"],
            "total_spent_inr": round(g["total_spent"], 2),
            "last_order": g["last_order"],
        })

    if search:
        s = search.lower()
        rows = [r for r in rows if s in r["name"].lower() or s in r["email"].lower()]

    rows.sort(key=lambda r: r["total_spent_inr"], reverse=True)

    total = len(rows)
    start = (page - 1) * page_size
    page_rows = rows[start:start + page_size]

    return {
        "customers": page_rows,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": max(1, (total + page_size - 1) // page_size),
    }


@router.get("/users")
def list_users(db: DBSession = Depends(get_db)):
    users = db.query(User).order_by(desc(User.created_at)).all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        }
        for u in users
    ]


# ---------------------------------------------------------------------------
# AI agent status + live policy controls
# ---------------------------------------------------------------------------

@router.get("/agent/status")
def agent_status(db: DBSession = Depends(get_db)):
    total_actions = db.query(AuditLog).count()
    auto_approved = db.query(AuditLog).filter(AuditLog.policy_check_result == "allowed").count()
    human_gated = db.query(AuditLog).filter(AuditLog.policy_check_result == "blocked:gate_pending").count()
    blocked = db.query(AuditLog).filter(AuditLog.policy_check_result == "blocked:bound").count()
    recent = db.query(AuditLog).order_by(desc(AuditLog.timestamp)).limit(5).all()

    return {
        "status": "active",
        "model": OLLAMA_MODEL,
        "model_endpoint": OLLAMA_URL,
        "total_actions_logged": total_actions,
        "auto_approved": auto_approved,
        "human_confirmation_required": human_gated,
        "blocked_by_policy": blocked,
        "recent_activity": [
            {
                "id": a.id,
                "action_type": a.action_type,
                "policy_check_result": a.policy_check_result,
                "final_status": a.final_status,
                "timestamp": a.timestamp.isoformat() if a.timestamp else None,
            }
            for a in recent
        ],
    }


@router.get("/agent/policy")
def get_policy():
    return POLICY


class PolicyUpdate(BaseModel):
    max_txn_amount_inr: float
    max_txns_per_session: int
    auto_approve_below_inr: float
    requires_human_confirm_above_inr: float
    allowed_categories: List[str]
    max_discount_pct_agent_can_apply: float


@router.put("/agent/policy")
def put_policy(payload: PolicyUpdate):
    try:
        return update_policy(payload.dict())
    except ValueError as e:
        raise HTTPException(400, str(e))