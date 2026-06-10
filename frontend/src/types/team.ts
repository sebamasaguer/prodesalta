export interface PlayerInSquad {
  id: number;
  name: string;
  number: number | null;
  position: string | null;
  age: number | null;
  nationality: string | null;
  photo_url: string | null;
}

export interface TeamDetail {
  id: number;
  name: string;
  code: string;
  flag_url: string | null;
  coach_name: string | null;
  coach_nationality: string | null;
  country: string | null;
  founded: number | null;
  first_wc_year: number | null;
  wc_participations: number | null;
  wc_played: number | null;
  wc_wins: number | null;
  wc_draws: number | null;
  wc_losses: number | null;
  wc_goals_scored: number | null;
  wc_goals_conceded: number | null;
  players: PlayerInSquad[];
}
