import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RefreshCw, Trophy, Users } from "lucide-react";
import {
  getGroupRanking,
  listMyGroupRankingSummaries,
} from "../api/rankings";
import { RankingTable } from "../components/RankingTable";
import type {
  GroupRanking,
  MyGroupRankingSummary,
} from "../types/ranking";

export function RankingPage() {
  const [summaries, setSummaries] = useState<MyGroupRankingSummary[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [ranking, setRanking] = useState<GroupRanking | null>(null);

  const [isLoadingSummaries, setIsLoadingSummaries] = useState(true);
  const [isLoadingRanking, setIsLoadingRanking] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadSummaries() {
    setIsLoadingSummaries(true);
    setErrorMessage("");

    try {
      const data = await listMyGroupRankingSummaries();
      setSummaries(data);

      if (data.length > 0) {
        setSelectedGroupId((current) => current || data[0].group.id);
      }
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.detail || "No se pudo cargar el ranking",
      );
    } finally {
      setIsLoadingSummaries(false);
    }
  }

  async function loadRanking(groupId: number) {
    setIsLoadingRanking(true);
    setErrorMessage("");

    try {
      const data = await getGroupRanking(groupId);
      setRanking(data);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.detail || "No se pudo cargar el ranking del grupo",
      );
    } finally {
      setIsLoadingRanking(false);
    }
  }

  useEffect(() => {
    loadSummaries();
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      loadRanking(selectedGroupId);
    }
  }, [selectedGroupId]);

  const selectedSummary =
    summaries.find((item) => item.group.id === selectedGroupId) || null;

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-red-100">
            Ranking
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight">
            Ranking por grupo
          </h1>

          <p className="mt-2 text-slate-300">
            Posiciones calculadas automáticamente con los puntos de cada
            predicción.
          </p>
        </div>

        <button
          onClick={() => {
            loadSummaries();
            if (selectedGroupId) loadRanking(selectedGroupId);
          }}
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

      {isLoadingSummaries ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-slate-200">
          Cargando rankings...
        </div>
      ) : summaries.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-mundial-red/10 text-red-100">
            <Users size={34} />
          </div>

          <h2 className="text-2xl font-black">
            Todavía no pertenecés a ningún grupo
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Para ver rankings, primero creá un grupo o unite a uno existente.
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/grupos/nuevo"
              className="rounded-2xl bg-mundial-green px-5 py-3 font-black text-mundial-dark hover:bg-mundial-greenLight"
            >
              Crear grupo
            </Link>

            <Link
              to="/grupos/unirse"
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-black text-white hover:bg-white/10"
            >
              Unirme con código
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6">
            <label className="mb-2 block text-sm font-bold text-slate-200">
              Grupo
            </label>

            <select
              value={selectedGroupId || ""}
              onChange={(event) => setSelectedGroupId(Number(event.target.value))}
              className="w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 text-white outline-none focus:border-mundial-red md:max-w-md"
            >
              {summaries.map((summary) => (
                <option key={summary.group.id} value={summary.group.id}>
                  {summary.group.is_personal ? "Individual" : summary.group.name}
                </option>
              ))}
            </select>
          </div>

          {selectedSummary && (
            <div className="mb-6 grid gap-4 md:grid-cols-4">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <Trophy className="mb-4 text-red-100" size={30} />
                <p className="text-sm text-slate-300">Mi posición</p>
                <p className="mt-2 text-4xl font-black">
                  {selectedSummary.my_position
                    ? `#${selectedSummary.my_position}`
                    : "-"}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-300">Mis puntos</p>
                <p className="mt-2 text-4xl font-black text-red-100">
                  {selectedSummary.my_points}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-300">Participantes</p>
                <p className="mt-2 text-4xl font-black">
                  {selectedSummary.participants_count}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-300">Líder</p>
                <p className="mt-2 text-2xl font-black">
                  {selectedSummary.leader_name || "-"}
                </p>
                <p className="mt-1 text-sm font-bold text-red-100">
                  {selectedSummary.leader_points ?? 0} pts
                </p>
              </div>
            </div>
          )}

          {isLoadingRanking ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-slate-200">
              Cargando ranking del grupo...
            </div>
          ) : (
            <RankingTable entries={ranking?.entries || []} />
          )}
        </>
      )}
    </div>
  );
}