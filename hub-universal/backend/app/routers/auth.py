from fastapi import APIRouter, HTTPException
from ..config import get_settings
from ..schemas import LoginRequest, Token
from ..security import create_access_token, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=Token)
async def login(body: LoginRequest) -> Token:
    settings = get_settings()
    if body.email != settings.admin_email or not verify_password(body.password, settings.admin_password):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    return Token(access_token=create_access_token(body.email))
