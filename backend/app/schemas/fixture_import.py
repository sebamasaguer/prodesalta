from pydantic import BaseModel


class FixtureImportRowPreview(BaseModel):
    row_number: int

    torneo: str | None = None
    anio: int | None = None
    fase: str | None = None
    grupo: str | None = None

    local: str | None = None
    codigo_local: str | None = None
    visitante: str | None = None
    codigo_visitante: str | None = None

    fecha_partido: str | None = None
    cierre_prediccion: str | None = None

    valid: bool
    errors: list[str] = []


class FixtureImportPreviewResponse(BaseModel):
    ok: bool
    total_rows: int
    valid_rows: int
    invalid_rows: int
    rows: list[FixtureImportRowPreview]


class FixtureImportCommitResponse(BaseModel):
    ok: bool
    total_rows: int
    imported_matches: int
    created_teams: int
    skipped_rows: int
    errors: list[str] = []