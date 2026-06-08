from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import CurrentUser, DbSession, require_admin
from app.models.match import MatchStatus
from app.models.user import User
from app.schemas.match import MatchCreate, MatchRead, MatchResultUpdate, MatchUpdate
from app.services.match_service import (
    close_match_for_predictions,
    create_match,
    get_match_by_id,
    list_matches,
    list_upcoming_matches,
    set_match_result,
    update_match,
)


router = APIRouter(prefix="/matches", tags=["matches"])


@router.get("/public", response_model=list[MatchRead])
def get_public_matches(db: DbSession):
    return list_matches(db)


@router.get("", response_model=list[MatchRead])
def get_matches(
    db: DbSession,
    current_user: CurrentUser,
    tournament_id: int | None = None,
    status_filter: MatchStatus | None = None,
):
    return list_matches(
        db=db,
        tournament_id=tournament_id,
        status_filter=status_filter,
    )


@router.get("/upcoming", response_model=list[MatchRead])
def get_upcoming_matches(
    db: DbSession,
    current_user: CurrentUser,
    limit: int = 20,
):
    return list_upcoming_matches(db, limit=limit)


@router.post("", response_model=MatchRead, status_code=status.HTTP_201_CREATED)
def create_new_match(
    data: MatchCreate,
    db: DbSession,
    _: User = Depends(require_admin),
):
    return create_match(db, data)


@router.get("/{match_id}", response_model=MatchRead)
def get_match(
    match_id: int,
    db: DbSession,
    current_user: CurrentUser,
):
    match = get_match_by_id(db, match_id)

    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Partido no encontrado",
        )

    return match


@router.patch("/{match_id}", response_model=MatchRead)
def patch_match(
    match_id: int,
    data: MatchUpdate,
    db: DbSession,
    _: User = Depends(require_admin),
):
    match = get_match_by_id(db, match_id)

    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Partido no encontrado",
        )

    return update_match(db, match, data)


@router.put("/{match_id}/result", response_model=MatchRead)
def update_match_result(
    match_id: int,
    data: MatchResultUpdate,
    db: DbSession,
    _: User = Depends(require_admin),
):
    match = get_match_by_id(db, match_id)

    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Partido no encontrado",
        )

    return set_match_result(db, match, data)


@router.put("/{match_id}/close", response_model=MatchRead)
def close_match(
    match_id: int,
    db: DbSession,
    _: User = Depends(require_admin),
):
    match = get_match_by_id(db, match_id)

    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Partido no encontrado",
        )

    return close_match_for_predictions(db, match)