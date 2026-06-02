from fastapi import APIRouter

from app.core.deps import CurrentUser, DbSession
from app.schemas.ranking import (
    GroupRankingRead,
    MyGroupRankingSummaryRead,
    RankingEntryRead,
)
from app.services.ranking_service import (
    build_general_ranking_response,
    build_group_ranking_response,
    build_my_group_ranking_summaries,
)


router = APIRouter(prefix="/rankings", tags=["rankings"])


@router.get("/general", response_model=list[RankingEntryRead])
def general_ranking(
    db: DbSession,
    current_user: CurrentUser,
):
    return build_general_ranking_response(db)


@router.get("/my-groups", response_model=list[MyGroupRankingSummaryRead])
def my_group_rankings(
    db: DbSession,
    current_user: CurrentUser,
):
    return build_my_group_ranking_summaries(db, current_user)


@router.get("/group/{group_id}", response_model=GroupRankingRead)
def group_ranking(
    group_id: int,
    db: DbSession,
    current_user: CurrentUser,
):
    return build_group_ranking_response(db, group_id, current_user)