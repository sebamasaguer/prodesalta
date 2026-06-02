from fastapi import APIRouter, Depends, File, UploadFile
from fastapi.responses import StreamingResponse
from io import BytesIO

from app.core.deps import DbSession, require_admin
from app.models.user import User
from app.schemas.fixture_import import (
    FixtureImportCommitResponse,
    FixtureImportPreviewResponse,
)
from app.services.fixture_import_service import (
    commit_fixture_import,
    create_fixture_template_excel,
    preview_fixture_import,
)


router = APIRouter(prefix="/fixture-import", tags=["fixture-import"])


@router.get("/template")
def download_fixture_template(
    _: User = Depends(require_admin),
):
    content = create_fixture_template_excel()

    headers = {
        "Content-Disposition": 'attachment; filename="plantilla_fixture_prode.xlsx"'
    }

    return StreamingResponse(
        BytesIO(content),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers=headers,
    )


@router.post("/preview", response_model=FixtureImportPreviewResponse)
async def preview_import(
    file: UploadFile = File(...),
    _: User = Depends(require_admin),
):
    return await preview_fixture_import(file)


@router.post("/commit", response_model=FixtureImportCommitResponse)
async def commit_import(
    db: DbSession,
    file: UploadFile = File(...),
    _: User = Depends(require_admin),
):
    return await commit_fixture_import(db, file)