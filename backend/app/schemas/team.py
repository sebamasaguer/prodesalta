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


class PlayerInSquad(BaseModel):
    id: int
    name: str
    number: int | None = None
    position: str | None = None
    age: int | None = None
    nationality: str | None = None
    photo_url: str | None = None

    model_config = {
        "from_attributes": True,
    }


class TeamDetail(BaseModel):
    id: int
    name: str
    code: str
    flag_url: str | None = None
    coach_name: str | None = None
    coach_nationality: str | None = None
    country: str | None = None
    founded: int | None = None
    first_wc_year: int | None = None
    wc_participations: int | None = None
    wc_played: int | None = None
    wc_wins: int | None = None
    wc_draws: int | None = None
    wc_losses: int | None = None
    wc_goals_scored: int | None = None
    wc_goals_conceded: int | None = None
    players: list[PlayerInSquad] = []

    model_config = {
        "from_attributes": True,
    }