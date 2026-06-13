import uuid
import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from auth.deps import get_current_user_id

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: Session = Depends(get_db)):
    from config import settings

    if settings.auth_mode == "supabase":
        async with httpx.AsyncClient() as client:
            res = await client.post(
                f"{settings.supabase_url}/auth/v1/token?grant_type=password",
                json={"email": body.email, "password": body.password},
                headers={"apikey": settings.supabase_anon_key},
            )
        data = res.json()
        if "access_token" not in data:
            raise HTTPException(401, data.get("error_description", "Invalid credentials"))
        return TokenResponse(access_token=data["access_token"])

    from auth.local import authenticate_user, create_access_token
    user = authenticate_user(db, body.email, body.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"sub": user.id, "email": user.email})
    return TokenResponse(access_token=token)


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(body: RegisterRequest, db: Session = Depends(get_db)):
    from config import settings

    if settings.auth_mode == "supabase":
        async with httpx.AsyncClient() as client:
            res = await client.post(
                f"{settings.supabase_url}/auth/v1/signup",
                json={"email": body.email, "password": body.password},
                headers={"apikey": settings.supabase_anon_key},
            )
        data = res.json()
        if "error" in data:
            raise HTTPException(400, data.get("error_description", "Registration failed"))
        token = data.get("access_token", "")
        msg = None if token else "Account created. Check your email to confirm before signing in."
        return TokenResponse(access_token=token, message=msg)

    from models.user import User
    from auth.local import get_password_hash, create_access_token
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(id=str(uuid.uuid4()), email=body.email, hashed_password=get_password_hash(body.password))
    db.add(user)
    db.commit()
    token = create_access_token({"sub": user.id, "email": user.email})
    return TokenResponse(access_token=token)


@router.get("/me")
def me(user_id: str = Depends(get_current_user_id)):
    return {"user_id": user_id}
