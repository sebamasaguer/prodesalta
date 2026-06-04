import { api } from "./client";
import type {
  Tournament,
  TournamentCreatePayload,
  TournamentUpdatePayload,
} from "../types/tournament";

export async function listTournaments(activeOnly = false) {
  const { data } = await api.get<Tournament[]>("/tournaments", {
    params: {
      active_only: activeOnly,
    },
  });

  return data;
}

export async function createTournament(payload: TournamentCreatePayload) {
  const { data } = await api.post<Tournament>("/tournaments", payload);
  return data;
}

export async function updateTournament(
  tournamentId: number,
  payload: TournamentUpdatePayload,
) {
  const { data } = await api.patch<Tournament>(
    `/tournaments/${tournamentId}`,
    payload,
  );

  return data;
}
