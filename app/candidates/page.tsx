"use client";

import { useState, useEffect, useCallback } from "react";
import { DISTRICTS } from "@/data";
import { cn, getAllianceBg } from "@/lib/utils";

const PARTIES   = ["INC", "CPI(M)", "BJP", "CPI", "IUML", "KC(M)", "BDJS"];
const ALLIANCES = ["LDF", "UDF", "NDA"];

interface Candidate {
  id: string;
  name: string;
  party_abbr?: string;
  partyAbbr?: string;
  alliance?: string;
  constituency_name?: string;
  constituencyName?: string;
  district?: string;
  age?: number | null;
  gender?: string | null;
  education?: string | null;
  profession?: string | null;
  assets_lakh?: number;
  assetsLakh?: number;
  liabilities_lakh?: number;
  liabilitiesLakh?: number;
  criminal_cases?: number;
  criminalCases?: number;
  terms_served?: number;
  termsServed?: number;
  is_incumbent?: boolean;
  isIncumbent?: boolean;
  imageInitials?: string;
}

// Normalise DB row or static record to a consistent shape
function normalise(c: Candidate) {
  return {
    id: c.id,
    name: c.name,
    partyAbbr:        c.party_abbr     ?? c.partyAbbr        ?? "",
    alliance:         c.alliance       ?? "",
    constituencyName: c.constituency_name ?? c.constituencyName ?? "",
    district:         c.district       ?? "",
    age:              c.age            ?? null,
    gender:           c.gender         ?? null,
    education:        c.education      ?? null,
    profession:       c.profession     ?? null,
    assetsLakh:       c.assets_lakh    ?? c.assetsLakh        ?? 0,
    liabilitiesLakh:  c.liabilities_lakh ?? c.liabilitiesLakh ?? 0,
    criminalCases:    c.criminal_cases ?? c.criminalCases     ?? 0,
    termsServed:      c.terms_served   ?? c.termsServed       ?? 0,
    isIncumbent:      c.is_incumbent   ?? c.isIncumbent       ?? false,
    initials:         c.imageInitials  ?? c.name.split(" ").map((w) => w[0]).slice(0, 2).join(""),
  };
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<ReturnType<typeof normalise>[]>([]);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [source,     setSource]     = useState("static");
  const [notice,     setNotice]     = useState<string | null>(null);

  const [search,         setSearch]         = useState("");
  const [filterParty,    setFilterParty]    = useState("All");
  const [filterAlliance, setFilterAlliance] = useState("All");
  const [filterDistrict, setFilterDistrict] = useState("All");
  const [filterGender,   setFilterGender]   = useState("All");
  const [sortBy,         setSortBy]         = useState("name");

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ state: "kerala", sort: sortBy, limit: "200" });
    if (search)         params.set("q",         search);
    if (filterParty    !== "All") params.set("party",    filterParty);
    if (filterAlliance !== "All") params.set("alliance", filterAlliance);
    if (filterDistrict !== "All") params.set("district", filterDistrict);

    try {
      const res  = await fetch(`/api/candidates?${params}`);
      const json = await res.json();
      let data: Candidate[] = json.candidates || [];

      // Client-side gender filter (not in API)
      if (filterGender !== "All") {
        data = data.filter((c) => (c.gender ?? "").toLowerCase().startsWith(filterGender.toLowerCase()));
      }

      setCandidates(data.map(normalise));
      setTotal(json.total || data.length);
      setSource(json.source || "static");
      setNotice(json.notice || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, filterParty, filterAlliance, filterDistrict, filterGender, sortBy]);

  useEffect(() => {
    const id = setTimeout(fetchCandidates, 300); // debounce search input
    return () => clearTimeout(id);
  }, [fetchCandidates]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2">👤 Candidate Directory</h1>
        <p className="text-gray-500">
          Browse all candidates across Kerala's 140 constituencies. Data sourced from ECI affidavits via MyNeta/ADR.
        </p>
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <span className="text-sm text-gray-500">
            Showing <strong>{candidates.length}</strong>
            {total > candidates.length ? ` of ${total}` : ""} candidates
          </span>
          {notice && (
            <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">
              ℹ️ {notice}
            </span>
          )}
          {source === "db" && (
            <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded">
              ✓ Live data
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <input
            type="text"
            placeholder="Search name, constituency..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="md:col-span-2 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-kerala-green"
          />
          <select value={filterAlliance} onChange={(e) => setFilterAlliance(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-kerala-green">
            <option value="All">All Alliances</option>
            {ALLIANCES.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <select value={filterParty} onChange={(e) => setFilterParty(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-kerala-green">
            <option value="All">All Parties</option>
            {PARTIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-kerala-green">
            <option value="All">All Districts</option>
            {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-kerala-green">
            <option value="name">Sort: Name</option>
            <option value="assets">Sort: Assets ↓</option>
            <option value="age">Sort: Age ↓</option>
            <option value="terms">Sort: Terms ↓</option>
          </select>
        </div>
        <div className="mt-3 flex gap-2">
          {["All", "Male", "Female"].map((g) => (
            <button key={g} onClick={() => setFilterGender(g)}
              className={cn("text-xs px-3 py-1 rounded-full border transition-all",
                filterGender === g ? "bg-kerala-green text-white border-kerala-green" : "text-gray-600 border-gray-200 hover:border-kerala-green")}>
              {g === "All" ? "All Genders" : g}
            </button>
          ))}
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 h-52 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && candidates.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-medium">No candidates match your search</p>
          <button onClick={() => { setSearch(""); setFilterParty("All"); setFilterAlliance("All"); setFilterDistrict("All"); setFilterGender("All"); }}
            className="mt-3 text-kerala-green text-sm underline">Clear all filters</button>
        </div>
      )}

      {/* Candidates Grid */}
      {!loading && candidates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {candidates.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-100 shadow-sm card-hover p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #1a6b3a, #2d9d5c)" }}>
                  {c.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900 text-sm">{c.name}</h3>
                    {c.isIncumbent && (
                      <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded font-medium">Incumbent</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{c.constituencyName} · {c.district}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", getAllianceBg(c.alliance))}>
                      {c.alliance || "Ind"}
                    </span>
                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">{c.partyAbbr}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <div className="text-xs text-gray-500">Age</div>
                  <div className="font-semibold text-gray-900 text-sm">{c.age ? `${c.age} yrs` : "—"}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <div className="text-xs text-gray-500">Terms</div>
                  <div className="font-semibold text-gray-900 text-sm">
                    {c.termsServed === 0 ? "First time" : `${c.termsServed}x MLA`}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <div className="text-xs text-gray-500">Assets</div>
                  <div className="font-semibold text-gray-900 text-sm">₹{c.assetsLakh}L</div>
                </div>
                <div className={cn("rounded-lg p-2.5", c.criminalCases > 0 ? "bg-red-50" : "bg-gray-50")}>
                  <div className="text-xs text-gray-500">Criminal Cases</div>
                  <div className={cn("font-semibold text-sm", c.criminalCases > 0 ? "text-red-600" : "text-gray-900")}>
                    {c.criminalCases === 0 ? "None" : `${c.criminalCases} case${c.criminalCases > 1 ? "s" : ""}`}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-50 pt-3 space-y-1">
                {c.education  && <div className="flex items-center gap-2 text-xs text-gray-600"><span>🎓</span><span>{c.education}</span></div>}
                {c.profession && <div className="flex items-center gap-2 text-xs text-gray-600"><span>💼</span><span>{c.profession}</span></div>}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-xs text-gray-400 text-center">
        {source === "db"
          ? "Data synced from ECI affidavits via MyNeta/ADR. "
          : "Demo candidates shown — run npm run sync:candidates to load full dataset. "}
        All figures declared by candidates; not independently verified.
      </div>
    </div>
  );
}
