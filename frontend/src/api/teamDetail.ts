import { api } from "./client";
import type { TeamDetail } from "../types/team";

export async function getTeamDetail(teamId: number): Promise<TeamDetail> {
  const response = await api.get<TeamDetail>(`/teams/${teamId}/detail`);
  return response.data;
}
