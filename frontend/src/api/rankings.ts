import { api } from "./client";
import type {
  GroupRanking,
  MyGroupRankingSummary,
} from "../types/ranking";

export async function listMyGroupRankingSummaries(): Promise<MyGroupRankingSummary[]> {
  const response = await api.get<MyGroupRankingSummary[]>("/rankings/my-groups");
  return response.data;
}

export async function getGroupRanking(groupId: number): Promise<GroupRanking> {
  const response = await api.get<GroupRanking>(`/rankings/group/${groupId}`);
  return response.data;
}