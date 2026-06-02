import type { ProdeGroup } from "./prodeGroup";
import type { User } from "./auth";

export interface RankingEntry {
  position: number;

  user_id: number;
  user: User;

  total_points: number;
  predictions_count: number;

  exact_scores_count: number;
  winner_count: number;
  goal_difference_count: number;

  finished_predictions_count: number;
}

export interface GroupRanking {
  group: ProdeGroup;
  entries: RankingEntry[];
}

export interface MyGroupRankingSummary {
  group: ProdeGroup;
  my_position: number | null;
  my_points: number;
  participants_count: number;
  leader_name: string | null;
  leader_points: number | null;
}