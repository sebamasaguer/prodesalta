from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.core.deps import CurrentUser, DbSession, require_admin
from app.models.user import User
from app.schemas.team import TeamCreate, TeamDetail, TeamRead, TeamUpdate
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