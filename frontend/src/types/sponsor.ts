export interface Sponsor {
  id: number;
  name: string;
  phone: string | null;
  logo_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SponsorPayload {
  name: string;
  phone?: string | null;
  logo_url?: string | null;
  display_order: number;
  is_active: boolean;
}

export type SponsorUpdatePayload = Partial<SponsorPayload>;
