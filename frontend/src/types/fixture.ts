export type MatchPhase =
  | "GROUP_STAGE"
  | "ROUND_OF_32"
  | "ROUND_OF_16"
  | "QUARTER_FINAL"
  | "SEMI_FINAL"
  | "THIRD_PLACE"
  | "FINAL";

export type MatchStatus =
  | "SCHEDULED"
  | "CLOSED"
  | "LIVE"
  | "FINISHED"
  | "CANCELLED";

export interface Tournament {
  id: number;
  name: string;
  year: number;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Team {
  id: number;
  name: string;
  code: string;
  flag_url: string | null;
  created_at: string;
}

export interface Match {
  id: number;
  tournament_id: number;
  phase: MatchPhase;
  world_group: string | null;

  home_team_id: number | null;
  away_team_id: number | null;

  home_placeholder: string | null;
  away_placeholder: string | null;

  match_datetime: string;
  prediction_deadline: string;

  status: MatchStatus;
  home_score: number | null;
  away_score: number | null;

  created_at: string;

  tournament: Tournament;
  home_team: Team | null;
  away_team: Team | null;
}

export interface TournamentCreatePayload {
  name: string;
  year: number;
  description?: string;
  is_active: boolean;
}

export interface TeamCreatePayload {
  name: string;
  code: string;
  flag_url?: string | null;
}

export interface MatchCreatePayload {
  tournament_id: number;
  phase: MatchPhase;
  world_group?: string;
  home_team_id?: number | null;
  away_team_id?: number | null;
  home_placeholder?: string | null;
  away_placeholder?: string | null;
  match_datetime: string;
  prediction_deadline: string;
}

export interface MatchResultPayload {
  home_score: number;
  away_score: number;
  status: MatchStatus;
}