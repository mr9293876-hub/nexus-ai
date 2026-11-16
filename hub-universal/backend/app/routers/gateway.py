from typing import Any
from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from ..crypto import decrypt
from ..database import get_db
from ..security import require_auth
from ..services.adapters import chat_completion
from ..services.router import choose_provider

router = APIRouter(prefix="/v1", tags=["gateway"], dependencies=[Depends(require_auth)])


@router.post("/chat/completions")
async def completions(request: Request, db: AsyncSession = Depends(get_db)) -> dict[str, Any]:
    payload = await request.json()
    provider = await choose_provider(db, request.headers.get("x-site"), payload.pop("provider_id", None))
    return await chat_completion(provider.base_url, decrypt(provider.encrypted_api_key), payload)
