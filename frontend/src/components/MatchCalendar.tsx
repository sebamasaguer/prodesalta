import { useEffect, useRef, useState } from "react";
import { Flag } from "lucide-react";
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

interface MatchCalendarProps {
  matches: Match[];
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
  variant?: "light" | "dark";
}

const DAY_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const MONTH_SHORT = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

const phaseLabels: Record<string, string> = {
  GROUP_STAGE: "Grupos",
  ROUND_OF_32: "16avos",
  ROUND_OF_16: "Octavos",
  QUARTER_FINAL: "Cuartos",
  SEMI_FINAL: "Semi",
  THIRD_PLACE: "3er puesto",
  FINAL: "Final",
};

const statusConfig: Record<string, { label: string; light: string; dark: string }> = {
  SCHEDULED: {
    label: "Programado",
    light: "bg-slate-100 text-slate-500",
    dark: "bg-white/10 text-slate-300",
  },
  LIVE: {
    label: "En vivo",
    light: "bg-mundial-green/10 text-mundial-green animate-pulse",
    dark: "bg-mundial-green/20 text-mundial-greenSoft animate-pulse",
  },
  CLOSED: {
    label: "Cerrado",
    light: "bg-yellow-50 text-yellow-600",
    dark: "bg-yellow-500/15 text-yellow-300",
  },
  FINISHED: {
    label: "Finalizado",
    light: "bg-blue-50 text-blue-500",
    dark: "bg-blue-500/15 text-blue-200",
  },
  CANCELLED: {
    label: "Cancelado",
    light: "bg-red-50 text-red-400",
    dark: "bg-mundial-red/15 text-red-200",
  },
};

function localDateKey(dt: string): string {
  const d = new Date(dt);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatTime(dt: string): string {
  try {
    return new Intl.DateTimeFormat("es-AR", { timeStyle: "short" }).format(new Date(dt));
  } catch {
    return "";
  }
}

function todayKey(): string {
  return localDateKey(new Date().toISOString());
}

function nearestDateKey(days: string[]): string {
  if (!days.length) return "";
  const today = todayKey();
  const future = days.filter((d) => d >= today);
  return future.length ? future[0] : days[days.length - 1];
}

function TeamChip({
  name,
  code,
  flagUrl,
  variant,
  teamId,
  onTeamClick,
}: {
  name: string;
  code: string;
  flagUrl: string | null;
  variant: "light" | "dark";
  teamId: number | null;
  onTeamClick?: (id: number) => void;
}) {
  const clickable = !!(teamId && onTeamClick);

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <button
        type="button"
        disabled={!clickable}
        onClick={clickable ? () => onTeamClick!(teamId!) : undefined}
        className={`flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl border transition ${
          variant === "light"
            ? "border-slate-200 bg-slate-50"
            : "border-white/10 bg-white/5"
        } ${clickable ? "cursor-pointer hover:scale-110 hover:shadow-md" : "cursor-default"}`}
        title={clickable ? `Ver selección de ${name}` : undefined}
      >
        {flagUrl ? (
          <img
            src={flagUrl}
            alt={`Bandera ${name}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <Flag
            size={14}
            className={variant === "light" ? "text-slate-400" : "text-slate-500"}
          />
        )}
      </button>
      <div className="min-w-0">
        <p
          className={`truncate text-sm font-black leading-none ${
            variant === "light" ? "text-mundial-navy" : "text-white"
          }`}
        >
          {code || name}
        </p>
        {code && (
          <p
            className={`mt-0.5 truncate text-xs font-semibold ${
              variant === "light" ? "text-mundial-muted" : "text-slate-400"
            }`}
          >
            {name}
          </p>
        )}
      </div>
    </div>
  );
}

function MatchRow({
  match,
  variant,
  onTeamClick,
}: {
  match: Match;
  variant: "light" | "dark";
  onTeamClick?: (id: number) => void;
}) {
  const home = homeName(match);
  const away = awayName(match);
  const homeTeamCode = homeCode(match);
  const awayTeamCode = awayCode(match);
  const homeTeamFlag = homeFlag(match);
  const awayTeamFlag = awayFlag(match);
  const phase = phaseLabels[match.phase] || match.phase;
  const group = match.world_group ? ` · Grupo ${match.world_group}` : "";
  const status = statusConfig[match.status] || statusConfig.SCHEDULED;
  const isFinished = match.status === "FINISHED";

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
        variant === "light"
          ? "border border-mundial-line bg-white"
          : "border border-white/10 bg-white/5"
      }`}
    >
      <div className="w-12 shrink-0 text-center">
        <p
          className={`text-sm font-black tabular-nums ${
            variant === "light" ? "text-mundial-navy" : "text-white"
          }`}
        >
          {formatTime(match.match_datetime)}
        </p>
        <p
          className={`mt-0.5 text-xs font-semibold ${
            variant === "light" ? "text-mundial-muted" : "text-slate-400"
          }`}
        >
          {phase}{group}
        </p>
      </div>

      <TeamChip
        name={home}
        code={homeTeamCode}
        flagUrl={homeTeamFlag}
        variant={variant}
        teamId={match.home_team_id}
        onTeamClick={onTeamClick}
      />

      <div className="shrink-0 text-center">
        {isFinished && match.home_score !== null && match.away_score !== null ? (
          <p
            className={`text-lg font-black tabular-nums ${
              variant === "light" ? "text-mundial-navy" : "text-white"
            }`}
          >
            {match.home_score} - {match.away_score}
          </p>
        ) : (
          <p
            className={`text-sm font-black ${
              variant === "light" ? "text-mundial-muted" : "text-slate-400"
            }`}
          >
            vs
          </p>
        )}
      </div>

      <TeamChip
        name={away}
        code={awayTeamCode}
        flagUrl={awayTeamFlag}
        variant={variant}
        teamId={match.away_team_id}
        onTeamClick={onTeamClick}
      />

      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-black ${
          variant === "light" ? status.light : status.dark
        }`}
      >
        {status.label}
      </span>
    </div>
  );
}

export function MatchCalendar({
  matches,
  selectedDate,
  onSelectDate,
  variant = "dark",
}: MatchCalendarProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  const grouped = matches.reduce<Record<string, Match[]>>((acc, match) => {
    const key = localDateKey(match.match_datetime);
    if (!acc[key]) acc[key] = [];
    acc[key].push(match);
    return acc;
  }, {});

  const days = Object.keys(grouped).sort();

  const defaultDay = nearestDateKey(days);
  const [internalDate, setInternalDate] = useState(defaultDay);

  const activeDate = selectedDate !== undefined ? selectedDate : internalDate;

  function handleSelect(day: string) {
    setInternalDate(day);
    onSelectDate?.(day);
  }

  useEffect(() => {
    if (!stripRef.current || !activeDate) return;
    const el = stripRef.current.querySelector<HTMLElement>(`[data-day="${activeDate}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeDate]);

  if (!days.length) return null;

  const dayMatches = grouped[activeDate] ?? [];

  return (
    <>
      <div>
        <div
          ref={stripRef}
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
          style={{ scrollbarWidth: "none" }}
        >
          {days.map((day) => {
            const d = new Date(day + "T12:00:00");
            const isActive = day === activeDate;
            const count = grouped[day].length;

            return (
              <button
                key={day}
                data-day={day}
                onClick={() => handleSelect(day)}
                className={`flex shrink-0 flex-col items-center rounded-2xl px-4 py-3 transition ${
                  isActive
                    ? variant === "light"
                      ? "bg-mundial-navy text-white shadow-mundialDark"
                      : "bg-mundial-gold text-mundial-navy shadow-mundialGold"
                    : variant === "light"
                    ? "border border-mundial-line bg-white text-mundial-navy hover:bg-mundial-light"
                    : "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-wide opacity-70">
                  {DAY_SHORT[d.getDay()]}
                </span>
                <span className="mt-0.5 text-xl font-black leading-none">
                  {d.getDate()}
                </span>
                <span className="mt-0.5 text-xs font-semibold opacity-70">
                  {MONTH_SHORT[d.getMonth()]}
                </span>
                <span
                  className={`mt-1.5 rounded-full px-2 py-0.5 text-xs font-black ${
                    isActive
                      ? variant === "light"
                        ? "bg-white/20 text-white"
                        : "bg-mundial-navy/20 text-mundial-navy"
                      : variant === "light"
                      ? "bg-mundial-green/10 text-mundial-green"
                      : "bg-mundial-green/20 text-mundial-greenSoft"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 space-y-2">
          {dayMatches.length === 0 ? (
            <p
              className={`py-4 text-center text-sm font-semibold ${
                variant === "light" ? "text-mundial-muted" : "text-slate-400"
              }`}
            >
              No hay partidos este día
            </p>
          ) : (
            dayMatches.map((match) => (
              <MatchRow
                key={match.id}
                match={match}
                variant={variant}
                onTeamClick={setSelectedTeamId}
              />
            ))
          )}
        </div>
      </div>

      {selectedTeamId != null && (
        <TeamDetailModal
          teamId={selectedTeamId}
          onClose={() => setSelectedTeamId(null)}
        />
      )}
    </>
  );
}
