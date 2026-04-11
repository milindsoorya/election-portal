import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Lazy singleton — only created on first use so the build doesn't fail
// when env vars aren't present in the CI/build environment.
let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error("Supabase env vars not set");
    _supabase = createClient(url, key);
  }
  return _supabase;
}

// Convenience proxy — callers can still do `supabase.from(...)` without changing imports
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

// Service-role client — bypasses RLS, used ONLY in server-side sync scripts
// Never expose to the browser
export function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

// ---- Typed helpers ----

export type StateRow = {
  id: string;
  name: string;
  seats: number;
  majority_mark: number;
  election_date: string;
  result_date: string;
  active: boolean;
};

export type CandidateRow = {
  id: string;
  state_id: string;
  constituency_id: number;
  constituency_name: string;
  district: string;
  name: string;
  party_id: string | null;
  party_name: string | null;
  party_abbr: string | null;
  alliance: string | null;
  age: number | null;
  gender: string | null;
  education: string | null;
  profession: string | null;
  assets_lakh: number;
  liabilities_lakh: number;
  criminal_cases: number;
  terms_served: number;
  is_incumbent: boolean;
  affidavit_url: string | null;
};

export type ResultRow = {
  state_id: string;
  constituency_id: number;
  constituency_name: string;
  district: string;
  leading_candidate: string | null;
  leading_party: string | null;
  leading_alliance: string | null;
  leading_votes: number;
  runner_up_candidate: string | null;
  runner_up_party: string | null;
  runner_up_votes: number;
  total_votes_counted: number;
  total_voters: number;
  margin: number;
  status: "Pending" | "Counting" | "Leading" | "Won";
  rounds_complete: number;
  total_rounds: number;
  last_updated_at: string;
};

export type AllianceTallyRow = {
  state_id: string;
  alliance: string;
  won: number;
  leading: number;
  color: string | null;
  updated_at: string;
};

export type BoothRow = {
  id: string;
  state_id: string;
  constituency_id: number;
  constituency_name: string;
  district: string;
  booth_number: number;
  booth_name: string;
  address: string | null;
  total_voters: number;
  open_time: string;
  close_time: string;
  is_accessible: boolean;
  has_ramp: boolean;
  has_helper_cabin: boolean;
  latitude: number | null;
  longitude: number | null;
};
