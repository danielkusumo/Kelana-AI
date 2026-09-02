import os
import bcrypt
from fastapi import HTTPException
from jose import jwt
from datetime import datetime, timedelta, timezone
from database import SessionLocal
from models.user import User

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = os.getenv("JWT_ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES"))

def hash_password(password: str) -> str:
    """Hash a plaintext password with bcrypt."""
    return bcrypt.hashpw(
        bytes(password, encoding="utf-8"),
        bcrypt.gensalt(),
    ).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    """Check a plaintext password against a bcrypt hash."""
    return bcrypt.checkpw(
        bytes(plain, encoding="utf-8"),
        bytes(hashed, encoding="utf-8"),
    )

def create_access_token(data: dict) -> str:
    """Build a signed JWT with an expiry claim."""
    to_encode = dict(data)
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    """Decode and validate a JWT, returning its claims."""
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

def get_user_id(authorization: str | None) -> int:
    """Extract the user id from an 'Authorization: Bearer <token>' header."""
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.split(" ", 1)[1].strip()
    try:
        payload = decode_token(token)
        return int(payload.get("sub"))
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def register(name: str, email: str, password: str) -> dict:
    """Create a new user and return a JWT access token + user profile."""
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        user = User(
            name=name,
            email=email,
            password_hash=hash_password(password),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        token = create_access_token({"sub": str(user.id), "email": user.email})
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {"id": user.id, "name": user.name, "email": user.email},
        }
    finally:
        db.close()

def login(email: str, password: str) -> dict:
    """Authenticate a user and return a JWT access token + user profile."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        token = create_access_token({"sub": str(user.id), "email": user.email})
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {"id": user.id, "name": user.name, "email": user.email},
        }
    finally:
        db.close()