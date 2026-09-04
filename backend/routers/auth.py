"""
Real signup/login backed by MySQL. Passwords are hashed with bcrypt —
never stored or returned in plaintext.

NOTE — scope/limitation, stated plainly: this issues no session token or
cookie. The frontend receives the user's id/name/email/role once at
login and holds it in memory; it is not re-verified on every request.
That's an intentional simplification for this build (no route currently
requires authorization), not an oversight — if you later gate any
endpoint by identity, add a real token (e.g. JWT) and verify it there.
"""
import bcrypt
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session as DBSession

from db.database import get_db
from db.models import User

router = APIRouter(prefix="/auth", tags=["auth"])


class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str  # "buyer" | "merchant"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    role: str


def _hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def _verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except (ValueError, TypeError):
        return False


def _user_out(user: User) -> dict:
    return {"id": user.id, "name": user.name, "email": user.email, "role": user.role}


@router.post("/signup")
def signup(req: SignupRequest, db: DBSession = Depends(get_db)):
    if req.role not in ("buyer", "merchant"):
        raise HTTPException(400, "role must be 'buyer' or 'merchant'")
    if len(req.password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters")
    if not req.name.strip():
        raise HTTPException(400, "Name is required")

    email = req.email.lower()
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(409, "An account with this email already exists")

    user = User(
        name=req.name.strip(),
        email=email,
        password_hash=_hash_password(req.password),
        role=req.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _user_out(user)


@router.post("/login")
def login(req: LoginRequest, db: DBSession = Depends(get_db)):
    email = req.email.lower()
    user = db.query(User).filter(User.email == email).first()
    if not user or not _verify_password(req.password, user.password_hash):
        raise HTTPException(401, "Invalid email or password")
    if user.role != req.role:
        raise HTTPException(401, f"This account is registered as a {user.role}, not a {req.role}")
    return _user_out(user)