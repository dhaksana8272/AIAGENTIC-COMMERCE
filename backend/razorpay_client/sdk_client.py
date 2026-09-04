"""
Direct Razorpay Python SDK calls — the reliability fallback path.
Used whenever the MCP tool call fails or times out. Same policy gate
applies regardless of which path executes the call.
"""
import os
import razorpay

_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")

_client = None


def get_client():
    global _client
    if _client is None:
        if not _KEY_ID or not _KEY_SECRET:
            raise RuntimeError("RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET not set in .env")
        _client = razorpay.Client(auth=(_KEY_ID, _KEY_SECRET))
    return _client


def create_payment_link(amount_inr: float, description: str, buyer_name: str = "Test Buyer",
                         buyer_email: str = "buyer@example.com", buyer_contact: str = "9876543210") -> dict:
    """Amount must be sent to Razorpay in paise (integer)."""
    client = get_client()
    payload = {
        "amount": int(round(amount_inr * 100)),
        "currency": "INR",
        "description": description,
        "customer": {
            "name": buyer_name,
            "email": buyer_email,
            "contact": buyer_contact,
        },
        "notify": {"sms": False, "email": False},
        "reminder_enable": False,
    }
    return client.payment_link.create(payload)


def fetch_payment_link(payment_link_id: str) -> dict:
    client = get_client()
    return client.payment_link.fetch(payment_link_id)


def fetch_payment(payment_id: str) -> dict:
    client = get_client()
    return client.payment.fetch(payment_id)


def create_order(amount_inr: float, receipt: str) -> dict:
    client = get_client()
    return client.order.create({
        "amount": int(round(amount_inr * 100)),
        "currency": "INR",
        "receipt": receipt,
    })
