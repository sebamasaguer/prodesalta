import type { User } from "./auth";

export type GroupRole = "OWNER" | "MEMBER";

export interface ProdeGroup {
  id: number;
  name: string;
  description: string | null;
  invite_code: string;
  owner_user_id: number;
  is_active: boolean;
  is_personal: boolean;
  created_at: string;
  members_count: number;
  my_role: GroupRole | null;
}

export interface GroupMember {
  id: number;
  group_id: number;
  user_id: number;
  role_in_group: GroupRole;
  joined_at: string;
  user: User;
}

export interface ProdeGroupDetail extends ProdeGroup {
  members: GroupMember[];
}

export interface CreateGroupPayload {
  name: string;
  description?: string;
}

export interface JoinGroupPayload {
  invite_code: string;
}