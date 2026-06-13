from fastapi import HTTPException
import jwt


def decode_supabase_jwt(token: str) -> dict:
    from config import settings
    try:
        return jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=401, detail=f"Invalid Supabase token: {exc}")
