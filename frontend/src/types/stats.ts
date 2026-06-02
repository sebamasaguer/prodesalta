import type { RankingEntry } from "./ranking";

export interface DashboardStats {
  users_count: number;
  groups_count: number;
  teams_count: number;
  tournaments_count: number;
  matches_count: number;
  scheduled_matches_count: number;
  finished_matches_count: number;
  predictions_count: number;
  total_points_awarded: number;
  average_points_per_prediction: number;
}

export interface GroupStats {
  group_id: number;
  group_name: string;
  members_count: number;
  predictions_count: number;
  total_points: number;
  average_points: number;
  leader_name: string | null;
  leader_points: number | null;
}

export interface StatsOverview {
  dashboard: DashboardStats;
  top_general: RankingEntry[];
  top_exact_scores: RankingEntry[];
  top_winners: RankingEntry[];
  group_stats: GroupStats[];
}