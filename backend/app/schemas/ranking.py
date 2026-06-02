from pydantic import BaseModel

from app.schemas.prode_group import ProdeGroupRead
from app.schemas.user import UserRead


class RankingEntryRead(BaseModel):
    position: int

    user_id: int
    user: UserRead

    total_points: int
    predictions_count: int

    exact_scores_count: int
    winner_count: int
    goal_difference_count: int

    finished_predictions_count: int


class GroupRankingRead(BaseModel):
    group: ProdeGroupRead
    entries: list[RankingEntryRead]


class MyGroupRankingSummaryRead(BaseModel):
    group: ProdeGroupRead
    my_position: int | None
    my_points: int
    participants_count: int
    leader_name: str | None
    leader_points: int | None