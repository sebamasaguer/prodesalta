import type { Match } from "./fixture";

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