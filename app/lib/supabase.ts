import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ── Singleton browser client ───────────────────────────────────────────────
let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!_client) _client = createClient(url, key);
  return _client;
}

/** Async version — same singleton, kept for backward compat */
export async function getBrowserSupabase(): Promise<SupabaseClient | null> {
  return getSupabase();
}

export const DEMO_USER = "demo-user";
export const DEMO_DOCTOR = "demo-doctor";

// ── Database types ─────────────────────────────────────────────────────────
export type DbSession = {
  id: number;
  user_id: string;
  exercise_name: string;
  exercise_key: string;
  achieved_angle: number;
  target_angle: number;
  rep_count: number;
  correct_reps: number;
  pain_before: number;
  pain_after: number;
  duration_seconds: number;
  status: "COMPLETED" | "ABANDONED";
  week_number: number;
  angle_log: { t: number; a: number }[];
  feedback_log: { text: string; type: string; t: number }[];
  started_at: string;
  ended_at: string;
};

export type DbCheckin = {
  id: number;
  user_id: string;
  pain_score: number;
  swelling: string;
  mood: string;
  slept_well: boolean;
  notes: string;
  insight: string;
  created_at: string;
};

export type DbPatientProfile = {
  user_id: string;
  full_name: string;
  email: string;
  age: number;
  gender: string;
  phone: string;
  surgery_type: string;
  surgery_date: string;
  current_week: number;
  total_weeks: number;
  target_rom: number;
  doctor_id: string;
};

export type DbMedicalReport = {
  id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  is_processed: boolean;
  is_active: boolean;
  extracted_data: Record<string, unknown>;
  created_at: string;
};

export type DbMessage = {
  id: string;
  from_user: string;
  to_user: string;
  from_role: "doctor" | "patient";
  text: string;
  read: boolean;
  created_at: string;
};

export type DbClinicalNote = {
  id: string;
  doctor_id: string;
  patient_id: string;
  note: string;
  type: "progress" | "concern" | "milestone";
  created_at: string;
};

// ── Helpers ────────────────────────────────────────────────────────────────
export function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export function fmtDateShort(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (diffDays === 0) return fmtTime(iso);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7)  return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
