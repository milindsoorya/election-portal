"use client";

import { useState } from "react";

type SearchMode = "voter-id" | "name";

interface VoterResult {
  voterId?: string;
  name?: string;
  fatherHusbandName?: string;
  age?: number;
  gender?: string;
  address?: string;
  serialNumber?: number;
  boothId?: string;
  boothName?: string;
  boothAddress?: string;
  constituencyName?: string;
  district?: string;
}

interface BoothResult {
  boothId?: string;
  id?: string;
  boothName?: string;
  booth_name?: string;
  address?: string;
  boothNumber?: number;
  booth_number?: number;
  constituencyName?: string;
  constituency_name?: string;
  district?: string;
  totalVoters?: number;
  total_voters?: number;
  openTime?: string;
  open_time?: string;
  closeTime?: string;
  close_time?: string;
  isAccessible?: boolean;
  is_accessible?: boolean;
  hasRamp?: boolean;
  has_ramp?: boolean;
  hasHelperCabins?: boolean;
  has_helper_cabin?: boolean;
}

interface ApiResponse {
  source: string;
  voter?: VoterResult;
  voters?: VoterResult[];
  booth?: BoothResult;
  message?: string;
  notice?: string;
}

function normaliseBooth(b: BoothResult) {
  return {
    id: b.boothId || b.id || "",
    name: b.boothName || b.booth_name || "",
    address: b.address || "",
    number: b.boothNumber ?? b.booth_number ?? 0,
    constituency: b.constituencyName || b.constituency_name || "",
    district: b.district || "",
    totalVoters: b.totalVoters ?? b.total_voters ?? 0,
    openTime: b.openTime || b.open_time || "07:00",
    closeTime: b.closeTime || b.close_time || "18:00",
    accessible: b.isAccessible ?? b.is_accessible ?? false,
    ramp: b.hasRamp ?? b.has_ramp ?? false,
    helper: b.hasHelperCabins ?? b.has_helper_cabin ?? false,
  };
}

export default function BoothFinderPage() {
  const [mode,     setMode]     = useState<SearchMode>("voter-id");
  const [query,    setQuery]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    setResponse(null);

    const params = new URLSearchParams({ state: "S21" });
    if (mode === "voter-id") params.set("voterId", query.trim());
    else params.set("name", query.trim());

    try {
      const res = await fetch(`/api/booth-finder?${params}`);
      const json: ApiResponse = await res.json();
      setResponse(json);
    } catch (e) {
      setResponse({ source: "error", message: "Could not reach the server. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  const voter = response?.voter;
  const booth = response?.booth ? normaliseBooth(response.booth) :
                (voter?.boothName ? normaliseBooth({
                  boothId: voter.boothId,
                  boothName: voter.boothName,
                  address: voter.boothAddress,
                  constituencyName: voter.constituencyName,
                  district: voter.district,
                }) : null);

  const notFound = response?.source === "not_found" || (searched && !loading && !voter && !booth);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2">📍 Polling Booth Finder</h1>
        <p className="text-gray-500">
          Find your assigned polling booth using your Voter ID (EPIC) or name.
          Booth data is fetched live from the ECI electoral search.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex gap-2 mb-4">
          {([
            { value: "voter-id" as SearchMode, label: "🪪 Voter ID (EPIC)" },
            { value: "name" as SearchMode,     label: "👤 Name" },
          ]).map((m) => (
            <button key={m.value} onClick={() => { setMode(m.value); setQuery(""); setResponse(null); setSearched(false); }}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                mode === m.value ? "bg-kerala-green text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder={mode === "voter-id" ? "e.g. KL/08/001/000234" : "Enter your name as on voter roll"}
            className="flex-1 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-kerala-green"
          />
          <button onClick={handleSearch} disabled={loading}
            className="bg-kerala-green hover:bg-kerala-dark disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-lg transition-all">
            {loading ? "Searching…" : "Search"}
          </button>
        </div>

        {mode === "voter-id" && (
          <p className="text-xs text-gray-400 mt-2">
            Try: {["KL/08/001/000234", "KL/16/001/001123", "KL/05/001/000891"].map((id) => (
              <button key={id} onClick={() => setQuery(id)} className="text-kerala-green underline mx-1">{id}</button>
            ))}
          </p>
        )}
      </div>

      {/* Source badge */}
      {response && response.source && response.source !== "not_found" && (
        <div className={`text-xs px-3 py-1.5 rounded-lg mb-4 flex items-center gap-2 border ${
          response.source === "eci"   ? "bg-green-50 text-green-700 border-green-200" :
          response.source === "db"    ? "bg-blue-50 text-blue-700 border-blue-200" :
          response.source === "cache" ? "bg-purple-50 text-purple-700 border-purple-200" :
          "bg-amber-50 text-amber-700 border-amber-200"}`}>
          <span>{response.source === "eci" ? "✓ Live ECI data" :
                 response.source === "db"    ? "✓ Database" :
                 response.source === "cache" ? "✓ Cached" : "ℹ️ Demo data"}</span>
          {response.notice && <span>— {response.notice}</span>}
        </div>
      )}

      {/* Not Found */}
      {notFound && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="font-bold text-amber-800 mb-2">Voter Record Not Found</h3>
          <p className="text-amber-700 text-sm mb-4">
            No voter found matching your search. Please check your {mode === "voter-id" ? "Voter ID number" : "name spelling"} and try again.
          </p>
          <ul className="text-left text-xs text-amber-700 space-y-1 list-disc list-inside max-w-sm mx-auto">
            <li>Verify your details at <strong>electoralsearch.eci.gov.in</strong></li>
            <li>Call CEO Kerala: <strong>0471-2726999</strong></li>
            <li>Call ECI Helpline: <strong>1950</strong></li>
          </ul>
        </div>
      )}

      {/* Result */}
      {voter && (
        <div className="space-y-4 animate-fade-in">
          {/* Voter Card */}
          <div className="bg-white rounded-xl border-2 border-kerala-green shadow-sm overflow-hidden">
            <div className="gradient-kerala text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2"><span className="text-xl">🪪</span><span className="font-bold">Voter Details</span></div>
              <span className="text-green-200 text-xs">Electoral Roll 2026</span>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              <div><p className="text-xs text-gray-500 mb-0.5">Full Name</p><p className="font-bold text-gray-900">{voter.name}</p></div>
              <div><p className="text-xs text-gray-500 mb-0.5">Voter ID (EPIC)</p><p className="font-mono font-bold text-gray-900 text-sm">{voter.voterId}</p></div>
              <div><p className="text-xs text-gray-500 mb-0.5">Father / Husband</p><p className="text-gray-700 text-sm">{voter.fatherHusbandName}</p></div>
              <div><p className="text-xs text-gray-500 mb-0.5">Age / Gender</p><p className="text-gray-700 text-sm">{voter.age} yrs / {voter.gender}</p></div>
              <div className="col-span-2"><p className="text-xs text-gray-500 mb-0.5">Address</p><p className="text-gray-700 text-sm">{voter.address}</p></div>
              {voter.serialNumber && (
                <div><p className="text-xs text-gray-500 mb-0.5">Serial No.</p><p className="font-semibold text-gray-900">{voter.serialNumber}</p></div>
              )}
            </div>
          </div>

          {/* Booth Card */}
          {booth && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-kerala-saffron text-white px-5 py-3 flex items-center gap-2">
                <span className="text-xl">📍</span><span className="font-bold">Your Polling Booth</span>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                  <div>
                    <h3 className="font-black text-gray-900 text-lg">{booth.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{booth.address}</p>
                  </div>
                  {booth.number > 0 && (
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Booth No.</div>
                      <div className="text-2xl font-black text-kerala-green">#{booth.number}</div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500 mb-1">Opens</div>
                    <div className="font-bold text-green-700">🕖 {booth.openTime} AM</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500 mb-1">Closes</div>
                    <div className="font-bold text-red-700">🕕 {booth.closeTime} PM</div>
                  </div>
                  {booth.constituency && (
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-500 mb-1">Constituency</div>
                      <div className="font-semibold text-gray-900 text-sm">{booth.constituency}</div>
                    </div>
                  )}
                  {booth.totalVoters > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-500 mb-1">Total Voters</div>
                      <div className="font-bold text-gray-900">{booth.totalVoters.toLocaleString()}</div>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-blue-700 mb-2">♿ Accessibility</h4>
                  <div className="flex gap-3 flex-wrap text-xs">
                    {[
                      { ok: booth.accessible, label: "Wheelchair accessible" },
                      { ok: booth.ramp,       label: "Ramp available" },
                      { ok: booth.helper,     label: "Helper cabin" },
                    ].map(({ ok, label }) => (
                      <span key={label} className={`flex items-center gap-1 ${ok ? "text-green-700" : "text-gray-400"}`}>
                        {ok ? "✅" : "❌"} {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* What to bring */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h4 className="font-semibold text-amber-800 mb-2">📋 What to bring</h4>
            <div className="grid grid-cols-2 gap-1 text-xs text-amber-700">
              {["Voter ID Card (EPIC) — primary", "Aadhaar Card", "Passport", "Driving Licence", "MGNREGA Job Card", "Ration Card with photo"].map((id) => (
                <div key={id} className="flex items-center gap-1.5"><span>✓</span>{id}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Info cards when idle */}
      {!searched && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: "🕖", title: "Opens at 7:00 AM", desc: "All polling stations open at 7 AM sharp" },
            { icon: "🕕", title: "Closes at 6:00 PM", desc: "Voters in queue at 6 PM are allowed to vote" },
            { icon: "♿", title: "Accessibility", desc: "PWD voters get priority access at all booths" },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="font-semibold text-gray-900 text-sm">{item.title}</div>
              <div className="text-gray-500 text-xs mt-1">{item.desc}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
