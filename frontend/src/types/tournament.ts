export type Tournament = {
  id: number;
  name: string;
  year: number;
  description?: string | null;
  is_active: boolean;
  created_at: string;
};

export type TournamentCreatePayload = {
  name: string;
  year: number;
  description?: string | null;
  is_active: boolean;
};

export type TournamentUpdatePayload = {
  name?: string;
  year?: number;
  description?: string | null;
  is_active?: boolean;
};
