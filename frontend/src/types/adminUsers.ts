import type { User, UserRole } from "./auth";

export interface AdminUserFilters {
  q?: string;
  role?: UserRole | "";
  is_active?: boolean | "";
  email_verified?: boolean | "";
}

export interface AdminUserUpdatePayload {
  first_name?: string;
  last_name?: string;
  role?: UserRole;
  is_active?: boolean;
  email_verified?: boolean;
}

export interface UserAdminStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  verified_users: number;
  unverified_users: number;
  admin_users: number;
  organizer_users: number;
  player_users: number;
}

export type AdminUser = User;
