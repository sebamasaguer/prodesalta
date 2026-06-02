import { api } from "./client";
import type {
  CreateGroupPayload,
  JoinGroupPayload,
  ProdeGroup,
  ProdeGroupDetail,
} from "../types/prodeGroup";

export async function listMyGroups(): Promise<ProdeGroup[]> {
  const response = await api.get<ProdeGroup[]>("/prode-groups");
  return response.data;
}

export async function createGroup(
  payload: CreateGroupPayload,
): Promise<ProdeGroup> {
  const response = await api.post<ProdeGroup>("/prode-groups", payload);
  return response.data;
}

export async function joinGroup(
  payload: JoinGroupPayload,
): Promise<ProdeGroup> {
  const response = await api.post<ProdeGroup>("/prode-groups/join", payload);
  return response.data;
}

export async function getGroupDetail(groupId: number): Promise<ProdeGroupDetail> {
  const response = await api.get<ProdeGroupDetail>(`/prode-groups/${groupId}`);
  return response.data;
}

export async function leaveGroup(groupId: number): Promise<void> {
  await api.post(`/prode-groups/${groupId}/leave`);
}

export async function removeGroupMember(
  groupId: number,
  userId: number,
): Promise<void> {
  await api.delete(`/prode-groups/${groupId}/members/${userId}`);
}

export async function getMyPersonalGroup(): Promise<ProdeGroup> {
  const response = await api.get<ProdeGroup>("/prode-groups/personal/me");
  return response.data;
}