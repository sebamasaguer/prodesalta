import { useState } from "react";
import { CalendarDays, Flag, Lock } from "lucide-react";
import type { Match } from "../types/fixture";
import {
  awayCode,
  awayFlag,
  awayName,
  homeCode,
  homeFlag,
  homeName,
} from "../utils/matchDisplay";
import { TeamDetailModal } from "./TeamDetailModal";

interface MatchCardProps {
  match: Match;
}

const phaseLabels: Record<string, string> = {
  GROUP_STAGE: "Fase de grupos",
  ROUND_OF_32: "16avos",
  ROUND_OF_16: "Octavos",
  QUARTER_FINAL: "Cuartos",
  SEMI_FINAL: "Semifinal",
  THIRD_PLACE: "Tercer puesto",
  FINAL: "Final",
};

const statusLabels: Record<string, string> = {
  SCHEDULED: "Programado",
  LIVE: "En vivo",
  CLOSED: "Cerrado",
  FINISHED: "Finalizado",
  CANCELLED: "Cancelado",
};

function formatDate(value: string): string {
  try {
    return new Intl.DateTimeFormat("es-AR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function TeamBox({
  name,
  code,
  flagUrl,
  teamId,
  onTeamClick,
}: {
  name: string;
  code: string;
  flagUrl: string | null;
  teamId: number | null;
  onTeamClick?: (id: number) => void;
}) {
  const clickable = !!(teamId && onTeamClick);

  return (
    <div className="flex min-h-[94px] min-w-0 flex-1 items-center gap-3 rounded-2xl bg-mundial-dark/70 px-3 py-4">
      <button
        type="button"
        disabled={!clickable}
        onClick={clickable ? () => onTeamClick!(teamId!) : undefined}
        title={clickable ? `Ver selección de ${name}` : undefined}
        className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition ${
          clickable ? "cursor-pointer hover:scale-110 hover:border-white/30 hover:shadow-lg" : "cursor-default"
        }`}
      >
        {flagUrl ? (
          <img
            src={flagUrl}
            alt={`Bandera de ${name}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <Flag className="text-slate-400" size={22} />
        )}
      </button>

      <div className="min-w-0 flex-1 text-center">
        <h3 className="break-words text-sm font-black leading-snug text-white sm:text-base">
          {name}
        </h3>

        {code && (
          <p className="mt-0.5 text-xs font-bold text-slate-400">
            {code}
          </p>
        )}
      </div>
    </div>
  );
}

export function MatchCard({ match }: MatchCardProps) {
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  const home = homeName(match);
  const away = awayName(match);
  const homeTeamCode = homeCode(match);
  const awayTeamCode = awayCode(match);
  const homeTeamFlag = homeFlag(match);
  const awayTeamFlag = awayFlag(match);

  const phaseLabel = phaseLabels[match.phase] || match.phase;
  const statusLabel = statusLabels[match.status] || match.status;

  const isFinished = match.status === "FINISHED";

  return (
    <>
      <article className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-mundial-greenSoft">
              {phaseLabel}
              {match.world_group ? ` · Grupo ${match.world_group}` : ""}
            </p>

            <p className="mt-1 text-sm text-slate-300">
              {match.tournament?.name || "Mundial 2026"}
            </p>
          </div>

          <span className="rounded-full bg-mundial-green/10 px-3 py-1 text-xs font-black text-mundial-greenSoft">
            {statusLabel}
          </span>
        </div>

        <div className="grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
          <TeamBox
            name={home}
            code={homeTeamCode}
            flagUrl={homeTeamFlag}
            teamId={match.home_team_id}
            onTeamClick={setSelectedTeamId}
          />

          <div className="w-12 shrink-0 text-center text-base font-black text-slate-400 sm:w-16 sm:text-xl">
            {isFinished && match.home_score !== null && match.away_score !== null
              ? `${match.home_score} - ${match.away_score}`
              : "VS"}
          </div>

          <TeamBox
            name={away}
            code={awayTeamCode}
            flagUrl={awayTeamFlag}
            teamId={match.away_team_id}
            onTeamClick={setSelectedTeamId}
          />
        </div>

        {isFinished && match.home_score !== null && match.away_score !== null && (
          <div className="mt-5 rounded-2xl border border-mundial-red/20 bg-mundial-red/10 px-4 py-3 text-center">
            <p className="text-sm font-bold text-red-50">Resultado final</p>
            <p className="mt-1 text-3xl font-black text-red-100">
              {match.home_score} - {match.away_score}
            </p>
          </div>
        )}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-2 rounded-2xl bg-mundial-dark/60 px-4 py-3 text-sm text-slate-200">
            <CalendarDays size={17} className="text-mundial-greenSoft" />
            <span>Partido: {formatDate(match.match_datetime)}</span>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-mundial-dark/60 px-4 py-3 text-sm text-slate-200">
            <Lock size={17} className="text-red-100" />
            <span>Cierre: {formatDate(match.prediction_deadline)}</span>
          </div>
        </div>
      </article>

      {selectedTeamId != null && (
        <TeamDetailModal
          teamId={selectedTeamId}
          onClose={() => setSelectedTeamId(null)}
        />
      )}
    </>
  );
}
