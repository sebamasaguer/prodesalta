import { useState } from "react";
import {
  CheckCircle2,
  Download,
  FileSpreadsheet,
  RefreshCw,
  Upload,
  XCircle,
} from "lucide-react";
import {
  commitFixtureImport,
  downloadFixtureTemplate,
  previewFixtureImport,
} from "../api/fixtureImport";
import type {
  FixtureImportCommitResponse,
  FixtureImportPreviewResponse,
} from "../types/fixtureImport";

function formatDate(value: string | null): string {
  if (!value) return "-";

  try {
    return new Intl.DateTimeFormat("es-AR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function AdminFixtureImportPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<FixtureImportPreviewResponse | null>(null);
  const [commitResult, setCommitResult] =
    useState<FixtureImportCommitResponse | null>(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;

    setSelectedFile(file);
    setPreview(null);
    setCommitResult(null);
    setErrorMessage("");
  }

  async function handleDownloadTemplate() {
    setIsDownloading(true);
    setErrorMessage("");

    try {
      await downloadFixtureTemplate();
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.detail || "No se pudo descargar la plantilla",
      );
    } finally {
      setIsDownloading(false);
    }
  }

  async function handlePreview() {
    if (!selectedFile) {
      setErrorMessage("Seleccioná un archivo Excel");
      return;
    }

    setIsPreviewing(true);
    setErrorMessage("");
    setCommitResult(null);

    try {
      const result = await previewFixtureImport(selectedFile);
      setPreview(result);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.detail || "No se pudo validar el archivo",
      );
    } finally {
      setIsPreviewing(false);
    }
  }

  async function handleCommit() {
    if (!selectedFile) {
      setErrorMessage("Seleccioná un archivo Excel");
      return;
    }

    const confirmImport = confirm(
      "¿Confirmás la importación del fixture? Se crearán equipos y partidos nuevos.",
    );

    if (!confirmImport) return;

    setIsImporting(true);
    setErrorMessage("");
    setCommitResult(null);

    try {
      const result = await commitFixtureImport(selectedFile);
      setCommitResult(result);

      if (result.ok) {
        setPreview(null);
      }
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.detail || "No se pudo importar el archivo",
      );
    } finally {
      setIsImporting(false);
    }
  }

  const canImport = Boolean(preview && preview.invalid_rows === 0 && preview.valid_rows > 0);

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-yellow-300">
          Administración
        </p>

        <h1 className="mt-2 text-4xl font-black">
          Importar fixture por Excel
        </h1>

        <p className="mt-2 text-slate-400">
          Descargá la plantilla, completá partidos y cargá el fixture completo
          de forma masiva.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 font-semibold text-red-200">
          {errorMessage}
        </div>
      )}

      {commitResult && (
        <div
          className={
            commitResult.ok
              ? "mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 font-semibold text-emerald-200"
              : "mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 font-semibold text-red-200"
          }
        >
          <p>
            {commitResult.ok
              ? "Importación completada correctamente."
              : "La importación finalizó con errores."}
          </p>

          <div className="mt-3 grid gap-3 text-sm md:grid-cols-4">
            <div>Total filas: {commitResult.total_rows}</div>
            <div>Partidos importados: {commitResult.imported_matches}</div>
            <div>Equipos creados: {commitResult.created_teams}</div>
            <div>Filas omitidas: {commitResult.skipped_rows}</div>
          </div>

          {commitResult.errors.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
              {commitResult.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400/10 text-yellow-300">
            <FileSpreadsheet size={32} />
          </div>

          <h2 className="text-2xl font-black">
            Plantilla Excel
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            La plantilla contiene las columnas obligatorias y ejemplos de carga.
          </p>

          <button
            onClick={handleDownloadTemplate}
            disabled={isDownloading}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-5 py-3 font-black text-slate-950 hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download size={18} />
            {isDownloading ? "Descargando..." : "Descargar plantilla"}
          </button>

          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
            <p className="mb-3 text-sm font-black text-slate-300">
              Columnas requeridas
            </p>

            <div className="grid gap-2 text-sm text-slate-400 sm:grid-cols-2">
              <span>torneo</span>
              <span>anio</span>
              <span>fase</span>
              <span>grupo</span>
              <span>local</span>
              <span>codigo_local</span>
              <span>visitante</span>
              <span>codigo_visitante</span>
              <span>fecha_partido</span>
              <span>cierre_prediccion</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
          <h2 className="text-2xl font-black">
            Subir archivo
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Primero validá el archivo con vista previa. Solo se permite importar
            si todas las filas son válidas.
          </p>

          <div className="mt-5 rounded-2xl border border-dashed border-white/20 bg-slate-950/60 p-6">
            <input
              type="file"
              accept=".xlsx,.xlsm"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:bg-emerald-400 file:px-4 file:py-2 file:font-black file:text-slate-950 hover:file:bg-emerald-300"
            />

            {selectedFile && (
              <p className="mt-3 text-sm text-slate-400">
                Archivo seleccionado:{" "}
                <span className="font-bold text-white">{selectedFile.name}</span>
              </p>
            )}
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handlePreview}
              disabled={!selectedFile || isPreviewing}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={18} />
              {isPreviewing ? "Validando..." : "Vista previa"}
            </button>

            <button
              onClick={handleCommit}
              disabled={!canImport || isImporting}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3 font-black text-slate-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Upload size={18} />
              {isImporting ? "Importando..." : "Importar fixture"}
            </button>
          </div>
        </div>
      </div>

      {preview && (
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
                Vista previa
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Validación del archivo
              </h2>
            </div>

            <div className="flex flex-wrap gap-3">
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white">
                Total: {preview.total_rows}
              </span>

              <span className="rounded-full bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
                Válidas: {preview.valid_rows}
              </span>

              <span className="rounded-full bg-red-500/10 px-4 py-2 text-sm font-bold text-red-300">
                Errores: {preview.invalid_rows}
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1250px] border-collapse text-left">
                <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-4 py-4">Estado</th>
                    <th className="px-4 py-4">Fila</th>
                    <th className="px-4 py-4">Torneo</th>
                    <th className="px-4 py-4">Año</th>
                    <th className="px-4 py-4">Fase</th>
                    <th className="px-4 py-4">Grupo</th>
                    <th className="px-4 py-4">Local</th>
                    <th className="px-4 py-4">Visitante</th>
                    <th className="px-4 py-4">Partido</th>
                    <th className="px-4 py-4">Cierre</th>
                    <th className="px-4 py-4">Errores</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/10">
                  {preview.rows.map((row) => (
                    <tr key={row.row_number} className="bg-white/[0.02]">
                      <td className="px-4 py-4">
                        {row.valid ? (
                          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-300">
                            <CheckCircle2 size={14} />
                            OK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1 text-xs font-black text-red-300">
                            <XCircle size={14} />
                            Error
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4 font-bold">
                        {row.row_number}
                      </td>

                      <td className="px-4 py-4">
                        {row.torneo || "-"}
                      </td>

                      <td className="px-4 py-4">
                        {row.anio || "-"}
                      </td>

                      <td className="px-4 py-4">
                        {row.fase || "-"}
                      </td>

                      <td className="px-4 py-4">
                        {row.grupo || "-"}
                      </td>

                      <td className="px-4 py-4 font-bold">
                        {row.local || "-"}
                        <p className="text-xs text-slate-500">
                          {row.codigo_local || "-"}
                        </p>
                      </td>

                      <td className="px-4 py-4 font-bold">
                        {row.visitante || "-"}
                        <p className="text-xs text-slate-500">
                          {row.codigo_visitante || "-"}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        {formatDate(row.fecha_partido)}
                      </td>

                      <td className="px-4 py-4">
                        {formatDate(row.cierre_prediccion)}
                      </td>

                      <td className="px-4 py-4">
                        {row.errors.length === 0 ? (
                          <span className="text-slate-500">-</span>
                        ) : (
                          <ul className="list-disc space-y-1 pl-4 text-sm text-red-300">
                            {row.errors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {preview.invalid_rows > 0 && (
            <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200">
              Hay filas con errores. Corregí el Excel y volvé a subirlo antes de importar.
            </div>
          )}
        </div>
      )}
    </div>
  );
}