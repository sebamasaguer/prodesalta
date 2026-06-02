import { useEffect, useState } from "react";
import { createTournament, listTournaments } from "../api/fixture";
import type { Tournament } from "../types/fixture";

export function AdminTournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [form, setForm] = useState({
    name: "Mundial 2026",
    year: 2026,
    description: "Torneo base para Prode Mundial.",
    is_active: true,
  });
  const [errorMessage, setErrorMessage] = useState("");

  async function loadTournaments() {
    const data = await listTournaments();
    setTournaments(data);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    try {
      await createTournament(form);
      await loadTournaments();
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.detail || "No se pudo crear el torneo",
      );
    }
  }

  useEffect(() => {
    loadTournaments();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-yellow-300">
          Administración
        </p>
        <h1 className="mt-2 text-4xl font-black">Torneos</h1>
        <p className="mt-2 text-slate-400">
          Creá torneos para asociar equipos y partidos.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-white/5 p-6"
        >
          <h2 className="mb-5 text-2xl font-black">Nuevo torneo</h2>

          {errorMessage && (
            <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-300">
                Nombre
              </label>
              <input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-yellow-400"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-300">
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
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-yellow-400"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-300">
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
                rows={4}
                className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-yellow-400"
              />
            </div>

            <button className="w-full rounded-2xl bg-yellow-400 px-5 py-3 font-black text-slate-950 hover:bg-yellow-300">
              Crear torneo
            </button>
          </div>
        </form>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-5 text-2xl font-black">Torneos cargados</h2>

          <div className="space-y-3">
            {tournaments.map((tournament) => (
              <div
                key={tournament.id}
                className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xl font-black">
                      {tournament.name} · {tournament.year}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      {tournament.description || "Sin descripción"}
                    </p>
                  </div>

                  <span
                    className={
                      tournament.is_active
                        ? "rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-300"
                        : "rounded-full bg-slate-400/10 px-3 py-1 text-xs font-black text-slate-300"
                    }
                  >
                    {tournament.is_active ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>
            ))}

            {tournaments.length === 0 && (
              <p className="text-slate-400">No hay torneos cargados.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}