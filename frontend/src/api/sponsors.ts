import { api } from "./client";
import type { Sponsor, SponsorPayload, SponsorUpdatePayload } from "../types/sponsor";

export type CreateSponsorFormPayload = {
  name: string;
  phone?: string | null;
  logoUrl?: string | null;
  logoFile?: File | null;
  displayOrder?: number;
  isActive?: boolean;
};

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

export async function createSponsorWithUpload(
  payload: CreateSponsorFormPayload,
): Promise<Sponsor> {
  const formData = new FormData();

  formData.append("name", payload.name.trim());

  if (payload.phone?.trim()) {
    formData.append("phone", payload.phone.trim());
  }

  if (payload.logoUrl?.trim()) {
    formData.append("logo_url", payload.logoUrl.trim());
  }

  if (payload.logoFile) {
    formData.append("logo_file", payload.logoFile);
  }

  formData.append("display_order", String(payload.displayOrder ?? 1));
  formData.append("is_active", String(payload.isActive ?? true));

  const response = await api.post<Sponsor>("/sponsors/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

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
