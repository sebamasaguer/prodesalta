from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.match import MatchRead
from app.schemas.prode_group import ProdeGroupRead
from app.schemas.user import UserRead


class PredictionCreate(BaseModel):
    match_id: int
    group_id: int
    home_score_predicted: int = Field(ge=0, le=99)
    away_score_predicted: int = Field(ge=0, le=99)


class PredictionUpdate(BaseModel):
    home_score_predicted: int = Field(ge=0, le=99)
    away_score_predicted: int = Field(ge=0, le=99)


class PredictionRead(BaseModel):
    id: int
    match_id: int
    user_id: int
    group_id: int

    home_score_predicted: int
    away_score_predicted: int

    points: int
    is_locked: bool

    created_at: datetime
    updated_at: datetime

    match: MatchRead

    model_config = {
        "from_attributes": True,
    }


class PredictionSimpleRead(BaseModel):
    id: int
    match_id: int
    user_id: int
    group_id: int

    home_score_predicted: int
    away_score_predicted: int

    points: int
    is_locked: bool

    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class MatchPredictionStatus(BaseModel):
    match: MatchRead
    prediction: PredictionSimpleRead | None = None
    can_predict: bool
    lock_reason: str | None = None


class GroupPredictionsRead(BaseModel):
    group: ProdeGroupRead
    items: list[MatchPredictionStatus]

class GroupPredictionRead(PredictionSimpleRead):
    match: MatchRead
    user: UserRead
