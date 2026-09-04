# """
# Agent-readable catalog endpoint. Any MCP-speaking AI agent (or this app's
# own orchestrator) can call GET /catalog to get a structured product feed.
# """
# import re
# from difflib import SequenceMatcher

# from fastapi import APIRouter, Depends
# from sqlalchemy.orm import Session as DBSession

# from db.database import get_db
# from db.models import CatalogItem

# router = APIRouter(prefix="/catalog", tags=["catalog"])

# # Words that carry no product meaning — ignored when scoring a match so
# # a full sentence like "I want a blue hoodie please" still matches.
# _STOPWORDS = {
#     "i", "a", "an", "the", "want", "would", "like", "to", "buy", "get",
#     "me", "add", "please", "for", "of", "in", "some", "any", "show",
#     "find", "looking", "need", "cart", "my", "and", "with", "under",
#     "over", "is", "there", "have", "has", "do", "you", "it", "that",
#     "this", "one",
# }

# _MATCH_THRESHOLD = 0.34


# def _singularize(token: str) -> str:
#     """Cheap plural stripping (caps -> cap) so wording differences don't
#     block an otherwise obvious match."""
#     if len(token) > 3 and token.endswith("s") and not token.endswith("ss"):
#         return token[:-1]
#     return token


# def _tokenize(text: str) -> set:
#     return {_singularize(t) for t in re.findall(r"[a-z0-9]+", text.lower())}


# @router.get("")
# def get_catalog(category: str | None = None, db: DBSession = Depends(get_db)):
#     q = db.query(CatalogItem)
#     if category:
#         q = q.filter(CatalogItem.category == category)
#     items = q.all()
#     return [
#         {
#             "sku": i.sku,
#             "name": i.name,
#             "category": i.category,
#             "price_inr": i.price_inr,
#             "stock": i.stock,
#             "cross_sell_sku": i.cross_sell_sku,
#         }
#         for i in items
#     ]


# def find_by_query(db: DBSession, query_text: str, limit: int = 5):
#     """Fuzzy product lookup used by the intent-driven search/add-to-cart
#     flow. Buyers no longer need to type a product's exact catalog name —
#     partial names, plurals, category words, and small typos all resolve,
#     e.g. "blue hoodie", "caps", or "hodie" all match "Blue Hoodie - M".
#     """
#     if not query_text or not query_text.strip():
#         return []

#     query_text = query_text.strip()
#     q_lower = query_text.lower()
#     q_tokens = _tokenize(query_text) - _STOPWORDS

#     items = db.query(CatalogItem).all()
#     if not items or not q_tokens:
#         return []

#     scored = []
#     for item in items:
#         # Exact SKU mention always wins outright.
#         if item.sku.lower() == q_lower or item.sku.lower() in _tokenize(query_text):
#             scored.append((3.0, item))
#             continue

#         name_tokens = _tokenize(item.name)
#         cat_tokens = _tokenize(item.category)
#         overlap = name_tokens & q_tokens

#         score = 0.0
#         if name_tokens:
#             score = max(score, len(overlap) / len(name_tokens))
#         if q_tokens:
#             score = max(score, len(overlap) / len(q_tokens))

#         # Direct substring containment (old behaviour) still counts strongly.
#         if item.name.lower() in q_lower or q_lower in item.name.lower():
#             score = max(score, 0.9)

#         # Mentioning just the category (e.g. "show me caps") is a decent signal.
#         if cat_tokens & q_tokens:
#             score = max(score, 0.5)

#         # Typo tolerance: fuzzy-match individual words when nothing overlapped exactly.
#         if score < _MATCH_THRESHOLD:
#             for qt in q_tokens:
#                 for nt in name_tokens:
#                     if SequenceMatcher(None, qt, nt).ratio() >= 0.8:
#                         score = max(score, 0.6)

#         if score >= _MATCH_THRESHOLD:
#             scored.append((score, item))

#     scored.sort(key=lambda pair: pair[0], reverse=True)
#     return [item for _, item in scored[:limit]]



"""
Agent-readable catalog endpoint. Any MCP-speaking AI agent (or this app's
own orchestrator) can call GET /catalog to get a structured product feed.
"""
import re
from difflib import SequenceMatcher

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as DBSession

from db.database import get_db
from db.models import CatalogItem

router = APIRouter(prefix="/catalog", tags=["catalog"])

# Words that carry no product meaning — ignored when scoring a match so
# a full sentence like "I want a blue hoodie please" still matches.
_STOPWORDS = {
    "i", "a", "an", "the", "want", "would", "like", "to", "buy", "get",
    "me", "add", "please", "for", "of", "in", "some", "any", "show",
    "find", "looking", "need", "cart", "my", "and", "with", "under",
    "over", "is", "there", "have", "has", "do", "you", "it", "that",
    "this", "one",
}

_MATCH_THRESHOLD = 0.34

# Common color words we can recognize inside a product name (catalog items
# don't have a dedicated color column — colors live in the product name
# itself, e.g. "Blue Hoodie - M").
COLOR_WORDS = {
    "black", "white", "blue", "red", "green", "yellow", "brown", "grey",
    "gray", "navy", "pink", "purple", "orange", "beige", "maroon", "gold",
    "silver", "olive", "tan", "cream",
}


def _singularize(token: str) -> str:
    """Cheap plural stripping (caps -> cap) so wording differences don't
    block an otherwise obvious match."""
    if len(token) > 3 and token.endswith("s") and not token.endswith("ss"):
        return token[:-1]
    return token


def _tokenize(text: str) -> set:
    return {_singularize(t) for t in re.findall(r"[a-z0-9]+", text.lower())}


@router.get("")
def get_catalog(category: str | None = None, db: DBSession = Depends(get_db)):
    q = db.query(CatalogItem)
    if category:
        q = q.filter(CatalogItem.category == category)
    items = q.all()
    return [
        {
            "sku": i.sku,
            "name": i.name,
            "category": i.category,
            "price_inr": i.price_inr,
            "stock": i.stock,
            "cross_sell_sku": i.cross_sell_sku,
        }
        for i in items
    ]


def find_by_query(db: DBSession, query_text: str, limit: int = 5):
    """Fuzzy product lookup used by the intent-driven search/add-to-cart
    flow. Buyers no longer need to type a product's exact catalog name —
    partial names, plurals, category words, and small typos all resolve,
    e.g. "blue hoodie", "caps", or "hodie" all match "Blue Hoodie - M".
    """
    if not query_text or not query_text.strip():
        return []

    query_text = query_text.strip()
    q_lower = query_text.lower()
    q_tokens = _tokenize(query_text) - _STOPWORDS

    items = db.query(CatalogItem).all()
    if not items or not q_tokens:
        return []

    scored = []
    for item in items:
        # Exact SKU mention always wins outright.
        if item.sku.lower() == q_lower or item.sku.lower() in _tokenize(query_text):
            scored.append((3.0, item))
            continue

        name_tokens = _tokenize(item.name)
        cat_tokens = _tokenize(item.category)
        overlap = name_tokens & q_tokens

        score = 0.0
        if name_tokens:
            score = max(score, len(overlap) / len(name_tokens))
        if q_tokens:
            score = max(score, len(overlap) / len(q_tokens))

        # Direct substring containment (old behaviour) still counts strongly.
        if item.name.lower() in q_lower or q_lower in item.name.lower():
            score = max(score, 0.9)

        # Mentioning just the category (e.g. "show me caps") is a decent signal.
        if cat_tokens & q_tokens:
            score = max(score, 0.5)

        # Typo tolerance: fuzzy-match individual words when nothing overlapped exactly.
        if score < _MATCH_THRESHOLD:
            for qt in q_tokens:
                for nt in name_tokens:
                    if SequenceMatcher(None, qt, nt).ratio() >= 0.8:
                        score = max(score, 0.6)

        if score >= _MATCH_THRESHOLD:
            scored.append((score, item))

    scored.sort(key=lambda pair: pair[0], reverse=True)
    return [item for _, item in scored[:limit]]


def filter_catalog(db: DBSession, filters: dict, limit: int = 10):
    """
    Deterministic structured search. The LLM only ever *proposes* filters
    (category/color/price bounds) extracted from the buyer's message —
    this function is the sole authority on what actually exists and is
    in stock. It can never return a product the LLM merely claimed was
    available; it can only return real, matching, in-stock rows.

    filters: {"category": str|None, "color": str|None,
              "max_price": number|None, "min_price": number|None}
    """
    category = (filters.get("category") or "").strip()
    color = (filters.get("color") or "").strip()
    max_price = filters.get("max_price")
    min_price = filters.get("min_price")

    category_tokens = _tokenize(category) if category else set()
    color_tokens = _tokenize(color) if color else set()

    items = db.query(CatalogItem).all()
    results = []
    for item in items:
        if item.stock <= 0:
            continue  # never recommend something that can't actually be bought

        name_tokens = _tokenize(item.name)
        cat_tokens = _tokenize(item.category)

        if category_tokens and not (cat_tokens & category_tokens or name_tokens & category_tokens):
            continue
        if color_tokens and not (name_tokens & color_tokens):
            continue
        if max_price is not None and item.price_inr > float(max_price):
            continue
        if min_price is not None and item.price_inr < float(min_price):
            continue

        results.append(item)

    results.sort(key=lambda i: i.price_inr)
    return results[:limit]


def category_exists(db: DBSession, category: str) -> bool:
    """Whether *any* in-stock item (by literal category or by a name
    token) matches this category word at all — used to tell the honest
    difference between 'nothing in stock right now' and 'we don't carry
    this at all', instead of just saying 'no results' either way."""
    if not category:
        return True
    tokens = _tokenize(category)
    for item in db.query(CatalogItem).all():
        if _tokenize(item.category) & tokens or _tokenize(item.name) & tokens:
            return True
    return False
