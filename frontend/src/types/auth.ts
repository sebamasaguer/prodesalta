export type UserRole = "ADMIN" | "ORGANIZER" | "PLAYER";

export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  terms_accepted_at: string | null;
  terms_version: string | null;
}

export interface LoginPayload {
  username_or_email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  accept_terms: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}