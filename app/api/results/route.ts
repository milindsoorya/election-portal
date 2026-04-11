/**
 * GET /api/results?state=kerala
 *
 * On election day:  scrapes ECI directly on each request, cached for 60s in-process.
 *                   No cron needed — the frontend's 60s auto-refresh drives it.
 * Off election day: serves from Supabase DB (populated by npm run sync:results).
 *                   Falls back to static demo data if DB is empty.
 *
 * This design works on Vercel Hobby (daily cron limit) because live results
 * are demand-driven, not cron-driven.
 */

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { supabase, getServiceClient } from "@/lib/db/supabase";
import { scrapeEciResults, scrapeEciPartyTally } from "@/lib/scrapers/eci-results";
import { ALLIANCE_COLORS } from "@/lib/constants";
import { CONSTITUENCIES } from "@/data/constituencies";
// Static fallback
import { RESULTS as STATIC_RESULTS, ALLIANCE_TALLY as STATIC_TALLY, ELECTION_STATS } from "@/data";

// ---- In-process cache (survives across requests in the same serverless instance) ----
interface CacheEntry { data: unknown; ts: number }
const cache = new Map<string, CacheEntry>();

function fromCache(key: string, ttlMs: number): unknown | null {
  const e = cache.get(key);
  if (!e) return null;
  if (Date.now() - e.ts > ttlMs) { cache.delete(key); return null; }
  return e.data;
}
function toCache(key: string, data: unknown) {
  cache.set(key, { data, ts: Date.now() });
}

// ---- Date helpers ----
const ELECTION_DATE = new Date(ELECTION_STATS.electionDate);
const RESULT_DATE   = new Date(ELECTION_STATS.resultDate);

function isElectionWindow(): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(ELECTION_DATE); start.setHours(0, 0, 0, 0);
  const end   = new Date(RESULT_DATE);   end.setDate(end.getDate() + 1); end.setHours(0, 0, 0, 0);
  return today >= start && today <= end;
}

// ---- Main handler ----

export async function GET(req: NextRequest) {
  const stateId = req.nextUrl.searchParams.get("state") || "kerala";
  const liveWindow = isElectionWindow();
  const LIVE_TTL_MS = 60_000;   // 60s cache on election day
  const IDLE_TTL_MS = 300_000;  // 5min cache off-season

  const cacheKey = `results:${stateId}`;

  // 1. Check in-process cache
  const cached = fromCache(cacheKey, liveWindow ? LIVE_TTL_MS : IDLE_TTL_MS);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=30" },
    });
  }

  // 2. On election day — scrape ECI directly
  if (liveWindow) {
    const eciUrl = process.env.ECI_RESULTS_URL;
    if (eciUrl) {
      try {
        const scraped = await scrapeAndPersist(stateId, eciUrl);
        toCache(cacheKey, scraped);
        return NextResponse.json(scraped, {
          headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=30" },
        });
      } catch (e) {
        console.warn("[/api/results] ECI scrape failed, falling through to DB:", (e as Error).message);
      }
    }
  }

  // 3. Try Supabase DB
  try {
    const [{ data: results, error: rErr }, { data: tally }, { data: stateRow }] = await Promise.all([
      supabase.from("results").select("*").eq("state_id", stateId).order("constituency_id"),
      supabase.from("alliance_tally").select("*").eq("state_id", stateId),
      supabase.from("states").select("*").eq("id", stateId).single(),
    ]);

    if (!rErr && results && results.length > 0) {
      const payload = {
        source: "db",
        lastUpdated: results[0]?.last_updated_at ?? new Date().toISOString(),
        results,
        allianceTally: tally ?? [],
        state: stateRow,
      };
      toCache(cacheKey, payload);
      return NextResponse.json(payload, {
        headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=60" },
      });
    }
  } catch (e) {
    console.warn("[/api/results] DB unavailable:", (e as Error).message);
  }

  // 4. Static demo fallback
  const payload = {
    source: "static",
    lastUpdated: new Date().toISOString(),
    results: STATIC_RESULTS,
    allianceTally: STATIC_TALLY,
    state: { id: stateId, ...ELECTION_STATS },
    notice: "Live data not yet available — showing demo data. Set ECI_RESULTS_URL and run npm run sync.",
  };
  toCache(cacheKey, payload);
  return NextResponse.json(payload, {
    headers: { "Cache-Control": "public, s-maxage=60" },
  });
}

// ---- Scrape ECI and write-through to Supabase ----

async function scrapeAndPersist(stateId: string, eciUrl: string) {
  const [reciResults] = await Promise.all([
    scrapeEciResults(eciUrl),
    scrapeEciPartyTally(eciUrl).catch(() => []),
  ]);

  if (reciResults.length === 0) throw new Error("ECI returned 0 results");

  // Write-through to Supabase asynchronously (don't block the response)
  persistToDb(stateId, reciResults).catch((e) =>
    console.warn("[/api/results] DB write-through failed:", e.message)
  );

  // Compute tally locally so we can return it immediately
  const tallyMap: Record<string, { won: number; leading: number }> = {};
  for (const r of reciResults) {
    const alliance = resolveAlliance(r.leadingParty);
    if (!tallyMap[alliance]) tallyMap[alliance] = { won: 0, leading: 0 };
    if (r.status === "Won")     tallyMap[alliance].won++;
    else if (r.status === "Leading") tallyMap[alliance].leading++;
  }

  const allianceTally = Object.entries(tallyMap).map(([alliance, counts]) => ({
    state_id: stateId,
    alliance,
    ...counts,
    color: ALLIANCE_COLORS[alliance] ?? "#6c757d",
    updated_at: new Date().toISOString(),
  }));

  const results = reciResults.map((r) => ({
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
    total_voters: resolveVoters(r.constituencyNumber),
    margin: r.margin,
    status: r.status,
    rounds_complete: r.roundsComplete,
    total_rounds: r.totalRounds,
    last_updated_at: new Date().toISOString(),
  }));

  return {
    source: "eci",
    lastUpdated: new Date().toISOString(),
    results,
    allianceTally,
  };
}

async function persistToDb(stateId: string, reciResults: Awaited<ReturnType<typeof scrapeEciResults>>) {
  const db = getServiceClient();
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
    total_voters: resolveVoters(r.constituencyNumber),
    margin: r.margin,
    status: r.status,
    rounds_complete: r.roundsComplete,
    total_rounds: r.totalRounds,
    last_updated_at: new Date().toISOString(),
  }));
  await db.from("results").upsert(rows, { onConflict: "state_id,constituency_id" });

  // Recompute alliance tally
  const tallyMap: Record<string, { won: number; leading: number }> = {};
  for (const r of reciResults) {
    const a = resolveAlliance(r.leadingParty);
    if (!tallyMap[a]) tallyMap[a] = { won: 0, leading: 0 };
    if (r.status === "Won") tallyMap[a].won++;
    else if (r.status === "Leading") tallyMap[a].leading++;
  }
  const tallyRows = Object.entries(tallyMap).map(([alliance, counts]) => ({
    state_id: stateId, alliance, ...counts,
    color: ALLIANCE_COLORS[alliance] ?? "#6c757d",
    updated_at: new Date().toISOString(),
  }));
  await db.from("alliance_tally").upsert(tallyRows, { onConflict: "state_id,alliance" });
}

function resolveDistrict(id: number): string {
  return CONSTITUENCIES.find((c) => c.id === id)?.district ?? "Unknown";
}
function resolveVoters(id: number): number {
  return CONSTITUENCIES.find((c) => c.id === id)?.voters ?? 0;
}

const PARTY_ALLIANCE: Record<string, string> = {
  "CPI(M)": "LDF", "CPIM": "LDF", "CPI": "LDF",
  "INC": "UDF", "IUML": "UDF", "KC(M)": "UDF",
  "BJP": "NDA", "BDJS": "NDA",
};
function resolveAlliance(party: string): string {
  if (!party) return "Others";
  const key = party.toUpperCase().trim();
  if (PARTY_ALLIANCE[key]) return PARTY_ALLIANCE[key];
  for (const [k, v] of Object.entries(PARTY_ALLIANCE)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return "Others";
}
