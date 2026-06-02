from datetime import datetime

from pydantic import BaseModel, Field, model_validator

from app.models.match import MatchPhase, MatchStatus
from app.schemas.team import TeamRead
from app.schemas.tournament import TournamentRead


class MatchCreate(BaseModel):
    tournament_id: int
    phase: MatchPhase
    world_group: str | None = Field(default=None, max_length=20)

    home_team_id: int | None = None
    away_team_id: int | None = None

    home_placeholder: str | None = Field(default=None, max_length=160)
    away_placeholder: str | None = Field(default=None, max_length=160)

    match_datetime: datetime
    prediction_deadline: datetime

    @model_validator(mode="after")
    def validate_match(self):
        has_home = self.home_team_id is not None or bool(self.home_placeholder)
        has_away = self.away_team_id is not None or bool(self.away_placeholder)

        if not has_home:
            raise ValueError("Falta equipo local o texto del cruce local")

        if not has_away:
            raise ValueError("Falta equipo visitante o texto del cruce visitante")

        if (
            self.home_team_id is not None
            and self.away_team_id is not None
            and self.home_team_id == self.away_team_id
        ):
            raise ValueError("El equipo local y visitante no pueden ser el mismo")

        if self.prediction_deadline > self.match_datetime:
            raise ValueError("El cierre de predicción no puede ser posterior al inicio del partido")

        return self


class MatchUpdate(BaseModel):
    tournament_id: int | None = None
    phase: MatchPhase | None = None
    world_group: str | None = Field(default=None, max_length=20)

    home_team_id: int | None = None
    away_team_id: int | None = None

    home_placeholder: str | None = Field(default=None, max_length=160)
    away_placeholder: str | None = Field(default=None, max_length=160)

    match_datetime: datetime | None = None
    prediction_deadline: datetime | None = None

    status: MatchStatus | None = None


class MatchResultUpdate(BaseModel):
    home_score: int = Field(ge=0, le=99)
    away_score: int = Field(ge=0, le=99)
    status: MatchStatus = MatchStatus.FINISHED


class MatchRead(BaseModel):
    id: int
    tournament_id: int
    phase: MatchPhase
    world_group: str | None

    home_team_id: int | None
    away_team_id: int | None

    home_placeholder: str | None
    away_placeholder: str | None

    match_datetime: datetime
    prediction_deadline: datetime

    status: MatchStatus
    home_score: int | None
    away_score: int | None

    created_at: datetime

    tournament: TournamentRead
    home_team: TeamRead | None = None
    away_team: TeamRead | None = None

    model_config = {
        "from_attributes": True,
    }