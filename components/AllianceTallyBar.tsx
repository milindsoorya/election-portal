"use client";

import { ALLIANCE_TALLY } from "@/data";
import { cn } from "@/lib/utils";

const TOTAL_SEATS = 140;
const MAJORITY = 71;

export default function AllianceTallyBar() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 text-sm">Live Seat Tally — Kerala 2026</h3>
        <span className="text-xs bg-red-100 text-red-600 font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse inline-block"></span>
          Counting Live
        </span>
      </div>

      {/* Majority bar */}
      <div className="relative h-8 rounded-lg overflow-hidden flex mb-1">
        {ALLIANCE_TALLY.map((a) => {
          const width = ((a.won + a.leading) / TOTAL_SEATS) * 100;
          return (
            <div
              key={a.alliance}
              className="flex items-center justify-center text-white text-xs font-bold transition-all"
              style={{ width: `${width}%`, backgroundColor: a.color, minWidth: width > 3 ? undefined : "0" }}
            >
              {width > 8 ? `${a.won + a.leading}` : ""}
            </div>
          );
        })}
      </div>

      {/* Majority marker */}
      <div className="relative h-5 mb-4">
        <div
          className="absolute top-0 flex flex-col items-center"
          style={{ left: `${(MAJORITY / TOTAL_SEATS) * 100}%`, transform: "translateX(-50%)" }}
        >
          <div className="w-0.5 h-3 bg-gray-400"></div>
          <span className="text-xs text-gray-500 whitespace-nowrap">Majority ({MAJORITY})</span>
        </div>
      </div>

      {/* Alliance cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {ALLIANCE_TALLY.map((a) => (
          <div key={a.alliance} className="rounded-lg p-3 border" style={{ borderColor: a.color + "40", backgroundColor: a.color + "0a" }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: a.color }}></div>
              <span className="font-bold text-sm text-gray-900">{a.alliance}</span>
            </div>
            <div className="text-2xl font-black" style={{ color: a.color }}>
              {a.won + a.leading}
            </div>
            <div className="text-xs text-gray-500 mt-1 space-y-0.5">
              <div>Won: <span className="font-semibold text-gray-700">{a.won}</span></div>
              <div>Leading: <span className="font-semibold text-gray-700">{a.leading}</span></div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-3 text-center">
        {ALLIANCE_TALLY.reduce((s, a) => s + a.won + a.leading, 0)} / {TOTAL_SEATS} seats reported
      </p>
    </div>
  );
}
