# """
# The agent orchestrator loop. This is the file that ties together:
#   intent_parser (LLM) -> policy engine (deterministic) -> audit log -> reply

# No Razorpay call ever happens directly from this router — checkout.py
# is the only place that actually moves money, and only after a
# policy-cleared or human-approved audit entry exists.
# """
# import json
# import hashlib
# from fastapi import APIRouter, Depends
# from sqlalchemy.orm import Session as DBSession

# from db.database import get_db
# from db.models import Session as SessionModel, AuditLog, CatalogItem, ChatMessage
# from schemas import ChatRequest, ChatResponse, ProductCard
# from agent.intent_parser import parse_intent
# from agent.reasoning import generate_reasoning
# from agent.chitchat import chitchat_reply
# from policy.engine import check_action
# from catalog.routes import find_by_query

# router = APIRouter(prefix="/chat", tags=["chat"])

# HISTORY_TURNS = 6  # how many past user/agent exchanges to feed back in for context


# def _demo_rating(sku: str):
#     """No review system exists yet, so these are stable, deterministic
#     per-SKU display values (same SKU always yields the same numbers) —
#     not real customer reviews. Swap this out once a review table exists."""
#     h = int(hashlib.sha1(sku.encode()).hexdigest(), 16)
#     rating = round(4.0 + (h % 10) / 10, 1)
#     review_count = 24 + (h % 20) * 7
#     return rating, review_count


# def _serialize_product(item: CatalogItem) -> ProductCard:
#     rating, review_count = _demo_rating(item.sku)
#     return ProductCard(
#         sku=item.sku,
#         name=item.name,
#         price_inr=item.price_inr,
#         stock=item.stock,
#         category=item.category,
#         rating=rating,
#         review_count=review_count,
#     )


# def _recent_history(db: DBSession, session_id: str):
#     """Last few turns for this session, oldest first: a list formatted for
#     the LLM (role: user/assistant), plus the single most recent agent
#     message on its own (used by the chitchat handler for quick follow-up
#     checks like a pending cross-sell offer)."""
#     rows = (
#         db.query(ChatMessage)
#         .filter(ChatMessage.session_id == session_id)
#         .order_by(ChatMessage.created_at.desc())
#         .limit(HISTORY_TURNS * 2)
#         .all()
#     )
#     rows = list(reversed(rows))
#     llm_history = [
#         {"role": "user" if r.role == "user" else "assistant", "content": r.content}
#         for r in rows
#     ]
#     last_agent_text = next((r.content for r in reversed(rows) if r.role == "agent"), None)
#     return llm_history, last_agent_text


# def _save_turn(db: DBSession, session_id: str, user_message: str, agent_reply: str):
#     db.add(ChatMessage(session_id=session_id, role="user", content=user_message))
#     db.add(ChatMessage(session_id=session_id, role="agent", content=agent_reply))
#     db.commit()


# async def _add_item_to_cart(db: DBSession, session: SessionModel, query_text: str, qty: int) -> ChatResponse:
#     """Shared add-to-cart flow: catalog match -> reasoning -> policy check
#     -> audit log -> reply. Used both for direct 'add_to_cart' intents and
#     for the context-driven cross-sell follow-up (buyer says 'yes' to a
#     suggestion made in the previous turn)."""
#     matches = find_by_query(db, query_text)
#     if not matches:
#         return ChatResponse(session_id=session.id, reply="I couldn't match that item to our catalog. Could you name it more specifically?")
#     item = matches[0]
#     amount = item.price_inr * qty

#     reasoning = await generate_reasoning("add_to_cart", {"sku": item.sku, "quantity": qty, "amount_inr": amount})
#     policy_result = check_action("add_to_cart", {"amount_inr": amount, "category": item.category}, session.txn_count)

#     audit = AuditLog(
#         session_id=session.id,
#         action_type="add_to_cart",
#         proposed_params_json=json.dumps({"sku": item.sku, "quantity": qty, "amount_inr": amount}),
#         agent_reasoning_text=reasoning,
#         policy_check_result=policy_result.code,
#         razorpay_call_made=False,
#         final_status="blocked" if not policy_result.allowed else "logged",
#     )
#     db.add(audit)
#     db.commit()
#     db.refresh(audit)

#     if not policy_result.allowed:
#         return ChatResponse(session_id=session.id, reply=f"Can't add that: {policy_result.reason}", audit_id=audit.id)

#     cross_sell_msg = ""
#     if item.cross_sell_sku:
#         cross_item = db.query(CatalogItem).filter(CatalogItem.sku == item.cross_sell_sku).first()
#         if cross_item:
#             cross_sell_msg = f" Pairs well with a {cross_item.name} (₹{cross_item.price_inr}) — want to add that too?"

#     reply = f"Added {qty} x {item.name} (₹{amount} total) to your cart.{cross_sell_msg} Say 'checkout' when ready."
#     return ChatResponse(
#         session_id=session.id,
#         reply=reply,
#         proposed_action={
#             "action": "add_to_cart",
#             "sku": item.sku,
#             "name": item.name,
#             "category": item.category,
#             "quantity": qty,
#             "amount_inr": amount,
#         },
#         audit_id=audit.id,
#         products=[_serialize_product(item)],
#     )


# @router.post("", response_model=ChatResponse)
# async def chat(req: ChatRequest, db: DBSession = Depends(get_db)):
#     # --- 1. Resolve / create session, linked to the logged-in user if present ---
#     session = None
#     if req.session_id:
#         session = db.query(SessionModel).filter(SessionModel.id == req.session_id).first()
#     if not session and req.user_id:
#         # No session_id given (e.g. fresh page load) — reuse this user's most
#         # recent session so their order history stays continuous across visits.
#         session = (
#             db.query(SessionModel)
#             .filter(SessionModel.user_id == req.user_id)
#             .order_by(SessionModel.created_at.desc())
#             .first()
#         )
#     if not session:
#         session = SessionModel(user_id=req.user_id)
#         db.add(session)
#         db.commit()
#         db.refresh(session)
#     elif req.user_id and not session.user_id:
#         # Backfill linkage for a session that started before login.
#         session.user_id = req.user_id
#         db.commit()

#     # --- 2. Pull recent conversation for context, then parse intent via Ollama (with fallback) ---
#     llm_history, last_agent_text = _recent_history(db, session.id)

#     catalog_items = db.query(CatalogItem).all()
#     catalog_snippet = "\n".join(f"{c.sku}: {c.name} (₹{c.price_inr}, {c.category})" for c in catalog_items)
#     intent = await parse_intent(req.message, catalog_snippet, history=llm_history)

#     action = intent.get("action", "chitchat")

#     # --- 3. Small talk is handled on its own — it never touches catalog search ---
#     if action == "chitchat":
#         reply_text, cross_sell_name = chitchat_reply(req.message, last_agent_text)
#         if cross_sell_name:
#             # Buyer said "yes" to the cross-sell offer from the previous
#             # turn — actually add it, going through the normal policy/audit path.
#             response = await _add_item_to_cart(db, session, cross_sell_name, 1)
#             _save_turn(db, session.id, req.message, response.reply)
#             return response
#         _save_turn(db, session.id, req.message, reply_text)
#         return ChatResponse(session_id=session.id, reply=reply_text)

#     # --- 4. Browsing (no money involved, no policy/audit needed) ---
#     if action == "search_catalog":
#         query_text = intent.get("query", req.message)
#         matches = find_by_query(db, query_text)
#         if matches:
#             lines = [f"- {m.name} (SKU {m.sku}) — ₹{m.price_inr}, {m.stock} in stock" for m in matches]
#             reply = "Here's what I found:\n" + "\n".join(lines)
#         else:
#             reply = "I couldn't find a matching product. Try describing it differently, e.g. 'blue hoodie' or 'cap'."
#         _save_turn(db, session.id, req.message, reply)
#         return ChatResponse(
#             session_id=session.id,
#             reply=reply,
#             products=[_serialize_product(m) for m in matches] if matches else None,
#         )

#     # --- 5. Money-adjacent / cart actions go through the policy engine ---
#     if action == "add_to_cart":
#         query_text = intent.get("query", req.message)
#         qty = int(intent.get("quantity", 1))
#         response = await _add_item_to_cart(db, session, query_text, qty)
#         _save_turn(db, session.id, req.message, response.reply)
#         return response

#     if action == "checkout":
#         reply = "Great — head to the checkout panel to review your cart total and confirm payment."
#         _save_turn(db, session.id, req.message, reply)
#         return ChatResponse(session_id=session.id, reply=reply, proposed_action={"action": "checkout"})

#     fallback_reply = "I didn't quite catch that — try asking about a product, or say 'checkout'."
#     _save_turn(db, session.id, req.message, fallback_reply)
#     return ChatResponse(session_id=session.id, reply=fallback_reply)


"""
The agent orchestrator loop. This is the file that ties together:
  intent_parser (LLM proposes filters/action) -> catalog filtering
  (backend verifies what's real) -> policy engine (deterministic) ->
  audit log -> reply

No Razorpay call ever happens directly from this router — checkout.py
is the only place that actually moves money, and only after a
policy-cleared or human-approved audit entry exists.

Architecture principle for search: the LLM never gets to just assert a
product is available. It proposes structured filters (category, color,
price bounds) or a positional reference ("the second one"); this file
always runs those through catalog.routes' deterministic functions before
a single product is shown to the buyer.
"""
import json
import hashlib
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as DBSession

from db.database import get_db
from db.models import Session as SessionModel, AuditLog, CatalogItem, ChatMessage, SessionContext
from schemas import ChatRequest, ChatResponse, ProductCard
from agent.intent_parser import parse_intent
from agent.reasoning import generate_reasoning
from agent.chitchat import chitchat_reply
from policy.engine import check_action
from catalog.routes import find_by_query, filter_catalog, category_exists

router = APIRouter(prefix="/chat", tags=["chat"])

HISTORY_TURNS = 6  # how many past user/agent exchanges to feed back in for context


def _demo_rating(sku: str):
    """No review system exists yet, so these are stable, deterministic
    per-SKU display values (same SKU always yields the same numbers) —
    not real customer reviews. Swap this out once a review table exists."""
    h = int(hashlib.sha1(sku.encode()).hexdigest(), 16)
    rating = round(4.0 + (h % 10) / 10, 1)
    review_count = 24 + (h % 20) * 7
    return rating, review_count


def _serialize_product(item: CatalogItem) -> ProductCard:
    rating, review_count = _demo_rating(item.sku)
    return ProductCard(
        sku=item.sku,
        name=item.name,
        price_inr=item.price_inr,
        stock=item.stock,
        category=item.category,
        rating=rating,
        review_count=review_count,
    )


def _recent_history(db: DBSession, session_id: str):
    """Last few turns for this session, oldest first: a list formatted for
    the LLM (role: user/assistant), plus the single most recent agent
    message on its own (used by the chitchat handler for quick follow-up
    checks like a pending cross-sell offer)."""
    rows = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(HISTORY_TURNS * 2)
        .all()
    )
    rows = list(reversed(rows))
    llm_history = [
        {"role": "user" if r.role == "user" else "assistant", "content": r.content}
        for r in rows
    ]
    last_agent_text = next((r.content for r in reversed(rows) if r.role == "agent"), None)
    return llm_history, last_agent_text


def _save_turn(db: DBSession, session_id: str, user_message: str, agent_reply: str):
    db.add(ChatMessage(session_id=session_id, role="user", content=user_message))
    db.add(ChatMessage(session_id=session_id, role="agent", content=agent_reply))
    db.commit()


def _remember_shown(db: DBSession, session_id: str, items: list):
    """Persists the ordered SKU list from the latest search result so a
    later 'add the second one' can be resolved against real products
    actually shown to this buyer, not guessed."""
    skus_json = json.dumps([i.sku for i in items])
    ctx = db.query(SessionContext).filter(SessionContext.session_id == session_id).first()
    if ctx:
        ctx.last_shown_skus_json = skus_json
    else:
        db.add(SessionContext(session_id=session_id, last_shown_skus_json=skus_json))
    db.commit()


def _resolve_ordinal(db: DBSession, session_id: str, ordinal: int) -> CatalogItem | None:
    """1-based position into the last set of products actually shown to
    this session. Returns None (never a guess) if there's no prior list
    or the position is out of range."""
    ctx = db.query(SessionContext).filter(SessionContext.session_id == session_id).first()
    if not ctx:
        return None
    try:
        skus = json.loads(ctx.last_shown_skus_json or "[]")
    except json.JSONDecodeError:
        return None
    if ordinal < 1 or ordinal > len(skus):
        return None
    sku = skus[ordinal - 1]
    return db.query(CatalogItem).filter(CatalogItem.sku == sku).first()


def _describe_search(filters: dict, count: int) -> str:
    """Deterministic natural-language description of what the backend
    actually searched for and found — a factual summary of real filters
    applied, not an LLM guess about what's available."""
    bits = []
    if filters.get("color"):
        bits.append(filters["color"])
    if filters.get("category"):
        bits.append(filters["category"])
    subject = " ".join(bits) if bits else "products"
    price_bits = []
    if filters.get("min_price") is not None:
        price_bits.append(f"above ₹{filters['min_price']:.0f}")
    if filters.get("max_price") is not None:
        price_bits.append(f"under ₹{filters['max_price']:.0f}")
    price_desc = f" {' and '.join(price_bits)}" if price_bits else ""
    lead = "Here's a recommendation" if filters.get("intent") == "recommendation" else "Here's what I found"
    noun = "product" if count == 1 else "products"
    return f"{lead}: {count} {subject if bits else noun}{price_desc} in stock."


async def _add_item_to_cart_by_item(db: DBSession, session: SessionModel, item: CatalogItem, qty: int) -> ChatResponse:
    """Core add-to-cart flow once a specific catalog item has already been
    resolved (either by fuzzy name match or by ordinal reference) —
    reasoning -> policy check -> audit log -> reply."""
    amount = item.price_inr * qty

    reasoning = await generate_reasoning("add_to_cart", {"sku": item.sku, "quantity": qty, "amount_inr": amount})
    policy_result = check_action("add_to_cart", {"amount_inr": amount, "category": item.category}, session.txn_count)

    audit = AuditLog(
        session_id=session.id,
        action_type="add_to_cart",
        proposed_params_json=json.dumps({"sku": item.sku, "quantity": qty, "amount_inr": amount}),
        agent_reasoning_text=reasoning,
        policy_check_result=policy_result.code,
        razorpay_call_made=False,
        final_status="blocked" if not policy_result.allowed else "logged",
    )
    db.add(audit)
    db.commit()
    db.refresh(audit)

    if not policy_result.allowed:
        return ChatResponse(session_id=session.id, reply=f"Can't add that: {policy_result.reason}", audit_id=audit.id)

    cross_sell_msg = ""
    if item.cross_sell_sku:
        cross_item = db.query(CatalogItem).filter(CatalogItem.sku == item.cross_sell_sku).first()
        if cross_item:
            cross_sell_msg = f" Pairs well with a {cross_item.name} (₹{cross_item.price_inr}) — want to add that too?"

    reply = f"Added {qty} x {item.name} (₹{amount} total) to your cart.{cross_sell_msg} Say 'checkout' when ready."
    return ChatResponse(
        session_id=session.id,
        reply=reply,
        proposed_action={
            "action": "add_to_cart",
            "sku": item.sku,
            "name": item.name,
            "category": item.category,
            "quantity": qty,
            "amount_inr": amount,
        },
        audit_id=audit.id,
        products=[_serialize_product(item)],
    )


async def _add_item_to_cart(db: DBSession, session: SessionModel, query_text: str, qty: int) -> ChatResponse:
    """Fuzzy-name add-to-cart path — used for direct 'add_to_cart' intents
    that name a product, and for the context-driven cross-sell follow-up
    (buyer says 'yes' to a suggestion made in the previous turn)."""
    matches = find_by_query(db, query_text)
    if not matches:
        return ChatResponse(session_id=session.id, reply="I couldn't match that item to our catalog. Could you name it more specifically?")
    return await _add_item_to_cart_by_item(db, session, matches[0], qty)


@router.post("", response_model=ChatResponse)
async def chat(req: ChatRequest, db: DBSession = Depends(get_db)):
    # --- 1. Resolve / create session, linked to the logged-in user if present ---
    session = None
    if req.session_id:
        session = db.query(SessionModel).filter(SessionModel.id == req.session_id).first()
    if not session and req.user_id:
        # No session_id given (e.g. fresh page load) — reuse this user's most
        # recent session so their order history stays continuous across visits.
        session = (
            db.query(SessionModel)
            .filter(SessionModel.user_id == req.user_id)
            .order_by(SessionModel.created_at.desc())
            .first()
        )
    if not session:
        session = SessionModel(user_id=req.user_id)
        db.add(session)
        db.commit()
        db.refresh(session)
    elif req.user_id and not session.user_id:
        # Backfill linkage for a session that started before login.
        session.user_id = req.user_id
        db.commit()

    # --- 2. Pull recent conversation for context, then parse intent via Ollama (with fallback) ---
    llm_history, last_agent_text = _recent_history(db, session.id)

    catalog_items = db.query(CatalogItem).all()
    catalog_snippet = "\n".join(f"{c.sku}: {c.name} (₹{c.price_inr}, {c.category})" for c in catalog_items)
    intent = await parse_intent(req.message, catalog_snippet, history=llm_history)

    action = intent.get("action", "chitchat")

    # --- 3. Small talk is handled on its own — it never touches catalog search ---
    if action == "chitchat":
        reply_text, cross_sell_name = chitchat_reply(req.message, last_agent_text)
        if cross_sell_name:
            # Buyer said "yes" to the cross-sell offer from the previous
            # turn — actually add it, going through the normal policy/audit path.
            response = await _add_item_to_cart(db, session, cross_sell_name, 1)
            _save_turn(db, session.id, req.message, response.reply)
            return response
        _save_turn(db, session.id, req.message, reply_text)
        return ChatResponse(session_id=session.id, reply=reply_text)

    # --- 4. Browsing: LLM proposes filters, backend is the sole authority on results ---
    if action == "search_catalog":
        filters = intent.get("filters") or {}
        has_structured_filters = any(
            filters.get(k) for k in ("category", "color", "max_price", "min_price")
        )

        if has_structured_filters:
            matches = filter_catalog(db, filters)
            if matches:
                reply = _describe_search(filters, len(matches))
            else:
                # Graceful degrade: figure out *why* nothing matched instead
                # of just saying "no results" — try relaxing price/color
                # first, and tell the buyer honestly if the category simply
                # isn't carried at all rather than inventing something.
                category = filters.get("category")
                if category and not category_exists(db, category):
                    reply = (
                        f"We don't currently carry {category} products. "
                        "Here's a few popular items you might like instead:"
                    )
                    matches = filter_catalog(db, {})[:3]
                else:
                    relaxed = dict(filters)
                    relaxed.pop("max_price", None)
                    relaxed.pop("min_price", None)
                    relaxed_matches = filter_catalog(db, relaxed)
                    if relaxed_matches:
                        price_desc = (
                            f"under ₹{filters['max_price']:.0f}" if filters.get("max_price") is not None
                            else f"above ₹{filters['min_price']:.0f}"
                        )
                        reply = f"Nothing matched {price_desc} exactly, but here's the closest option:"
                        matches = relaxed_matches[:3]
                    else:
                        reply = "I couldn't find anything matching that. Try describing it differently, e.g. 'blue hoodie' or 'cap'."
        else:
            query_text = intent.get("query", req.message)
            matches = find_by_query(db, query_text)
            reply = (
                "Here's what I found:\n" + "\n".join(f"- {m.name} (SKU {m.sku}) — ₹{m.price_inr}, {m.stock} in stock" for m in matches)
                if matches
                else "I couldn't find a matching product. Try describing it differently, e.g. 'blue hoodie' or 'cap'."
            )

        if matches:
            _remember_shown(db, session.id, matches)
        _save_turn(db, session.id, req.message, reply)
        return ChatResponse(
            session_id=session.id,
            reply=reply,
            products=[_serialize_product(m) for m in matches] if matches else None,
        )

    # --- 5. Money-adjacent / cart actions go through the policy engine ---
    if action == "add_to_cart":
        qty = int(intent.get("quantity", 1))
        ordinal = (intent.get("item_reference") or {}).get("ordinal")

        if ordinal:
            item = _resolve_ordinal(db, session.id, ordinal)
            if not item:
                reply = "I'm not sure which item you mean — could you tell me its name, or search again first?"
                _save_turn(db, session.id, req.message, reply)
                return ChatResponse(session_id=session.id, reply=reply)
            response = await _add_item_to_cart_by_item(db, session, item, qty)
        else:
            query_text = intent.get("query", req.message)
            response = await _add_item_to_cart(db, session, query_text, qty)

        _save_turn(db, session.id, req.message, response.reply)
        return response

    if action == "checkout":
        reply = "Great — head to the checkout panel to review your cart total and confirm payment."
        _save_turn(db, session.id, req.message, reply)
        return ChatResponse(session_id=session.id, reply=reply, proposed_action={"action": "checkout"})

    fallback_reply = "I didn't quite catch that — try asking about a product, or say 'checkout'."
    _save_turn(db, session.id, req.message, fallback_reply)
    return ChatResponse(session_id=session.id, reply=fallback_reply)
