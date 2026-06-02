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
  email_verified_at: string | null;
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

export interface RegisterResponse {
  message: string;
  email: string;
  email_delivery_mode: string;
  dev_verification_url?: string | null;
}

export interface VerifyEmailPayload {
  token: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}
