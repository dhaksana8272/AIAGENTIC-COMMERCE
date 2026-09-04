# """
# Deterministic bound + gate checker.
# INTENTIONALLY contains zero LLM calls — this layer must be provably
# deterministic so judges/auditors can trust it independent of model behaviour.

# Every action the agent wants to take is passed through check_action()
# BEFORE any Razorpay API/MCP call is made.
# """
# import json
# import os

# _POLICY_PATH = os.path.join(os.path.dirname(__file__), "policy.json")

# with open(_POLICY_PATH, "r") as f:
#     POLICY = json.load(f)


# class PolicyResult:
#     def __init__(self, allowed: bool, requires_confirmation: bool, reason: str, code: str):
#         self.allowed = allowed
#         self.requires_confirmation = requires_confirmation
#         self.reason = reason
#         self.code = code  # allowed | blocked:bound | blocked:gate_pending | approved:human

#     def to_dict(self):
#         return {
#             "allowed": self.allowed,
#             "requires_confirmation": self.requires_confirmation,
#             "reason": self.reason,
#             "code": self.code,
#         }


# def check_action(action_type: str, params: dict, session_txn_count: int) -> PolicyResult:
#     """
#     action_type: e.g. "create_payment_link"
#     params: must include amount_inr, category (optional), discount_pct (optional)
#     """
#     amount = float(params.get("amount_inr", 0))
#     category = params.get("category")
#     discount_pct = float(params.get("discount_pct", 0))

#     # --- BOUND checks (hard limits, never overridable by the agent) ---
#     if amount > POLICY["max_txn_amount_inr"]:
#         return PolicyResult(
#             allowed=False,
#             requires_confirmation=False,
#             reason=f"Amount ₹{amount} exceeds merchant max transaction bound of ₹{POLICY['max_txn_amount_inr']}.",
#             code="blocked:bound",
#         )

#     if session_txn_count >= POLICY["max_txns_per_session"]:
#         return PolicyResult(
#             allowed=False,
#             requires_confirmation=False,
#             reason=f"Session has reached the max of {POLICY['max_txns_per_session']} transactions allowed.",
#             code="blocked:bound",
#         )

#     if category and category not in POLICY["allowed_categories"]:
#         return PolicyResult(
#             allowed=False,
#             requires_confirmation=False,
#             reason=f"Category '{category}' is not in the merchant's allowed categories {POLICY['allowed_categories']}.",
#             code="blocked:bound",
#         )

#     if discount_pct > POLICY["max_discount_pct_agent_can_apply"]:
#         return PolicyResult(
#             allowed=False,
#             requires_confirmation=False,
#             reason=f"Agent tried to apply {discount_pct}% discount, exceeding the {POLICY['max_discount_pct_agent_can_apply']}% cap.",
#             code="blocked:bound",
#         )

#     # --- GATE checks (allowed, but needs an explicit human click) ---
#     if amount > POLICY["requires_human_confirm_above_inr"]:
#         return PolicyResult(
#             allowed=True,
#             requires_confirmation=True,
#             reason=f"Amount ₹{amount} is above the ₹{POLICY['requires_human_confirm_above_inr']} auto-approve threshold — buyer confirmation required.",
#             code="blocked:gate_pending",
#         )

#     # --- Auto-approved ---
#     return PolicyResult(
#         allowed=True,
#         requires_confirmation=False,
#         reason=f"Amount ₹{amount} is within the ₹{POLICY['auto_approve_below_inr']} auto-approve threshold.",
#         code="allowed",
#     )


"""
Deterministic bound + gate checker.
INTENTIONALLY contains zero LLM calls — this layer must be provably
deterministic so judges/auditors can trust it independent of model behaviour.

Every action the agent wants to take is passed through check_action()
BEFORE any Razorpay API/MCP call is made.
"""
import json
import os

_POLICY_PATH = os.path.join(os.path.dirname(__file__), "policy.json")

with open(_POLICY_PATH, "r") as f:
    POLICY = json.load(f)


def update_policy(new_values: dict) -> dict:
    """Merchant-facing policy edit: validates, writes policy.json, and
    updates the in-memory POLICY dict in place (mutated, not reassigned,
    so the reference every other module imported stays live)."""
    allowed_keys = {
        "max_txn_amount_inr", "max_txns_per_session", "auto_approve_below_inr",
        "requires_human_confirm_above_inr", "allowed_categories",
        "max_discount_pct_agent_can_apply",
    }
    merged = {**POLICY, **{k: v for k, v in new_values.items() if k in allowed_keys}}

    if merged["auto_approve_below_inr"] > merged["requires_human_confirm_above_inr"]:
        raise ValueError("auto_approve_below_inr must not exceed requires_human_confirm_above_inr")
    if merged["requires_human_confirm_above_inr"] > merged["max_txn_amount_inr"]:
        raise ValueError("requires_human_confirm_above_inr must not exceed max_txn_amount_inr")

    with open(_POLICY_PATH, "w") as f:
        json.dump(merged, f, indent=2)

    POLICY.clear()
    POLICY.update(merged)
    return POLICY


class PolicyResult:
    def __init__(self, allowed: bool, requires_confirmation: bool, reason: str, code: str):
        self.allowed = allowed
        self.requires_confirmation = requires_confirmation
        self.reason = reason
        self.code = code  # allowed | blocked:bound | blocked:gate_pending | approved:human

    def to_dict(self):
        return {
            "allowed": self.allowed,
            "requires_confirmation": self.requires_confirmation,
            "reason": self.reason,
            "code": self.code,
        }


def check_action(action_type: str, params: dict, session_txn_count: int) -> PolicyResult:
    """
    action_type: e.g. "create_payment_link"
    params: must include amount_inr, category (optional), discount_pct (optional)
    """
    amount = float(params.get("amount_inr", 0))
    category = params.get("category")
    discount_pct = float(params.get("discount_pct", 0))

    # --- BOUND checks (hard limits, never overridable by the agent) ---
    if amount > POLICY["max_txn_amount_inr"]:
        return PolicyResult(
            allowed=False,
            requires_confirmation=False,
            reason=f"Amount ₹{amount} exceeds merchant max transaction bound of ₹{POLICY['max_txn_amount_inr']}.",
            code="blocked:bound",
        )

    if session_txn_count >= POLICY["max_txns_per_session"]:
        return PolicyResult(
            allowed=False,
            requires_confirmation=False,
            reason=f"Session has reached the max of {POLICY['max_txns_per_session']} transactions allowed.",
            code="blocked:bound",
        )

    if category and category not in POLICY["allowed_categories"]:
        return PolicyResult(
            allowed=False,
            requires_confirmation=False,
            reason=f"Category '{category}' is not in the merchant's allowed categories {POLICY['allowed_categories']}.",
            code="blocked:bound",
        )

    if discount_pct > POLICY["max_discount_pct_agent_can_apply"]:
        return PolicyResult(
            allowed=False,
            requires_confirmation=False,
            reason=f"Agent tried to apply {discount_pct}% discount, exceeding the {POLICY['max_discount_pct_agent_can_apply']}% cap.",
            code="blocked:bound",
        )

    # --- GATE checks (allowed, but needs an explicit human click) ---
    if amount > POLICY["requires_human_confirm_above_inr"]:
        return PolicyResult(
            allowed=True,
            requires_confirmation=True,
            reason=f"Amount ₹{amount} is above the ₹{POLICY['requires_human_confirm_above_inr']} auto-approve threshold — buyer confirmation required.",
            code="blocked:gate_pending",
        )

    # --- Auto-approved ---
    return PolicyResult(
        allowed=True,
        requires_confirmation=False,
        reason=f"Amount ₹{amount} is within the ₹{POLICY['auto_approve_below_inr']} auto-approve threshold.",
        code="allowed",
    )
