# import uuid
# import datetime as dt
# from sqlalchemy import (
#     Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey
# )
# from sqlalchemy.orm import relationship
# from db.database import Base


# def gen_uuid():
#     return str(uuid.uuid4())


# class Session(Base):
#     __tablename__ = "sessions"

#     id = Column(String(36), primary_key=True, default=gen_uuid)
#     merchant_id = Column(String(64), nullable=False, default="test_merchant_1")
#     user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
#     created_at = Column(DateTime, default=dt.datetime.utcnow)
#     txn_count = Column(Integer, default=0)

#     audit_entries = relationship("AuditLog", back_populates="session")
# class User(Base):
#     __tablename__ = "users"

#     id = Column(String(36), primary_key=True, default=gen_uuid)
#     name = Column(String(128), nullable=False)
#     email = Column(String(255), unique=True, nullable=False, index=True)
#     password_hash = Column(String(255), nullable=False)
#     role = Column(String(16), nullable=False)  # "buyer" | "merchant"
#     created_at = Column(DateTime, default=dt.datetime.utcnow)


# class SessionContext(Base):
#     """
#     Purely additive — a brand new table. Remembers the ordered list of
#     product SKUs shown to a session in its last search result, so "add
#     the second one" can be resolved deterministically against real,
#     already-shown products instead of guessed by the LLM.
#     """
#     __tablename__ = "session_context"

#     session_id = Column(String(36), ForeignKey("sessions.id"), primary_key=True)
#     last_shown_skus_json = Column(Text, default="[]")
#     updated_at = Column(DateTime, default=dt.datetime.utcnow, onupdate=dt.datetime.utcnow)


# class ChatMessage(Base):
#     """
#     Per-session conversation log. Purely additive — a brand new table, so
#     it has no effect on any existing table/row. Used to (a) give the LLM
#     a few turns of real context so it can resolve follow-ups like "the
#     blue one", and (b) let the chitchat handler react sensibly to short
#     replies like "yes"/"no" that follow a specific agent question.
#     """
#     __tablename__ = "chat_messages"

#     id = Column(String(36), primary_key=True, default=gen_uuid)
#     session_id = Column(String(36), ForeignKey("sessions.id"), nullable=False)
#     role = Column(String(16), nullable=False)  # "user" | "agent"
#     content = Column(Text, nullable=False)
#     created_at = Column(DateTime, default=dt.datetime.utcnow)


# class AuditLog(Base):
#     """
#     The core 'explainable' table. Every proposed agent action — whether
#     it results in a real Razorpay call or not — gets a row here.
#     """
#     __tablename__ = "audit_log"

#     id = Column(String(36), primary_key=True, default=gen_uuid)
#     session_id = Column(String(36), ForeignKey("sessions.id"), nullable=False)
#     timestamp = Column(DateTime, default=dt.datetime.utcnow)

#     action_type = Column(String(64), nullable=False)          # e.g. create_payment_link
#     proposed_params_json = Column(Text)                       # raw JSON string
#     agent_reasoning_text = Column(Text)                       # 1-line LLM explanation

#     # allowed | blocked:bound | blocked:gate_pending | approved:human
#     policy_check_result = Column(String(32), nullable=False)

#     razorpay_call_made = Column(Boolean, default=False)
#     razorpay_response_json = Column(Text, nullable=True)
#     final_status = Column(String(32), default="pending")      # pending|success|failed|blocked

#     session = relationship("Session", back_populates="audit_entries")


# class Order(Base):
#     __tablename__ = "orders"

#     id = Column(String(36), primary_key=True, default=gen_uuid)
#     session_id = Column(String(36), ForeignKey("sessions.id"), nullable=False)
#     user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
#     razorpay_order_id = Column(String(64), nullable=True)
#     razorpay_payment_link_id = Column(String(64), nullable=True)
#     amount_inr = Column(Float, nullable=False)
#     items_json = Column(Text)                                 # cart snapshot
#     status = Column(String(32), default="created")            # created|paid|failed|cancelled
#     created_at = Column(DateTime, default=dt.datetime.utcnow)
#     updated_at = Column(DateTime, default=dt.datetime.utcnow, onupdate=dt.datetime.utcnow)


# class CatalogItem(Base):
#     __tablename__ = "catalog_items"

#     sku = Column(String(32), primary_key=True)
#     name = Column(String(128), nullable=False)
#     category = Column(String(64), nullable=False)
#     price_inr = Column(Float, nullable=False)
#     stock = Column(Integer, default=0)
#     cross_sell_sku = Column(String(32), nullable=True)        # simple co-occurrence rule


# import uuid
# import datetime as dt
# from sqlalchemy import (
#     Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey
# )
# from sqlalchemy.orm import relationship
# from db.database import Base


# def gen_uuid():
#     return str(uuid.uuid4())


# class Session(Base):
#     __tablename__ = "sessions"

#     id = Column(String(36), primary_key=True, default=gen_uuid)
#     merchant_id = Column(String(64), nullable=False, default="test_merchant_1")
#     user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
#     created_at = Column(DateTime, default=dt.datetime.utcnow)
#     txn_count = Column(Integer, default=0)

#     audit_entries = relationship("AuditLog", back_populates="session")
# class User(Base):
#     __tablename__ = "users"

#     id = Column(String(36), primary_key=True, default=gen_uuid)
#     name = Column(String(128), nullable=False)
#     email = Column(String(255), unique=True, nullable=False, index=True)
#     password_hash = Column(String(255), nullable=False)
#     role = Column(String(16), nullable=False)  # "buyer" | "merchant"
#     created_at = Column(DateTime, default=dt.datetime.utcnow)


# class ChatMessage(Base):
#     """
#     Per-session conversation log. Purely additive — a brand new table, so
#     it has no effect on any existing table/row. Used to (a) give the LLM
#     a few turns of real context so it can resolve follow-ups like "the
#     blue one", and (b) let the chitchat handler react sensibly to short
#     replies like "yes"/"no" that follow a specific agent question.
#     """
#     __tablename__ = "chat_messages"

#     id = Column(String(36), primary_key=True, default=gen_uuid)
#     session_id = Column(String(36), ForeignKey("sessions.id"), nullable=False)
#     role = Column(String(16), nullable=False)  # "user" | "agent"
#     content = Column(Text, nullable=False)
#     created_at = Column(DateTime, default=dt.datetime.utcnow)


# class AuditLog(Base):
#     """
#     The core 'explainable' table. Every proposed agent action — whether
#     it results in a real Razorpay call or not — gets a row here.
#     """
#     __tablename__ = "audit_log"

#     id = Column(String(36), primary_key=True, default=gen_uuid)
#     session_id = Column(String(36), ForeignKey("sessions.id"), nullable=False)
#     timestamp = Column(DateTime, default=dt.datetime.utcnow)

#     action_type = Column(String(64), nullable=False)          # e.g. create_payment_link
#     proposed_params_json = Column(Text)                       # raw JSON string
#     agent_reasoning_text = Column(Text)                       # 1-line LLM explanation

#     # allowed | blocked:bound | blocked:gate_pending | approved:human
#     policy_check_result = Column(String(32), nullable=False)

#     razorpay_call_made = Column(Boolean, default=False)
#     razorpay_response_json = Column(Text, nullable=True)
#     final_status = Column(String(32), default="pending")      # pending|success|failed|blocked

#     session = relationship("Session", back_populates="audit_entries")


# class Order(Base):
#     __tablename__ = "orders"

#     id = Column(String(36), primary_key=True, default=gen_uuid)
#     session_id = Column(String(36), ForeignKey("sessions.id"), nullable=False)
#     user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
#     razorpay_order_id = Column(String(64), nullable=True)
#     razorpay_payment_link_id = Column(String(64), nullable=True)
#     amount_inr = Column(Float, nullable=False)
#     items_json = Column(Text)                                 # cart snapshot
#     status = Column(String(32), default="created")            # created|paid|failed|cancelled
#     created_at = Column(DateTime, default=dt.datetime.utcnow)
#     updated_at = Column(DateTime, default=dt.datetime.utcnow, onupdate=dt.datetime.utcnow)


# class CatalogItem(Base):
#     __tablename__ = "catalog_items"

#     sku = Column(String(32), primary_key=True)
#     name = Column(String(128), nullable=False)
#     category = Column(String(64), nullable=False)
#     price_inr = Column(Float, nullable=False)
#     stock = Column(Integer, default=0)
#     cross_sell_sku = Column(String(32), nullable=True)        # simple co-occurrence rule


import uuid
import datetime as dt
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey
)
from sqlalchemy.orm import relationship
from db.database import Base


def gen_uuid():
    return str(uuid.uuid4())


class Session(Base):
    __tablename__ = "sessions"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    merchant_id = Column(String(64), nullable=False, default="test_merchant_1")
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=dt.datetime.utcnow)
    txn_count = Column(Integer, default=0)

    audit_entries = relationship("AuditLog", back_populates="session")
class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(128), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(16), nullable=False)  # "buyer" | "merchant"
    created_at = Column(DateTime, default=dt.datetime.utcnow)


class SessionContext(Base):
    """
    Purely additive — a brand new table. Remembers the ordered list of
    product SKUs shown to a session in its last search result, so "add
    the second one" can be resolved deterministically against real,
    already-shown products instead of guessed by the LLM.
    """
    __tablename__ = "session_context"

    session_id = Column(String(36), ForeignKey("sessions.id"), primary_key=True)
    last_shown_skus_json = Column(Text, default="[]")
    updated_at = Column(DateTime, default=dt.datetime.utcnow, onupdate=dt.datetime.utcnow)


class ChatMessage(Base):
    """
    Per-session conversation log. Purely additive — a brand new table, so
    it has no effect on any existing table/row. Used to (a) give the LLM
    a few turns of real context so it can resolve follow-ups like "the
    blue one", and (b) let the chitchat handler react sensibly to short
    replies like "yes"/"no" that follow a specific agent question.
    """
    __tablename__ = "chat_messages"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    session_id = Column(String(36), ForeignKey("sessions.id"), nullable=False)
    role = Column(String(16), nullable=False)  # "user" | "agent"
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=dt.datetime.utcnow)


class AuditLog(Base):
    """
    The core 'explainable' table. Every proposed agent action — whether
    it results in a real Razorpay call or not — gets a row here.
    """
    __tablename__ = "audit_log"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    session_id = Column(String(36), ForeignKey("sessions.id"), nullable=False)
    timestamp = Column(DateTime, default=dt.datetime.utcnow)

    action_type = Column(String(64), nullable=False)          # e.g. create_payment_link
    proposed_params_json = Column(Text)                       # raw JSON string
    agent_reasoning_text = Column(Text)                       # 1-line LLM explanation

    # allowed | blocked:bound | blocked:gate_pending | approved:human
    policy_check_result = Column(String(32), nullable=False)

    razorpay_call_made = Column(Boolean, default=False)
    razorpay_response_json = Column(Text, nullable=True)
    final_status = Column(String(32), default="pending")      # pending|success|failed|blocked

    session = relationship("Session", back_populates="audit_entries")


class Order(Base):
    __tablename__ = "orders"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    session_id = Column(String(36), ForeignKey("sessions.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    razorpay_order_id = Column(String(64), nullable=True)
    razorpay_payment_link_id = Column(String(64), nullable=True)
    amount_inr = Column(Float, nullable=False)
    items_json = Column(Text)                                 # cart snapshot
    status = Column(String(32), default="created")            # created|paid|failed|cancelled
    # Tracks whether inventory has already been decremented for this order.
    # Stock must only ever be decremented once, and only once payment is
    # actually confirmed (never merely on payment-link creation) — this
    # flag is what makes that decrement idempotent across webhook retries,
    # /order-status polling, and the buyer's manual "I completed payment"
    # report all racing to confirm the same order.
    stock_decremented = Column(Boolean, default=False)
    created_at = Column(DateTime, default=dt.datetime.utcnow)
    updated_at = Column(DateTime, default=dt.datetime.utcnow, onupdate=dt.datetime.utcnow)


class WebhookEvent(Base):
    """
    Idempotency ledger for inbound Razorpay webhook deliveries. Razorpay
    may deliver the same event more than once (retries on timeout, etc.),
    so every processed event's key is recorded here first; a second
    delivery of the same key is recognized and skipped before any order /
    stock / audit mutation happens. The primary key doubles as a unique
    constraint, so even two concurrent requests for the same event can't
    both slip through a race between the SELECT and the INSERT.
    """
    __tablename__ = "webhook_events"

    id = Column(String(128), primary_key=True)   # X-Razorpay-Event-Id if present, else sha256(body)
    event_type = Column(String(64), nullable=True)
    received_at = Column(DateTime, default=dt.datetime.utcnow)


class CatalogItem(Base):
    __tablename__ = "catalog_items"

    sku = Column(String(32), primary_key=True)
    name = Column(String(128), nullable=False)
    category = Column(String(64), nullable=False)
    price_inr = Column(Float, nullable=False)
    stock = Column(Integer, default=0)
    cross_sell_sku = Column(String(32), nullable=True)        # simple co-occurrence rule