import { api } from "./client";
import type { Sponsor, SponsorPayload, SponsorUpdatePayload } from "../types/sponsor";

export async function listPublicSponsors(): Promise<Sponsor[]> {
  const response = await api.get<Sponsor[]>("/sponsors/public");
  return response.data;
}

export async function listSponsors(): Promise<Sponsor[]> {
  const response = await api.get<Sponsor[]>("/sponsors");
  return response.data;
}

export async function createSponsor(payload: SponsorPayload): Promise<Sponsor> {
  const response = await api.post<Sponsor>("/sponsors", payload);
  return response.data;
}

export async function updateSponsor(
  sponsorId: number,
  payload: SponsorUpdatePayload,
): Promise<Sponsor> {
  const response = await api.patch<Sponsor>(`/sponsors/${sponsorId}`, payload);
  return response.data;
}

export async function deleteSponsor(sponsorId: number): Promise<void> {
  await api.delete(`/sponsors/${sponsorId}`);
}

export async function uploadSponsorLogo(
  sponsorId: number,
  file: File,
): Promise<Sponsor> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<Sponsor>(`/sponsors/${sponsorId}/logo`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}
