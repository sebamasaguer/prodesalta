from datetime import datetime

from pydantic import BaseModel, Field


class TournamentCreate(BaseModel):
    name: str = Field(min_length=3, max_length=160)
    year: int = Field(ge=1900, le=2200)
    description: str | None = Field(default=None, max_length=2000)
    is_active: bool = True


class TournamentUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=3, max_length=160)
    year: int | None = Field(default=None, ge=1900, le=2200)
    description: str | None = Field(default=None, max_length=2000)
    is_active: bool | None = None


class TournamentRead(BaseModel):
    id: int
    name: str
    year: int
    description: str | None
    is_active: bool
    created_at: datetime

    model_config = {
        "from_attributes": True,
    }
