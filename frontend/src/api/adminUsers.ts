import { api } from "./client";
import type { AdminUser, AdminUserFilters, AdminUserUpdatePayload, UserAdminStats } from "../types/adminUsers";

function cleanParams(filters?: AdminUserFilters) {
  const params: Record<string, string | boolean> = {};

  if (!filters) return params;

  if (filters.q?.trim()) params.q = filters.q.trim();
  if (filters.role) params.role = filters.role;
  if (filters.is_active !== "" && filters.is_active !== undefined) params.is_active = filters.is_active;
  if (filters.email_verified !== "" && filters.email_verified !== undefined) params.email_verified = filters.email_verified;

  return params;
}

export async function listAdminUsers(filters?: AdminUserFilters): Promise<AdminUser[]> {
  const response = await api.get<AdminUser[]>("/users", {
    params: {
      ...cleanParams(filters),
      limit: 200,
    },
  });

  return response.data;
}

export async function getAdminUserStats(): Promise<UserAdminStats> {
  const response = await api.get<UserAdminStats>("/users/stats");
  return response.data;
}

export async function updateAdminUser(
  userId: number,
  payload: AdminUserUpdatePayload,
): Promise<AdminUser> {
  const response = await api.patch<AdminUser>(`/users/${userId}`, payload);
  return response.data;
}
