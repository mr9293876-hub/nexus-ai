from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from ..models import Provider, Site
from ..schemas import SiteCreate, SiteRead
from ..security import require_auth

router = APIRouter(prefix="/sites", tags=["sites"], dependencies=[Depends(require_auth)])


@router.get("", response_model=list[SiteRead])
async def list_sites(db: AsyncSession = Depends(get_db)):
    return (await db.execute(select(Site).order_by(Site.id))).scalars().all()


@router.post("", response_model=SiteRead, status_code=201)
async def create_site(body: SiteCreate, db: AsyncSession = Depends(get_db)):
    if body.active_provider_id and not await db.get(Provider, body.active_provider_id):
        raise HTTPException(status_code=400, detail="Provedor não encontrado")
    site = Site(**body.model_dump())
    db.add(site)
    try:
        await db.commit()
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Slug ou nome de site já existe") from exc
    await db.refresh(site)
    return site
