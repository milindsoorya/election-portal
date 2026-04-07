"use client";

import { useState, useMemo } from "react";
import { CANDIDATES, DISTRICTS } from "@/data";
import { cn, getAllianceBg, formatNumber } from "@/lib/utils";

const PARTIES = [...new Set(CANDIDATES.map((c) => c.partyAbbr))].sort();
const ALLIANCES = ["LDF", "UDF", "NDA", "Independent"];

export default function CandidatesPage() {
  const [search, setSearch] = useState("");
  const [filterParty, setFilterParty] = useState("All");
  const [filterAlliance, setFilterAlliance] = useState("All");
  const [filterDistrict, setFilterDistrict] = useState("All");
  const [filterGender, setFilterGender] = useState("All");
  const [sortBy, setSortBy] = useState<"name" | "assets" | "age" | "terms">("name");

  const filtered = useMemo(() => {
    return CANDIDATES.filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()) &&
        !c.constituencyName.toLowerCase().includes(search.toLowerCase()) &&
        !c.partyAbbr.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterParty !== "All" && c.partyAbbr !== filterParty) return false;
      if (filterAlliance !== "All" && c.alliance !== filterAlliance) return false;
      if (filterDistrict !== "All" && c.district !== filterDistrict) return false;
      if (filterGender !== "All" && c.gender !== filterGender) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === "assets") return b.assetsLakh - a.assetsLakh;
      if (sortBy === "age") return b.age - a.age;
      if (sortBy === "terms") return b.termsServed - a.termsServed;
      return a.name.localeCompare(b.name);
    });
  }, [search, filterParty, filterAlliance, filterDistrict, filterGender, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2">👤 Candidate Directory</h1>
        <p className="text-gray-500">
          Browse all candidates across Kerala's 140 constituencies. Data sourced from ECI affidavits via MyNeta/ADR.
        </p>
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <span className="text-sm text-gray-500">Showing <strong>{filtered.length}</strong> of {CANDIDATES.length} candidates</span>
          <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">
            ℹ️ Sample data — full dataset in production
          </span>
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
          <select
            value={filterAlliance}
            onChange={(e) => setFilterAlliance(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-kerala-green"
          >
            <option value="All">All Alliances</option>
            {ALLIANCES.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <select
            value={filterParty}
            onChange={(e) => setFilterParty(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-kerala-green"
          >
            <option value="All">All Parties</option>
            {PARTIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select
            value={filterDistrict}
            onChange={(e) => setFilterDistrict(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-kerala-green"
          >
            <option value="All">All Districts</option>
            {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-kerala-green"
          >
            <option value="name">Sort: Name</option>
            <option value="assets">Sort: Assets ↓</option>
            <option value="age">Sort: Age ↓</option>
            <option value="terms">Sort: Terms ↓</option>
          </select>
        </div>
        <div className="mt-3 flex gap-2">
          {["All", "Male", "Female"].map((g) => (
            <button
              key={g}
              onClick={() => setFilterGender(g)}
              className={cn(
                "text-xs px-3 py-1 rounded-full border transition-all",
                filterGender === g
                  ? "bg-kerala-green text-white border-kerala-green"
                  : "text-gray-600 border-gray-200 hover:border-kerala-green"
              )}
            >
              {g === "All" ? "All Genders" : g}
            </button>
          ))}
        </div>
      </div>

      {/* Candidates Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-medium">No candidates match your search</p>
          <button onClick={() => { setSearch(""); setFilterParty("All"); setFilterAlliance("All"); setFilterDistrict("All"); setFilterGender("All"); }} className="mt-3 text-kerala-green text-sm underline">
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-100 shadow-sm card-hover p-5">
              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #1a6b3a, #2d9d5c)" }}
                >
                  {c.imageInitials}
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
                      {c.alliance}
                    </span>
                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">{c.partyAbbr}</span>
                  </div>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <div className="text-xs text-gray-500">Age</div>
                  <div className="font-semibold text-gray-900 text-sm">{c.age} yrs</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5">
                  <div className="text-xs text-gray-500">Terms</div>
                  <div className="font-semibold text-gray-900 text-sm">{c.termsServed === 0 ? "First time" : `${c.termsServed}x MLA`}</div>
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

              {/* Education / Profession */}
              <div className="border-t border-gray-50 pt-3 space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>🎓</span><span>{c.education}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>💼</span><span>{c.profession}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Data note */}
      <div className="mt-8 text-xs text-gray-400 text-center">
        Candidate financial and criminal data sourced from official ECI affidavits via MyNeta/ADR. All figures in Indian Rupees.
        Data is as declared by candidates and has not been independently verified.
      </div>
    </div>
  );
}
