import { api } from "./client";
import type {
  MatchScoreCalculation,
  ScoringRule,
  ScoringRuleCreatePayload,
} from "../types/scoring";

export async function listScoringRules(): Promise<ScoringRule[]> {
  const response = await api.get<ScoringRule[]>("/scoring-rules");
  return response.data;
}

export async function getActiveScoringRule(
  tournamentId?: number,
): Promise<ScoringRule> {
  const response = await api.get<ScoringRule>("/scoring-rules/active", {
    params: tournamentId ? { tournament_id: tournamentId } : undefined,
  });

  return response.data;
}

export async function createScoringRule(
  payload: ScoringRuleCreatePayload,
): Promise<ScoringRule> {
  const response = await api.post<ScoringRule>("/scoring-rules", payload);
  return response.data;
}

export async function recalculateMatchPoints(
  matchId: number,
): Promise<MatchScoreCalculation> {
  const response = await api.post<MatchScoreCalculation>(
    `/scoring-rules/matches/${matchId}/calculate`,
  );

  return response.data;
}