from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.match import Match, MatchStatus
from app.models.prediction import Prediction
from app.models.prode_group import GroupMember, ProdeGroup
from app.models.team import Team
from app.models.tournament import Tournament
from app.models.user import User
from app.schemas.stats import DashboardStatsRead, GroupStatsRead
from app.services.ranking_service import (
    build_general_ranking_response,
    build_group_ranking_entries,
)


def safe_average(total: int, count: int) -> float:
    if count == 0:
        return 0.0

    return round(total / count, 2)


def get_dashboard_stats(db: Session) -> DashboardStatsRead:
    users_count = int(db.execute(select(func.count(User.id))).scalar_one())
    groups_count = int(db.execute(select(func.count(ProdeGroup.id))).scalar_one())
    teams_count = int(db.execute(select(func.count(Team.id))).scalar_one())
    tournaments_count = int(db.execute(select(func.count(Tournament.id))).scalar_one())
    matches_count = int(db.execute(select(func.count(Match.id))).scalar_one())

    scheduled_matches_count = int(
        db.execute(
            select(func.count(Match.id)).where(Match.status == MatchStatus.SCHEDULED)
        ).scalar_one()
    )

    finished_matches_count = int(
        db.execute(
            select(func.count(Match.id)).where(Match.status == MatchStatus.FINISHED)
        ).scalar_one()
    )

    predictions_count = int(db.execute(select(func.count(Prediction.id))).scalar_one())

    total_points_awarded = db.execute(
        select(func.coalesce(func.sum(Prediction.points), 0))
    ).scalar_one()

    total_points_awarded = int(total_points_awarded or 0)

    return DashboardStatsRead(
        users_count=users_count,
        groups_count=groups_count,
        teams_count=teams_count,
        tournaments_count=tournaments_count,
        matches_count=matches_count,
        scheduled_matches_count=scheduled_matches_count,
        finished_matches_count=finished_matches_count,
        predictions_count=predictions_count,
        total_points_awarded=total_points_awarded,
        average_points_per_prediction=safe_average(
            total_points_awarded,
            predictions_count,
        ),
    )


def get_group_stats(db: Session) -> list[GroupStatsRead]:
    groups = list(
        db.execute(
            select(ProdeGroup).order_by(ProdeGroup.created_at.desc())
        ).scalars().all()
    )

    items: list[GroupStatsRead] = []

    for group in groups:
        members_count = int(
            db.execute(
                select(func.count(GroupMember.id)).where(GroupMember.group_id == group.id)
            ).scalar_one()
        )

        predictions_count = int(
            db.execute(
                select(func.count(Prediction.id)).where(Prediction.group_id == group.id)
            ).scalar_one()
        )

        total_points = db.execute(
            select(func.coalesce(func.sum(Prediction.points), 0)).where(
                Prediction.group_id == group.id
            )
        ).scalar_one()

        total_points = int(total_points or 0)

        ranking = build_group_ranking_entries(db, group.id)

        leader_name = None
        leader_points = None

        if ranking:
            leader_name = ranking[0].user.full_name
            leader_points = ranking[0].total_points

        items.append(
            GroupStatsRead(
                group_id=group.id,
                group_name=group.name,
                members_count=members_count,
                predictions_count=predictions_count,
                total_points=total_points,
                average_points=safe_average(total_points, predictions_count),
                leader_name=leader_name,
                leader_points=leader_points,
            )
        )

    return items


def get_top_exact_scores(db: Session, limit: int = 10) -> list[dict]:
    ranking = build_general_ranking_response(db)

    ranking.sort(
        key=lambda item: (
            item["exact_scores_count"],
            item["total_points"],
            item["winner_count"],
        ),
        reverse=True,
    )

    return ranking[:limit]


def get_top_winners(db: Session, limit: int = 10) -> list[dict]:
    ranking = build_general_ranking_response(db)

    ranking.sort(
        key=lambda item: (
            item["winner_count"],
            item["total_points"],
            item["exact_scores_count"],
        ),
        reverse=True,
    )

    return ranking[:limit]


def get_stats_overview(db: Session) -> dict:
    general_ranking = build_general_ranking_response(db)

    return {
        "dashboard": get_dashboard_stats(db),
        "top_general": general_ranking[:10],
        "top_exact_scores": get_top_exact_scores(db, limit=10),
        "top_winners": get_top_winners(db, limit=10),
        "group_stats": get_group_stats(db),
    }