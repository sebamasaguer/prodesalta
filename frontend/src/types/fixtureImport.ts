export interface FixtureImportRowPreview {
  row_number: number;

  torneo: string | null;
  anio: number | null;
  fase: string | null;
  grupo: string | null;

  local: string | null;
  codigo_local: string | null;
  visitante: string | null;
  codigo_visitante: string | null;

  fecha_partido: string | null;
  cierre_prediccion: string | null;

  valid: boolean;
  errors: string[];
}

export interface FixtureImportPreviewResponse {
  ok: boolean;
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  rows: FixtureImportRowPreview[];
}

export interface FixtureImportCommitResponse {
  ok: boolean;
  total_rows: number;
  imported_matches: number;
  created_teams: number;
  skipped_rows: number;
  errors: string[];
}