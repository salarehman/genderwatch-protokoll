import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type GenderType = "female" | "male" | "tina_female" | "tina_male" | "tina_other";

export interface Protocol {
  id: string;
  name: string;
  created_at: string;
}

export interface SpeakingEvent {
  id: string;
  protocol_id: string;
  gender: GenderType;
  started_at: string;
  ended_at: string | null;
  duration_ms: number | null;
}
