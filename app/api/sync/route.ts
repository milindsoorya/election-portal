/**
 * POST /api/sync?job=results|candidates|booths|all&state=kerala
 *
 * Internal endpoint called by:
 *   1. Vercel Cron (every 2 min on election day for results, daily for candidates)
 *   2. The npm run sync CLI script
 *   3. Admin UI (manual trigger)
 *
 * Protected by CRON_SECRET so only Vercel/admin can call it.
 */

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getServiceClient } from "@/lib/db/supabase";
import { scrapeEciResults, scrapeEciPartyTally } from "@/lib/scrapers/eci-results";
import { fetchMyNetaCandidates } from "@/lib/scrapers/myneta";
import { CONSTITUENCIES } from "@/data/constituencies";
import { ALLIANCE_COLORS } from "@/lib/constants";

// Require CRON_SECRET on all requests
function isAuthorised(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // dev mode — allow without secret
  const auth = req.headers.get("authorization");
  const querySecret = req.nextUrl.searchParams.get("secret");
  return auth === `Bearer ${secret}` || querySecret === secret;
}

export async function POST(req: NextRequest) {
  if (!isAuthorised(req)) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const job     = req.nextUrl.searchParams.get("job") || "results";
  const stateId = req.nextUrl.searchParams.get("state") || "kerala";
  const started = Date.now();

  const db = getServiceClient();
  let recordsUpdated = 0;
  let errorMessage: string | undefined;

  // Log start
  const { data: logRow } = await db
    .from("sync_log")
    .insert({ job, state_id: stateId, status: "running" })
    .select("id")
    .single();
  const logId = logRow?.id;

  try {
    if (job === "results" || job === "all") {
      recordsUpdated += await syncResults(stateId, db);
    }
    if (job === "candidates" || job === "all") {
      recordsUpdated += await syncCandidates(stateId, db);
    }

    // Update log
    if (logId) {
      await db.from("sync_log").update({
        status: "success",
        records_updated: recordsUpdated,
        duration_ms: Date.now() - started,
        finished_at: new Date().toISOString(),
      }).eq("id", logId);
    }

    return NextResponse.json({
      ok: true,
      job,
      stateId,
      recordsUpdated,
      durationMs: Date.now() - started,
    });
  } catch (e) {
    errorMessage = (e as Error).message;
    console.error(`[sync/${job}]`, e);

    if (logId) {
      await db.from("sync_log").update({
        status: "error",
        error_message: errorMessage,
        duration_ms: Date.now() - started,
        finished_at: new Date().toISOString(),
      }).eq("id", logId);
    }

    return NextResponse.json({ ok: false, error: errorMessage }, { status: 500 });
  }
}

// ---- Results sync ----

async function syncResults(
  stateId: string,
  db: ReturnType<typeof getServiceClient>
): Promise<number> {
  const eciUrl = process.env.ECI_RESULTS_URL;
  if (!eciUrl) {
    console.warn("[sync/results] ECI_RESULTS_URL not set — skipping live scrape");
    return 0;
  }

  console.log(`[sync/results] Scraping ECI: ${eciUrl}`);
  const [reciResults, partyTallies] = await Promise.all([
    scrapeEciResults(eciUrl),
    scrapeEciPartyTally(eciUrl),
  ]);

  if (reciResults.length === 0) {
    console.log("[sync/results] No results scraped");
    return 0;
  }

  // Upsert constituency results
  const rows = reciResults.map((r) => ({
    state_id: stateId,
    constituency_id: r.constituencyNumber,
    constituency_name: r.constituencyName,
    district: resolveDistrict(r.constituencyNumber),
    leading_candidate: r.leadingCandidate,
    leading_party: r.leadingParty,
    leading_alliance: resolveAlliance(r.leadingParty),
    leading_votes: r.leadingVotes,
    runner_up_candidate: r.trailingCandidate,
    runner_up_party: r.trailingParty,
    runner_up_votes: r.trailingVotes,
    total_votes_counted: r.totalVotesCounted,
    margin: r.margin,
    status: r.status,
    rounds_complete: r.roundsComplete,
    total_rounds: r.totalRounds,
    last_updated_at: new Date().toISOString(),
  }));

  const { error } = await db
    .from("results")
    .upsert(rows, { onConflict: "state_id,constituency_id" });

  if (error) throw new Error(`Results upsert failed: ${error.message}`);

  // Update alliance tally cache
  await updateAllianceTally(stateId, db);

  console.log(`[sync/results] Updated ${rows.length} constituency results`);
  return rows.length;
}

async function updateAllianceTally(
  stateId: string,
  db: ReturnType<typeof getServiceClient>
) {
  const { data: results } = await db
    .from("results")
    .select("leading_alliance, status")
    .eq("state_id", stateId);

  if (!results) return;

  const tally: Record<string, { won: number; leading: number }> = {};
  for (const r of results) {
    const a = r.leading_alliance || "Others";
    if (!tally[a]) tally[a] = { won: 0, leading: 0 };
    if (r.status === "Won") tally[a].won++;
    else if (r.status === "Leading") tally[a].leading++;
  }

  const rows = Object.entries(tally).map(([alliance, counts]) => ({
    state_id: stateId,
    alliance,
    won: counts.won,
    leading: counts.leading,
    color: ALLIANCE_COLORS[alliance] || "#6c757d",
    updated_at: new Date().toISOString(),
  }));

  await db.from("alliance_tally").upsert(rows, { onConflict: "state_id,alliance" });
}

// ---- Candidates sync ----

async function syncCandidates(
  stateId: string,
  db: ReturnType<typeof getServiceClient>
): Promise<number> {
  const electionId = process.env.MYNETA_ELECTION_ID;
  if (!electionId) {
    console.warn("[sync/candidates] MYNETA_ELECTION_ID not set — skipping");
    return 0;
  }

  console.log(`[sync/candidates] Fetching MyNeta election ${electionId}`);
  const candidates = await fetchMyNetaCandidates(electionId);

  if (candidates.length === 0) {
    console.log("[sync/candidates] No candidates fetched");
    return 0;
  }

  const rows = candidates.map((c) => ({
    id: `${stateId}-${c.constituencyNumber}-${c.id}`,
    state_id: stateId,
    constituency_id: c.constituencyNumber,
    constituency_name: c.constituency,
    district: resolveDistrict(c.constituencyNumber),
    name: c.name,
    party_name: c.party,
    party_abbr: c.party,
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

  const { error } = await db.from("candidates").upsert(rows, { onConflict: "id" });
  if (error) throw new Error(`Candidates upsert failed: ${error.message}`);

  console.log(`[sync/candidates] Upserted ${rows.length} candidates`);
  return rows.length;
}

// ---- Helpers ----

/** Map constituency number → district name using our static data */
function resolveDistrict(constituencyId: number): string {
  return CONSTITUENCIES.find((c) => c.id === constituencyId)?.district || "Unknown";
}

/** Map party abbreviation → alliance name */
const PARTY_ALLIANCE_MAP: Record<string, string> = {
  "CPI(M)": "LDF", "CPI": "LDF", "NCP": "LDF", "JD(S)": "LDF",
  "INC": "UDF", "IUML": "UDF", "KC(M)": "UDF", "RSP": "UDF",
  "BJP": "NDA", "BDJS": "NDA",
};

function resolveAlliance(party: string): string {
  // Try exact match first
  if (PARTY_ALLIANCE_MAP[party]) return PARTY_ALLIANCE_MAP[party];
  // Try partial match
  for (const [key, val] of Object.entries(PARTY_ALLIANCE_MAP)) {
    if (party.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return "Others";
}
