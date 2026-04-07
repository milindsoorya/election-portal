"use client";

import { useState } from "react";
import { POLLING_BOOTHS, VOTER_RECORDS } from "@/data";

type SearchMode = "voter-id" | "name";

export default function BoothFinderPage() {
  const [mode, setMode] = useState<SearchMode>("voter-id");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<typeof VOTER_RECORDS[0] | null>(null);
  const [booth, setBooth] = useState<typeof POLLING_BOOTHS[0] | null>(null);
  const [searched, setSearched] = useState(false);
  const [notFound, setNotFound] = useState(false);

  function handleSearch() {
    if (!query.trim()) return;
    setSearched(true);
    setNotFound(false);
    setResult(null);
    setBooth(null);

    let voter = null;
    if (mode === "voter-id") {
      voter = VOTER_RECORDS.find((v) =>
        v.voterId.toLowerCase().replace(/\s/g, "") === query.toLowerCase().replace(/\s/g, "")
      );
    } else {
      voter = VOTER_RECORDS.find((v) =>
        v.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (voter) {
      const b = POLLING_BOOTHS.find((b) => b.boothId === voter!.boothId);
      setResult(voter);
      setBooth(b || null);
    } else {
      setNotFound(true);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2">📍 Polling Booth Finder</h1>
        <p className="text-gray-500">
          Find your assigned polling booth using your Voter ID (EPIC) or name.
          Booths are open from 7:00 AM to 6:00 PM on election day.
        </p>
      </div>

      {/* Search Mode Toggle */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex gap-2 mb-4">
          {[
            { value: "voter-id" as SearchMode, label: "🪪 Search by Voter ID (EPIC)" },
            { value: "name" as SearchMode, label: "👤 Search by Name" },
          ].map((m) => (
            <button
              key={m.value}
              onClick={() => { setMode(m.value); setQuery(""); setSearched(false); setResult(null); setBooth(null); setNotFound(false); }}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                mode === m.value
                  ? "bg-kerala-green text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
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
            placeholder={
              mode === "voter-id"
                ? "e.g. KL/08/001/000234"
                : "Enter your name as on voter roll"
            }
            className="flex-1 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-kerala-green"
          />
          <button
            onClick={handleSearch}
            className="bg-kerala-green hover:bg-kerala-dark text-white font-semibold px-6 py-3 rounded-lg transition-all"
          >
            Search
          </button>
        </div>

        {mode === "voter-id" && (
          <p className="text-xs text-gray-400 mt-2">
            Try demo: <button onClick={() => setQuery("KL/08/001/000234")} className="text-kerala-green underline">KL/08/001/000234</button>{" "}
            or{" "}
            <button onClick={() => setQuery("KL/16/001/001123")} className="text-kerala-green underline">KL/16/001/001123</button>
          </p>
        )}
        {mode === "name" && (
          <p className="text-xs text-gray-400 mt-2">
            Try demo: <button onClick={() => setQuery("Rajesh")} className="text-kerala-green underline">Rajesh</button>{" "}
            or{" "}
            <button onClick={() => setQuery("Anitha")} className="text-kerala-green underline">Anitha</button>
          </p>
        )}
      </div>

      {/* Results */}
      {searched && notFound && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="font-bold text-amber-800 mb-2">Voter Record Not Found</h3>
          <p className="text-amber-700 text-sm">
            No voter found matching your search. Please check your{" "}
            {mode === "voter-id" ? "Voter ID number" : "name spelling"} and try again.
          </p>
          <div className="mt-4 text-sm text-amber-700">
            <p className="font-medium mb-2">If you are registered but not found here:</p>
            <ul className="text-left space-y-1 list-disc list-inside text-xs">
              <li>Check your name on the official electoral roll at <strong>electoralsearch.eci.gov.in</strong></li>
              <li>Call the CEO Kerala helpline: <strong>0471-2726999</strong></li>
              <li>Call the ECI national helpline: <strong>1950</strong></li>
            </ul>
          </div>
        </div>
      )}

      {searched && result && booth && (
        <div className="space-y-4 animate-fade-in">
          {/* Voter Card */}
          <div className="bg-white rounded-xl border-2 border-kerala-green shadow-sm overflow-hidden">
            <div className="gradient-kerala text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🪪</span>
                <span className="font-bold">Voter Details Found</span>
              </div>
              <span className="text-green-200 text-xs">Electoral Roll 2026</span>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Full Name</p>
                  <p className="font-bold text-gray-900">{result.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Voter ID (EPIC)</p>
                  <p className="font-mono font-bold text-gray-900 text-sm">{result.voterId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Father / Husband Name</p>
                  <p className="text-gray-700 text-sm">{result.fatherHusbandName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Age / Gender</p>
                  <p className="text-gray-700 text-sm">{result.age} years / {result.gender}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 mb-0.5">Address</p>
                  <p className="text-gray-700 text-sm">{result.address}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Serial No. in Voter List</p>
                  <p className="font-semibold text-gray-900">{result.serialNumber}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Booth Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-kerala-saffron text-white px-5 py-3 flex items-center gap-2">
              <span className="text-xl">📍</span>
              <span className="font-bold">Your Polling Booth</span>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                <div>
                  <h3 className="font-black text-gray-900 text-lg">{booth.boothName}</h3>
                  <p className="text-gray-600 text-sm mt-1">{booth.address}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Booth Number</div>
                  <div className="text-2xl font-black text-kerala-green">#{booth.boothNumber}</div>
                </div>
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
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500 mb-1">Constituency</div>
                  <div className="font-semibold text-gray-900 text-sm">{booth.constituencyName}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500 mb-1">Total Voters</div>
                  <div className="font-bold text-gray-900">{booth.totalVoters.toLocaleString()}</div>
                </div>
              </div>

              {/* Accessibility */}
              <div className="bg-blue-50 rounded-lg p-3">
                <h4 className="text-xs font-semibold text-blue-700 mb-2">♿ Accessibility Features</h4>
                <div className="flex gap-3 flex-wrap text-xs">
                  <span className={`flex items-center gap-1 ${booth.accessible ? "text-green-700" : "text-gray-400"}`}>
                    {booth.accessible ? "✅" : "❌"} Wheelchair accessible
                  </span>
                  <span className={`flex items-center gap-1 ${booth.hasRamp ? "text-green-700" : "text-gray-400"}`}>
                    {booth.hasRamp ? "✅" : "❌"} Ramp available
                  </span>
                  <span className={`flex items-center gap-1 ${booth.hasHelperCabins ? "text-green-700" : "text-gray-400"}`}>
                    {booth.hasHelperCabins ? "✅" : "❌"} Helper cabin
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Reminder */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h4 className="font-semibold text-amber-800 mb-2">📋 What to bring on election day</h4>
            <div className="grid grid-cols-2 gap-1 text-xs text-amber-700">
              {[
                "Voter ID Card (EPIC) — primary",
                "Aadhaar Card (with photo)",
                "Passport",
                "Driving Licence",
                "MGNREGA Job Card",
                "Ration Card with photo",
              ].map((id) => (
                <div key={id} className="flex items-center gap-1.5">
                  <span>✓</span>{id}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* General Booth Info */}
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
