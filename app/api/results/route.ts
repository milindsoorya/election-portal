/**
 * GET /api/results?state=kerala
 *
 * Returns live results for the requested state from Supabase.
 * Falls back to ECI scrape if DB is empty.
 *
 * Cache-Control: revalidate every 60s on election day, 5min otherwise.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";
import type { ResultRow, AllianceTallyRow } from "@/lib/db/supabase";
// Static fallback when DB is not yet set up
import { RESULTS as STATIC_RESULTS, ALLIANCE_TALLY as STATIC_TALLY, ELECTION_STATS } from "@/data";

const ELECTION_DATE = new Date(ELECTION_STATS.electionDate);

function isElectionDay(): boolean {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const electionDay = new Date(ELECTION_DATE.getFullYear(), ELECTION_DATE.getMonth(), ELECTION_DATE.getDate());
  const dayAfter = new Date(electionDay);
  dayAfter.setDate(dayAfter.getDate() + 2); // results day + 1
  return today >= electionDay && today <= dayAfter;
}

export async function GET(req: NextRequest) {
  const stateId = req.nextUrl.searchParams.get("state") || "kerala";
  const cacheSeconds = isElectionDay() ? 60 : 300;

  try {
    // Try Supabase first
    const { data: results, error: rErr } = await supabase
      .from("results")
      .select("*")
      .eq("state_id", stateId)
      .order("constituency_id", { ascending: true });

    const { data: tally, error: tErr } = await supabase
      .from("alliance_tally")
      .select("*")
      .eq("state_id", stateId);

    const { data: stateRow } = await supabase
      .from("states")
      .select("*")
      .eq("id", stateId)
      .single();

    // If DB has data, return it
    if (!rErr && results && results.length > 0) {
      return NextResponse.json(
        {
          source: "db",
          lastUpdated: results[0]?.last_updated_at || new Date().toISOString(),
          results: results as ResultRow[],
          allianceTally: (tally as AllianceTallyRow[]) || [],
          state: stateRow,
        },
        {
          headers: {
            "Cache-Control": `public, s-maxage=${cacheSeconds}, stale-while-revalidate=30`,
          },
        }
      );
    }

    // DB empty — return static fallback with a flag
    return NextResponse.json(
      {
        source: "static",
        lastUpdated: new Date().toISOString(),
        results: STATIC_RESULTS,
        allianceTally: STATIC_TALLY,
        state: { id: stateId, election_date: ELECTION_STATS.electionDate, ...ELECTION_STATS },
        notice: "Live data not yet available — showing demo data. Run npm run sync to populate.",
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
        },
      }
    );
  } catch (e) {
    console.error("[/api/results]", e);
    // Always return something usable
    return NextResponse.json(
      {
        source: "static",
        results: STATIC_RESULTS,
        allianceTally: STATIC_TALLY,
        error: "Database unavailable — showing cached data",
      },
      { status: 200 }
    );
  }
}
