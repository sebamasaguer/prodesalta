from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.match import Match, MatchStatus
from app.models.team import Team
from app.models.tournament import Tournament
from app.schemas.match import MatchCreate, MatchResultUpdate, MatchUpdate


def get_match_query():
    return (
        select(Match)
        .options(
            joinedload(Match.tournament),
            joinedload(Match.home_team),
            joinedload(Match.away_team),
        )
    )


def list_matches(
    db: Session,
    tournament_id: int | None = None,
    status_filter: MatchStatus | None = None,
) -> list[Match]:
    stmt = get_match_query()

    if tournament_id is not None:
        stmt = stmt.where(Match.tournament_id == tournament_id)

    if status_filter is not None:
        stmt = stmt.where(Match.status == status_filter)

    stmt = stmt.order_by(Match.match_datetime.asc())

    return list(db.execute(stmt).scalars().all())


def list_upcoming_matches(db: Session, limit: int = 20) -> list[Match]:
    now = datetime.now(timezone.utc)

    stmt = (
        get_match_query()
        .where(Match.match_datetime >= now)
        .where(Match.status.in_([MatchStatus.SCHEDULED, MatchStatus.CLOSED]))
        .order_by(Match.match_datetime.asc())
        .limit(limit)
    )

    return list(db.execute(stmt).scalars().all())


def get_match_by_id(db: Session, match_id: int) -> Match | None:
    stmt = get_match_query().where(Match.id == match_id)
    return db.execute(stmt).scalar_one_or_none()


def validate_match_references(
    db: Session,
    tournament_id: int,
    home_team_id: int | None,
    away_team_id: int | None,
) -> None:
    tournament = db.get(Tournament, tournament_id)

    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Torneo no encontrado",
        )

    if home_team_id is not None:
        home_team = db.get(Team, home_team_id)

        if not home_team:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Equipo local no encontrado",
            )

    if away_team_id is not None:
        away_team = db.get(Team, away_team_id)

        if not away_team:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Equipo visitante no encontrado",
            )


def create_match(db: Session, data: MatchCreate) -> Match:
    validate_match_references(
        db=db,
        tournament_id=data.tournament_id,
        home_team_id=data.home_team_id,
        away_team_id=data.away_team_id,
    )

    match = Match(
        tournament_id=data.tournament_id,
        phase=data.phase,
        world_group=data.world_group.strip().upper() if data.world_group else None,
        home_team_id=data.home_team_id,
        away_team_id=data.away_team_id,
        home_placeholder=data.home_placeholder.strip() if data.home_placeholder else None,
        away_placeholder=data.away_placeholder.strip() if data.away_placeholder else None,
        match_datetime=data.match_datetime,
        prediction_deadline=data.prediction_deadline,
        status=MatchStatus.SCHEDULED,
    )

    db.add(match)
    db.commit()
    db.refresh(match)

    return get_match_by_id(db, match.id)


def update_match(
    db: Session,
    match: Match,
    data: MatchUpdate,
) -> Match:
    update_data = data.model_dump(exclude_unset=True)

    next_tournament_id = update_data.get("tournament_id", match.tournament_id)
    next_home_team_id = update_data.get("home_team_id", match.home_team_id)
    next_away_team_id = update_data.get("away_team_id", match.away_team_id)

    if (
        next_home_team_id is not None
        and next_away_team_id is not None
        and next_home_team_id == next_away_team_id
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El equipo local y visitante no pueden ser el mismo",
        )

    validate_match_references(
        db=db,
        tournament_id=next_tournament_id,
        home_team_id=next_home_team_id,
        away_team_id=next_away_team_id,
    )

    next_match_datetime = update_data.get("match_datetime", match.match_datetime)
    next_prediction_deadline = update_data.get(
        "prediction_deadline",
        match.prediction_deadline,
    )

    if next_prediction_deadline > next_match_datetime:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El cierre de predicción no puede ser posterior al inicio del partido",
        )

    if "world_group" in update_data and update_data["world_group"]:
        update_data["world_group"] = update_data["world_group"].strip().upper()

    if "home_placeholder" in update_data and update_data["home_placeholder"]:
        update_data["home_placeholder"] = update_data["home_placeholder"].strip()

    if "away_placeholder" in update_data and update_data["away_placeholder"]:
        update_data["away_placeholder"] = update_data["away_placeholder"].strip()

    for field, value in update_data.items():
        setattr(match, field, value)

    db.add(match)
    db.commit()
    db.refresh(match)

    return get_match_by_id(db, match.id)


def set_match_result(
    db: Session,
    match: Match,
    data: MatchResultUpdate,
) -> Match:
    from app.services.scoring_service import calculate_points_for_match

    match.home_score = data.home_score
    match.away_score = data.away_score
    match.status = data.status

    db.add(match)
    db.commit()
    db.refresh(match)

    if match.status == MatchStatus.FINISHED:
        calculate_points_for_match(db, match)

    return get_match_by_id(db, match.id)


def close_match_for_predictions(db: Session, match: Match) -> Match:
    if match.status == MatchStatus.FINISHED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede cerrar un partido finalizado",
        )

    match.status = MatchStatus.CLOSED

    db.add(match)
    db.commit()
    db.refresh(match)

    return get_match_by_id(db, match.id)