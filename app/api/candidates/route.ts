/**
 * GET /api/candidates?state=kerala&constituency=&party=&alliance=&district=&q=&page=1&limit=50
 *
 * Returns candidate data from Supabase with full filtering.
 * Falls back to static data if DB is not populated.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";
import { CANDIDATES as STATIC_CANDIDATES } from "@/data";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const stateId   = p.get("state")        || "kerala";
  const q         = p.get("q")            || "";
  const party     = p.get("party")        || "";
  const alliance  = p.get("alliance")     || "";
  const district  = p.get("district")     || "";
  const consId    = p.get("constituency") || "";
  const page      = Math.max(1, parseInt(p.get("page") || "1"));
  const limit     = Math.min(100, parseInt(p.get("limit") || "50"));
  const offset    = (page - 1) * limit;
  const sortBy    = p.get("sort") || "name";

  try {
    let query = supabase
      .from("candidates")
      .select("*", { count: "exact" })
      .eq("state_id", stateId);

    if (q)        query = query.or(`name.ilike.%${q}%,constituency_name.ilike.%${q}%,party_abbr.ilike.%${q}%`);
    if (party)    query = query.eq("party_abbr", party);
    if (alliance) query = query.eq("alliance", alliance);
    if (district) query = query.eq("district", district);
    if (consId)   query = query.eq("constituency_id", parseInt(consId));

    // Sorting
    if (sortBy === "assets")  query = query.order("assets_lakh", { ascending: false });
    else if (sortBy === "age") query = query.order("age", { ascending: false });
    else if (sortBy === "terms") query = query.order("terms_served", { ascending: false });
    else query = query.order("name", { ascending: true });

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (!error && data && data.length > 0) {
      return NextResponse.json(
        {
          source: "db",
          total: count || 0,
          page,
          limit,
          candidates: data,
        },
        {
          headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
        }
      );
    }

    // Fallback to static data with client-side filtering
    let filtered = STATIC_CANDIDATES.filter((c) => {
      if (q && !c.name.toLowerCase().includes(q.toLowerCase()) &&
               !c.constituencyName.toLowerCase().includes(q.toLowerCase()) &&
               !c.partyAbbr.toLowerCase().includes(q.toLowerCase())) return false;
      if (party    && c.partyAbbr !== party)    return false;
      if (alliance && c.alliance  !== alliance)  return false;
      if (district && c.district  !== district)  return false;
      if (consId   && c.constituencyId !== parseInt(consId)) return false;
      return true;
    });

    if (sortBy === "assets")  filtered.sort((a, b) => b.assetsLakh - a.assetsLakh);
    else if (sortBy === "age") filtered.sort((a, b) => b.age - a.age);
    else if (sortBy === "terms") filtered.sort((a, b) => b.termsServed - a.termsServed);
    else filtered.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json(
      {
        source: "static",
        total: filtered.length,
        page: 1,
        limit: filtered.length,
        candidates: filtered,
        notice: "Showing demo candidates — run npm run sync:candidates to load full dataset.",
      },
      {
        headers: { "Cache-Control": "public, s-maxage=60" },
      }
    );
  } catch (e) {
    console.error("[/api/candidates]", e);
    return NextResponse.json(
      { source: "static", total: STATIC_CANDIDATES.length, page: 1, limit: STATIC_CANDIDATES.length, candidates: STATIC_CANDIDATES },
      { status: 200 }
    );
  }
}
