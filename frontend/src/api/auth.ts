import { api, TOKEN_STORAGE_KEY } from "./client";
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  RegisterResponse,
  User,
  VerifyEmailPayload,
} from "../types/auth";

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/login", payload);
  localStorage.setItem(TOKEN_STORAGE_KEY, response.data.access_token);
  return response.data;
}

export async function register(
  payload: RegisterPayload,
): Promise<RegisterResponse> {
  const response = await api.post<RegisterResponse>("/auth/register", payload);
  return response.data;
}

export async function verifyEmail(
  payload: VerifyEmailPayload,
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/verify-email", payload);
  localStorage.setItem(TOKEN_STORAGE_KEY, response.data.access_token);
  return response.data;
}

export async function getMe(): Promise<User> {
  const response = await api.get<User>("/auth/me");
  return response.data;
}

export function logout() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function hasToken(): boolean {
  return Boolean(localStorage.getItem(TOKEN_STORAGE_KEY));
}
