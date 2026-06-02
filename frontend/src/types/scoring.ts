export interface ScoringRule {
  id: number;
  tournament_id: number | null;
  name: string;

  exact_score_points: number;
  winner_points: number;
  goal_difference_points: number;
  participation_points: number;

  is_default: boolean;
  is_active: boolean;
  created_at: string;
}

export interface ScoringRuleCreatePayload {
  tournament_id?: number | null;
  name: string;

  exact_score_points: number;
  winner_points: number;
  goal_difference_points: number;
  participation_points: number;

  is_default: boolean;
  is_active: boolean;
}

export interface MatchScoreCalculation {
  match_id: number;
  predictions_processed: number;
  predictions_locked: number;
}