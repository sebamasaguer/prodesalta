from datetime import datetime

from pydantic import BaseModel, Field


class TeamCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    code: str = Field(min_length=2, max_length=12)
    flag_url: str | None = Field(default=None, max_length=500)


class TeamUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    code: str | None = Field(default=None, min_length=2, max_length=12)
    flag_url: str | None = Field(default=None, max_length=500)


class TeamRead(BaseModel):
    id: int
    name: str
    code: str
    flag_url: str | None = None
    created_at: datetime

    model_config = {
        "from_attributes": True,
    }