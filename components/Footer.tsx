import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🗳️</span>
              <div>
                <div className="text-white font-bold">India Election Portal</div>
                <div className="text-green-400 text-sm">Non-partisan civic information</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              A free, non-partisan platform providing transparent election information for Indian voters.
              All data sourced from ECI, MyNeta/ADR, and official government sources.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs bg-green-900/50 text-green-400 border border-green-700 px-2 py-1 rounded">
                ⚖️ Non-partisan
              </span>
              <span className="text-xs bg-green-900/50 text-green-400 border border-green-700 px-2 py-1 rounded">
                📂 Open Data
              </span>
              <span className="text-xs bg-green-900/50 text-green-400 border border-green-700 px-2 py-1 rounded">
                🔒 No Ads
              </span>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/candidates", label: "Candidate Directory" },
                { href: "/booth-finder", label: "Booth Finder" },
                { href: "/results", label: "Live Results" },
                { href: "/voter-guide", label: "Voter Guide" },
                { href: "/trivia", label: "Trivia & Quiz" },
                { href: "/parties", label: "Party Hub" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-green-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Data Sources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Data Sources</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>🏛 Election Commission of India (ECI)</li>
              <li>📋 MyNeta / ADR</li>
              <li>📊 Lok Dhaba, TCPD</li>
              <li>🗂 CEO Kerala Website</li>
            </ul>
            <div className="mt-6">
              <h3 className="text-white font-semibold mb-2">Helplines</h3>
              <div className="text-sm text-gray-400 space-y-1">
                <div>📞 ECI Helpline: <span className="text-white">1950</span></div>
                <div>📞 CEO Kerala: <span className="text-white">0471-2726999</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© 2026 India Election Portal. Data for informational purposes only.</p>
          <p>All electoral data sourced from publicly available government records. Not affiliated with any political party.</p>
        </div>
      </div>
    </footer>
  );
}
