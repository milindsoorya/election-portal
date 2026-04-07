/**
 * GET /api/booth-finder?voterId=KL/08/001/000234&state=S21
 * GET /api/booth-finder?name=Rajesh&district=KNR&constituency=008&state=S21
 *
 * Proxies the ECI electoral search so we:
 *   1. Avoid CORS issues from the browser
 *   2. Cache results (same voter ID for same election = same booth)
 *   3. Rate-limit to respect ECI's servers
 *
 * Falls back to our local Supabase booth table if ECI is unreachable.
 */

import { NextRequest, NextResponse } from "next/server";
import { searchByVoterId, searchByName } from "@/lib/scrapers/voter-roll";
import { supabase } from "@/lib/db/supabase";
// Demo records for when ECI is unreachable
import { VOTER_RECORDS, POLLING_BOOTHS } from "@/data";

// Simple in-process cache to avoid re-hitting ECI for same queries
const cache = new Map<string, { result: unknown; ts: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function fromCache(key: string): unknown | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) { cache.delete(key); return null; }
  return entry.result;
}
function toCache(key: string, result: unknown) {
  cache.set(key, { result, ts: Date.now() });
}

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const voterId    = p.get("voterId")?.trim().toUpperCase() || "";
  const name       = p.get("name")?.trim() || "";
  const district   = p.get("district")?.trim() || "";
  const consCode   = p.get("constituency")?.trim() || "";
  const dob        = p.get("dob")?.trim() || "";
  const stateCode  = p.get("state") || "S21"; // Kerala = S21

  if (!voterId && !name) {
    return NextResponse.json({ error: "Provide voterId or name" }, { status: 400 });
  }

  const cacheKey = voterId ? `epic:${voterId}` : `name:${name}:${district}:${consCode}`;

  // Check cache
  const cached = fromCache(cacheKey);
  if (cached) {
    return NextResponse.json({ source: "cache", ...cached as object });
  }

  // 1. Try ECI electoral search
  try {
    if (voterId) {
      const result = await searchByVoterId(voterId, stateCode);
      if (result) {
        toCache(cacheKey, { voter: result });
        return NextResponse.json({ source: "eci", voter: result });
      }
    } else if (name && district && consCode) {
      const results = await searchByName({ name, districtCode: district, constituencyCode: consCode, dob, stateCode });
      if (results.length > 0) {
        toCache(cacheKey, { voters: results });
        return NextResponse.json({ source: "eci", voters: results });
      }
    }
  } catch (e) {
    console.warn("[booth-finder] ECI search failed:", (e as Error).message);
  }

  // 2. Try Supabase booth table (for booth details lookup by booth ID)
  if (voterId) {
    try {
      const { data: booth } = await supabase
        .from("polling_booths")
        .select("*")
        .eq("state_id", "kerala")
        .limit(1)
        .single();

      if (booth) {
        return NextResponse.json({ source: "db", booth, notice: "ECI search unavailable — partial result from DB" });
      }
    } catch { /* ignore */ }
  }

  // 3. Static demo fallback
  if (voterId) {
    const voter = VOTER_RECORDS.find((v) =>
      v.voterId.replace(/\s/g, "") === voterId.replace(/\s/g, "")
    );
    if (voter) {
      const booth = POLLING_BOOTHS.find((b) => b.boothId === voter.boothId);
      toCache(cacheKey, { voter, booth, source: "demo" });
      return NextResponse.json({
        source: "demo",
        voter,
        booth,
        notice: "ECI search unavailable — showing demo data",
      });
    }
  }

  if (name) {
    const voter = VOTER_RECORDS.find((v) => v.name.toLowerCase().includes(name.toLowerCase()));
    if (voter) {
      const booth = POLLING_BOOTHS.find((b) => b.boothId === voter.boothId);
      return NextResponse.json({ source: "demo", voter, booth, notice: "Demo data" });
    }
  }

  return NextResponse.json({ source: "not_found", message: "Voter not found" }, { status: 404 });
}
