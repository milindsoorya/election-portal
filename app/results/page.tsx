"use client";

import { useState, useEffect, useCallback } from "react";
import { DISTRICTS } from "@/data";
import { cn, getAllianceColor } from "@/lib/utils";
import type { ResultRow, AllianceTallyRow } from "@/lib/db/supabase";

const STATUS_COLORS: Record<string, string> = {
  Won:      "bg-green-100 text-green-700 border-green-200",
  Leading:  "bg-blue-100 text-blue-700 border-blue-200",
  Counting: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Pending:  "bg-gray-100 text-gray-500 border-gray-200",
};

const TOTAL = 140;
const MAJORITY = 71;

interface ApiResponse {
  source: string;
  lastUpdated?: string;
  results: ResultRow[];
  allianceTally: AllianceTallyRow[];
  notice?: string;
}

export default function ResultsPage() {
  const [data, setData]           = useState<ApiResponse | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [filterAlliance, setFilterAlliance] = useState("All");
  const [filterDistrict, setFilterDistrict] = useState("All");
  const [filterStatus,   setFilterStatus]   = useState("All");
  const [autoRefresh,    setAutoRefresh]    = useState(true);
  const [lastFetch,      setLastFetch]      = useState<Date | null>(null);

  const fetchResults = useCallback(async () => {
    try {
      const res = await fetch("/api/results?state=kerala");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: ApiResponse = await res.json();
      setData(json);
      setLastFetch(new Date());
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Auto-refresh every 60s when enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchResults, 60_000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchResults]);

  const results      = data?.results || [];
  const allianceTally = data?.allianceTally || [];

  const filtered = results.filter((r) => {
    if (filterAlliance !== "All" && r.leading_alliance !== filterAlliance) return false;
    if (filterDistrict !== "All" && r.district          !== filterDistrict)  return false;
    if (filterStatus   !== "All" && r.status            !== filterStatus)    return false;
    return true;
  });

  const seatsReported = results.filter((r) => r.status === "Won" || r.status === "Leading").length;
  const leadingAlliance = allianceTally.length > 0
    ? allianceTally.reduce((a, b) => (a.won + a.leading) > (b.won + b.leading) ? a : b)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h1 className="text-3xl font-black text-gray-900">📊 Live Results</h1>
            <span className="flex items-center gap-1.5 bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full border border-red-200">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse inline-block"></span>
              {data?.source === "db" ? "Live" : "Demo Data"}
            </span>
          </div>
          <p className="text-gray-500 text-sm">
            Kerala Assembly Election 2026 — Real-time counting results.
          </p>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {lastFetch && (
              <span className="text-xs text-gray-400">
                Updated: {lastFetch.toLocaleTimeString("en-IN")}
              </span>
            )}
            {data?.notice && (
              <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">
                ℹ️ {data.notice}
              </span>
            )}
            <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              Auto-refresh (60s)
            </label>
            <button
              onClick={fetchResults}
              className="text-xs text-kerala-green underline"
            >
              Refresh now
            </button>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 mb-1">Seats Declared</div>
          <div className="text-3xl font-black text-gray-900">
            {loading ? "—" : seatsReported}
            <span className="text-gray-400 text-lg font-normal"> / {TOTAL}</span>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[1,2,3,4].map((i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-32 animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-red-700 text-sm">
          Failed to load results: {error}. <button onClick={fetchResults} className="underline">Retry</button>
        </div>
      )}

      {/* Alliance Tally Cards */}
      {allianceTally.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {allianceTally.map((a) => {
            const total = a.won + a.leading;
            const toMajority = Math.max(0, MAJORITY - total);
            const isLeading = leadingAlliance?.alliance === a.alliance;
            return (
              <div
                key={a.alliance}
                className={cn("bg-white rounded-xl border-2 shadow-sm p-4", isLeading ? "shadow-md" : "border-gray-100")}
                style={isLeading ? { borderColor: a.color || "#ccc" } : {}}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: a.color || "#ccc" }}></div>
                    <span className="font-bold text-gray-900">{a.alliance}</span>
                  </div>
                  {isLeading && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">Leading</span>}
                </div>
                <div className="text-4xl font-black" style={{ color: a.color || "#333" }}>{total}</div>
                <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                  <div>Won: <strong className="text-gray-700">{a.won}</strong> · Leading: <strong className="text-gray-700">{a.leading}</strong></div>
                  {toMajority > 0
                    ? <div className="text-gray-400">Need {toMajority} more</div>
                    : <div className="text-green-600 font-medium">✓ Majority!</div>}
                </div>
                <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (total / MAJORITY) * 100)}%`, backgroundColor: a.color || "#ccc" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Seat bar */}
      {allianceTally.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Seat Distribution</h3>
            <span className="text-xs text-gray-500">Majority: {MAJORITY} seats</span>
          </div>
          <div className="relative h-10 rounded-lg overflow-hidden flex">
            {allianceTally.map((a) => {
              const w = ((a.won + a.leading) / TOTAL) * 100;
              return (
                <div
                  key={a.alliance}
                  className="flex items-center justify-center text-white text-sm font-bold"
                  style={{ width: `${w}%`, backgroundColor: a.color || "#ccc" }}
                  title={`${a.alliance}: ${a.won + a.leading}`}
                >
                  {w > 5 ? `${a.won + a.leading}` : ""}
                </div>
              );
            })}
            <div className="flex-1 bg-gray-100 flex items-center justify-center text-xs text-gray-400">
              {TOTAL - allianceTally.reduce((s, a) => s + a.won + a.leading, 0)} pending
            </div>
          </div>
          <div className="mt-2 relative h-5">
            <div className="absolute" style={{ left: `${(MAJORITY / TOTAL) * 100}%`, transform: "translateX(-50%)" }}>
              <div className="w-0.5 h-3 bg-gray-400 mx-auto"></div>
              <span className="text-xs text-gray-500 whitespace-nowrap">{MAJORITY}</span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-600">
            {allianceTally.map((a) => (
              <div key={a.alliance} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: a.color || "#ccc" }}></div>
                <span>{a.alliance}: {a.won + a.leading}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5">
        <div className="flex flex-wrap gap-3">
          <select value={filterAlliance} onChange={(e) => setFilterAlliance(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-kerala-green">
            <option value="All">All Alliances</option>
            {["LDF","UDF","NDA","Others"].map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <select value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-kerala-green">
            <option value="All">All Districts</option>
            {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-kerala-green">
            <option value="All">All Statuses</option>
            {["Won","Leading","Counting","Pending"].map((s) => <option key={s} value={s}>{s}</option>)}
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
                <tr key={r.constituency_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 font-semibold text-gray-900">{r.constituency_name}</td>
                  <td className="px-4 py-4 text-gray-500 text-xs hidden md:table-cell">{r.district}</td>
                  <td className="px-4 py-4">
                    {r.status !== "Pending" && r.leading_candidate ? (
                      <div>
                        <div className="font-medium text-gray-900 text-xs">{r.leading_candidate}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getAllianceColor(r.leading_alliance || "") }}></div>
                          <span className="text-xs text-gray-500">{r.leading_party} · {r.leading_alliance}</span>
                        </div>
                        {r.runner_up_candidate && (
                          <div className="text-xs text-gray-400 mt-0.5">vs {r.runner_up_candidate} ({r.runner_up_party})</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">Counting not started</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right hidden lg:table-cell">
                    {r.leading_votes > 0 && (
                      <div>
                        <div className="font-medium text-gray-900 text-xs">{r.leading_votes.toLocaleString("en-IN")}</div>
                        <div className="text-gray-400 text-xs">{r.runner_up_votes.toLocaleString("en-IN")}</div>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right hidden lg:table-cell">
                    {r.margin > 0 && (
                      <span className="font-semibold text-gray-700 text-xs">+{r.margin.toLocaleString("en-IN")}</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={cn("text-xs px-2 py-1 rounded-full border font-medium", STATUS_COLORS[r.status])}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center hidden md:table-cell">
                    {r.total_rounds > 0 && (
                      <>
                        <div className="text-xs text-gray-500">{r.rounds_complete}/{r.total_rounds}</div>
                        <div className="h-1 bg-gray-100 rounded-full mt-1 w-16 mx-auto">
                          <div className="h-full bg-kerala-green rounded-full"
                            style={{ width: `${(r.rounds_complete / r.total_rounds) * 100}%` }} />
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center mt-4">
        {data?.source === "db"
          ? "Results sourced live from ECI via automated scrape. "
          : "Demo data shown — configure ECI_RESULTS_URL and run npm run sync:results. "}
        Source: Election Commission of India.
      </p>
    </div>
  );
}
