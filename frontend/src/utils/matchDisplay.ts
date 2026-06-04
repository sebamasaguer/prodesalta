import type { Match } from "../types/fixture";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "/api";

const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

export function resolveAssetUrl(value: string | null | undefined): string | null {
  if (!value) return null;

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `${BACKEND_BASE_URL}${value}`;
}

export function homeName(match: Match): string {
  return match.home_team?.name || match.home_placeholder || "Por definir";
}

export function homeCode(match: Match): string {
  return match.home_team?.code || "";
}

export function homeFlag(match: Match): string | null {
  return resolveAssetUrl(match.home_team?.flag_url);
}

export function awayName(match: Match): string {
  return match.away_team?.name || match.away_placeholder || "Por definir";
}

export function awayCode(match: Match): string {
  return match.away_team?.code || "";
}

export function awayFlag(match: Match): string | null {
  return resolveAssetUrl(match.away_team?.flag_url);
}