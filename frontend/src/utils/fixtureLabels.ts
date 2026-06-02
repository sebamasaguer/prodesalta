import type { MatchPhase, MatchStatus } from "../types/fixture";

export function phaseLabel(phase: MatchPhase): string {
  const labels: Record<MatchPhase, string> = {
    GROUP_STAGE: "Fase de grupos",
    ROUND_OF_32: "16avos",
    ROUND_OF_16: "Octavos",
    QUARTER_FINAL: "Cuartos",
    SEMI_FINAL: "Semifinal",
    THIRD_PLACE: "Tercer puesto",
    FINAL: "Final",
  };

  return labels[phase];
}

export function statusLabel(status: MatchStatus): string {
  const labels: Record<MatchStatus, string> = {
    SCHEDULED: "Programado",
    CLOSED: "Cerrado",
    LIVE: "En vivo",
    FINISHED: "Finalizado",
    CANCELLED: "Cancelado",
  };

  return labels[status];
}

export function statusClass(status: MatchStatus): string {
  const classes: Record<MatchStatus, string> = {
    SCHEDULED: "bg-mundial-green/10 text-mundial-greenSoft",
    CLOSED: "bg-mundial-red/10 text-red-100",
    LIVE: "bg-mundial-red/10 text-red-100",
    FINISHED: "bg-blue-400/10 text-blue-300",
    CANCELLED: "bg-slate-500/10 text-slate-200",
  };

  return classes[status];
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}