from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as DBSession
from sqlalchemy import desc

from db.database import get_db
from db.models import AuditLog

router = APIRouter(prefix="/audit", tags=["audit"])


@router.get("")
def list_audit(session_id: str | None = None, limit: int = 100, db: DBSession = Depends(get_db)):
    q = db.query(AuditLog).order_by(desc(AuditLog.timestamp))
    if session_id:
        q = q.filter(AuditLog.session_id == session_id)
    entries = q.limit(limit).all()
    return [
        {
            "id": e.id,
            "session_id": e.session_id,
            "timestamp": e.timestamp.isoformat() if e.timestamp else None,
            "action_type": e.action_type,
            "proposed_params_json": e.proposed_params_json,
            "agent_reasoning_text": e.agent_reasoning_text,
            "policy_check_result": e.policy_check_result,
            "razorpay_call_made": e.razorpay_call_made,
            "razorpay_response_json": e.razorpay_response_json,
            "final_status": e.final_status,
        }
        for e in entries
    ]
