-- ============================================================
-- India Election Portal — Supabase Schema
-- Run this in the Supabase SQL editor to initialize your DB
-- ============================================================

-- States
CREATE TABLE IF NOT EXISTS states (
  id TEXT PRIMARY KEY,                    -- e.g. 'kerala'
  name TEXT NOT NULL,
  seats INTEGER NOT NULL,
  majority_mark INTEGER NOT NULL,
  election_date DATE,
  result_date DATE,
  active BOOLEAN DEFAULT false,
  language_code TEXT DEFAULT 'en',
  color_primary TEXT DEFAULT '#1a6b3a',
  color_secondary TEXT DEFAULT '#e8702a',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Constituencies
CREATE TABLE IF NOT EXISTS constituencies (
  id INTEGER NOT NULL,
  state_id TEXT NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  district TEXT NOT NULL,
  total_voters INTEGER DEFAULT 0,
  total_booths INTEGER DEFAULT 0,
  reserved_for TEXT DEFAULT 'General',     -- General / SC / ST
  eci_code TEXT,                           -- ECI internal code e.g. 'S21A001'
  PRIMARY KEY (id, state_id)
);

-- Parties
CREATE TABLE IF NOT EXISTS parties (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  abbreviation TEXT NOT NULL,
  alliance TEXT,
  color TEXT,
  symbol_emoji TEXT,
  founded_year INTEGER,
  ideology TEXT,
  seats_contesting INTEGER DEFAULT 0,
  manifesto_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Candidates  (sourced from MyNeta / ECI affidavits)
CREATE TABLE IF NOT EXISTS candidates (
  id TEXT PRIMARY KEY,
  state_id TEXT NOT NULL REFERENCES states(id),
  constituency_id INTEGER NOT NULL,
  constituency_name TEXT NOT NULL,
  district TEXT NOT NULL,
  name TEXT NOT NULL,
  party_id TEXT REFERENCES parties(id),
  party_name TEXT,
  party_abbr TEXT,
  alliance TEXT,
  age INTEGER,
  gender TEXT,
  education TEXT,
  profession TEXT,
  assets_lakh NUMERIC DEFAULT 0,
  liabilities_lakh NUMERIC DEFAULT 0,
  criminal_cases INTEGER DEFAULT 0,
  terms_served INTEGER DEFAULT 0,
  is_incumbent BOOLEAN DEFAULT false,
  myneta_id TEXT,                          -- MyNeta candidate ID for re-fetching
  affidavit_url TEXT,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Polling Booths
CREATE TABLE IF NOT EXISTS polling_booths (
  id TEXT PRIMARY KEY,                     -- e.g. 'KL-KNR-008-001'
  state_id TEXT NOT NULL REFERENCES states(id),
  constituency_id INTEGER NOT NULL,
  constituency_name TEXT NOT NULL,
  district TEXT NOT NULL,
  booth_number INTEGER NOT NULL,
  booth_name TEXT NOT NULL,
  address TEXT,
  total_voters INTEGER DEFAULT 0,
  open_time TEXT DEFAULT '07:00',
  close_time TEXT DEFAULT '18:00',
  is_accessible BOOLEAN DEFAULT false,
  has_ramp BOOLEAN DEFAULT false,
  has_helper_cabin BOOLEAN DEFAULT false,
  latitude NUMERIC,
  longitude NUMERIC,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Election Results  (updated live during counting)
CREATE TABLE IF NOT EXISTS results (
  id BIGSERIAL PRIMARY KEY,
  state_id TEXT NOT NULL REFERENCES states(id),
  constituency_id INTEGER NOT NULL,
  constituency_name TEXT NOT NULL,
  district TEXT NOT NULL,
  leading_candidate TEXT,
  leading_party TEXT,
  leading_alliance TEXT,
  leading_votes INTEGER DEFAULT 0,
  runner_up_candidate TEXT,
  runner_up_party TEXT,
  runner_up_votes INTEGER DEFAULT 0,
  total_votes_counted INTEGER DEFAULT 0,
  total_voters INTEGER DEFAULT 0,
  margin INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Pending',           -- Pending / Counting / Leading / Won
  rounds_complete INTEGER DEFAULT 0,
  total_rounds INTEGER DEFAULT 0,
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (state_id, constituency_id)
);

-- Alliance tally cache  (computed/cached for speed)
CREATE TABLE IF NOT EXISTS alliance_tally (
  state_id TEXT NOT NULL REFERENCES states(id),
  alliance TEXT NOT NULL,
  won INTEGER DEFAULT 0,
  leading INTEGER DEFAULT 0,
  color TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (state_id, alliance)
);

-- Sync log  (audit trail for all scraping jobs)
CREATE TABLE IF NOT EXISTS sync_log (
  id BIGSERIAL PRIMARY KEY,
  job TEXT NOT NULL,                       -- 'results' | 'candidates' | 'booths'
  state_id TEXT,
  status TEXT NOT NULL,                    -- 'success' | 'error' | 'running'
  records_updated INTEGER DEFAULT 0,
  error_message TEXT,
  duration_ms INTEGER,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);

-- ---- Indexes ----
CREATE INDEX IF NOT EXISTS idx_candidates_state ON candidates(state_id);
CREATE INDEX IF NOT EXISTS idx_candidates_constituency ON candidates(state_id, constituency_id);
CREATE INDEX IF NOT EXISTS idx_candidates_party ON candidates(party_id);
CREATE INDEX IF NOT EXISTS idx_results_state ON results(state_id);
CREATE INDEX IF NOT EXISTS idx_results_status ON results(state_id, status);
CREATE INDEX IF NOT EXISTS idx_booths_constituency ON polling_booths(state_id, constituency_id);

-- ---- Seed: Kerala state ----
INSERT INTO states (id, name, seats, majority_mark, election_date, result_date, active, language_code)
VALUES ('kerala', 'Kerala', 140, 71, '2026-04-23', '2026-04-25', true, 'ml')
ON CONFLICT (id) DO NOTHING;

-- ---- Enable Row-Level Security ----
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE polling_booths ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables
CREATE POLICY "public_read_results" ON results FOR SELECT USING (true);
CREATE POLICY "public_read_candidates" ON candidates FOR SELECT USING (true);
CREATE POLICY "public_read_booths" ON polling_booths FOR SELECT USING (true);
CREATE POLICY "public_read_states" ON states FOR SELECT USING (true);
CREATE POLICY "public_read_constituencies" ON constituencies FOR SELECT USING (true);
CREATE POLICY "public_read_parties" ON parties FOR SELECT USING (true);

-- Service role can write (used by the sync scripts via SUPABASE_SERVICE_ROLE_KEY)
-- No need for explicit INSERT policies — service role bypasses RLS
