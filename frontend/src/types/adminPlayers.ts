export interface PlayerAdmin {
  id: number;
  name: string;
  firstname: string | null;
  lastname: string | null;
  nationality: string | null;
  age: number | null;
  photo_url: string | null;
  position: string | null;
  jersey_number: number | null;
}

export interface PlayerCreatePayload {
  name: string;
  firstname?: string | null;
  lastname?: string | null;
  nationality?: string | null;
  age?: number | null;
  photo_url?: string | null;
  position?: string | null;
  jersey_number?: number | null;
}

export interface PlayerUpdatePayload {
  name?: string | null;
  firstname?: string | null;
  lastname?: string | null;
  nationality?: string | null;
  age?: number | null;
  photo_url?: string | null;
  position?: string | null;
  jersey_number?: number | null;
}
