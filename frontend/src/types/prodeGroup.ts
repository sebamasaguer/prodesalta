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

export interface GroupPrize {
  id: number;
  group_id: number;
  title: string;
  description: string | null;
  amount_label: string | null;
  position_order: number;
  created_by_user_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface ProdeGroupDetail extends ProdeGroup {
  members: GroupMember[];
  prizes: GroupPrize[];
}

export interface CreateGroupPayload {
  name: string;
  description?: string;
}

export interface JoinGroupPayload {
  invite_code: string;
}

export interface GroupPrizePayload {
  title: string;
  description?: string | null;
  amount_label?: string | null;
  position_order: number;
}
