from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import CurrentUser, DbSession, require_admin
from app.models.user import User
from app.schemas.tournament import TournamentCreate, TournamentRead, TournamentUpdate
from app.services.tournament_service import (
    create_tournament,
    get_tournament_by_id,
    list_active_tournaments,
    list_tournaments,
    update_tournament,
)


router = APIRouter(prefix="/tournaments", tags=["tournaments"])


@router.get("", response_model=list[TournamentRead])
def get_tournaments(
    db: DbSession,
    current_user: CurrentUser,
    active_only: bool = False,
):
    if active_only:
        return list_active_tournaments(db)

    return list_tournaments(db)


@router.post("", response_model=TournamentRead, status_code=status.HTTP_201_CREATED)
def create_new_tournament(
    data: TournamentCreate,
    db: DbSession,
    _: User = Depends(require_admin),
):
    return create_tournament(db, data)


@router.get("/{tournament_id}", response_model=TournamentRead)
def get_tournament(
    tournament_id: int,
    db: DbSession,
    current_user: CurrentUser,
):
    tournament = get_tournament_by_id(db, tournament_id)

    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Torneo no encontrado",
        )

    return tournament


@router.patch("/{tournament_id}", response_model=TournamentRead)
def patch_tournament(
    tournament_id: int,
    data: TournamentUpdate,
    db: DbSession,
    _: User = Depends(require_admin),
):
    tournament = get_tournament_by_id(db, tournament_id)

    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Torneo no encontrado",
        )

    return update_tournament(db, tournament, data)