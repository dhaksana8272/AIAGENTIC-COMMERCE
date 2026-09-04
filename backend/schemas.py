# from typing import Optional, List, Dict, Any
# from pydantic import BaseModel


# class ChatRequest(BaseModel):
#     session_id: Optional[str] = None
#     user_id: Optional[str] = None
#     message: str

# class ChatResponse(BaseModel):
#     session_id: str
#     reply: str
#     proposed_action: Optional[Dict[str, Any]] = None
#     requires_confirmation: bool = False
#     audit_id: Optional[str] = None


# class ConfirmRequest(BaseModel):
#     session_id: str
#     audit_id: str
#     approve: bool


# class CheckoutResult(BaseModel):
#     status: str
#     payment_link: Optional[str] = None
#     order_id: Optional[str] = None
#     message: str


# class AuditEntryOut(BaseModel):
#     id: str
#     session_id: str
#     timestamp: str
#     action_type: str
#     proposed_params_json: Optional[str]
#     agent_reasoning_text: Optional[str]
#     policy_check_result: str
#     razorpay_call_made: bool
#     razorpay_response_json: Optional[str]
#     final_status: str

#     class Config:
#         from_attributes = True



from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    user_id: Optional[str] = None
    message: str

class ProductCard(BaseModel):
    sku: str
    name: str
    price_inr: float
    stock: int
    category: str
    rating: float
    review_count: int


class ChatResponse(BaseModel):
    session_id: str
    reply: str
    proposed_action: Optional[Dict[str, Any]] = None
    requires_confirmation: bool = False
    audit_id: Optional[str] = None
    products: Optional[List[ProductCard]] = None


class ConfirmRequest(BaseModel):
    session_id: str
    audit_id: str
    approve: bool


class CheckoutResult(BaseModel):
    status: str
    payment_link: Optional[str] = None
    order_id: Optional[str] = None
    message: str


class AuditEntryOut(BaseModel):
    id: str
    session_id: str
    timestamp: str
    action_type: str
    proposed_params_json: Optional[str]
    agent_reasoning_text: Optional[str]
    policy_check_result: str
    razorpay_call_made: bool
    razorpay_response_json: Optional[str]
    final_status: str

    class Config:
        from_attributes = True
