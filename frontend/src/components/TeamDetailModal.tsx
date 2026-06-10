import { useEffect, useRef, useState } from "react";
import { X, User } from "lucide-react";
import { getTeamDetail } from "../api/teamDetail";
import type { TeamDetail, PlayerInSquad } from "../types/team";
import { resolveAssetUrl } from "../utils/matchDisplay";

const POSITION_LABEL: Record<string, string> = {
  Goalkeeper: "Arquero",
  Defender: "Defensor",
  Midfielder: "Mediocampista",
  Attacker: "Delantero",
};

const POSITION_ORDER: Record<string, number> = {
  Goalkeeper: 0,
  Defender: 1,
  Midfielder: 2,
  Attacker: 3,
};

const POSITION_COLOR: Record<string, string> = {
  Goalkeeper: "bg-yellow-100 text-yellow-700",
  Defender: "bg-blue-100 text-blue-700",
  Midfielder: "bg-green-100 text-green-700",
  Attacker: "bg-red-100 text-red-700",
};

function positionLabel(pos: string | null): string {
  if (!pos) return "";
  return POSITION_LABEL[pos] || pos;
}

function positionColor(pos: string | null): string {
  if (!pos) return "bg-slate-100 text-slate-600";
  return POSITION_COLOR[pos] || "bg-slate-100 text-slate-600";
}

function sortPlayers(players: PlayerInSquad[]): PlayerInSquad[] {
  return [...players].sort((a, b) => {
    const oa = POSITION_ORDER[a.position ?? ""] ?? 99;
    const ob = POSITION_ORDER[b.position ?? ""] ?? 99;
    if (oa !== ob) return oa - ob;
    return (a.number ?? 99) - (b.number ?? 99);
  });
}

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: number | null | undefined;
  color?: string;
}) {
  if (value == null) return null;
  return (
    <div className="flex flex-col items-center gap-1 px-3">
      <span className={`text-2xl font-black tabular-nums ${color ?? "text-slate-800"}`}>
        {value}
      </span>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </span>
    </div>
  );
}

function PlayerCard({ player }: { player: PlayerInSquad }) {
  const [imgError, setImgError] = useState(false);
  const photo = player.photo_url && !imgError ? player.photo_url : null;

  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-center">
      <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm">
        {photo ? (
          <img
            src={photo}
            alt={player.name}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <User size={24} className="text-slate-400" />
        )}
        {player.number != null && (
          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-white bg-slate-700 text-[10px] font-black text-white shadow">
            {player.number}
          </span>
        )}
      </div>

      <p className="w-full truncate text-xs font-black text-slate-800 leading-tight">
        {player.name}
      </p>

      {player.position && (
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-black ${positionColor(player.position)}`}
        >
          {positionLabel(player.position)}
        </span>
      )}

      {player.age != null && (
        <span className="text-[10px] font-semibold text-slate-400">{player.age} años</span>
      )}
    </div>
  );
}

interface TeamDetailModalProps {
  teamId: number;
  onClose: () => void;
}

export function TeamDetailModal({ teamId, onClose }: TeamDetailModalProps) {
  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    setError("");
    getTeamDetail(teamId)
      .then(setTeam)
      .catch(() => setError("No se pudieron cargar los datos del equipo."))
      .finally(() => setLoading(false));
  }, [teamId]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const hasWcStats =
    team &&
    (team.wc_played != null ||
      team.wc_wins != null ||
      team.wc_draws != null ||
      team.wc_losses != null ||
      team.wc_goals_scored != null ||
      team.wc_goals_conceded != null);

  const sortedPlayers = team ? sortPlayers(team.players) : [];
  const flagUrl = team ? resolveAssetUrl(team.flag_url) : null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/10 text-slate-600 transition hover:bg-black/20"
          aria-label="Cerrar"
        >
          <X size={16} />
        </button>

        {loading ? (
          <div className="flex h-48 items-center justify-center text-slate-400 font-semibold">
            Cargando...
          </div>
        ) : error ? (
          <div className="flex h-48 items-center justify-center text-red-500 font-semibold px-6 text-center">
            {error}
          </div>
        ) : team ? (
          <>
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-slate-100 px-6 py-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
                {flagUrl ? (
                  <img
                    src={flagUrl}
                    alt={`Bandera ${team.name}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-3xl">🏳️</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-black text-slate-900 truncate">{team.name}</h2>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                  {team.first_wc_year != null && (
                    <span>
                      <span className="font-semibold text-slate-400 text-xs uppercase tracking-wider mr-1">1er Mundial</span>
                      <span className="font-black text-slate-700">{team.first_wc_year}</span>
                    </span>
                  )}
                  {team.wc_participations != null && (
                    <span>
                      <span className="font-semibold text-slate-400 text-xs uppercase tracking-wider mr-1">Participaciones</span>
                      <span className="font-black text-slate-700">{team.wc_participations}</span>
                    </span>
                  )}
                  {team.coach_name && (
                    <span>
                      <span className="font-semibold text-slate-400 text-xs uppercase tracking-wider mr-1">DT</span>
                      <span className="font-black text-slate-700">{team.coach_name}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Récord en Mundiales */}
              {hasWcStats && (
                <div className="px-6 py-4 border-b border-slate-100">
                  <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">
                    Récord en Mundiales
                  </p>
                  <div className="flex flex-wrap gap-y-2 divide-x divide-slate-200 rounded-2xl border border-slate-100 bg-slate-50 py-3">
                    <StatBox label="Jugados" value={team.wc_played} color="text-slate-800" />
                    <StatBox label="Ganados" value={team.wc_wins} color="text-green-600" />
                    <StatBox label="Empates" value={team.wc_draws} color="text-orange-500" />
                    <StatBox label="Perdidos" value={team.wc_losses} color="text-red-400" />
                    <StatBox label="Goles a favor" value={team.wc_goals_scored} color="text-orange-500" />
                    <StatBox label="Goles en contra" value={team.wc_goals_conceded} color="text-slate-400" />
                  </div>
                </div>
              )}

              {/* Plantilla */}
              {sortedPlayers.length > 0 ? (
                <div className="px-6 py-4">
                  <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">
                    Plantilla · {sortedPlayers.length} jugadores
                  </p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                    {sortedPlayers.map((player) => (
                      <PlayerCard key={player.id} player={player} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="px-6 py-8 text-center text-slate-400 font-semibold text-sm">
                  Sin datos de plantilla aún.
                  <p className="mt-1 text-xs text-slate-300">Ejecutá el script de sincronización para cargar jugadores.</p>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
