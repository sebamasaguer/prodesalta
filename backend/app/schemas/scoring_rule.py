from datetime import datetime

from pydantic import BaseModel, Field


class ScoringRuleCreate(BaseModel):
    tournament_id: int | None = None
    name: str = Field(default="Regla estándar", min_length=3, max_length=160)

    exact_score_points: int = Field(default=5, ge=0, le=100)
    winner_points: int = Field(default=3, ge=0, le=100)
    goal_difference_points: int = Field(default=2, ge=0, le=100)
    participation_points: int = Field(default=0, ge=0, le=100)

    is_default: bool = False
    is_active: bool = True


class ScoringRuleUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=3, max_length=160)

    exact_score_points: int | None = Field(default=None, ge=0, le=100)
    winner_points: int | None = Field(default=None, ge=0, le=100)
    goal_difference_points: int | None = Field(default=None, ge=0, le=100)
    participation_points: int | None = Field(default=None, ge=0, le=100)

    is_default: bool | None = None
    is_active: bool | None = None


class ScoringRuleRead(BaseModel):
    id: int
    tournament_id: int | None
    name: str

    exact_score_points: int
    winner_points: int
    goal_difference_points: int
    participation_points: int

    is_default: bool
    is_active: bool
    created_at: datetime

    model_config = {
        "from_attributes": True,
    }


class MatchScoreCalculationRead(BaseModel):
    match_id: int
    predictions_processed: int
    predictions_locked: int