from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

_security = HTTPBearer()


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(_security),
) -> str:
    from config import settings
    token = credentials.credentials

    if settings.auth_mode == "supabase":
        from auth.supabase_jwt import decode_supabase_jwt
        payload = decode_supabase_jwt(token)
    else:
        from auth.local import decode_local_jwt
        payload = decode_local_jwt(token)

    user_id: str | None = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token missing sub claim")
    return user_id
