import { api } from "./client";
import type {
  GroupMemberPrediction,
  GroupPrediction,
  MatchPredictionStatus,
  Prediction,
  SavePredictionPayload,
} from "../types/prediction";

export async function listMyPredictions(groupId?: number): Promise<Prediction[]> {
  const response = await api.get<Prediction[]>("/predictions", {
    params: groupId ? { group_id: groupId } : undefined,
  });

  return response.data;
}

export async function savePrediction(
  payload: SavePredictionPayload,
): Promise<Prediction> {
  const response = await api.post<Prediction>("/predictions", payload);
  return response.data;
}

export async function updatePrediction(
  predictionId: number,
  payload: Pick<
    SavePredictionPayload,
    "home_score_predicted" | "away_score_predicted"
  >,
): Promise<Prediction> {
  const response = await api.patch<Prediction>(
    `/predictions/${predictionId}`,
    payload,
  );

  return response.data;
}

export async function listGroupPredictions(
  groupId: number,
): Promise<GroupPrediction[]> {
  const response = await api.get<GroupPrediction[]>(
    `/predictions/group/${groupId}/all`,
  );

  return response.data;
}

export async function listGroupMatchesWithPredictions(
  groupId: number,
): Promise<MatchPredictionStatus[]> {
  const response = await api.get<MatchPredictionStatus[]>(
    `/predictions/group/${groupId}/matches`,
  );

  return response.data;
}


export async function listGroupMemberPredictions(
  groupId: number,
): Promise<GroupMemberPrediction[]> {
  const response = await api.get<GroupMemberPrediction[]>(
    `/predictions/group/${groupId}/members-predictions`,
  );

  return response.data;
}

export async function lockExpiredPredictions(): Promise<{
  ok: boolean;
  locked_count: number;
}> {
  const response = await api.post("/predictions/lock-expired");
  return response.data;
}