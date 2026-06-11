from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.core.deps import CurrentUser, DbSession, require_admin
from app.models.user import User
from app.schemas.player import PlayerCreate, PlayerRead, PlayerUpdate
from app.schemas.team import TeamCreate, TeamDetail, TeamRead, TeamUpdate
from app.services.player_service import (
    create_player_in_team,
    list_team_players,
    remove_player_from_team,
    update_player_in_team,
)
from app.services.team_service import (
    create_team,
    get_team_by_id,
    get_team_detail,
    list_teams,
    update_team,
)


router = APIRouter(prefix="/teams", tags=["teams"])

UPLOAD_DIR = Path("app/static/uploads/flags")
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".svg"}


@router.get("", response_model=list[TeamRead])
def get_teams(
    db: DbSession,
    current_user: CurrentUser,
):
    return list_teams(db)


@router.get("/{team_id}/detail", response_model=TeamDetail)
def get_team_detail_endpoint(team_id: int, db: DbSession):
    detail = get_team_detail(db, team_id)
    if not detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipo no encontrado",
        )
    return detail


@router.post("", response_model=TeamRead, status_code=status.HTTP_201_CREATED)
def create_new_team(
    data: TeamCreate,
    db: DbSession,
    _: User = Depends(require_admin),
):
    return create_team(db, data)


@router.patch("/{team_id}", response_model=TeamRead)
def patch_team(
    team_id: int,
    data: TeamUpdate,
    db: DbSession,
    _: User = Depends(require_admin),
):
    team = get_team_by_id(db, team_id)

    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipo no encontrado",
        )

    return update_team(db, team, data)


@router.delete("/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_team(
    team_id: int,
    db: DbSession,
    _: User = Depends(require_admin),
):
    team = get_team_by_id(db, team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipo no encontrado",
        )
    db.delete(team)
    db.commit()


@router.get("/{team_id}/players", response_model=list[PlayerRead])
def get_team_players(
    team_id: int,
    db: DbSession,
    _: User = Depends(require_admin),
):
    return list_team_players(db, team_id)


@router.post(
    "/{team_id}/players",
    response_model=PlayerRead,
    status_code=status.HTTP_201_CREATED,
)
def add_player_to_team(
    team_id: int,
    data: PlayerCreate,
    db: DbSession,
    _: User = Depends(require_admin),
):
    team = get_team_by_id(db, team_id)
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipo no encontrado",
        )
    return create_player_in_team(db, team_id, data)


@router.patch("/{team_id}/players/{player_id}", response_model=PlayerRead)
def update_team_player(
    team_id: int,
    player_id: int,
    data: PlayerUpdate,
    db: DbSession,
    _: User = Depends(require_admin),
):
    result = update_player_in_team(db, team_id, player_id, data)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Jugador no encontrado en este equipo",
        )
    return result


@router.delete(
    "/{team_id}/players/{player_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_player(
    team_id: int,
    player_id: int,
    db: DbSession,
    _: User = Depends(require_admin),
):
    ok = remove_player_from_team(db, team_id, player_id)
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Jugador no encontrado en este equipo",
        )


@router.post("/{team_id}/flag", response_model=TeamRead)
async def upload_team_flag(
    team_id: int,
    db: DbSession,
    file: UploadFile = File(...),
    _: User = Depends(require_admin),
):
    team = get_team_by_id(db, team_id)

    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipo no encontrado",
        )

    original_name = file.filename or ""
    extension = Path(original_name).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato no permitido. Usá PNG, JPG, JPEG, WEBP o SVG",
        )

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    filename = f"{team.code.lower()}_{uuid4().hex}{extension}"
    destination = UPLOAD_DIR / filename

    content = await file.read()

    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo está vacío",
        )

    destination.write_bytes(content)

    team.flag_url = f"/static/uploads/flags/{filename}"

    db.add(team)
    db.commit()
    db.refresh(team)

    return team