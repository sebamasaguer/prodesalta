import { api } from "./client";
import type {
  PlayerAdmin,
  PlayerCreatePayload,
  PlayerUpdatePayload,
} from "../types/adminPlayers";

export async function listTeamPlayers(teamId: number): Promise<PlayerAdmin[]> {
  const response = await api.get<PlayerAdmin[]>(`/teams/${teamId}/players`);
  return response.data;
}

export async function createTeamPlayer(
  teamId: number,
  data: PlayerCreatePayload,
): Promise<PlayerAdmin> {
  const response = await api.post<PlayerAdmin>(`/teams/${teamId}/players`, data);
  return response.data;
}

export async function updateTeamPlayer(
  teamId: number,
  playerId: number,
  data: PlayerUpdatePayload,
): Promise<PlayerAdmin> {
  const response = await api.patch<PlayerAdmin>(
    `/teams/${teamId}/players/${playerId}`,
    data,
  );
  return response.data;
}

export async function removeTeamPlayer(
  teamId: number,
  playerId: number,
): Promise<void> {
  await api.delete(`/teams/${teamId}/players/${playerId}`);
}
