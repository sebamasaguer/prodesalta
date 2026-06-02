from fastapi import APIRouter

from app.core.deps import CurrentUser, DbSession
from app.schemas.stats import (
    DashboardStatsRead,
    GroupStatsRead,
    StatsOverviewRead,
)
from app.services.stats_service import (
    get_dashboard_stats,
    get_group_stats,
    get_stats_overview,
)


router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/dashboard", response_model=DashboardStatsRead)
def dashboard_stats(
    db: DbSession,
    current_user: CurrentUser,
):
    return get_dashboard_stats(db)


@router.get("/groups", response_model=list[GroupStatsRead])
def groups_stats(
    db: DbSession,
    current_user: CurrentUser,
):
    return get_group_stats(db)


@router.get("/overview", response_model=StatsOverviewRead)
def overview_stats(
    db: DbSession,
    current_user: CurrentUser,
):
    return get_stats_overview(db)