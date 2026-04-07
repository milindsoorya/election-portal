import Link from "next/link";
import CountdownTimer from "@/components/CountdownTimer";
import StatCard from "@/components/StatCard";
import AllianceTallyBar from "@/components/AllianceTallyBar";
import { ELECTION_STATS, STATES, RESULTS } from "@/data";
import { formatNumber } from "@/lib/utils";

const FEATURES = [
  {
    href: "/candidates",
    icon: "👤",
    title: "Candidate Directory",
    desc: "Search all 140 constituencies. View assets, criminal cases, education and terms served.",
    color: "bg-blue-50 border-blue-100",
    iconBg: "bg-blue-100",
  },
  {
    href: "/booth-finder",
    icon: "📍",
    title: "Booth Finder",
    desc: "Find your polling booth by voter ID. View address, timing, accessibility info.",
    color: "bg-green-50 border-green-100",
    iconBg: "bg-green-100",
  },
  {
    href: "/results",
    icon: "📊",
    title: "Live Results",
    desc: "Real-time counting dashboard. Party tally, constituency-wise bars, majority tracker.",
    color: "bg-red-50 border-red-100",
    iconBg: "bg-red-100",
  },
  {
    href: "/voter-guide",
    icon: "📋",
    title: "Voter Guide",
    desc: "Step-by-step voting process, valid IDs, EVM/VVPAT explainer, NOTA, helplines.",
    color: "bg-purple-50 border-purple-100",
    iconBg: "bg-purple-100",
  },
  {
    href: "/trivia",
    icon: "🧠",
    title: "Trivia & Quiz",
    desc: "Kerala election history, fun facts, and an interactive quiz. How civic-smart are you?",
    color: "bg-yellow-50 border-yellow-100",
    iconBg: "bg-yellow-100",
  },
  {
    href: "/parties",
    icon: "🏛",
    title: "Party Hub",
    desc: "Manifestos, party symbols, alliance breakdown, and who is leading what.",
    color: "bg-orange-50 border-orange-100",
    iconBg: "bg-orange-100",
  },
];

const RECENT_RESULTS = RESULTS.filter((r) => r.status === "Won").slice(0, 5);

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="gradient-kerala text-white py-14 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
            <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
            <span className="text-green-100">Counting in progress — 101 of 140 seats declared</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black mb-3 leading-tight">
            🌴 Kerala Election 2026
          </h1>
          <p className="text-green-200 text-lg mb-8 max-w-2xl mx-auto">
            Your complete, non-partisan guide to the Kerala Legislative Assembly Election.
            Candidates, booths, live results and civic education — all in one place.
          </p>

          <div className="mb-8">
            <CountdownTimer
              targetDate={ELECTION_STATS.electionDate}
              label="Time until election day"
              isPastLabel="📊 Counting Underway — Check Live Results"
            />
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/results"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-xl transition-all flex items-center gap-2"
            >
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              Live Results
            </Link>
            <Link
              href="/booth-finder"
              className="bg-white/15 hover:bg-white/25 text-white font-semibold px-6 py-3 rounded-xl border border-white/25 transition-all"
            >
              📍 Find My Booth
            </Link>
            <Link
              href="/candidates"
              className="bg-white/15 hover:bg-white/25 text-white font-semibold px-6 py-3 rounded-xl border border-white/25 transition-all"
            >
              👤 Candidates
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 -mt-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Seats"
            value={ELECTION_STATS.totalSeats}
            icon="🏛"
            subtext={`Majority: ${ELECTION_STATS.majorityMark} seats`}
            highlight
          />
          <StatCard
            label="Registered Voters"
            value={formatNumber(ELECTION_STATS.totalVoters)}
            icon="🗳"
            subtext="Eligible to vote"
          />
          <StatCard
            label="Polling Booths"
            value={formatNumber(ELECTION_STATS.totalBooths)}
            icon="📍"
            subtext="Across Kerala"
          />
          <StatCard
            label="Voter Turnout"
            value={`${ELECTION_STATS.voterTurnout}%`}
            icon="📊"
            subtext="Overall turnout"
            highlight
          />
        </div>
      </section>

      {/* Live Tally */}
      <section className="max-w-7xl mx-auto px-4 mt-8">
        <AllianceTallyBar />
      </section>

      {/* Recent Results */}
      <section className="max-w-7xl mx-auto px-4 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 text-lg">Recent Declarations</h2>
          <Link href="/results" className="text-kerala-green text-sm font-medium hover:underline">
            View all →
          </Link>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {RECENT_RESULTS.map((r) => (
              <div key={r.constituencyId} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{r.constituencyName}</div>
                    <div className="text-xs text-gray-500">{r.district} District</div>
                  </div>
                </div>
                <div className="text-center hidden md:block">
                  <div className="font-semibold text-gray-900 text-sm">{r.leadingCandidate}</div>
                  <div className="text-xs text-gray-500">{r.leadingParty}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                    Won
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Margin: {r.margin.toLocaleString("en-IN")}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-4 mt-12 pb-6">
        <h2 className="font-bold text-gray-900 text-xl mb-2">Everything You Need</h2>
        <p className="text-gray-500 text-sm mb-6">One platform for every voter in Kerala</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className={`rounded-xl border p-5 card-hover ${f.color} block`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${f.iconBg}`}>
                {f.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
              <span className="inline-block mt-4 text-xs font-medium text-kerala-green">
                Explore →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* States Coming Soon */}
      <section className="max-w-7xl mx-auto px-4 mt-6 pb-8">
        <h2 className="font-bold text-gray-900 text-lg mb-4">Other States — Coming Soon</h2>
        <div className="flex flex-wrap gap-3">
          {STATES.map((state) => (
            <div
              key={state.id}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                state.active
                  ? "bg-kerala-green text-white border-kerala-green"
                  : "bg-gray-100 text-gray-500 border-gray-200"
              }`}
            >
              <span>{state.emoji}</span>
              <span>{state.name}</span>
              {state.active && (
                <span className="bg-white/25 text-white text-xs px-2 py-0.5 rounded-full">Active</span>
              )}
              {!state.active && (
                <span className="text-xs text-gray-400">{state.election}</span>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
