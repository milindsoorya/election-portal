#!/usr/bin/env npx tsx
/**
 * India Election Portal — Data Sync Script
 * -----------------------------------------
 * Usage:
 *   npm run sync                    # sync everything
 *   npm run sync:results            # results only
 *   npm run sync:candidates         # candidates only
 *   npm run sync:booths             # booths only
 *
 * Reads from:
 *   - results.eci.gov.in (live counting)
 *   - myneta.info (candidate affidavits)
 *   - electoralsearch.eci.gov.in (voter rolls)
 *
 * Writes to:
 *   - Supabase (configured via .env.local)
 *
 * Requires these env vars (see .env.example):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   ECI_RESULTS_URL            (set when election results are announced)
 *   MYNETA_ELECTION_ID         (set before candidate filing deadline)
 *   MYNETA_STATE_SLUG          (e.g. 'kerala2026')
 */

import "dotenv/config";
import { getServiceClient } from "../lib/db/supabase";
import { scrapeEciResults, scrapeEciPartyTally } from "../lib/scrapers/eci-results";
import { fetchMyNetaCandidates } from "../lib/scrapers/myneta";
import { scrapeCeoKeralaBooths } from "../lib/scrapers/voter-roll";
import { CONSTITUENCIES } from "../data/constituencies";
import { ALLIANCE_COLORS } from "../lib/constants";

const STATE_ID = process.env.SYNC_STATE || "kerala";
const JOB = process.argv[2] || "all";

async function main() {
  console.log(`\n🗳  India Election Portal — Sync`);
  console.log(`   State: ${STATE_ID} | Job: ${JOB}`);
  console.log(`   ${new Date().toISOString()}\n`);

  const db = getServiceClient();

  // Ensure state row exists
  await db.from("states").upsert({
    id: STATE_ID,
    name: "Kerala",
    seats: 140,
    majority_mark: 71,
    election_date: process.env.ELECTION_DATE || "2026-04-23",
    result_date: process.env.RESULT_DATE || "2026-04-25",
    active: true,
    language_code: "ml",
  }, { onConflict: "id" });

  if (JOB === "all" || JOB === "results") {
    await syncResults(db);
  }

  if (JOB === "all" || JOB === "candidates") {
    await syncCandidates(db);
  }

  if (JOB === "all" || JOB === "booths") {
    await syncBooths(db);
  }

  console.log("\n✅  Sync complete\n");
}

// ---- Results ----

async function syncResults(db: ReturnType<typeof getServiceClient>) {
  const eciUrl = process.env.ECI_RESULTS_URL;
  if (!eciUrl) {
    console.log("⚠️  ECI_RESULTS_URL not set — skipping results sync");
    console.log("   Set this to the ECI results page URL once the election is announced");
    console.log("   e.g. https://results.eci.gov.in/ResultAcGenApr2026/\n");
    return;
  }

  console.log("📊 Syncing results from ECI...");
  console.log(`   URL: ${eciUrl}`);

  const startMs = Date.now();

  const [results, _partyTally] = await Promise.all([
    scrapeEciResults(eciUrl),
    scrapeEciPartyTally(eciUrl),
  ]);

  if (results.length === 0) {
    console.log("   No results found — counting may not have started yet");
    return;
  }

  const rows = results.map((r) => ({
    state_id: STATE_ID,
    constituency_id: r.constituencyNumber,
    constituency_name: r.constituencyName,
    district: resolveDistrict(r.constituencyNumber),
    leading_candidate: r.leadingCandidate || null,
    leading_party: r.leadingParty || null,
    leading_alliance: resolveAlliance(r.leadingParty) || null,
    leading_votes: r.leadingVotes,
    runner_up_candidate: r.trailingCandidate || null,
    runner_up_party: r.trailingParty || null,
    runner_up_votes: r.trailingVotes,
    total_votes_counted: r.totalVotesCounted,
    total_voters: resolveVoters(r.constituencyNumber),
    margin: r.margin,
    status: r.status,
    rounds_complete: r.roundsComplete,
    total_rounds: r.totalRounds || defaultRounds(r.constituencyNumber),
    last_updated_at: new Date().toISOString(),
  }));

  const { error } = await db
    .from("results")
    .upsert(rows, { onConflict: "state_id,constituency_id" });

  if (error) {
    console.error("❌  Results upsert failed:", error.message);
    return;
  }

  // Recompute alliance tally
  await updateAllianceTally(db);

  const elapsed = ((Date.now() - startMs) / 1000).toFixed(1);
  console.log(`   ✓  Updated ${rows.length} constituencies (${elapsed}s)`);
}

async function updateAllianceTally(db: ReturnType<typeof getServiceClient>) {
  const { data: allResults } = await db
    .from("results")
    .select("leading_alliance, status")
    .eq("state_id", STATE_ID);

  if (!allResults) return;

  const tally: Record<string, { won: number; leading: number }> = {};
  for (const r of allResults) {
    const a = r.leading_alliance || "Others";
    if (!tally[a]) tally[a] = { won: 0, leading: 0 };
    if (r.status === "Won") tally[a].won++;
    else if (r.status === "Leading") tally[a].leading++;
  }

  const rows = Object.entries(tally).map(([alliance, counts]) => ({
    state_id: STATE_ID,
    alliance,
    won: counts.won,
    leading: counts.leading,
    color: ALLIANCE_COLORS[alliance] || "#6c757d",
    updated_at: new Date().toISOString(),
  }));

  await db.from("alliance_tally").upsert(rows, { onConflict: "state_id,alliance" });
  console.log(`   ✓  Alliance tally updated: ${rows.map((r) => `${r.alliance}=${r.won + r.leading}`).join(" | ")}`);
}

// ---- Candidates ----

async function syncCandidates(db: ReturnType<typeof getServiceClient>) {
  const electionId = process.env.MYNETA_ELECTION_ID;
  if (!electionId) {
    console.log("⚠️  MYNETA_ELECTION_ID not set — skipping candidate sync");
    console.log("   Find the election ID at https://myneta.info/");
    console.log("   e.g. for Kerala 2021 it was 479\n");
    return;
  }

  console.log("👤 Syncing candidates from MyNeta...");
  console.log(`   Election ID: ${electionId}`);

  const startMs = Date.now();
  const candidates = await fetchMyNetaCandidates(electionId);

  if (candidates.length === 0) {
    console.log("   No candidates found — check MYNETA_ELECTION_ID and MYNETA_STATE_SLUG");
    return;
  }

  // Upsert in batches of 50 to avoid payload limits
  const BATCH = 50;
  let upserted = 0;

  for (let i = 0; i < candidates.length; i += BATCH) {
    const batch = candidates.slice(i, i + BATCH).map((c) => ({
      id: `${STATE_ID}-${c.constituencyNumber}-${c.id}`,
      state_id: STATE_ID,
      constituency_id: c.constituencyNumber,
      constituency_name: c.constituency,
      district: resolveDistrict(c.constituencyNumber),
      name: c.name,
      party_name: c.party,
      party_abbr: abbreviateParty(c.party),
      alliance: resolveAlliance(c.party),
      age: c.age,
      gender: c.gender,
      education: c.education,
      profession: c.profession,
      assets_lakh: c.assetsLakh,
      liabilities_lakh: c.liabilitiesLakh,
      criminal_cases: c.criminalCasesTotal,
      terms_served: c.termsServed,
      is_incumbent: c.isIncumbent,
      myneta_id: c.id,
      affidavit_url: c.affidavitUrl,
      last_synced_at: new Date().toISOString(),
    }));

    const { error } = await db.from("candidates").upsert(batch, { onConflict: "id" });
    if (error) {
      console.error(`   ❌  Batch ${i / BATCH + 1} failed:`, error.message);
    } else {
      upserted += batch.length;
      process.stdout.write(`\r   Progress: ${upserted}/${candidates.length}     `);
    }
  }

  const elapsed = ((Date.now() - startMs) / 1000).toFixed(1);
  console.log(`\n   ✓  Upserted ${upserted} candidates (${elapsed}s)`);
}

// ---- Booths ----

async function syncBooths(db: ReturnType<typeof getServiceClient>) {
  console.log("📍 Syncing polling booths from CEO Kerala...");

  const startMs = Date.now();
  const booths = await scrapeCeoKeralaBooths();

  if (booths.length === 0) {
    console.log("   No booth data scraped — CEO Kerala may require manual download");
    console.log("   Download booth lists from https://www.ceo.kerala.gov.in/electionrolls.html");
    console.log("   Then import via: psql ... < booth_data.sql\n");
    return;
  }

  const rows = booths.map((b) => ({
    id: b.boothId,
    state_id: STATE_ID,
    constituency_id: b.constituencyId,
    constituency_name: b.constituencyName,
    district: b.district,
    booth_number: b.boothNumber,
    booth_name: b.boothName,
    address: b.address,
    total_voters: b.totalVoters,
    open_time: "07:00",
    close_time: "18:00",
    is_accessible: b.isAccessible,
    last_synced_at: new Date().toISOString(),
  }));

  const { error } = await db.from("polling_booths").upsert(rows, { onConflict: "id" });
  if (error) {
    console.error("❌  Booths upsert failed:", error.message);
    return;
  }

  const elapsed = ((Date.now() - startMs) / 1000).toFixed(1);
  console.log(`   ✓  Upserted ${rows.length} booths (${elapsed}s)`);
}

// ---- Helpers ----

function resolveDistrict(constituencyId: number): string {
  return CONSTITUENCIES.find((c) => c.id === constituencyId)?.district || "Unknown";
}

function resolveVoters(constituencyId: number): number {
  return CONSTITUENCIES.find((c) => c.id === constituencyId)?.voters || 0;
}

function defaultRounds(constituencyId: number): number {
  const voters = resolveVoters(constituencyId);
  return Math.ceil(voters / 15000); // rough estimate
}

const PARTY_ALLIANCE: Record<string, string> = {
  "communist party of india (marxist)": "LDF",
  "cpi(m)": "LDF",
  "cpim": "LDF",
  "communist party of india": "LDF",
  "cpi": "LDF",
  "indian national congress": "UDF",
  "inc": "UDF",
  "congress": "UDF",
  "indian union muslim league": "UDF",
  "iuml": "UDF",
  "kerala congress": "UDF",
  "kc(m)": "UDF",
  "bharatiya janata party": "NDA",
  "bjp": "NDA",
  "bdjs": "NDA",
};

function resolveAlliance(party: string): string {
  if (!party) return "Others";
  const key = party.toLowerCase().trim();
  if (PARTY_ALLIANCE[key]) return PARTY_ALLIANCE[key];
  for (const [k, v] of Object.entries(PARTY_ALLIANCE)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return "Others";
}

function abbreviateParty(party: string): string {
  const map: Record<string, string> = {
    "Communist Party of India (Marxist)": "CPI(M)",
    "Indian National Congress": "INC",
    "Bharatiya Janata Party": "BJP",
    "Communist Party of India": "CPI",
    "Indian Union Muslim League": "IUML",
    "Kerala Congress (M)": "KC(M)",
  };
  return map[party] || party.substring(0, 20);
}

main().catch((e) => {
  console.error("\n❌  Fatal error:", e);
  process.exit(1);
});
