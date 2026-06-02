from collections import defaultdict
from dataclasses import dataclass

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.match import Match, MatchStatus
from app.models.prediction import Prediction
from app.models.prode_group import GroupMember, ProdeGroup
from app.models.user import User
from app.services.group_service import count_group_members, get_group_member
from app.services.scoring_service import (
    get_active_rule_for_tournament,
    calculate_prediction_points,
)


@dataclass
class RankingStats:
    user: User
    total_points: int = 0
    predictions_count: int = 0
    exact_scores_count: int = 0
    winner_count: int = 0
    goal_difference_count: int = 0
    finished_predictions_count: int = 0


def require_group_member_access(
    db: Session,
    group_id: int,
    user: User,
) -> ProdeGroup:
    group = db.get(ProdeGroup, group_id)

    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Grupo no encontrado",
        )

    member = get_group_member(db, group_id, user.id)

    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No pertenecés a este grupo",
        )

    return group


def list_group_members(db: Session, group_id: int) -> list[GroupMember]:
    stmt = (
        select(GroupMember)
        .options(joinedload(GroupMember.user))
        .where(GroupMember.group_id == group_id)
        .order_by(GroupMember.joined_at.asc())
    )

    return list(db.execute(stmt).scalars().all())


def list_group_predictions(db: Session, group_id: int) -> list[Prediction]:
    stmt = (
        select(Prediction)
        .options(
            joinedload(Prediction.user),
            joinedload(Prediction.match).joinedload(Match.tournament),
            joinedload(Prediction.match).joinedload(Match.home_team),
            joinedload(Prediction.match).joinedload(Match.away_team),
        )
        .where(Prediction.group_id == group_id)
        .order_by(Prediction.created_at.asc())
    )

    return list(db.execute(stmt).scalars().all())


def classify_prediction_hit(db: Session, prediction: Prediction) -> str | None:
    match = prediction.match

    if not match:
        return None

    if match.status != MatchStatus.FINISHED:
        return None

    if match.home_score is None or match.away_score is None:
        return None

    rule = get_active_rule_for_tournament(db, match.tournament_id)

    breakdown = calculate_prediction_points(
        official_home=match.home_score,
        official_away=match.away_score,
        predicted_home=prediction.home_score_predicted,
        predicted_away=prediction.away_score_predicted,
        rule=rule,
    )

    if breakdown.reason == "Resultado exacto":
        return "exact"

    if breakdown.reason == "Ganador o empate acertado":
        return "winner"

    if breakdown.reason == "Diferencia de gol acertada":
        return "goal_difference"

    return None


def build_group_ranking_entries(
    db: Session,
    group_id: int,
) -> list[RankingStats]:
    members = list_group_members(db, group_id)
    predictions = list_group_predictions(db, group_id)

    stats_by_user: dict[int, RankingStats] = {}

    for member in members:
        stats_by_user[member.user_id] = RankingStats(
            user=member.user,
            total_points=0,
            predictions_count=0,
            exact_scores_count=0,
            winner_count=0,
            goal_difference_count=0,
            finished_predictions_count=0,
        )

    for prediction in predictions:
        if prediction.user_id not in stats_by_user:
            continue

        stats = stats_by_user[prediction.user_id]

        stats.predictions_count += 1
        stats.total_points += prediction.points or 0

        match = prediction.match

        if match and match.status == MatchStatus.FINISHED:
            stats.finished_predictions_count += 1

            hit_type = classify_prediction_hit(db, prediction)

            if hit_type == "exact":
                stats.exact_scores_count += 1
            elif hit_type == "winner":
                stats.winner_count += 1
            elif hit_type == "goal_difference":
                stats.goal_difference_count += 1

    ranking = list(stats_by_user.values())

    ranking.sort(
        key=lambda item: (
            item.total_points,
            item.exact_scores_count,
            item.winner_count,
            item.goal_difference_count,
            item.predictions_count,
        ),
        reverse=True,
    )

    return ranking


def serialize_group_for_ranking(
    db: Session,
    group: ProdeGroup,
    current_user: User,
):
    member = get_group_member(db, group.id, current_user.id)

    return {
        "id": group.id,
        "name": group.name,
        "description": group.description,
        "invite_code": group.invite_code,
        "owner_user_id": group.owner_user_id,
        "is_active": group.is_active,
        "is_personal": group.is_personal,
        "created_at": group.created_at,
        "members_count": count_group_members(db, group.id),
        "my_role": member.role_in_group if member else None,
    }


def build_group_ranking_response(
    db: Session,
    group_id: int,
    current_user: User,
) -> dict:
    group = require_group_member_access(db, group_id, current_user)
    ranking_stats = build_group_ranking_entries(db, group_id)

    entries = []

    for index, stats in enumerate(ranking_stats, start=1):
        entries.append(
            {
                "position": index,
                "user_id": stats.user.id,
                "user": stats.user,
                "total_points": stats.total_points,
                "predictions_count": stats.predictions_count,
                "exact_scores_count": stats.exact_scores_count,
                "winner_count": stats.winner_count,
                "goal_difference_count": stats.goal_difference_count,
                "finished_predictions_count": stats.finished_predictions_count,
            }
        )

    return {
        "group": serialize_group_for_ranking(db, group, current_user),
        "entries": entries,
    }


def build_my_group_ranking_summaries(
    db: Session,
    current_user: User,
) -> list[dict]:
    stmt = (
        select(ProdeGroup)
        .join(GroupMember, GroupMember.group_id == ProdeGroup.id)
        .where(GroupMember.user_id == current_user.id)
        .order_by(ProdeGroup.created_at.desc())
    )

    groups = list(db.execute(stmt).scalars().all())
    summaries = []

    for group in groups:
        ranking_stats = build_group_ranking_entries(db, group.id)

        my_position = None
        my_points = 0
        leader_name = None
        leader_points = None

        if ranking_stats:
            leader = ranking_stats[0]
            leader_name = leader.user.full_name
            leader_points = leader.total_points

        for index, stats in enumerate(ranking_stats, start=1):
            if stats.user.id == current_user.id:
                my_position = index
                my_points = stats.total_points
                break

        summaries.append(
            {
                "group": serialize_group_for_ranking(db, group, current_user),
                "my_position": my_position,
                "my_points": my_points,
                "participants_count": len(ranking_stats),
                "leader_name": leader_name,
                "leader_points": leader_points,
            }
        )

    return summaries


def build_general_ranking_entries(db: Session) -> list[RankingStats]:
    users_stmt = select(User).where(User.is_active.is_(True)).order_by(User.created_at.asc())
    users = list(db.execute(users_stmt).scalars().all())

    predictions_stmt = (
        select(Prediction)
        .options(
            joinedload(Prediction.user),
            joinedload(Prediction.match).joinedload(Match.tournament),
            joinedload(Prediction.match).joinedload(Match.home_team),
            joinedload(Prediction.match).joinedload(Match.away_team),
        )
        .order_by(Prediction.created_at.asc())
    )

    predictions = list(db.execute(predictions_stmt).scalars().all())

    stats_by_user: dict[int, RankingStats] = {}

    for user in users:
        stats_by_user[user.id] = RankingStats(
            user=user,
            total_points=0,
            predictions_count=0,
            exact_scores_count=0,
            winner_count=0,
            goal_difference_count=0,
            finished_predictions_count=0,
        )

    for prediction in predictions:
        if prediction.user_id not in stats_by_user:
            continue

        stats = stats_by_user[prediction.user_id]

        stats.predictions_count += 1
        stats.total_points += prediction.points or 0

        match = prediction.match

        if match and match.status == MatchStatus.FINISHED:
            stats.finished_predictions_count += 1

            hit_type = classify_prediction_hit(db, prediction)

            if hit_type == "exact":
                stats.exact_scores_count += 1
            elif hit_type == "winner":
                stats.winner_count += 1
            elif hit_type == "goal_difference":
                stats.goal_difference_count += 1

    ranking = list(stats_by_user.values())

    ranking.sort(
        key=lambda item: (
            item.total_points,
            item.exact_scores_count,
            item.winner_count,
            item.goal_difference_count,
            item.predictions_count,
        ),
        reverse=True,
    )

    return ranking


def build_general_ranking_response(db: Session) -> list[dict]:
    ranking_stats = build_general_ranking_entries(db)

    entries = []

    for index, stats in enumerate(ranking_stats, start=1):
        entries.append(
            {
                "position": index,
                "user_id": stats.user.id,
                "user": stats.user,
                "total_points": stats.total_points,
                "predictions_count": stats.predictions_count,
                "exact_scores_count": stats.exact_scores_count,
                "winner_count": stats.winner_count,
                "goal_difference_count": stats.goal_difference_count,
                "finished_predictions_count": stats.finished_predictions_count,
            }
        )

    return entries