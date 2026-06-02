import { useEffect, useMemo, useState } from "react";
import {
  Edit3,
  Flag,
  ImagePlus,
  Plus,
  RefreshCw,
  Save,
  Search,
  X,
} from "lucide-react";
import {
  createTeam,
  listTeams,
  updateTeam,
  uploadTeamFlag,
} from "../api/fixture";
import type { Team } from "../types/fixture";

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function resolveFlagUrl(value: string | null): string | null {
  if (!value) return null;

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8100/api";

  const baseUrl = apiBaseUrl.replace(/\/api\/?$/, "");

  return `${baseUrl}${value}`;
}

export function AdminTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isUploadingFlag, setIsUploadingFlag] = useState(false);

  const [searchText, setSearchText] = useState("");

  const [form, setForm] = useState({
    name: "",
    code: "",
    flag_url: "",
  });

  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    code: "",
    flag_url: "",
  });

  async function loadTeams() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await listTeams();
      setTeams(data);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.detail || "No se pudieron cargar los equipos",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadTeams();
  }, []);

  const filteredTeams = useMemo(() => {
    const search = normalizeText(searchText);

    if (!search) return teams;

    return teams.filter((team) => {
      const value = normalizeText(`${team.name} ${team.code}`);
      return value.includes(search);
    });
  }, [teams, searchText]);

  function openEdit(team: Team) {
    setEditingTeam(team);
    setEditForm({
      name: team.name,
      code: team.code,
      flag_url: team.flag_url || "",
    });
    setErrorMessage("");
    setSuccessMessage("");
  }

  function closeEdit() {
    setEditingTeam(null);
    setEditForm({
      name: "",
      code: "",
      flag_url: "",
    });
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsCreating(true);

    try {
      await createTeam({
        name: form.name,
        code: form.code,
        flag_url: form.flag_url || null,
      });

      setForm({
        name: "",
        code: "",
        flag_url: "",
      });

      setSuccessMessage("Equipo creado correctamente");
      await loadTeams();

      setTimeout(() => setSuccessMessage(""), 2500);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.detail || "No se pudo crear el equipo",
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function handleSaveEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingTeam) return;

    setErrorMessage("");
    setSuccessMessage("");
    setIsSavingEdit(true);

    try {
      const updated = await updateTeam(editingTeam.id, {
        name: editForm.name,
        code: editForm.code,
        flag_url: editForm.flag_url || null,
      });

      setTeams((current) =>
        current.map((team) => (team.id === updated.id ? updated : team)),
      );

      setEditingTeam(updated);
      setSuccessMessage("País actualizado correctamente");

      setTimeout(() => setSuccessMessage(""), 2500);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.detail || "No se pudo actualizar el país",
      );
    } finally {
      setIsSavingEdit(false);
    }
  }

  async function handleFlagUpload(event: React.ChangeEvent<HTMLInputElement>) {
    if (!editingTeam) return;

    const file = event.target.files?.[0];

    if (!file) return;

    setErrorMessage("");
    setSuccessMessage("");
    setIsUploadingFlag(true);

    try {
      const updated = await uploadTeamFlag(editingTeam.id, file);

      setTeams((current) =>
        current.map((team) => (team.id === updated.id ? updated : team)),
      );

      setEditingTeam(updated);
      setEditForm((current) => ({
        ...current,
        flag_url: updated.flag_url || "",
      }));

      setSuccessMessage("Bandera cargada correctamente");

      setTimeout(() => setSuccessMessage(""), 2500);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.detail || "No se pudo cargar la bandera",
      );
    } finally {
      setIsUploadingFlag(false);
      event.target.value = "";
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-mundial-greenSoft">
            Administración
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight">
            Países / Equipos
          </h1>

          <p className="mt-2 text-slate-300">
            Administrá los países del Mundial 2026, sus códigos y banderas.
          </p>
        </div>

        <button
          onClick={loadTeams}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white hover:bg-white/10"
        >
          <RefreshCw size={18} />
          Actualizar
        </button>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-2xl border border-mundial-red/30 bg-mundial-red/10 px-4 py-3 font-semibold text-red-100">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mb-6 rounded-2xl border border-mundial-green/30 bg-mundial-green/10 px-4 py-3 font-semibold text-mundial-greenSoft">
          {successMessage}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <form
          onSubmit={handleCreate}
          className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mundial-green text-mundial-dark">
              <Plus size={24} />
            </div>

            <h2 className="text-2xl font-black">Nuevo país</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-200">
                Nombre del país
              </label>

              <input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Argentina"
                className="w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 text-white outline-none focus:border-mundial-green"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-200">
                Código
              </label>

              <input
                value={form.code}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    code: event.target.value.toUpperCase(),
                  }))
                }
                placeholder="ARG"
                className="w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 uppercase text-white outline-none focus:border-mundial-green"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-200">
                URL bandera opcional
              </label>

              <input
                value={form.flag_url}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    flag_url: event.target.value,
                  }))
                }
                placeholder="https://..."
                className="w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 text-white outline-none focus:border-mundial-green"
              />
            </div>

            <button
              disabled={isCreating}
              className="w-full rounded-2xl bg-mundial-green px-5 py-3 font-black text-mundial-dark hover:bg-mundial-greenLight disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreating ? "Creando..." : "Crear país"}
            </button>
          </div>
        </form>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-black">Países cargados</h2>

              <p className="mt-1 text-sm text-slate-300">
                Mostrando {filteredTeams.length} de {teams.length}.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 focus-within:border-mundial-green md:w-80">
              <Search size={18} className="text-slate-400" />

              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Buscar país o código..."
                className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
              />

              {searchText && (
                <button
                  type="button"
                  onClick={() => setSearchText("")}
                  className="text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-white/10 bg-mundial-dark/60 p-6 text-slate-200">
              Cargando países...
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-mundial-dark/60 p-8 text-center">
              <Flag className="mx-auto mb-4 text-slate-400" size={36} />

              <h3 className="text-xl font-black">No hay países encontrados</h3>

              <p className="mt-2 text-sm text-slate-300">
                Probá cambiar el filtro de búsqueda.
              </p>
            </div>
          ) : (
            <div className="grid max-h-[720px] gap-3 overflow-y-auto pr-2 md:grid-cols-2">
              {filteredTeams.map((team) => {
                const flagUrl = resolveFlagUrl(team.flag_url);

                return (
                  <div
                    key={team.id}
                    className="rounded-2xl border border-white/10 bg-mundial-dark/70 p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                        {flagUrl ? (
                          <img
                            src={flagUrl}
                            alt={`Bandera de ${team.name}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Flag className="text-slate-400" size={24} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xl font-black">
                          {team.name}
                        </p>

                        <p className="mt-1 text-sm font-black text-red-100">
                          {team.code}
                        </p>
                      </div>

                      <button
                        onClick={() => openEdit(team)}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-slate-200 hover:bg-white/10"
                      >
                        <Edit3 size={16} />
                        Editar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {editingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-mundial-dark p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-red-100">
                  Editar país
                </p>

                <h2 className="mt-2 text-3xl font-black">
                  {editingTeam.name}
                </h2>
              </div>

              <button
                onClick={closeEdit}
                className="rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-200 hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-mundial-dark">
                  {resolveFlagUrl(editForm.flag_url) ? (
                    <img
                      src={resolveFlagUrl(editForm.flag_url) || ""}
                      alt={`Bandera de ${editForm.name}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Flag className="text-slate-400" size={32} />
                  )}
                </div>

                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-200">
                    Bandera del país
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Podés pegar una URL o subir una imagen desde tu equipo.
                  </p>

                  <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-mundial-green px-4 py-2 text-sm font-black text-mundial-dark hover:bg-mundial-greenLight">
                    <ImagePlus size={16} />
                    {isUploadingFlag ? "Subiendo..." : "Subir imagen"}
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.webp,.svg"
                      onChange={handleFlagUpload}
                      disabled={isUploadingFlag}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-200">
                  Nombre del país
                </label>

                <input
                  value={editForm.name}
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 text-white outline-none focus:border-mundial-red"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-200">
                  Código
                </label>

                <input
                  value={editForm.code}
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      code: event.target.value.toUpperCase(),
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 uppercase text-white outline-none focus:border-mundial-red"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-200">
                  URL bandera
                </label>

                <input
                  value={editForm.flag_url}
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      flag_url: event.target.value,
                    }))
                  }
                  placeholder="https://... o /static/uploads/flags/archivo.png"
                  className="w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 text-white outline-none focus:border-mundial-red"
                />
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-black text-white hover:bg-white/10"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-mundial-red px-5 py-3 font-black text-mundial-dark hover:bg-mundial-redLight disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={18} />
                  {isSavingEdit ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}