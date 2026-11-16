from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from ..models import Provider, Site
from ..schemas import ActiveProvider, SiteRead
from ..security import require_auth

router = APIRouter(prefix="/dashboard", tags=["dashboard"], dependencies=[Depends(require_auth)])


@router.put("/sites/{site_id}/active-provider", response_model=SiteRead)
async def set_active_provider(site_id: int, body: ActiveProvider, db: AsyncSession = Depends(get_db)):
    site = await db.get(Site, site_id)
    if not site or not await db.get(Provider, body.provider_id):
        raise HTTPException(status_code=404, detail="Site ou provedor não encontrado")
    site.active_provider_id = body.provider_id
    await db.commit()
    await db.refresh(site)
    return site
