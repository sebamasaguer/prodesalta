import type { Match } from "./fixture";
import type { User } from "./auth";

export interface Prediction {
  id: number;
  match_id: number;
  user_id: number;
  group_id: number;

  home_score_predicted: number;
  away_score_predicted: number;

  points: number;
  is_locked: boolean;

  created_at: string;
  updated_at: string;

  match: Match;
}

export interface PredictionSimple {
  id: number;
  match_id: number;
  user_id: number;
  group_id: number;

  home_score_predicted: number;
  away_score_predicted: number;

  points: number;
  is_locked: boolean;

  created_at: string;
  updated_at: string;
}

export interface SavePredictionPayload {
  match_id: number;
  group_id: number;
  home_score_predicted: number;
  away_score_predicted: number;
}

export interface MatchPredictionStatus {
  match: Match;
  prediction: PredictionSimple | null;
  can_predict: boolean;
  lock_reason: string | null;
}

export interface GroupPrediction extends PredictionSimple {
  match: Match;
  user: User;
}

export interface GroupMemberPrediction {
  id: number;

  user_id: number;
  username: string;
  full_name: string | null;

  match_id: number;
  phase: string | null;
  home_team_name: string;
  away_team_name: string;

  predicted_home_score: number;
  predicted_away_score: number;

  actual_home_score: number | null;
  actual_away_score: number | null;

  points: number;
  is_locked: boolean;

  created_at: string;
  updated_at: string;
}
