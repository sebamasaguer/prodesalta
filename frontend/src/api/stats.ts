import { api } from "./client";
import type {
  DashboardStats,
  GroupStats,
  StatsOverview,
} from "../types/stats";
import type { RankingEntry } from "../types/ranking";

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await api.get<DashboardStats>("/stats/dashboard");
  return response.data;
}

export async function getStatsOverview(): Promise<StatsOverview> {
  const response = await api.get<StatsOverview>("/stats/overview");
  return response.data;
}

export async function getGroupStats(): Promise<GroupStats[]> {
  const response = await api.get<GroupStats[]>("/stats/groups");
  return response.data;
}

export async function getGeneralRanking(): Promise<RankingEntry[]> {
  const response = await api.get<RankingEntry[]>("/rankings/general");
  return response.data;
}