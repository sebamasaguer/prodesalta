from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.core.deps import DbSession, require_admin
from app.models.user import User
from app.schemas.sponsor import SponsorCreate, SponsorRead, SponsorUpdate
from app.services.sponsor_service import (
    create_sponsor,
    delete_sponsor,
    get_sponsor_by_id,
    list_sponsors,
    update_sponsor,
)


router = APIRouter(prefix="/sponsors", tags=["sponsors"])

UPLOAD_DIR = Path("app/static/uploads/sponsors")
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".svg"}
MAX_LOGO_SIZE_BYTES = 3 * 1024 * 1024


@router.get("/public", response_model=list[SponsorRead])
def get_public_sponsors(db: DbSession):
    return list_sponsors(db, only_active=True)


@router.get("", response_model=list[SponsorRead])
def get_sponsors(
    db: DbSession,
    _: User = Depends(require_admin),
):
    return list_sponsors(db, only_active=False)


@router.post("", response_model=SponsorRead, status_code=status.HTTP_201_CREATED)
def create_new_sponsor(
    data: SponsorCreate,
    db: DbSession,
    _: User = Depends(require_admin),
):
    return create_sponsor(db, data)


@router.patch("/{sponsor_id}", response_model=SponsorRead)
def patch_sponsor(
    sponsor_id: int,
    data: SponsorUpdate,
    db: DbSession,
    _: User = Depends(require_admin),
):
    sponsor = get_sponsor_by_id(db, sponsor_id)

    if not sponsor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sponsor no encontrado",
        )

    return update_sponsor(db, sponsor, data)


@router.delete("/{sponsor_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_sponsor(
    sponsor_id: int,
    db: DbSession,
    _: User = Depends(require_admin),
):
    sponsor = get_sponsor_by_id(db, sponsor_id)

    if not sponsor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sponsor no encontrado",
        )

    delete_sponsor(db, sponsor)
    return None


@router.post("/{sponsor_id}/logo", response_model=SponsorRead)
async def upload_sponsor_logo(
    sponsor_id: int,
    db: DbSession,
    file: UploadFile = File(...),
    _: User = Depends(require_admin),
):
    sponsor = get_sponsor_by_id(db, sponsor_id)

    if not sponsor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sponsor no encontrado",
        )

    original_name = file.filename or ""
    extension = Path(original_name).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato no permitido. Usá PNG, JPG, JPEG, WEBP o SVG",
        )

    content = await file.read()

    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo está vacío",
        )

    if len(content) > MAX_LOGO_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El logo no puede superar los 3 MB",
        )

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    safe_name = sponsor.name.lower().replace(" ", "-")[:50] or "sponsor"
    filename = f"{safe_name}_{uuid4().hex}{extension}"
    destination = UPLOAD_DIR / filename
    destination.write_bytes(content)

    sponsor.logo_url = f"/static/uploads/sponsors/{filename}"

    db.add(sponsor)
    db.commit()
    db.refresh(sponsor)

    return sponsor
