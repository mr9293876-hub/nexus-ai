from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..models import Provider, Site


async def choose_provider(db: AsyncSession, site_slug: str | None, requested_provider_id: int | None = None) -> Provider:
    if requested_provider_id:
        provider = await db.get(Provider, requested_provider_id)
    else:
        site = None
        if site_slug:
            site = (await db.execute(select(Site).where(Site.slug == site_slug, Site.is_active.is_(True)))).scalar_one_or_none()
        provider = await db.get(Provider, site.active_provider_id) if site and site.active_provider_id else None
        if not provider:
            provider = (await db.execute(select(Provider).where(Provider.is_active.is_(True)).order_by(Provider.id))).scalars().first()
    if not provider or not provider.is_active:
        raise HTTPException(status_code=503, detail="Nenhum provedor ativo configurado")
    return provider
