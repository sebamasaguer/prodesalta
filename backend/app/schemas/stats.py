from pydantic import BaseModel

from app.schemas.ranking import RankingEntryRead


class DashboardStatsRead(BaseModel):
    users_count: int
    groups_count: int
    teams_count: int
    tournaments_count: int
    matches_count: int
    scheduled_matches_count: int
    finished_matches_count: int
    predictions_count: int
    total_points_awarded: int
    average_points_per_prediction: float


class UserStatsRead(BaseModel):
    user_id: int
    full_name: str
    username: str
    total_points: int
    predictions_count: int
    exact_scores_count: int
    winner_count: int
    goal_difference_count: int
    groups_count: int


class GroupStatsRead(BaseModel):
    group_id: int
    group_name: str
    members_count: int
    predictions_count: int
    total_points: int
    average_points: float
    leader_name: str | None
    leader_points: int | None


class StatsOverviewRead(BaseModel):
    dashboard: DashboardStatsRead
    top_general: list[RankingEntryRead]
    top_exact_scores: list[RankingEntryRead]
    top_winners: list[RankingEntryRead]
    group_stats: list[GroupStatsRead]