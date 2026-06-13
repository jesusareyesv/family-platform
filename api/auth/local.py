from datetime import datetime, timedelta, timezone
from fastapi import HTTPException
import bcrypt
import jwt


def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def create_access_token(payload: dict) -> str:
    from config import settings
    data = payload.copy()
    data["exp"] = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    return jwt.encode(data, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_local_jwt(token: str) -> dict:
    from config import settings
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=401, detail=f"Invalid token: {exc}")


def authenticate_user(db, email: str, password: str):
    from models.user import User
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user
