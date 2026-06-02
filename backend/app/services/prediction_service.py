from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.match import Match, MatchStatus
from app.models.prediction import Prediction
from app.models.prode_group import ProdeGroup
from app.models.user import User
from app.schemas.prediction import PredictionCreate, PredictionUpdate
from app.services.group_service import get_group_member
from app.services.match_service import get_match_by_id


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def normalize_datetime(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)

    return value.astimezone(timezone.utc)


def get_prediction_query():
    return (
        select(Prediction)
        .options(
            joinedload(Prediction.match).joinedload(Match.tournament),
            joinedload(Prediction.match).joinedload(Match.home_team),
            joinedload(Prediction.match).joinedload(Match.away_team),
            joinedload(Prediction.user),
        )
    )


def get_prediction_by_id(db: Session, prediction_id: int) -> Prediction | None:
    stmt = get_prediction_query().where(Prediction.id == prediction_id)
    return db.execute(stmt).scalar_one_or_none()


def get_prediction_for_user_match_group(
    db: Session,
    user_id: int,
    match_id: int,
    group_id: int,
) -> Prediction | None:
    stmt = get_prediction_query().where(
        Prediction.user_id == user_id,
        Prediction.match_id == match_id,
        Prediction.group_id == group_id,
    )

    return db.execute(stmt).scalar_one_or_none()


def list_user_predictions(
    db: Session,
    user: User,
    group_id: int | None = None,
) -> list[Prediction]:
    stmt = get_prediction_query().where(Prediction.user_id == user.id)

    if group_id is not None:
        stmt = stmt.where(Prediction.group_id == group_id)

    stmt = stmt.order_by(Prediction.created_at.desc())

    return list(db.execute(stmt).scalars().all())


def list_group_predictions(
    db: Session,
    group_id: int,
    current_user: User,
) -> list[Prediction]:
    validate_group_access(db, group_id, current_user)

    stmt = (
        get_prediction_query()
        .where(Prediction.group_id == group_id)
        .order_by(Prediction.created_at.desc())
    )

    return list(db.execute(stmt).scalars().all())


def validate_group_access(
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

    if not group.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El grupo está inactivo",
        )

    member = get_group_member(db, group_id, user.id)

    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No pertenecés a este grupo",
        )

    return group


def get_match_lock_reason(match: Match) -> str | None:
    current_time = now_utc()
    deadline = normalize_datetime(match.prediction_deadline)

    if match.status == MatchStatus.FINISHED:
        return "El partido ya finalizó"

    if match.status == MatchStatus.CANCELLED:
        return "El partido fue cancelado"

    if match.status == MatchStatus.CLOSED:
        return "Las predicciones están cerradas para este partido"

    if match.status == MatchStatus.LIVE:
        return "El partido ya está en vivo"

    if current_time > deadline:
        return "El tiempo para predecir este partido ya venció"

    return None


def can_predict_match(match: Match) -> bool:
    return get_match_lock_reason(match) is None


def validate_match_can_be_predicted(match: Match) -> None:
    reason = get_match_lock_reason(match)

    if reason:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=reason,
        )


def create_or_update_prediction(
    db: Session,
    data: PredictionCreate,
    user: User,
) -> Prediction:
    validate_group_access(db, data.group_id, user)

    match = get_match_by_id(db, data.match_id)

    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Partido no encontrado",
        )

    validate_match_can_be_predicted(match)

    prediction = get_prediction_for_user_match_group(
        db=db,
        user_id=user.id,
        match_id=data.match_id,
        group_id=data.group_id,
    )

    if prediction:
        if prediction.is_locked:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La predicción ya está bloqueada",
            )

        prediction.home_score_predicted = data.home_score_predicted
        prediction.away_score_predicted = data.away_score_predicted

        db.add(prediction)
        db.commit()
        db.refresh(prediction)

        return get_prediction_by_id(db, prediction.id)

    prediction = Prediction(
        match_id=data.match_id,
        user_id=user.id,
        group_id=data.group_id,
        home_score_predicted=data.home_score_predicted,
        away_score_predicted=data.away_score_predicted,
        points=0,
        is_locked=False,
    )

    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    return get_prediction_by_id(db, prediction.id)


def update_prediction(
    db: Session,
    prediction: Prediction,
    data: PredictionUpdate,
    user: User,
) -> Prediction:
    if prediction.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No podés editar una predicción de otro usuario",
        )

    if prediction.is_locked:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La predicción ya está bloqueada",
        )

    validate_group_access(db, prediction.group_id, user)

    match = get_match_by_id(db, prediction.match_id)

    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Partido no encontrado",
        )

    validate_match_can_be_predicted(match)

    prediction.home_score_predicted = data.home_score_predicted
    prediction.away_score_predicted = data.away_score_predicted

    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    return get_prediction_by_id(db, prediction.id)


def lock_expired_predictions(db: Session) -> int:
    current_time = now_utc()

    stmt = (
        select(Prediction)
        .join(Match, Match.id == Prediction.match_id)
        .where(Prediction.is_locked.is_(False))
    )

    predictions = list(db.execute(stmt).scalars().all())
    locked_count = 0

    for prediction in predictions:
        match = db.get(Match, prediction.match_id)

        if not match:
            continue

        deadline = normalize_datetime(match.prediction_deadline)

        if current_time > deadline or match.status != MatchStatus.SCHEDULED:
            prediction.is_locked = True
            db.add(prediction)
            locked_count += 1

    db.commit()

    return locked_count