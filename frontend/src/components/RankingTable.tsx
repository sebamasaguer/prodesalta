import { Medal, Trophy } from "lucide-react";
import type { RankingEntry } from "../types/ranking";
import { useAuth } from "../context/AuthContext";

interface RankingTableProps {
  entries: RankingEntry[];
}

function positionClass(position: number): string {
  if (position === 1) return "bg-yellow-400 text-slate-950";
  if (position === 2) return "bg-slate-300 text-slate-950";
  if (position === 3) return "bg-orange-400 text-slate-950";
  return "bg-white/10 text-white";
}

export function RankingTable({ entries }: RankingTableProps) {
  const { user } = useAuth();

  if (entries.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-yellow-400/10 text-yellow-300">
          <Trophy size={34} />
        </div>

        <h2 className="text-2xl font-black">Todavía no hay ranking</h2>

        <p className="mx-auto mt-3 max-w-xl text-slate-400">
          Cuando los participantes carguen predicciones y existan partidos con
          resultados, se mostrarán las posiciones.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[950px] border-collapse text-left">
          <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-4">Posición</th>
              <th className="px-4 py-4">Participante</th>
              <th className="px-4 py-4 text-center">Puntos</th>
              <th className="px-4 py-4 text-center">Predicciones</th>
              <th className="px-4 py-4 text-center">Exactos</th>
              <th className="px-4 py-4 text-center">Ganador</th>
              <th className="px-4 py-4 text-center">Diferencia</th>
              <th className="px-4 py-4 text-center">Finalizados</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/10">
            {entries.map((entry) => {
              const isCurrentUser = entry.user_id === user?.id;

              return (
                <tr
                  key={entry.user_id}
                  className={
                    isCurrentUser
                      ? "bg-emerald-400/10"
                      : "bg-white/[0.02]"
                  }
                >
                  <td className="px-4 py-4">
                    <div
                      className={`inline-flex h-10 min-w-10 items-center justify-center rounded-2xl px-3 font-black ${positionClass(
                        entry.position,
                      )}`}
                    >
                      {entry.position <= 3 ? (
                        <Medal size={18} />
                      ) : (
                        entry.position
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div>
                      <p className="font-black">
                        {entry.user.first_name} {entry.user.last_name}
                        {isCurrentUser && (
                          <span className="ml-2 rounded-full bg-emerald-400/20 px-2 py-1 text-xs font-black text-emerald-300">
                            vos
                          </span>
                        )}
                      </p>

                      <p className="text-sm text-slate-500">
                        @{entry.user.username}
                      </p>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-center">
                    <span className="text-3xl font-black text-yellow-300">
                      {entry.total_points}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-center font-bold">
                    {entry.predictions_count}
                  </td>

                  <td className="px-4 py-4 text-center font-bold text-yellow-300">
                    {entry.exact_scores_count}
                  </td>

                  <td className="px-4 py-4 text-center font-bold text-emerald-300">
                    {entry.winner_count}
                  </td>

                  <td className="px-4 py-4 text-center font-bold text-blue-300">
                    {entry.goal_difference_count}
                  </td>

                  <td className="px-4 py-4 text-center font-bold text-slate-300">
                    {entry.finished_predictions_count}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}