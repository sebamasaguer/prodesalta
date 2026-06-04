import { useEffect, useMemo, useState } from "react";
import { Edit2, RefreshCw, Save, X } from "lucide-react";
import {
  createTournament,
  listTournaments,
  updateTournament,
} from "../api/tournaments";
import type {
  Tournament,
  TournamentCreatePayload,
  TournamentUpdatePayload,
} from "../types/tournament";

type TournamentFormState = {
  name: string;
  year: number;
  description: string;
  is_active: boolean;
};

const emptyCreateForm: TournamentFormState = {
  name: "Mundial 2026",
  year: 2026,
  description: "Torneo base para Prode Mundial.",
  is_active: true,
};

function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object" &&
    (error as { response?: { data?: { detail?: unknown } } }).response?.data
      ?.detail
  ) {
    const detail = (error as { response: { data: { detail: unknown } } })
      .response.data.detail;

    if (typeof detail === "string") {
      return detail;
    }
  }

  return fallback;
}

export function AdminTournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [form, setForm] = useState<TournamentFormState>(emptyCreateForm);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(
    null,
  );
  const [editForm, setEditForm] = useState<TournamentFormState>({
    name: "",
    year: 2026,
    description: "",
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [savingCreate, setSavingCreate] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [editErrorMessage, setEditErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const activeCount = useMemo(
    () => tournaments.filter((tournament) => tournament.is_active).length,
    [tournaments],
  );

  const inactiveCount = tournaments.length - activeCount;

  async function loadTournaments() {
    try {
      setLoading(true);
      setErrorMessage("");
      const data = await listTournaments(false);
      setTournaments(data);
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "No se pudieron cargar los torneos"),
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const payload: TournamentCreatePayload = {
      name: form.name.trim(),
      year: Number(form.year),
      description: form.description.trim() || null,
      is_active: form.is_active,
    };

    try {
      setSavingCreate(true);
      await createTournament(payload);
      setSuccessMessage("Torneo creado correctamente.");
      setForm(emptyCreateForm);
      await loadTournaments();
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "No se pudo crear el torneo"),
      );
    } finally {
      setSavingCreate(false);
    }
  }

  function openEditModal(tournament: Tournament) {
    setEditingTournament(tournament);
    setEditErrorMessage("");
    setSuccessMessage("");
    setEditForm({
      name: tournament.name,
      year: tournament.year,
      description: tournament.description ?? "",
      is_active: tournament.is_active,
    });
  }

  function closeEditModal() {
    setEditingTournament(null);
    setEditErrorMessage("");
  }

  async function handleEditSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingTournament) {
      return;
    }

    setEditErrorMessage("");
    setSuccessMessage("");

    const payload: TournamentUpdatePayload = {
      name: editForm.name.trim(),
      year: Number(editForm.year),
      description: editForm.description.trim() || null,
      is_active: editForm.is_active,
    };

    try {
      setSavingEdit(true);
      const updatedTournament = await updateTournament(
        editingTournament.id,
        payload,
      );

      setTournaments((current) =>
        current.map((tournament) =>
          tournament.id === updatedTournament.id ? updatedTournament : tournament,
        ),
      );

      setSuccessMessage("Torneo actualizado correctamente.");
      closeEditModal();
    } catch (error) {
      setEditErrorMessage(
        getErrorMessage(error, "No se pudo actualizar el torneo"),
      );
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleToggleActive(tournament: Tournament) {
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const updatedTournament = await updateTournament(tournament.id, {
        is_active: !tournament.is_active,
      });

      setTournaments((current) =>
        current.map((item) =>
          item.id === updatedTournament.id ? updatedTournament : item,
        ),
      );

      setSuccessMessage(
        updatedTournament.is_active
          ? "Torneo activado correctamente."
          : "Torneo desactivado correctamente.",
      );
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "No se pudo cambiar el estado del torneo"),
      );
    }
  }

  useEffect(() => {
    loadTournaments();
  }, []);

  return (
    <div className="space-y-8 text-white">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.35em] text-mundial-red">
              Administración
            </p>
            <h1 className="mt-3 text-4xl font-black">Torneos</h1>
            <p className="mt-3 max-w-3xl text-base font-semibold leading-7 text-slate-300">
              Creá y editá torneos para asociar equipos y partidos. La edición
              está disponible solo para administradores del sistema.
            </p>
          </div>

          <button
            type="button"
            onClick={loadTournaments}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Actualizar
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-300">
            Total
          </p>
          <p className="mt-3 text-4xl font-black">{tournaments.length}</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-300">
            Activos
          </p>
          <p className="mt-3 text-4xl font-black text-mundial-green">
            {activeCount}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-300">
            Inactivos
          </p>
          <p className="mt-3 text-4xl font-black text-mundial-red">
            {inactiveCount}
          </p>
        </div>
      </section>

      {(errorMessage || successMessage) && (
        <section
          className={
            errorMessage
              ? "rounded-3xl border border-mundial-red/30 bg-mundial-red/10 px-5 py-4 text-sm font-bold text-red-100"
              : "rounded-3xl border border-mundial-green/30 bg-mundial-green/10 px-5 py-4 text-sm font-bold text-green-100"
          }
        >
          {errorMessage || successMessage}
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-white/5 p-6"
        >
          <h2 className="mb-5 text-2xl font-black">Nuevo torneo</h2>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-200">
                Nombre
              </label>
              <input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 font-semibold text-white outline-none placeholder:text-slate-400 focus:border-mundial-gold"
                placeholder="Mundial 2026"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-200">
                Año
              </label>
              <input
                type="number"
                value={form.year}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    year: Number(event.target.value),
                  }))
                }
                className="w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 font-semibold text-white outline-none placeholder:text-slate-400 focus:border-mundial-gold"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-200">
                Descripción
              </label>
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                rows={5}
                className="w-full resize-none rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 font-semibold text-white outline-none placeholder:text-slate-400 focus:border-mundial-gold"
                placeholder="Descripción del torneo"
              />
            </div>

            <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <span className="text-sm font-black text-white">
                Torneo activo
              </span>
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    is_active: event.target.checked,
                  }))
                }
                className="h-5 w-5 accent-mundial-green"
              />
            </label>

            <button
              type="submit"
              disabled={savingCreate}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-mundial-red px-5 py-3 font-black text-white shadow-sm transition hover:bg-mundial-redLight disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={18} />
              {savingCreate ? "Creando..." : "Crear torneo"}
            </button>
          </div>
        </form>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-black">Torneos cargados</h2>
            {loading && (
              <span className="text-sm font-bold text-slate-300">
                Cargando...
              </span>
            )}
          </div>

          <div className="space-y-3">
            {tournaments.map((tournament) => (
              <article
                key={tournament.id}
                className="rounded-3xl border border-white/10 bg-mundial-dark/60 p-5"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-2xl font-black">
                        {tournament.name} · {tournament.year}
                      </h3>

                      <span
                        className={
                          tournament.is_active
                            ? "rounded-full bg-mundial-green/10 px-3 py-1 text-xs font-black text-mundial-greenSoft"
                            : "rounded-full bg-slate-400/10 px-3 py-1 text-xs font-black text-slate-200"
                        }
                      >
                        {tournament.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </div>

                    <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-300">
                      {tournament.description || "Sin descripción"}
                    </p>

                    <p className="mt-3 text-xs font-bold text-slate-400">
                      Creado:{" "}
                      {new Date(tournament.created_at).toLocaleDateString(
                        "es-AR",
                      )}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(tournament)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-black text-white transition hover:bg-white/10"
                    >
                      <Edit2 size={17} />
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleActive(tournament)}
                      className={
                        tournament.is_active
                          ? "rounded-2xl border border-mundial-red/30 bg-mundial-red/10 px-4 py-2 text-sm font-black text-red-100 transition hover:bg-mundial-red/20"
                          : "rounded-2xl border border-mundial-green/30 bg-mundial-green/10 px-4 py-2 text-sm font-black text-green-100 transition hover:bg-mundial-green/20"
                      }
                    >
                      {tournament.is_active ? "Desactivar" : "Activar"}
                    </button>
                  </div>
                </div>
              </article>
            ))}

            {tournaments.length === 0 && !loading && (
              <p className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm font-semibold text-slate-300">
                No hay torneos cargados.
              </p>
            )}
          </div>
        </section>
      </div>

      {editingTournament && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-mundial-sidebar p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.35em] text-mundial-red">
                  Editar torneo
                </p>

                <h2 className="mt-2 text-2xl font-black text-white">
                  {editingTournament.name}
                </h2>

                <p className="mt-2 text-sm font-semibold text-slate-300">
                  Modificá el nombre, año, descripción y estado del torneo.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {editErrorMessage && (
              <div className="mb-5 rounded-2xl border border-mundial-red/30 bg-mundial-red/10 px-4 py-3 text-sm font-bold text-red-100">
                {editErrorMessage}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-200">
                  Nombre
                </label>
                <input
                  value={editForm.name}
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 font-semibold text-white outline-none placeholder:text-slate-400 focus:border-mundial-gold"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-200">
                  Año
                </label>
                <input
                  type="number"
                  value={editForm.year}
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      year: Number(event.target.value),
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 font-semibold text-white outline-none placeholder:text-slate-400 focus:border-mundial-gold"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-200">
                  Descripción
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  rows={5}
                  className="w-full resize-none rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 font-semibold text-white outline-none placeholder:text-slate-400 focus:border-mundial-gold"
                />
              </div>

              <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="text-sm font-black text-white">
                  Torneo activo
                </span>
                <input
                  type="checkbox"
                  checked={editForm.is_active}
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      is_active: event.target.checked,
                    }))
                  }
                  className="h-5 w-5 accent-mundial-green"
                />
              </label>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={savingEdit}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-mundial-green px-5 py-3 text-sm font-black text-white shadow-mundialGreen transition hover:bg-mundial-greenLight disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={18} />
                  {savingEdit ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
