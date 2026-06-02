from fastapi import APIRouter, HTTPException, status

from app.core.deps import CurrentUser, DbSession
from app.schemas.prediction import (
    MatchPredictionStatus,
    PredictionCreate,
    PredictionRead,
    PredictionSimpleRead,
    PredictionUpdate,
)
from app.services.group_service import get_group_by_id, get_group_member
from app.services.match_service import list_matches
from app.services.prediction_service import (
    can_predict_match,
    create_or_update_prediction,
    get_match_lock_reason,
    get_prediction_by_id,
    get_prediction_for_user_match_group,
    list_user_predictions,
    lock_expired_predictions,
    update_prediction,
)


router = APIRouter(prefix="/predictions", tags=["predictions"])


@router.get("", response_model=list[PredictionRead])
def my_predictions(
    db: DbSession,
    current_user: CurrentUser,
    group_id: int | None = None,
):
    return list_user_predictions(db, current_user, group_id=group_id)


@router.post("", response_model=PredictionRead, status_code=status.HTTP_201_CREATED)
def save_prediction(
    data: PredictionCreate,
    db: DbSession,
    current_user: CurrentUser,
):
    return create_or_update_prediction(db, data, current_user)


@router.patch("/{prediction_id}", response_model=PredictionRead)
def patch_prediction(
    prediction_id: int,
    data: PredictionUpdate,
    db: DbSession,
    current_user: CurrentUser,
):
    prediction = get_prediction_by_id(db, prediction_id)

    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Predicción no encontrada",
        )

    return update_prediction(db, prediction, data, current_user)


@router.get("/group/{group_id}/matches", response_model=list[MatchPredictionStatus])
def group_matches_with_predictions(
    group_id: int,
    db: DbSession,
    current_user: CurrentUser,
):
    group = get_group_by_id(db, group_id)

    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Grupo no encontrado",
        )

    member = get_group_member(db, group_id, current_user.id)

    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No pertenecés a este grupo",
        )

    matches = list_matches(db)
    items: list[MatchPredictionStatus] = []

    for match in matches:
        prediction = get_prediction_for_user_match_group(
            db=db,
            user_id=current_user.id,
            match_id=match.id,
            group_id=group_id,
        )

        prediction_read = (
            PredictionSimpleRead.model_validate(prediction)
            if prediction
            else None
        )

        items.append(
            MatchPredictionStatus(
                match=match,
                prediction=prediction_read,
                can_predict=can_predict_match(match),
                lock_reason=get_match_lock_reason(match),
            )
        )

    return items


@router.post("/lock-expired")
def lock_expired(
    db: DbSession,
    current_user: CurrentUser,
):
    locked_count = lock_expired_predictions(db)

    return {
        "ok": True,
        "locked_count": locked_count,
    }