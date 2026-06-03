from datetime import datetime

from pydantic import BaseModel, Field


class SponsorBase(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    phone: str | None = Field(default=None, max_length=80)
    logo_url: str | None = Field(default=None, max_length=500)
    display_order: int = Field(default=1, ge=1, le=9999)
    is_active: bool = True


class SponsorCreate(SponsorBase):
    pass


class SponsorUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=160)
    phone: str | None = Field(default=None, max_length=80)
    logo_url: str | None = Field(default=None, max_length=500)
    display_order: int | None = Field(default=None, ge=1, le=9999)
    is_active: bool | None = None


class SponsorRead(BaseModel):
    id: int
    name: str
    phone: str | None = None
    logo_url: str | None = None
    display_order: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }
