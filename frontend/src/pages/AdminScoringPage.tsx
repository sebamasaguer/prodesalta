import { useEffect, useState } from "react";
import { createScoringRule, listScoringRules } from "../api/scoring";
import { listTournaments } from "../api/fixture";
import type { Tournament } from "../types/fixture";
import type { ScoringRule } from "../types/scoring";

export function AdminScoringPage() {
  const [rules, setRules] = useState<ScoringRule[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState({
    tournament_id: "",
    name: "Regla estándar",
    exact_score_points: 5,
    winner_points: 3,
    goal_difference_points: 2,
    participation_points: 0,
    is_default: true,
    is_active: true,
  });

  async function loadData() {
    const [rulesData, tournamentsData] = await Promise.all([
      listScoringRules(),
      listTournaments(),
    ]);

    setRules(rulesData);
    setTournaments(tournamentsData);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await createScoringRule({
        tournament_id: form.tournament_id ? Number(form.tournament_id) : null,
        name: form.name,
        exact_score_points: form.exact_score_points,
        winner_points: form.winner_points,
        goal_difference_points: form.goal_difference_points,
        participation_points: form.participation_points,
        is_default: form.is_default,
        is_active: form.is_active,
      });

      setSuccessMessage("Regla de puntaje creada correctamente");
      await loadData();

      setTimeout(() => setSuccessMessage(""), 2500);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.detail || "No se pudo crear la regla",
      );
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-yellow-300">
          Administración
        </p>

        <h1 className="mt-2 text-4xl font-black">Reglas de puntaje</h1>

        <p className="mt-2 text-slate-400">
          Configurá cómo se calculan los puntos del Prode.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 font-semibold text-red-200">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 font-semibold text-emerald-200">
          {successMessage}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-white/5 p-6"
        >
          <h2 className="mb-5 text-2xl font-black">Nueva regla</h2>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-300">
                Torneo
              </label>

              <select
                value={form.tournament_id}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    tournament_id: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-yellow-400"
              >
                <option value="">Regla general</option>
                {tournaments.map((tournament) => (
                  <option key={tournament.id} value={tournament.id}>
                    {tournament.name} {tournament.year}
                  </option>
                ))}
              </select>
            </div>

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

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-300">
                  Exacto
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.exact_score_points}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      exact_score_points: Number(event.target.value),
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-300">
                  Ganador / empate
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.winner_points}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      winner_points: Number(event.target.value),
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-300">
                  Diferencia gol
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.goal_difference_points}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      goal_difference_points: Number(event.target.value),
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-300">
                  Participación
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.participation_points}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      participation_points: Number(event.target.value),
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-yellow-400"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3">
              <input
                type="checkbox"
                checked={form.is_default}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    is_default: event.target.checked,
                  }))
                }
              />
              <span className="text-sm font-bold text-slate-300">
                Usar como regla predeterminada
              </span>
            </label>

            <button className="w-full rounded-2xl bg-yellow-400 px-5 py-3 font-black text-slate-950 hover:bg-yellow-300">
              Crear regla
            </button>
          </div>
        </form>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-5 text-2xl font-black">Reglas cargadas</h2>

          <div className="space-y-3">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div>
                    <p className="text-xl font-black">{rule.name}</p>

                    <p className="mt-1 text-sm text-slate-400">
                      {rule.tournament_id
                        ? `Torneo ID: ${rule.tournament_id}`
                        : "Regla general"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {rule.is_default && (
                      <span className="rounded-full bg-yellow-400/10 px-3 py-1 text-xs font-black text-yellow-300">
                        Default
                      </span>
                    )}

                    {rule.is_active && (
                      <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-300">
                        Activa
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  <div className="rounded-xl bg-white/5 p-3">
                    <p className="text-xs text-slate-500">Exacto</p>
                    <p className="text-2xl font-black text-yellow-300">
                      {rule.exact_score_points}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/5 p-3">
                    <p className="text-xs text-slate-500">Ganador</p>
                    <p className="text-2xl font-black text-emerald-300">
                      {rule.winner_points}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/5 p-3">
                    <p className="text-xs text-slate-500">Diferencia</p>
                    <p className="text-2xl font-black text-emerald-300">
                      {rule.goal_difference_points}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/5 p-3">
                    <p className="text-xs text-slate-500">Participación</p>
                    <p className="text-2xl font-black">
                      {rule.participation_points}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {rules.length === 0 && (
              <p className="text-slate-400">
                No hay reglas cargadas. Creá una regla estándar.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}