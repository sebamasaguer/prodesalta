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
}: {
  name: string;
  code: string;
  flagUrl: string | null;
}) {
  return (
    <div className="flex min-h-[94px] flex-1 items-center gap-4 rounded-2xl bg-slate-950/70 px-4 py-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        {flagUrl ? (
          <img
            src={flagUrl}
            alt={`Bandera de ${name}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <Flag className="text-slate-500" size={24} />
        )}
      </div>

      <div className="min-w-0 flex-1 text-center">
        <h3 className="break-words text-xl font-black leading-tight text-white">
          {name}
        </h3>

        {code && (
          <p className="mt-1 text-sm font-bold text-slate-400">
            {code}
          </p>
        )}
      </div>
    </div>
  );
}

export function MatchCard({ match }: MatchCardProps) {
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
    <article className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
            {phaseLabel}
            {match.world_group ? ` · Grupo ${match.world_group}` : ""}
          </p>

          <p className="mt-1 text-sm text-slate-400">
            {match.tournament?.name || "Mundial 2026"}
          </p>
        </div>

        <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-300">
          {statusLabel}
        </span>
      </div>

      <div className="grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
        <TeamBox name={home} code={homeTeamCode} flagUrl={homeTeamFlag} />

        <div className="text-center text-xl font-black text-slate-500">
          VS
        </div>

        <TeamBox name={away} code={awayTeamCode} flagUrl={awayTeamFlag} />
      </div>

      {isFinished && match.home_score !== null && match.away_score !== null && (
        <div className="mt-5 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-4 py-3 text-center">
          <p className="text-sm font-bold text-yellow-200">Resultado final</p>
          <p className="mt-1 text-3xl font-black text-yellow-300">
            {match.home_score} - {match.away_score}
          </p>
        </div>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-2 rounded-2xl bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
          <CalendarDays size={17} className="text-emerald-300" />
          <span>Partido: {formatDate(match.match_datetime)}</span>
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
          <Lock size={17} className="text-yellow-300" />
          <span>Cierre: {formatDate(match.prediction_deadline)}</span>
        </div>
      </div>
    </article>
  );
}