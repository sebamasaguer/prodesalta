import { useEffect, useMemo, useState } from "react";
import {
  Edit3,
  Flag,
  ImagePlus,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import {
  createTeam,
  deleteTeam,
  listTeams,
  updateTeam,
  uploadTeamFlag,
} from "../api/fixture";
import {
  createTeamPlayer,
  listTeamPlayers,
  removeTeamPlayer,
  updateTeamPlayer,
} from "../api/adminPlayers";
import type { Team, TeamUpdatePayload } from "../types/fixture";
import type { PlayerAdmin, PlayerCreatePayload } from "../types/adminPlayers";

type DrawerTab = "datos" | "plantel";

function resolveFlagUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8100/api";
  return `${apiBaseUrl.replace(/\/api\/?$/, "")}${value}`;
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

const EMPTY_EDIT_FORM: TeamUpdatePayload = {
  name: "", code: "", flag_url: "",
  country: "", founded: null,
  coach_name: "", coach_nationality: "", coach_photo: "",
  venue_name: "", venue_city: "", venue_capacity: null, venue_photo: "",
  first_wc_year: null, wc_participations: null, wc_played: null,
  wc_wins: null, wc_draws: null, wc_losses: null,
  wc_goals_scored: null, wc_goals_conceded: null,
};

const EMPTY_PLAYER_FORM: PlayerCreatePayload = {
  name: "", firstname: "", lastname: "",
  nationality: "", age: null, photo_url: "",
  position: "", jersey_number: null,
};

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 text-white outline-none focus:border-mundial-green";
const labelClass =
  "mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400";

export function AdminTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [form, setForm] = useState({ name: "", code: "", flag_url: "" });

  // Drawer
  const [drawerTeam, setDrawerTeam] = useState<Team | null>(null);
  const [drawerTab, setDrawerTab] = useState<DrawerTab>("datos");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isUploadingFlag, setIsUploadingFlag] = useState(false);
  const [editForm, setEditForm] = useState<TeamUpdatePayload>(EMPTY_EDIT_FORM);

  // Delete
  const [deletingTeamId, setDeletingTeamId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Players
  const [players, setPlayers] = useState<PlayerAdmin[]>([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
  const [playerForm, setPlayerForm] = useState<PlayerCreatePayload>(EMPTY_PLAYER_FORM);
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<PlayerAdmin | null>(null);
  const [isSavingPlayer, setIsSavingPlayer] = useState(false);
  const [playerError, setPlayerError] = useState("");

  async function loadTeams() {
    setIsLoading(true);
    setErrorMessage("");
    try {
      setTeams(await listTeams());
    } catch {
      setErrorMessage("No se pudieron cargar los equipos");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadTeams(); }, []);

  const filteredTeams = useMemo(() => {
    const search = normalizeText(searchText);
    if (!search) return teams;
    return teams.filter((t) =>
      normalizeText(`${t.name} ${t.code}`).includes(search),
    );
  }, [teams, searchText]);

  function openDrawer(team: Team) {
    setDrawerTeam(team);
    setDrawerTab("datos");
    setEditForm({
      name: team.name,
      code: team.code,
      flag_url: team.flag_url ?? "",
      country: team.country ?? "",
      founded: team.founded ?? null,
      coach_name: team.coach_name ?? "",
      coach_nationality: team.coach_nationality ?? "",
      coach_photo: team.coach_photo ?? "",
      venue_name: team.venue_name ?? "",
      venue_city: team.venue_city ?? "",
      venue_capacity: team.venue_capacity ?? null,
      venue_photo: team.venue_photo ?? "",
      first_wc_year: team.first_wc_year ?? null,
      wc_participations: team.wc_participations ?? null,
      wc_played: team.wc_played ?? null,
      wc_wins: team.wc_wins ?? null,
      wc_draws: team.wc_draws ?? null,
      wc_losses: team.wc_losses ?? null,
      wc_goals_scored: team.wc_goals_scored ?? null,
      wc_goals_conceded: team.wc_goals_conceded ?? null,
    });
    setErrorMessage("");
    setSuccessMessage("");
    setPlayers([]);
    setEditingPlayer(null);
    setPlayerForm(EMPTY_PLAYER_FORM);
    setPlayerError("");
  }

  function closeDrawer() {
    setDrawerTeam(null);
    setEditingPlayer(null);
    setPlayers([]);
    setPlayerForm(EMPTY_PLAYER_FORM);
    setPlayerError("");
  }

  async function switchTab(tab: DrawerTab) {
    setDrawerTab(tab);
    if (tab === "plantel" && drawerTeam) {
      setIsLoadingPlayers(true);
      setPlayerError("");
      try {
        setPlayers(await listTeamPlayers(drawerTeam.id));
      } catch {
        setPlayerError("No se pudo cargar el plantel");
      } finally {
        setIsLoadingPlayers(false);
      }
    }
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setIsCreating(true);
    setErrorMessage("");
    try {
      await createTeam({ name: form.name, code: form.code, flag_url: form.flag_url || null });
      setForm({ name: "", code: "", flag_url: "" });
      setSuccessMessage("Equipo creado");
      await loadTeams();
      setTimeout(() => setSuccessMessage(""), 2500);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.detail || "No se pudo crear el equipo");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleSaveEdit(event: React.FormEvent) {
    event.preventDefault();
    if (!drawerTeam) return;
    setIsSavingEdit(true);
    setErrorMessage("");
    try {
      const updated = await updateTeam(drawerTeam.id, editForm);
      setTeams((curr) => curr.map((t) => (t.id === updated.id ? updated : t)));
      setDrawerTeam(updated);
      setSuccessMessage("Equipo actualizado");
      setTimeout(() => setSuccessMessage(""), 2500);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.detail || "No se pudo actualizar");
    } finally {
      setIsSavingEdit(false);
    }
  }

  async function handleFlagUpload(event: React.ChangeEvent<HTMLInputElement>) {
    if (!drawerTeam) return;
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploadingFlag(true);
    try {
      const updated = await uploadTeamFlag(drawerTeam.id, file);
      setTeams((curr) => curr.map((t) => (t.id === updated.id ? updated : t)));
      setDrawerTeam(updated);
      setEditForm((curr) => ({ ...curr, flag_url: updated.flag_url ?? "" }));
      setSuccessMessage("Bandera actualizada");
      setTimeout(() => setSuccessMessage(""), 2500);
    } catch {
      setErrorMessage("No se pudo subir la bandera");
    } finally {
      setIsUploadingFlag(false);
      event.target.value = "";
    }
  }

  async function handleDeleteTeam() {
    if (!deletingTeamId) return;
    setIsDeleting(true);
    try {
      await deleteTeam(deletingTeamId);
      setTeams((curr) => curr.filter((t) => t.id !== deletingTeamId));
      if (drawerTeam?.id === deletingTeamId) closeDrawer();
      setSuccessMessage("Equipo eliminado");
      setTimeout(() => setSuccessMessage(""), 2500);
    } catch {
      setErrorMessage("No se pudo eliminar el equipo");
    } finally {
      setIsDeleting(false);
      setDeletingTeamId(null);
    }
  }

  async function handleAddPlayer(event: React.FormEvent) {
    event.preventDefault();
    if (!drawerTeam) return;
    setIsAddingPlayer(true);
    setPlayerError("");
    try {
      const player = await createTeamPlayer(drawerTeam.id, playerForm);
      setPlayers((curr) => [...curr, player]);
      setPlayerForm(EMPTY_PLAYER_FORM);
    } catch {
      setPlayerError("No se pudo agregar el jugador");
    } finally {
      setIsAddingPlayer(false);
    }
  }

  async function handleSavePlayer(event: React.FormEvent) {
    event.preventDefault();
    if (!drawerTeam || !editingPlayer) return;
    setIsSavingPlayer(true);
    setPlayerError("");
    try {
      const updated = await updateTeamPlayer(drawerTeam.id, editingPlayer.id, {
        name: editingPlayer.name,
        firstname: editingPlayer.firstname,
        lastname: editingPlayer.lastname,
        nationality: editingPlayer.nationality,
        age: editingPlayer.age,
        photo_url: editingPlayer.photo_url,
        position: editingPlayer.position,
        jersey_number: editingPlayer.jersey_number,
      });
      setPlayers((curr) => curr.map((p) => (p.id === updated.id ? updated : p)));
      setEditingPlayer(null);
    } catch {
      setPlayerError("No se pudo guardar el jugador");
    } finally {
      setIsSavingPlayer(false);
    }
  }

  async function handleRemovePlayer(playerId: number) {
    if (!drawerTeam) return;
    setPlayerError("");
    try {
      await removeTeamPlayer(drawerTeam.id, playerId);
      setPlayers((curr) => curr.filter((p) => p.id !== playerId));
    } catch {
      setPlayerError("No se pudo quitar el jugador");
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-mundial-greenSoft">
            Administración
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Países / Equipos</h1>
          <p className="mt-2 text-slate-300">
            Administrá los países del Mundial 2026, sus datos y planteles.
          </p>
        </div>
        <button
          onClick={loadTeams}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white hover:bg-white/10"
        >
          <RefreshCw size={18} /> Actualizar
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

      <div className="space-y-6">
        {/* Lista de equipos */}
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
                onChange={(e) => setSearchText(e.target.value)}
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
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filteredTeams.map((team) => {
                const flagUrl = resolveFlagUrl(team.flag_url);
                return (
                  <div
                    key={team.id}
                    className="rounded-2xl border border-white/10 bg-mundial-dark/70 p-4"
                  >
                    <div className="flex flex-col items-center gap-3 text-center">
                      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                        {flagUrl ? (
                          <img
                            src={flagUrl}
                            alt={team.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Flag className="text-slate-400" size={28} />
                        )}
                      </div>
                      <div className="min-w-0 w-full">
                        <p className="truncate font-black">{team.name}</p>
                        <p className="text-xs font-black text-red-100">{team.code}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openDrawer(team)}
                          className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-200 hover:bg-white/10"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => setDeletingTeamId(team.id)}
                          className="rounded-xl border border-red-500/20 bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Formulario crear */}
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
              <label className={labelClass}>Nombre</label>
              <input
                value={form.name}
                onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))}
                placeholder="Argentina"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Código</label>
              <input
                value={form.code}
                onChange={(e) => setForm((c) => ({ ...c, code: e.target.value.toUpperCase() }))}
                placeholder="ARG"
                className={`${inputClass} uppercase`}
                required
              />
            </div>
            <div>
              <label className={labelClass}>URL bandera (opcional)</label>
              <input
                value={form.flag_url}
                onChange={(e) => setForm((c) => ({ ...c, flag_url: e.target.value }))}
                placeholder="https://..."
                className={inputClass}
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

      </div>

      {/* Modal confirmación eliminar */}
      {deletingTeamId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-mundial-dark p-6 shadow-2xl">
            <h2 className="mb-3 text-2xl font-black">¿Eliminar equipo?</h2>
            <p className="mb-6 text-slate-300">
              Esta acción no se puede deshacer. Se eliminarán también los jugadores del plantel.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingTeamId(null)}
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-black hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteTeam}
                disabled={isDeleting}
                className="flex-1 rounded-2xl bg-red-600 px-4 py-3 font-black text-white hover:bg-red-500 disabled:opacity-60"
              >
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer lateral */}
      {drawerTeam && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60" onClick={closeDrawer} />
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col bg-mundial-dark shadow-2xl">
            {/* Header drawer */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div className="flex items-center gap-3">
                {resolveFlagUrl(drawerTeam.flag_url) ? (
                  <img
                    src={resolveFlagUrl(drawerTeam.flag_url)!}
                    alt={drawerTeam.name}
                    className="h-10 w-10 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <Flag size={20} className="text-slate-400" />
                  </div>
                )}
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Editando
                  </p>
                  <h2 className="text-2xl font-black leading-tight">{drawerTeam.name}</h2>
                </div>
              </div>
              <button
                onClick={closeDrawer}
                className="rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-200 hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10">
              {(["datos", "plantel"] as DrawerTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => switchTab(tab)}
                  className={`flex-1 py-4 text-sm font-black uppercase tracking-wider transition ${
                    drawerTab === tab
                      ? "border-b-2 border-mundial-green text-mundial-greenSoft"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab === "datos" ? "Datos del equipo" : "Plantel"}
                </button>
              ))}
            </div>

            {/* Contenido tab */}
            <div className="flex-1 overflow-y-auto p-6">
              {successMessage && drawerTab === "datos" && (
                <div className="mb-4 rounded-2xl border border-mundial-green/30 bg-mundial-green/10 px-4 py-3 text-sm font-semibold text-mundial-greenSoft">
                  {successMessage}
                </div>
              )}
              {errorMessage && drawerTab === "datos" && (
                <div className="mb-4 rounded-2xl border border-mundial-red/30 bg-mundial-red/10 px-4 py-3 text-sm font-semibold text-red-100">
                  {errorMessage}
                </div>
              )}

              {/* TAB DATOS */}
              {drawerTab === "datos" && (
                <form onSubmit={handleSaveEdit} className="space-y-6">
                  {/* Bandera */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className={labelClass}>Bandera</p>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-mundial-dark">
                        {resolveFlagUrl(editForm.flag_url as string) ? (
                          <img
                            src={resolveFlagUrl(editForm.flag_url as string)!}
                            alt="Bandera"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Flag className="text-slate-400" size={28} />
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <input
                          value={editForm.flag_url as string}
                          onChange={(e) =>
                            setEditForm((c) => ({ ...c, flag_url: e.target.value }))
                          }
                          placeholder="https://... o /static/uploads/..."
                          className={inputClass}
                        />
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-mundial-green px-4 py-2 text-sm font-black text-mundial-dark hover:bg-mundial-greenLight">
                          <ImagePlus size={14} />
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
                  </div>

                  {/* Datos básicos */}
                  <div>
                    <p className="mb-3 text-sm font-black uppercase tracking-wider text-slate-400">
                      Datos básicos
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClass}>Nombre</label>
                        <input
                          value={editForm.name as string}
                          onChange={(e) => setEditForm((c) => ({ ...c, name: e.target.value }))}
                          className={inputClass}
                          required
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Código</label>
                        <input
                          value={editForm.code as string}
                          onChange={(e) =>
                            setEditForm((c) => ({ ...c, code: e.target.value.toUpperCase() }))
                          }
                          className={`${inputClass} uppercase`}
                          required
                        />
                      </div>
                      <div>
                        <label className={labelClass}>País</label>
                        <input
                          value={editForm.country as string}
                          onChange={(e) => setEditForm((c) => ({ ...c, country: e.target.value }))}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Año de fundación</label>
                        <input
                          type="number"
                          value={editForm.founded ?? ""}
                          onChange={(e) =>
                            setEditForm((c) => ({
                              ...c,
                              founded: e.target.value ? Number(e.target.value) : null,
                            }))
                          }
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Entrenador */}
                  <div>
                    <p className="mb-3 text-sm font-black uppercase tracking-wider text-slate-400">
                      Cuerpo técnico
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClass}>Entrenador</label>
                        <input
                          value={editForm.coach_name as string}
                          onChange={(e) =>
                            setEditForm((c) => ({ ...c, coach_name: e.target.value }))
                          }
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Nacionalidad DT</label>
                        <input
                          value={editForm.coach_nationality as string}
                          onChange={(e) =>
                            setEditForm((c) => ({ ...c, coach_nationality: e.target.value }))
                          }
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Estadio */}
                  <div>
                    <p className="mb-3 text-sm font-black uppercase tracking-wider text-slate-400">
                      Estadio local
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClass}>Nombre del estadio</label>
                        <input
                          value={editForm.venue_name as string}
                          onChange={(e) =>
                            setEditForm((c) => ({ ...c, venue_name: e.target.value }))
                          }
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Ciudad</label>
                        <input
                          value={editForm.venue_city as string}
                          onChange={(e) =>
                            setEditForm((c) => ({ ...c, venue_city: e.target.value }))
                          }
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Capacidad</label>
                        <input
                          type="number"
                          value={editForm.venue_capacity ?? ""}
                          onChange={(e) =>
                            setEditForm((c) => ({
                              ...c,
                              venue_capacity: e.target.value ? Number(e.target.value) : null,
                            }))
                          }
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Historial mundialista */}
                  <div>
                    <p className="mb-3 text-sm font-black uppercase tracking-wider text-slate-400">
                      Historial mundialista
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {(
                        [
                          ["Primer Mundial", "first_wc_year"],
                          ["Participaciones", "wc_participations"],
                          ["Partidos jugados", "wc_played"],
                          ["Victorias", "wc_wins"],
                          ["Empates", "wc_draws"],
                          ["Derrotas", "wc_losses"],
                          ["Goles a favor", "wc_goals_scored"],
                          ["Goles en contra", "wc_goals_conceded"],
                        ] as [string, keyof TeamUpdatePayload][]
                      ).map(([label, field]) => (
                        <div key={field}>
                          <label className={labelClass}>{label}</label>
                          <input
                            type="number"
                            value={(editForm[field] as number | null) ?? ""}
                            onChange={(e) =>
                              setEditForm((c) => ({
                                ...c,
                                [field]: e.target.value ? Number(e.target.value) : null,
                              }))
                            }
                            className={inputClass}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={closeDrawer}
                      className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-black hover:bg-white/10"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingEdit}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-mundial-red px-5 py-3 font-black text-white hover:bg-mundial-redLight disabled:opacity-60"
                    >
                      <Save size={18} />
                      {isSavingEdit ? "Guardando..." : "Guardar cambios"}
                    </button>
                  </div>
                </form>
              )}

              {/* TAB PLANTEL */}
              {drawerTab === "plantel" && (
                <div className="space-y-6">
                  {playerError && (
                    <div className="rounded-2xl border border-mundial-red/30 bg-mundial-red/10 px-4 py-3 text-sm font-semibold text-red-100">
                      {playerError}
                    </div>
                  )}

                  {/* Lista jugadores */}
                  <div>
                    <p className="mb-3 text-sm font-black uppercase tracking-wider text-slate-400">
                      Jugadores ({players.length})
                    </p>
                    {isLoadingPlayers ? (
                      <p className="text-slate-400">Cargando plantel...</p>
                    ) : players.length === 0 ? (
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-slate-400">
                        <Users size={32} className="mx-auto mb-3" />
                        <p>No hay jugadores cargados</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {players.map((player) =>
                          editingPlayer?.id === player.id ? (
                            <form
                              key={player.id}
                              onSubmit={handleSavePlayer}
                              className="rounded-2xl border border-mundial-green/30 bg-mundial-green/5 p-4"
                            >
                              <div className="grid gap-3 sm:grid-cols-2">
                                <div>
                                  <label className={labelClass}>Nombre *</label>
                                  <input
                                    value={editingPlayer.name}
                                    onChange={(e) =>
                                      setEditingPlayer((p) => p && { ...p, name: e.target.value })
                                    }
                                    className={inputClass}
                                    required
                                  />
                                </div>
                                <div>
                                  <label className={labelClass}>Apellido</label>
                                  <input
                                    value={editingPlayer.lastname ?? ""}
                                    onChange={(e) =>
                                      setEditingPlayer((p) =>
                                        p && { ...p, lastname: e.target.value },
                                      )
                                    }
                                    className={inputClass}
                                  />
                                </div>
                                <div>
                                  <label className={labelClass}>Posición</label>
                                  <input
                                    value={editingPlayer.position ?? ""}
                                    onChange={(e) =>
                                      setEditingPlayer((p) =>
                                        p && { ...p, position: e.target.value },
                                      )
                                    }
                                    className={inputClass}
                                  />
                                </div>
                                <div>
                                  <label className={labelClass}>Número</label>
                                  <input
                                    type="number"
                                    value={editingPlayer.jersey_number ?? ""}
                                    onChange={(e) =>
                                      setEditingPlayer((p) =>
                                        p && {
                                          ...p,
                                          jersey_number: e.target.value
                                            ? Number(e.target.value)
                                            : null,
                                        },
                                      )
                                    }
                                    className={inputClass}
                                  />
                                </div>
                                <div>
                                  <label className={labelClass}>Nacionalidad</label>
                                  <input
                                    value={editingPlayer.nationality ?? ""}
                                    onChange={(e) =>
                                      setEditingPlayer((p) =>
                                        p && { ...p, nationality: e.target.value },
                                      )
                                    }
                                    className={inputClass}
                                  />
                                </div>
                                <div>
                                  <label className={labelClass}>Edad</label>
                                  <input
                                    type="number"
                                    value={editingPlayer.age ?? ""}
                                    onChange={(e) =>
                                      setEditingPlayer((p) =>
                                        p && {
                                          ...p,
                                          age: e.target.value ? Number(e.target.value) : null,
                                        },
                                      )
                                    }
                                    className={inputClass}
                                  />
                                </div>
                              </div>
                              <div className="mt-3 flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingPlayer(null)}
                                  className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2 text-sm font-bold hover:bg-white/10"
                                >
                                  Cancelar
                                </button>
                                <button
                                  type="submit"
                                  disabled={isSavingPlayer}
                                  className="flex-1 rounded-xl bg-mundial-green py-2 text-sm font-black text-mundial-dark hover:bg-mundial-greenLight disabled:opacity-60"
                                >
                                  {isSavingPlayer ? "Guardando..." : "Guardar"}
                                </button>
                              </div>
                            </form>
                          ) : (
                            <div
                              key={player.id}
                              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-mundial-dark/70 px-4 py-3"
                            >
                              <span className="w-7 shrink-0 text-center text-sm font-black text-slate-400">
                                {player.jersey_number ?? "—"}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-bold">{player.name}</p>
                                <p className="text-xs text-slate-400">
                                  {player.position ?? "Sin posición"} ·{" "}
                                  {player.nationality ?? "—"}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setEditingPlayer(player)}
                                  className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/10"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  onClick={() => handleRemovePlayer(player.id)}
                                  className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    )}
                  </div>

                  {/* Agregar jugador */}
                  {!editingPlayer && (
                    <form
                      onSubmit={handleAddPlayer}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="mb-3 flex items-center gap-2">
                        <UserPlus size={18} className="text-mundial-greenSoft" />
                        <p className="text-sm font-black uppercase tracking-wider text-slate-300">
                          Agregar jugador
                        </p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className={labelClass}>Nombre *</label>
                          <input
                            value={playerForm.name}
                            onChange={(e) =>
                              setPlayerForm((c) => ({ ...c, name: e.target.value }))
                            }
                            className={inputClass}
                            required
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Apellido</label>
                          <input
                            value={playerForm.lastname ?? ""}
                            onChange={(e) =>
                              setPlayerForm((c) => ({ ...c, lastname: e.target.value }))
                            }
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Posición</label>
                          <input
                            value={playerForm.position ?? ""}
                            onChange={(e) =>
                              setPlayerForm((c) => ({ ...c, position: e.target.value }))
                            }
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Número</label>
                          <input
                            type="number"
                            value={playerForm.jersey_number ?? ""}
                            onChange={(e) =>
                              setPlayerForm((c) => ({
                                ...c,
                                jersey_number: e.target.value ? Number(e.target.value) : null,
                              }))
                            }
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Nacionalidad</label>
                          <input
                            value={playerForm.nationality ?? ""}
                            onChange={(e) =>
                              setPlayerForm((c) => ({ ...c, nationality: e.target.value }))
                            }
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Edad</label>
                          <input
                            type="number"
                            value={playerForm.age ?? ""}
                            onChange={(e) =>
                              setPlayerForm((c) => ({
                                ...c,
                                age: e.target.value ? Number(e.target.value) : null,
                              }))
                            }
                            className={inputClass}
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={isAddingPlayer}
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-mundial-green px-5 py-3 font-black text-mundial-dark hover:bg-mundial-greenLight disabled:opacity-60"
                      >
                        <Plus size={18} />
                        {isAddingPlayer ? "Agregando..." : "Agregar jugador"}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
