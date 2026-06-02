import { useEffect, useMemo, useState } from "react";
import {
  closeMatch,
  createMatch,
  listMatches,
  listTeams,
  listTournaments,
  updateMatchResult,
} from "../api/fixture";
import type {
  Match,
  MatchPhase,
  MatchStatus,
  Team,
  Tournament,
} from "../types/fixture";
import { formatDateTime, phaseLabel, statusClass, statusLabel } from "../utils/fixtureLabels";
import { recalculateMatchPoints } from "../api/scoring";
import { awayName, homeName } from "../utils/matchDisplay";

const phases: MatchPhase[] = [
  "GROUP_STAGE",
  "ROUND_OF_32",
  "ROUND_OF_16",
  "QUARTER_FINAL",
  "SEMI_FINAL",
  "THIRD_PLACE",
  "FINAL",
];

export function AdminFixturePage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);

  const [form, setForm] = useState({
    tournament_id: "",
    phase: "GROUP_STAGE" as MatchPhase,
    world_group: "A",
    home_team_id: "",
    away_team_id: "",
    match_datetime: "",
    prediction_deadline: "",
  });

  const [resultForm, setResultForm] = useState<Record<number, { home: string; away: string }>>({});
  const [errorMessage, setErrorMessage] = useState("");

  async function loadData() {
    const [tournamentsData, teamsData, matchesData] = await Promise.all([
      listTournaments(),
      listTeams(),
      listMatches(),
    ]);

    setTournaments(tournamentsData);
    setTeams(teamsData);
    setMatches(matchesData);

    setForm((current) => ({
      ...current,
      tournament_id:
        current.tournament_id ||
        String(tournamentsData.find((item) => item.is_active)?.id || tournamentsData[0]?.id || ""),
    }));
  }

  const canCreateMatch = useMemo(() => {
    return (
      form.tournament_id &&
      form.home_team_id &&
      form.away_team_id &&
      form.match_datetime &&
      form.prediction_deadline
    );
  }, [form]);

  async function handleCreateMatch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (form.home_team_id === form.away_team_id) {
      setErrorMessage("El equipo local y visitante no pueden ser el mismo");
      return;
    }

    try {
      await createMatch({
        tournament_id: Number(form.tournament_id),
        phase: form.phase,
        world_group: form.world_group || undefined,
        home_team_id: Number(form.home_team_id),
        away_team_id: Number(form.away_team_id),
        match_datetime: new Date(form.match_datetime).toISOString(),
        prediction_deadline: new Date(form.prediction_deadline).toISOString(),
      });

      setForm((current) => ({
        ...current,
        home_team_id: "",
        away_team_id: "",
        match_datetime: "",
        prediction_deadline: "",
      }));

      await loadData();
    } catch (error: any) {
      const detail = error?.response?.data?.detail;

      if (Array.isArray(detail)) {
        setErrorMessage(detail.map((item) => item.msg).join(" · "));
      } else {
        setErrorMessage(detail || "No se pudo crear el partido");
      }
    }
  }

  async function handleClose(matchId: number) {
    try {
      await closeMatch(matchId);
      await loadData();
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.detail || "No se pudo cerrar el partido");
    }
  }

  async function handleResult(match: Match) {
    const values = resultForm[match.id];

    if (!values) return;

    try {
      await updateMatchResult(match.id, {
        home_score: Number(values.home),
        away_score: Number(values.away),
        status: "FINISHED" as MatchStatus,
      });

      await loadData();
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.detail || "No se pudo cargar el resultado");
    }
  }

  async function handleRecalculate(matchId: number) {
  setErrorMessage("");

  try {
    const result = await recalculateMatchPoints(matchId);
    alert(
      `Puntos recalculados. Predicciones procesadas: ${result.predictions_processed}`,
    );
    await loadData();
  } catch (error: any) {
    setErrorMessage(
      error?.response?.data?.detail || "No se pudieron recalcular los puntos",
    );
  }
}

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
          Administración
        </p>
        <h1 className="mt-2 text-4xl font-black">Fixture</h1>
        <p className="mt-2 text-slate-400">
          Cargá partidos, fases, fechas, cierres de predicción y resultados.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 font-semibold text-red-200">
          {errorMessage}
        </div>
      )}

      <form
        onSubmit={handleCreateMatch}
        className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-6"
      >
        <h2 className="mb-5 text-2xl font-black">Nuevo partido</h2>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400"
              required
            >
              <option value="">Seleccionar</option>
              {tournaments.map((tournament) => (
                <option key={tournament.id} value={tournament.id}>
                  {tournament.name} {tournament.year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-300">
              Fase
            </label>
            <select
              value={form.phase}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  phase: event.target.value as MatchPhase,
                }))
              }
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400"
            >
              {phases.map((phase) => (
                <option key={phase} value={phase}>
                  {phaseLabel(phase)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-300">
              Grupo
            </label>
            <input
              value={form.world_group}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  world_group: event.target.value.toUpperCase(),
                }))
              }
              placeholder="A"
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 uppercase outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-300">
              Fecha partido
            </label>
            <input
              type="datetime-local"
              value={form.match_datetime}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  match_datetime: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-300">
              Cierre predicción
            </label>
            <input
              type="datetime-local"
              value={form.prediction_deadline}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  prediction_deadline: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-300">
              Local
            </label>
            <select
              value={form.home_team_id}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  home_team_id: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400"
              required
            >
              <option value="">Seleccionar</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-300">
              Visitante
            </label>
            <select
              value={form.away_team_id}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  away_team_id: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400"
              required
            >
              <option value="">Seleccionar</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              disabled={!canCreateMatch}
              className="w-full rounded-2xl bg-emerald-400 px-5 py-3 font-black text-slate-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Crear partido
            </button>
          </div>
        </div>
      </form>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-5 text-2xl font-black">Partidos cargados</h2>

        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full min-w-[1100px] border-collapse text-left">
            <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-4">Partido</th>
                <th className="px-4 py-4">Fase</th>
                <th className="px-4 py-4">Fecha</th>
                <th className="px-4 py-4">Cierre</th>
                <th className="px-4 py-4">Estado</th>
                <th className="px-4 py-4">Resultado</th>
                <th className="px-4 py-4 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {matches.map((match) => {
                const values = resultForm[match.id] || {
                  home: match.home_score?.toString() || "",
                  away: match.away_score?.toString() || "",
                };

                return (
                  <tr key={match.id} className="bg-white/[0.02]">
                    <td className="px-4 py-4 font-bold">
                      {homeName(match)} vs {awayName(match)}
                      <p className="text-xs font-normal text-slate-500">
                        {match.tournament.name}
                      </p>
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-300">
                      {phaseLabel(match.phase)}
                      {match.world_group ? ` · ${match.world_group}` : ""}
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-300">
                      {formatDateTime(match.match_datetime)}
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-300">
                      {formatDateTime(match.prediction_deadline)}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${statusClass(
                          match.status,
                        )}`}
                      >
                        {statusLabel(match.status)}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          value={values.home}
                          onChange={(event) =>
                            setResultForm((current) => ({
                              ...current,
                              [match.id]: {
                                ...values,
                                home: event.target.value,
                              },
                            }))
                          }
                          className="w-16 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-center font-black outline-none focus:border-yellow-400"
                        />
                        <span className="font-black">-</span>
                        <input
                          type="number"
                          min={0}
                          value={values.away}
                          onChange={(event) =>
                            setResultForm((current) => ({
                              ...current,
                              [match.id]: {
                                ...values,
                                away: event.target.value,
                              },
                            }))
                          }
                          className="w-16 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-center font-black outline-none focus:border-yellow-400"
                        />
                      </div>
                    </td>

                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {match.status === "SCHEDULED" && (
                          <button
                            onClick={() => handleClose(match.id)}
                            className="rounded-xl bg-yellow-400/10 px-3 py-2 text-sm font-bold text-yellow-300 hover:bg-yellow-400/20"
                          >
                            Cerrar
                          </button>
                        )}

                        <button
                          onClick={() => handleResult(match)}
                          className="rounded-xl bg-emerald-400/10 px-3 py-2 text-sm font-bold text-emerald-300 hover:bg-emerald-400/20"
                        >
                          Guardar resultado
                        </button>

                        <button
                          onClick={() => handleRecalculate(match.id)}
                          className="rounded-xl bg-blue-400/10 px-3 py-2 text-sm font-bold text-blue-300 hover:bg-blue-400/20"
                        >
                          Recalcular
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {matches.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No hay partidos cargados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}