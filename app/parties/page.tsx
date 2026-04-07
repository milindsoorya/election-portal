import { PARTIES, ALLIANCES, ALLIANCE_TALLY } from "@/data";
import { cn } from "@/lib/utils";

export default function PartiesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2">🏛 Party Hub</h1>
        <p className="text-gray-500">
          Alliances, party summaries, manifesto highlights, and current seat counts for the Kerala 2026 election.
        </p>
      </div>

      {/* Alliance Overview */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-5">Alliance Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {Object.entries(ALLIANCES).map(([key, alliance]) => {
            const tally = ALLIANCE_TALLY.find((t) => t.alliance === key);
            return (
              <div
                key={key}
                className="bg-white rounded-xl border-2 shadow-sm overflow-hidden"
                style={{ borderColor: tally?.color + "60" }}
              >
                {/* Alliance header */}
                <div className="px-5 py-4" style={{ backgroundColor: tally?.color + "15" }}>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tally?.color }} />
                    <h3 className="font-black text-gray-900 text-lg">{key}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{alliance.fullName}</p>
                </div>

                <div className="p-5 space-y-4">
                  {/* Seats tally */}
                  {tally && (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-500 mb-0.5">Current Tally</div>
                        <div className="text-3xl font-black" style={{ color: tally.color }}>
                          {tally.won + tally.leading}
                        </div>
                        <div className="text-xs text-gray-500">
                          {tally.won} won · {tally.leading} leading
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 mb-1">To majority</div>
                        <div className="text-xl font-bold text-gray-700">
                          {Math.max(0, 71 - tally.won - tally.leading) === 0
                            ? <span className="text-green-600 text-base">✓ Reached</span>
                            : Math.max(0, 71 - tally.won - tally.leading)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Progress to majority */}
                  {tally && (
                    <div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, ((tally.won + tally.leading) / 71) * 100)}%`,
                            backgroundColor: tally.color,
                          }}
                        />
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {Math.round(((tally.won + tally.leading) / 71) * 100)}% of majority mark (71)
                      </div>
                    </div>
                  )}

                  <div className="border-t border-gray-50 pt-3 space-y-2 text-sm">
                    <div>
                      <span className="text-xs text-gray-500">Alliance Leader</span>
                      <p className="font-semibold text-gray-900">{alliance.leader}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Key Parties</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {alliance.parties.map((p) => (
                          <span
                            key={p}
                            className="text-xs px-2 py-0.5 rounded-full border bg-gray-50 text-gray-700"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Party Cards */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-5">Party Profiles</h2>
        <div className="space-y-5">
          {PARTIES.map((party) => (
            <div key={party.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Party header */}
              <div
                className="px-6 py-4 flex items-center justify-between flex-wrap gap-3"
                style={{ backgroundColor: party.color + "15", borderBottom: `3px solid ${party.color}` }}
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{party.symbol}</span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black text-gray-900 text-lg">{party.abbreviation}</h3>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: party.color }}
                      >
                        {party.alliance}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{party.name}</p>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div className="text-xs text-gray-500">Founded</div>
                  <div className="font-semibold text-gray-900">{party.founded}</div>
                  <div className="text-xs text-gray-500 mt-1">Contesting</div>
                  <div className="font-semibold text-gray-900">{party.seatsContesting} seats</div>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ideology */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Ideology
                  </h4>
                  <p className="text-sm text-gray-700">{party.ideology}</p>
                </div>

                {/* Manifesto */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    2026 Manifesto Highlights
                  </h4>
                  <ul className="space-y-1.5">
                    {party.manifestoHighlights.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-sm text-gray-700">
                        <span
                          className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                          style={{ backgroundColor: party.color }}
                        />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="text-xs text-gray-400 text-center mt-8">
        Manifesto summaries are derived from publicly available party documents. This portal is strictly non-partisan
        and presents all parties equally. No editorial opinion is expressed.
      </p>
    </div>
  );
}
