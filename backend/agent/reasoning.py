"""
Generates the 1-line human-readable "why" string that goes into the
audit log next to every proposed action. Also has a deterministic
fallback so the audit log is never empty even if Ollama is down.
"""
import os
import httpx

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")


async def generate_reasoning(action_type: str, params: dict) -> str:
    prompt = (
        f"In one short plain-language sentence, explain why a shopping agent "
        f"is about to perform this action: {action_type} with params {params}. "
        f"Do not use markdown. Output only the sentence."
    )
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{OLLAMA_URL}/api/chat",
                json={
                    "model": OLLAMA_MODEL,
                    "stream": False,
                    "messages": [{"role": "user", "content": prompt}],
                },
            )
            resp.raise_for_status()
            data = resp.json()
            text = data.get("message", {}).get("content", "").strip()
            return text if text else _fallback_reasoning(action_type, params)
    except Exception:
        return _fallback_reasoning(action_type, params)


def _fallback_reasoning(action_type: str, params: dict) -> str:
    if action_type == "create_payment_link":
        return f"Creating a payment link for ₹{params.get('amount_inr')} because the buyer confirmed their cart."
    if action_type == "add_to_cart":
        return f"Adding {params.get('sku', 'item')} to cart based on the buyer's request."
    return f"Executing '{action_type}' based on the buyer's stated intent."
