"""
Deterministic (no-LLM, always-instant) handling for small talk — greetings,
thanks, goodbyes, and short yes/no replies — so these never get routed
through catalog search (which previously produced "I couldn't find a
matching product" for something like "hi").

Also does one small piece of real context-awareness: if the buyer's
previous agent turn ended with a cross-sell suggestion ("...Pairs well
with a Black Cap (₹349) — want to add that too?") and the buyer replies
affirmatively, we hand back the suggested product name so the caller can
run it through the normal add-to-cart + policy flow instead of just
saying "great!" and dropping it.
"""
import re
from typing import Optional, Tuple

GREETINGS = (
    "hi", "hii", "hiii", "hello", "helo", "hey", "heya", "hiya", "yo",
    "good morning", "good afternoon", "good evening", "greetings",
    "sup", "whats up", "what's up",
)
THANKS = (
    "thanks", "thank you", "thankyou", "thx", "ty",
    "much appreciated", "appreciate it", "cheers", "great thanks",
)
FAREWELLS = ("bye", "goodbye", "see you", "see ya", "later", "cya", "take care")
AFFIRM = (
    "yes", "yeah", "yea", "yep", "yup", "sure", "ok", "okay", "alright",
    "sounds good", "please add it", "add it", "go ahead", "do it",
)
NEGATE = (
    "no", "nope", "nah", "not really", "no thanks", "no thank you",
    "not now", "not right now", "maybe later", "skip it",
)

# Matches the exact phrasing chat.py uses when it appends a cross-sell nudge.
_CROSS_SELL_RE = re.compile(r"pairs well with an? (?P<name>.+?) \(₹", re.IGNORECASE)


def _normalize(text: str) -> str:
    return re.sub(r"[^\w\s']", "", (text or "").strip().lower())


def _matches(text: str, phrases: tuple) -> bool:
    return text in phrases or any(text == p or text.startswith(p + " ") for p in phrases)


def extract_cross_sell_name(agent_text: Optional[str]) -> Optional[str]:
    """Pulls the suggested product name out of a prior agent reply such as
    '...Pairs well with a Black Cap (₹349) — want to add that too?'."""
    if not agent_text:
        return None
    m = _CROSS_SELL_RE.search(agent_text)
    return m.group("name").strip() if m else None


def chitchat_reply(message: str, last_agent_message: Optional[str] = None) -> Tuple[str, Optional[str]]:
    """Returns (reply_text, cross_sell_item_name_or_None).

    The second element is only set when the buyer just said "yes" (or
    similar) right after the agent offered a specific cross-sell item —
    the caller should then run that item through the normal add-to-cart
    flow rather than just acknowledging.
    """
    text = _normalize(message)

    if _matches(text, AFFIRM):
        cross_sell_name = extract_cross_sell_name(last_agent_message)
        if cross_sell_name:
            return (f"Adding {cross_sell_name} to your cart too.", cross_sell_name)
        return (
            "Great — let me know what you'd like next, or say 'checkout' when you're ready to pay.",
            None,
        )

    if _matches(text, NEGATE):
        cross_sell_name = extract_cross_sell_name(last_agent_message)
        if cross_sell_name:
            return ("No problem, I'll leave that out. Anything else I can help you find?", None)
        return ("No worries! Let me know if you'd like to browse something else.", None)

    if _matches(text, GREETINGS):
        return (
            "Hey there! 👋 I'm your shopping assistant — I can help you find "
            "products, add them to your cart, and check out. What are you "
            "looking for today?",
            None,
        )

    if _matches(text, THANKS):
        return ("You're welcome! Let me know if you'd like to keep browsing or head to checkout.", None)

    if _matches(text, FAREWELLS):
        return ("Take care! Come back anytime you want to shop.", None)

    return (
        "I'm here to help you shop! You can ask things like \"show me hoodies\" "
        "or \"add a black cap to my cart\".",
        None,
    )