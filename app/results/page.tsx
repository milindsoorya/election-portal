"use client";

import { useState } from "react";
import { RESULTS, ALLIANCE_TALLY, ELECTION_STATS, DISTRICTS } from "@/data";
import { cn, getAllianceColor } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  Won: "bg-green-100 text-green-700 border-green-200",
  Leading: "bg-blue-100 text-blue-700 border-blue-200",
  Counting: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Pending: "bg-gray-100 text-gray-500 border-gray-200",
};

const TOTAL = 140;
const MAJORITY = 71;

export default function ResultsPage() {
  const [filterAlliance, setFilterAlliance] = useState("All");
  const [filterDistrict, setFilterDistrict] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const filtered = RESULTS.filter((r) => {
    if (filterAlliance !== "All" && r.leadingAlliance !== filterAlliance) return false;
    if (filterDistrict !== "All" && r.district !== filterDistrict) return false;
    if (filterStatus !== "All" && r.status !== filterStatus) return false;
    return true;
  });

  const leadingAlliance = ALLIANCE_TALLY.reduce((a, b) =>
    (a.won + a.leading) > (b.won + b.leading) ? a : b
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-black text-gray-900">📊 Live Results</h1>
            <span className="flex items-center gap-1.5 bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full border border-red-200">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse inline-block"></span>
              Counting Live
            </span>
          </div>
          <p className="text-gray-500 text-sm">
            Kerala Assembly Election 2026 — Real-time counting results.
            Last updated: 25 April 2026, 2:45 PM
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 mb-1">Seats Declared</div>
          <div className="text-3xl font-black text-gray-900">
            {ELECTION_STATS.seatsReported}
            <span className="text-gray-400 text-lg font-normal"> / {TOTAL}</span>
          </div>
        </div>
      </div>

      {/* Alliance Tally Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {ALLIANCE_TALLY.map((a) => {
          const total = a.won + a.leading;
          const toMajority = Math.max(0, MAJORITY - total);
          const isLeading = a.alliance === leadingAlliance.alliance;
          return (
            <div
              key={a.alliance}
              className={cn(
                "bg-white rounded-xl border-2 shadow-sm p-4",
                isLeading ? "border-current shadow-md" : "border-gray-100"
              )}
              style={isLeading ? { borderColor: a.color } : {}}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: a.color }}></div>
                  <span className="font-bold text-gray-900">{a.alliance}</span>
                </div>
                {isLeading && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">Leading</span>}
              </div>
              <div className="text-4xl font-black" style={{ color: a.color }}>{total}</div>
              <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                <div>Won: <strong className="text-gray-700">{a.won}</strong> · Leading: <strong className="text-gray-700">{a.leading}</strong></div>
                {toMajority > 0 ? (
                  <div className="text-gray-400">Need {toMajority} more for majority</div>
                ) : (
                  <div className="text-green-600 font-medium">✓ Majority reached!</div>
                )}
              </div>
              {/* Mini progress */}
              <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (total / MAJORITY) * 100)}%`, backgroundColor: a.color }}
                ></div>
              </div>
              <div className="text-xs text-gray-400 mt-1">{Math.round((total / MAJORITY) * 100)}% of majority</div>
            </div>
          );
        })}
      </div>

      {/* Visual bar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Seat Distribution</h3>
          <span className="text-xs text-gray-500">Majority: {MAJORITY} seats</span>
        </div>
        <div className="relative h-10 rounded-lg overflow-hidden flex">
          {ALLIANCE_TALLY.map((a) => {
            const width = ((a.won + a.leading) / TOTAL) * 100;
            return (
              <div
                key={a.alliance}
                className="flex items-center justify-center text-white text-sm font-bold"
                style={{ width: `${width}%`, backgroundColor: a.color }}
                title={`${a.alliance}: ${a.won + a.leading} seats`}
              >
                {width > 6 ? `${a.won + a.leading}` : ""}
              </div>
            );
          })}
          {/* Pending */}
          <div
            className="flex items-center justify-center text-gray-400 text-sm bg-gray-100"
            style={{ flex: 1 }}
          >
            {TOTAL - ALLIANCE_TALLY.reduce((s, a) => s + a.won + a.leading, 0)}
          </div>
        </div>
        <div className="mt-2 relative">
          <div
            className="absolute"
            style={{ left: `${(MAJORITY / TOTAL) * 100}%`, transform: "translateX(-50%)" }}
          >
            <div className="w-0.5 h-3 bg-gray-500 mx-auto"></div>
            <span className="text-xs text-gray-500 whitespace-nowrap">Majority ({MAJORITY})</span>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3 text-xs text-gray-600">
          {ALLIANCE_TALLY.map((a) => (
            <div key={a.alliance} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: a.color }}></div>
              <span>{a.alliance}: {a.won + a.leading}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-gray-200"></div>
            <span>Pending: {ELECTION_STATS.seatsPending}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5">
        <div className="flex flex-wrap gap-3">
          <select
            value={filterAlliance}
            onChange={(e) => setFilterAlliance(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-kerala-green"
          >
            <option value="All">All Alliances</option>
            {["LDF", "UDF", "NDA"].map((a) => <option key={a} value={a}>{a}</option>)}
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
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-kerala-green"
          >
            <option value="All">All Statuses</option>
            {["Won", "Leading", "Pending"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <span className="text-sm text-gray-500 self-center">{filtered.length} constituencies</span>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Constituency</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">District</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Candidate / Party</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Votes</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Margin</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Rounds</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((r) => (
                <tr key={r.constituencyId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-gray-900">{r.constituencyName}</div>
                  </td>
                  <td className="px-4 py-4 text-gray-500 text-xs hidden md:table-cell">{r.district}</td>
                  <td className="px-4 py-4">
                    {r.status !== "Pending" ? (
                      <div>
                        <div className="font-medium text-gray-900 text-xs">{r.leadingCandidate}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: getAllianceColor(r.leadingAlliance) }}
                          ></div>
                          <span className="text-xs text-gray-500">{r.leadingParty} · {r.leadingAlliance}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">vs {r.runnerUpCandidate} ({r.runnerUpParty})</div>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">Counting not started</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right hidden lg:table-cell">
                    {r.status !== "Pending" && (
                      <div>
                        <div className="font-medium text-gray-900 text-xs">{r.leadingVotes.toLocaleString("en-IN")}</div>
                        <div className="text-gray-400 text-xs">{r.runnerUpVotes.toLocaleString("en-IN")}</div>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right hidden lg:table-cell">
                    {r.margin > 0 && (
                      <span className="font-semibold text-gray-700 text-xs">
                        +{r.margin.toLocaleString("en-IN")}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={cn("text-xs px-2 py-1 rounded-full border font-medium", STATUS_COLORS[r.status])}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center hidden md:table-cell">
                    <div className="text-xs text-gray-500">{r.roundsComplete}/{r.totalRounds}</div>
                    <div className="h-1 bg-gray-100 rounded-full mt-1 w-16 mx-auto">
                      <div
                        className="h-full bg-kerala-green rounded-full"
                        style={{ width: `${(r.roundsComplete / r.totalRounds) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center mt-4">
        Results are updated every few minutes during counting. Source: Election Commission of India.
        Refresh page for latest data.
      </p>
    </div>
  );
}
