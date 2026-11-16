from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..crypto import encrypt
from ..database import get_db
from ..models import Provider
from ..schemas import ProviderCreate, ProviderRead
from ..security import require_auth

router = APIRouter(prefix="/providers", tags=["providers"], dependencies=[Depends(require_auth)])


@router.get("", response_model=list[ProviderRead])
async def list_providers(db: AsyncSession = Depends(get_db)):
    return (await db.execute(select(Provider).order_by(Provider.id))).scalars().all()


@router.post("", response_model=ProviderRead, status_code=201)
async def create_provider(body: ProviderCreate, db: AsyncSession = Depends(get_db)):
    provider = Provider(name=body.name, kind=body.kind, base_url=body.base_url, encrypted_api_key=encrypt(body.api_key), is_active=body.is_active)
    db.add(provider)
    try:
        await db.commit()
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Nome de provedor já existe") from exc
    await db.refresh(provider)
    return provider
