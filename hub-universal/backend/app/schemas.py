from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: str
    password: str


class ProviderCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    kind: str = "openai"
    base_url: str
    api_key: str = Field(min_length=1)
    is_active: bool = True


class ProviderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    kind: str
    base_url: str
    is_active: bool
    created_at: datetime


class SiteCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    slug: str = Field(pattern=r"^[a-z0-9-]+$")
    description: str | None = None
    active_provider_id: int | None = None
    is_active: bool = True


class SiteRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    slug: str
    description: str | None
    active_provider_id: int | None
    is_active: bool
    created_at: datetime


class ActiveProvider(BaseModel):
    provider_id: int
