import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Public client — used in Next.js server components and API routes for reads
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service-role client — bypasses RLS, used ONLY in server-side sync scripts
// Never expose to the browser
export function getServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(supabaseUrl, serviceKey, {
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
