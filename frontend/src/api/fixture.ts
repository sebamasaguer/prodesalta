import { api } from "./client";
import type {
  Match,
  MatchCreatePayload,
  MatchResultPayload,
  Team,
  TeamCreatePayload,
  Tournament,
  TournamentCreatePayload,
} from "../types/fixture";

export async function listTournaments(): Promise<Tournament[]> {
  const response = await api.get<Tournament[]>("/tournaments");
  return response.data;
}

export async function createTournament(
  payload: TournamentCreatePayload,
): Promise<Tournament> {
  const response = await api.post<Tournament>("/tournaments", payload);
  return response.data;
}

export async function listTeams(): Promise<Team[]> {
  const response = await api.get<Team[]>("/teams");
  return response.data;
}

export async function createTeam(payload: TeamCreatePayload): Promise<Team> {
  const response = await api.post<Team>("/teams", payload);
  return response.data;
}

export async function listMatches(): Promise<Match[]> {
  const response = await api.get<Match[]>("/matches");
  return response.data;
}

export async function listPublicMatches(): Promise<Match[]> {
  const response = await api.get<Match[]>("/matches/public");
  return response.data;
}

export async function listUpcomingMatches(): Promise<Match[]> {
  const response = await api.get<Match[]>("/matches/upcoming");
  return response.data;
}

export async function createMatch(payload: MatchCreatePayload): Promise<Match> {
  const response = await api.post<Match>("/matches", payload);
  return response.data;
}

export async function updateMatchResult(
  matchId: number,
  payload: MatchResultPayload,
): Promise<Match> {
  const response = await api.put<Match>(`/matches/${matchId}/result`, payload);
  return response.data;
}

export async function closeMatch(matchId: number): Promise<Match> {
  const response = await api.put<Match>(`/matches/${matchId}/close`);
  return response.data;
}

export async function updateTeam(
  teamId: number,
  payload: {
    name?: string;
    code?: string;
    flag_url?: string | null;
  },
): Promise<Team> {
  const response = await api.patch<Team>(`/teams/${teamId}`, payload);
  return response.data;
}

export async function uploadTeamFlag(
  teamId: number,
  file: File,
): Promise<Team> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<Team>(`/teams/${teamId}/flag`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}