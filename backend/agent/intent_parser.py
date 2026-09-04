# """
# Turns a buyer's free-text chat message into a structured intent JSON using
# a local Ollama model (llama3.2). Because small local models sometimes
# return malformed JSON, a regex/keyword fallback parser guarantees the
# pipeline never stalls — this doubles as a legitimate graceful-degradation
# story for the demo.

# IMPORTANT: this module NEVER calls Razorpay. It only produces intent.
# """
# import os
# import re
# import json
# import httpx

# OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
# OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")

# SYSTEM_PROMPT = """You are an intent-parsing module for a shopping agent.
# Given a buyer's message and a product catalog, output ONLY a JSON object
# (no prose, no markdown fences) with this exact shape:

# {
#   "action": "search_catalog" | "add_to_cart" | "checkout" | "chitchat",
#   "query": "<string, only for search_catalog>",
#   "sku": "<string, only for add_to_cart>",
#   "quantity": <int, only for add_to_cart>,
#   "category": "<string, optional>",
#   "discount_pct": <number, optional, default 0>
# }

# Rules for choosing "action":
# - If the buyer names a specific product and expresses intent to acquire it
#   (e.g. "I want X", "buy X", "I'd like to buy X", "get me X", "add X to my
#   cart", "I'll take X"), the action is "add_to_cart" — NOT "search_catalog".
# - Use "search_catalog" only when the buyer is browsing/asking what's
#   available, without committing to a specific item (e.g. "what hoodies do
#   you have", "show me caps", "any accessories under 500").
# - Use "checkout" only when the buyer wants to pay/complete their order
#   without naming a new product (e.g. "checkout", "pay now", "confirm my
#   order").
# - Use "chitchat" for greetings, thanks, goodbyes, small talk, short
#   yes/no replies, and anything unrelated to shopping.
# - Prior turns from this conversation are included as earlier messages.
#   Use them to resolve references like "that", "it", "the blue one", or
#   "the first one" to a specific product already mentioned, instead of
#   treating the message in isolation.

# Examples:
# "I would like to buy the blue hoodie" -> {"action": "add_to_cart", "query": "blue hoodie", "quantity": 1}
# "show me caps" -> {"action": "search_catalog", "query": "caps"}
# "checkout" -> {"action": "checkout"}
# "hi" -> {"action": "chitchat"}
# "thanks!" -> {"action": "chitchat"}
# (agent just listed a Blue Hoodie and a Black Cap) "add the cap" -> {"action": "add_to_cart", "query": "cap", "quantity": 1}

# Only output the JSON object. Nothing else.
# """


# async def parse_intent(message: str, catalog_snippet: str, history: list | None = None) -> dict:
#     """Returns a structured intent dict. Falls back to regex parsing on
#     any Ollama failure or malformed JSON response.

#     `history` (optional) is a list of {"role": "user"|"assistant",
#     "content": str} dicts from the recent conversation. Passing it lets
#     the model resolve follow-ups ("the blue one", "add that instead")
#     against what was already discussed instead of treating every message
#     as a cold start.
#     """
#     messages = [{"role": "system", "content": SYSTEM_PROMPT + f"\n\nCatalog:\n{catalog_snippet}"}]
#     if history:
#         messages.extend(history)
#     messages.append({"role": "user", "content": message})

#     try:
#         async with httpx.AsyncClient(timeout=15.0) as client:
#             resp = await client.post(
#                 f"{OLLAMA_URL}/api/chat",
#                 json={
#                     "model": OLLAMA_MODEL,
#                     "format": "json",
#                     "stream": False,
#                     "messages": messages,
#                 },
#             )
#             resp.raise_for_status()
#             data = resp.json()
#             content = data.get("message", {}).get("content", "")
#             parsed = json.loads(content)
#             parsed["_source"] = "llm"
#             return parsed
#     except Exception:
#         return _fallback_parse(message)


# # Keyword-only signals used by the offline fallback parser to recognize
# # small talk before falling through to the (wrong, for this case)
# # search_catalog default.
# _CHITCHAT_WORDS = (
#     "hi", "hii", "hello", "hey", "yo", "sup", "greetings",
#     "good morning", "good afternoon", "good evening",
#     "thanks", "thank you", "thankyou", "thx", "ty", "cheers",
#     "bye", "goodbye", "see you", "later", "cya", "take care",
#     "yes", "yeah", "yep", "yup", "sure", "okay", "ok",
#     "no", "nope", "nah",
# )


# def _fallback_parse(message: str) -> dict:
#     """Deterministic keyword-based fallback so a bad/unavailable LLM
#     response never stalls the demo."""
#     text = message.lower().strip()

#     # Small talk first, so "hi" / "thanks" / "no" don't fall through to
#     # search_catalog (there's no product named "hi").
#     if text in _CHITCHAT_WORDS or any(text.startswith(w) for w in _CHITCHAT_WORDS):
#         return {"action": "chitchat", "_source": "fallback"}

#     # Checkout intent only when there's no product named alongside it.
#     if any(w in text for w in ["checkout", "buy now", "pay now", "confirm order", "complete my order"]):
#         return {"action": "checkout", "_source": "fallback"}

#     add_triggers = ["add", "want", "get me", "buy", "purchase", "order", "i'll take", "i will take"]
#     if any(w in text for w in add_triggers):
#         qty = 1
#         qty_match = re.search(r"\b(\d+)\b", text)
#         if qty_match:
#             qty = int(qty_match.group(1))
#         return {
#             "action": "add_to_cart",
#             "query": text,
#             "quantity": qty,
#             "_source": "fallback",
#         }

#     return {"action": "search_catalog", "query": text, "_source": "fallback"}


"""
Turns a buyer's free-text chat message into a structured intent JSON using
a local Ollama model (llama3.2). Because small local models sometimes
return malformed JSON, a regex/keyword fallback parser guarantees the
pipeline never stalls — this doubles as a legitimate graceful-degradation
story for the demo.

IMPORTANT: this module NEVER decides what's actually in stock or what a
product costs. It only proposes structured filters (category, color,
price bounds) or an item reference; catalog/routes.py's filter_catalog()
and find_by_query() are the sole authority on real products — "AI
reasons, backend verifies."
"""
import os
import re
import json
import httpx

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")

SYSTEM_PROMPT = """You are an intent-parsing module for a shopping agent.
Given a buyer's message and a product catalog, output ONLY a JSON object
(no prose, no markdown fences) with this exact shape:

{
  "action": "search_catalog" | "add_to_cart" | "checkout" | "chitchat",
  "query": "<string, free-text fallback description of what they want>",
  "filters": {
    "category": "<string, optional — a product type like 'hoodie', 'cap', 'shirt', or a broader category like 'gaming'>",
    "color": "<string, optional>",
    "max_price": <number, optional — from phrases like 'under 2000', 'below ₹500'>,
    "min_price": <number, optional — from phrases like 'over 1000', 'above ₹300'>,
    "intent": "recommendation" | "specific" | null
  },
  "item_reference": {
    "ordinal": <int, optional — 1-based position like 'the second one' -> 2, 'the first one' -> 1>
  },
  "sku": "<string, optional, only if the buyer names an exact SKU>",
  "quantity": <int, only for add_to_cart, default 1>,
  "discount_pct": <number, optional, default 0>
}

Only include keys that actually apply — omit "filters" entirely for pure
chitchat, omit "item_reference" unless the buyer refers to a previously
shown item by position ("the second one", "the first option", "that
last one").

Rules for choosing "action":
- If the buyer names a specific product (by name, description, or a
  positional reference like "the second one") and expresses intent to
  acquire it (e.g. "I want X", "buy X", "add X to my cart", "I'll take
  X", "add the second one"), the action is "add_to_cart" — NOT
  "search_catalog".
- Use "search_catalog" when the buyer is browsing or describing what
  they're looking for without committing to one item — this includes
  filtered requests like "a blue hoodie under ₹2,000" and open-ended
  recommendation requests like "show me something good for gaming"
  (set filters.intent to "recommendation" for the latter kind).
- Extract every filter you can from the sentence: category, color, and
  price bounds are independent and any subset may be present.
- Use "checkout" only when the buyer wants to pay/complete their order
  without naming a new product.
- Use "chitchat" for greetings, thanks, goodbyes, small talk, short
  yes/no replies, and anything unrelated to shopping.
- Prior turns from this conversation are included as earlier messages.
  Use them to resolve pronouns and references ("that", "it", "the blue
  one") to a specific product already discussed when there's no
  clearer positional reference to extract.

Examples:
"I need a blue hoodie under ₹2,000." -> {"action": "search_catalog", "query": "blue hoodie under 2000", "filters": {"category": "hoodie", "color": "blue", "max_price": 2000}}
"Show me something good for gaming." -> {"action": "search_catalog", "query": "gaming", "filters": {"category": "gaming", "intent": "recommendation"}}
"Add the second one to my cart." -> {"action": "add_to_cart", "item_reference": {"ordinal": 2}, "quantity": 1}
"show me caps" -> {"action": "search_catalog", "query": "caps", "filters": {"category": "cap"}}
"anything under 500?" -> {"action": "search_catalog", "query": "under 500", "filters": {"max_price": 500}}
"I would like to buy the blue hoodie" -> {"action": "add_to_cart", "query": "blue hoodie", "quantity": 1}
"checkout" -> {"action": "checkout"}
"hi" -> {"action": "chitchat"}
"thanks!" -> {"action": "chitchat"}
(agent just listed a Blue Hoodie and a Black Cap) "add the cap" -> {"action": "add_to_cart", "query": "cap", "quantity": 1}

Only output the JSON object. Nothing else.
"""


async def parse_intent(message: str, catalog_snippet: str, history: list | None = None) -> dict:
    """Returns a structured intent dict. Falls back to regex parsing on
    any Ollama failure or malformed JSON response.

    `history` (optional) is a list of {"role": "user"|"assistant",
    "content": str} dicts from the recent conversation. Passing it lets
    the model resolve follow-ups ("the blue one", "add that instead")
    against what was already discussed instead of treating every message
    as a cold start.
    """
    messages = [{"role": "system", "content": SYSTEM_PROMPT + f"\n\nCatalog:\n{catalog_snippet}"}]
    if history:
        messages.extend(history)
    messages.append({"role": "user", "content": message})

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{OLLAMA_URL}/api/chat",
                json={
                    "model": OLLAMA_MODEL,
                    "format": "json",
                    "stream": False,
                    "messages": messages,
                },
            )
            resp.raise_for_status()
            data = resp.json()
            content = data.get("message", {}).get("content", "")
            parsed = json.loads(content)
            parsed["_source"] = "llm"
            return parsed
    except Exception:
        return _fallback_parse(message)


# Keyword-only signals used by the offline fallback parser to recognize
# small talk before falling through to the (wrong, for this case)
# search_catalog default.
_CHITCHAT_WORDS = (
    "hi", "hii", "hello", "hey", "yo", "sup", "greetings",
    "good morning", "good afternoon", "good evening",
    "thanks", "thank you", "thankyou", "thx", "ty", "cheers",
    "bye", "goodbye", "see you", "later", "cya", "take care",
    "yes", "yeah", "yep", "yup", "sure", "okay", "ok",
    "no", "nope", "nah",
)

_COLOR_WORDS = {
    "black", "white", "blue", "red", "green", "yellow", "brown", "grey",
    "gray", "navy", "pink", "purple", "orange", "beige", "maroon", "gold",
    "silver", "olive", "tan", "cream",
}

_RECOMMENDATION_TRIGGERS = (
    "something good for", "something for", "recommend", "suggest",
    "what's good for", "best for", "good option for",
)

_ORDINAL_WORDS = {
    "first": 1, "1st": 1, "second": 2, "2nd": 2, "third": 3, "3rd": 3,
    "fourth": 4, "4th": 4, "fifth": 5, "5th": 5,
}


def _extract_filters(text: str) -> dict:
    """Deterministic regex/keyword extraction used when the LLM is
    unavailable — the same structured shape the LLM would produce, just
    derived with simpler rules."""
    filters = {}

    price_match = re.search(r"\b(?:under|below|less than|within)\s*₹?\s*([\d,]+)", text)
    if price_match:
        filters["max_price"] = float(price_match.group(1).replace(",", ""))

    min_price_match = re.search(r"\b(?:over|above|more than)\s*₹?\s*([\d,]+)", text)
    if min_price_match:
        filters["min_price"] = float(min_price_match.group(1).replace(",", ""))

    for color in _COLOR_WORDS:
        if re.search(rf"\b{color}\b", text):
            filters["color"] = color
            break

    if any(trigger in text for trigger in _RECOMMENDATION_TRIGGERS):
        filters["intent"] = "recommendation"
        # e.g. "something good for gaming" -> category "gaming"
        m = re.search(r"(?:for|good for)\s+([a-z][a-z\s]{2,20})", text)
        if m:
            filters["category"] = m.group(1).strip().split(".")[0].strip()

    return filters


def _extract_ordinal(text: str) -> dict | None:
    for word, n in _ORDINAL_WORDS.items():
        if re.search(rf"\b{word}\b", text):
            return {"ordinal": n}
    return None


def _fallback_parse(message: str) -> dict:
    """Deterministic keyword-based fallback so a bad/unavailable LLM
    response never stalls the demo."""
    text = message.lower().strip()

    # Small talk first, so "hi" / "thanks" / "no" don't fall through to
    # search_catalog (there's no product named "hi").
    if text in _CHITCHAT_WORDS or any(text.startswith(w) for w in _CHITCHAT_WORDS):
        return {"action": "chitchat", "_source": "fallback"}

    # Checkout intent only when there's no product named alongside it.
    if any(w in text for w in ["checkout", "buy now", "pay now", "confirm order", "complete my order"]):
        return {"action": "checkout", "_source": "fallback"}

    ordinal_ref = _extract_ordinal(text)
    add_triggers = ["add", "want", "get me", "buy", "purchase", "order", "i'll take", "i will take"]
    if ordinal_ref and any(w in text for w in add_triggers + ["one"]):
        qty_match = re.search(r"\b(\d+)\b", text)
        qty = int(qty_match.group(1)) if qty_match and qty_match.group(1) != str(ordinal_ref["ordinal"]) else 1
        return {
            "action": "add_to_cart",
            "item_reference": ordinal_ref,
            "quantity": qty,
            "_source": "fallback",
        }

    if any(w in text for w in add_triggers):
        qty = 1
        qty_match = re.search(r"\b(\d+)\b", text)
        if qty_match:
            qty = int(qty_match.group(1))
        return {
            "action": "add_to_cart",
            "query": text,
            "quantity": qty,
            "_source": "fallback",
        }

    return {
        "action": "search_catalog",
        "query": text,
        "filters": _extract_filters(text),
        "_source": "fallback",
    }
