import { useEffect, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  RefreshCw,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { getStatsOverview } from "../api/stats";
import { RankingTable } from "../components/RankingTable";
import { StatsCard } from "../components/StatsCard";
import type { StatsOverview } from "../types/stats";

export function StatsPage() {
  const [overview, setOverview] = useState<StatsOverview | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "exactos" | "ganadores">(
    "general",
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadStats() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await getStatsOverview();
      setOverview(data);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.detail || "No se pudieron cargar las estadísticas",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  const rankingEntries =
  activeTab === "general"
    ? overview?.top_general || []
    : activeTab === "exactos"
      ? (overview?.top_exact_scores || []).filter(
          (entry) => entry.exact_scores_count > 0,
        )
      : (overview?.top_winners || []).filter(
          (entry) => entry.winner_count > 0,
        );

const rankingTitle =
  activeTab === "general"
    ? "Ranking general"
    : activeTab === "exactos"
      ? "Top resultados exactos"
      : "Top ganadores acertados";

const rankingDescription =
  activeTab === "general"
    ? "Ordenado por puntos totales acumulados."
    : activeTab === "exactos"
      ? "Jugadores con más resultados exactos acertados."
      : "Jugadores con más ganadores o empates acertados.";

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
            Estadísticas
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight">
            Estadísticas generales
          </h1>

          <p className="mt-2 text-slate-400">
            Métricas globales del Prode, ranking general y desempeño por grupo.
          </p>
        </div>

        <button
          onClick={loadStats}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white hover:bg-white/10"
        >
          <RefreshCw size={18} />
          Actualizar
        </button>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 font-semibold text-red-200">
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-slate-300">
          Cargando estadísticas...
        </div>
      ) : !overview ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-slate-300">
          No hay información disponible.
        </div>
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <StatsCard
              title="Usuarios"
              value={overview.dashboard.users_count}
              description="Usuarios registrados en el sistema."
              icon={<Users size={34} />}
            />

            <StatsCard
              title="Grupos"
              value={overview.dashboard.groups_count}
              description="Grupos de Prode creados."
              icon={<Trophy size={34} />}
            />

            <StatsCard
              title="Partidos"
              value={overview.dashboard.matches_count}
              description={`${overview.dashboard.finished_matches_count} finalizados`}
              icon={<CalendarDays size={34} />}
            />

            <StatsCard
              title="Predicciones"
              value={overview.dashboard.predictions_count}
              description={`${overview.dashboard.average_points_per_prediction} pts promedio`}
              icon={<Target size={34} />}
            />
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <StatsCard
              title="Equipos"
              value={overview.dashboard.teams_count}
              description="Selecciones cargadas."
              icon={<Users size={34} />}
            />

            <StatsCard
              title="Torneos"
              value={overview.dashboard.tournaments_count}
              description="Torneos configurados."
              icon={<Trophy size={34} />}
            />

            <StatsCard
              title="Próximos partidos"
              value={overview.dashboard.scheduled_matches_count}
              description="Partidos programados."
              icon={<CalendarDays size={34} />}
            />

            <StatsCard
              title="Puntos otorgados"
              value={overview.dashboard.total_points_awarded}
              description="Total acumulado del sistema."
              icon={<BarChart3 size={34} />}
            />
          </div>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-yellow-300">
                  Ranking general
                </p>

                <h2 className="mt-2 text-2xl font-black">
                    {rankingTitle}
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                    {rankingDescription}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => setActiveTab("general")}
                  className={
                    activeTab === "general"
                      ? "rounded-xl bg-yellow-400 px-4 py-2 text-sm font-black text-slate-950"
                      : "rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/15"
                  }
                >
                  General ({overview.top_general.length})
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("exactos")}
                  className={
                    activeTab === "exactos"
                      ? "rounded-xl bg-yellow-400 px-4 py-2 text-sm font-black text-slate-950"
                      : "rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/15"
                  }
                >
                  Exactos ({overview.top_exact_scores.filter((entry) => entry.exact_scores_count > 0).length})
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("ganadores")}
                  className={
                    activeTab === "ganadores"
                      ? "rounded-xl bg-yellow-400 px-4 py-2 text-sm font-black text-slate-950"
                      : "rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/15"
                  }
                >
                  Ganadores ({overview.top_winners.filter((entry) => entry.winner_count > 0).length})
                </button>
              </div>
            </div>

            <RankingTable entries={rankingEntries} />
          </div>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="mb-5">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
                Grupos
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Estadísticas por grupo
              </h2>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse text-left">
                  <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-4 py-4">Grupo</th>
                      <th className="px-4 py-4 text-center">Miembros</th>
                      <th className="px-4 py-4 text-center">Predicciones</th>
                      <th className="px-4 py-4 text-center">Puntos</th>
                      <th className="px-4 py-4 text-center">Promedio</th>
                      <th className="px-4 py-4">Líder</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/10">
                    {overview.group_stats.map((group) => (
                      <tr key={group.group_id} className="bg-white/[0.02]">
                        <td className="px-4 py-4 font-black">
                          {group.group_name}
                        </td>

                        <td className="px-4 py-4 text-center font-bold">
                          {group.members_count}
                        </td>

                        <td className="px-4 py-4 text-center font-bold">
                          {group.predictions_count}
                        </td>

                        <td className="px-4 py-4 text-center text-2xl font-black text-yellow-300">
                          {group.total_points}
                        </td>

                        <td className="px-4 py-4 text-center font-bold text-emerald-300">
                          {group.average_points}
                        </td>

                        <td className="px-4 py-4">
                          <p className="font-bold">
                            {group.leader_name || "-"}
                          </p>

                          <p className="text-sm text-yellow-300">
                            {group.leader_points ?? 0} pts
                          </p>
                        </td>
                      </tr>
                    ))}

                    {overview.group_stats.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-8 text-center text-slate-400"
                        >
                          Todavía no hay grupos cargados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}