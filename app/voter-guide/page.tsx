export default function VoterGuidePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2">📋 Voter Guide</h1>
        <p className="text-gray-500">Everything you need to know to vote in the Kerala 2026 Assembly Election.</p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { href: "#how-to-vote", icon: "🗳", label: "How to Vote" },
          { href: "#valid-ids", icon: "🪪", label: "Valid IDs" },
          { href: "#evm", icon: "🖥", label: "EVM & VVPAT" },
          { href: "#helplines", icon: "📞", label: "Helplines" },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="bg-white border border-gray-100 rounded-xl p-3 text-center shadow-sm hover:border-kerala-green hover:shadow-md transition-all"
          >
            <div className="text-2xl mb-1">{item.icon}</div>
            <div className="text-xs font-medium text-gray-700">{item.label}</div>
          </a>
        ))}
      </div>

      {/* How to Vote */}
      <section id="how-to-vote" className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>🗳</span> How to Vote — Step by Step
        </h2>
        <div className="space-y-3">
          {[
            {
              step: 1,
              title: "Check your name on the voter list",
              desc: "Visit electoralsearch.eci.gov.in or use this portal's Booth Finder to verify your registration and find your booth number.",
              note: "",
            },
            {
              step: 2,
              title: "Carry a valid photo ID",
              desc: "Bring any one of the accepted photo ID documents listed below. Your Voter ID card (EPIC) is the primary document.",
              note: "Multiple IDs are accepted — see the list below.",
            },
            {
              step: 3,
              title: "Arrive at your polling booth",
              desc: "Go to the booth assigned to your address. Booths are open 7:00 AM to 6:00 PM. Elderly and PWD voters get priority access.",
              note: "Check booth address using the Booth Finder above.",
            },
            {
              step: 4,
              title: "Wait in the queue and verify identity",
              desc: "Give your name and serial number to the presiding officer. Your ID will be verified and your finger will be marked with indelible ink.",
              note: "Indelible ink is applied to prevent double voting.",
            },
            {
              step: 5,
              title: "Sign the voter register",
              desc: "Sign (or apply thumb impression) next to your name in the electoral roll register. You will receive a ballot slip.",
              note: "",
            },
            {
              step: 6,
              title: "Enter the voting compartment",
              desc: "Go to the EVM (Electronic Voting Machine) in the voting compartment. You will see candidate names with party symbols.",
              note: "The compartment is private — no one can see your vote.",
            },
            {
              step: 7,
              title: "Press the button next to your chosen candidate",
              desc: "Press the blue button next to the candidate of your choice. A beep will confirm your vote. The adjacent lamp will light up.",
              note: "You can only vote once — the machine locks after one vote.",
            },
            {
              step: 8,
              title: "Verify your vote on the VVPAT",
              desc: "A slip showing the candidate name and party symbol you voted for will appear briefly (7 seconds) in the VVPAT glass window.",
              note: "This is just for your verification — it does not come out.",
            },
          ].map((s) => (
            <div key={s.step} className="flex gap-4 bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <div className="w-9 h-9 rounded-full bg-kerala-green text-white font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                {s.step}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{s.title}</h3>
                <p className="text-gray-600 text-sm mt-1">{s.desc}</p>
                {s.note && (
                  <p className="text-xs text-kerala-saffron mt-1.5 flex items-center gap-1">
                    <span>ℹ️</span> {s.note}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Valid IDs */}
      <section id="valid-ids" className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>🪪</span> Accepted Photo ID Documents
        </h2>
        <p className="text-gray-500 text-sm mb-4">
          Any one of the following documents is accepted at the polling booth. The document must be original (photocopies not accepted).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { id: "Voter ID Card (EPIC)", note: "Primary document — most recommended", primary: true },
            { id: "Aadhaar Card", note: "Accepted since 2019 election" },
            { id: "Passport", note: "Valid Indian passport" },
            { id: "Driving Licence", note: "Issued by transport authority" },
            { id: "MGNREGA Job Card", note: "With photograph" },
            { id: "Ration Card with photo", note: "State-issued ration card" },
            { id: "Bank / Post Office Passbook", note: "With photograph" },
            { id: "Health Insurance Smart Card", note: "Issued under Labour Ministry schemes" },
            { id: "Pension Document with photo", note: "Issued by government" },
            { id: "NPR Smart Card", note: "National Population Register card" },
            { id: "Service Identity Cards", note: "Issued by Central/State Govt/PSUs" },
            { id: "Member of Parliament / MLA ID", note: "Official identity card" },
          ].map((item) => (
            <div
              key={item.id}
              className={`flex items-start gap-3 p-3 rounded-lg border ${item.primary ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-100"}`}
            >
              <span className="text-green-600 text-lg mt-0.5">✓</span>
              <div>
                <div className={`font-medium text-sm ${item.primary ? "text-green-800" : "text-gray-900"}`}>
                  {item.id}
                  {item.primary && <span className="ml-2 text-xs bg-green-600 text-white px-1.5 py-0.5 rounded">Primary</span>}
                </div>
                <div className="text-xs text-gray-500">{item.note}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 bg-red-50 border border-red-100 rounded-lg p-3">
          <p className="text-sm text-red-700">
            <strong>❌ Not accepted:</strong> PAN Card, utility bills, bank statements, or any document without a photograph.
          </p>
        </div>
      </section>

      {/* EVM & VVPAT */}
      <section id="evm" className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>🖥</span> Understanding EVM & VVPAT
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3">🖥 EVM — Electronic Voting Machine</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex gap-2"><span className="text-kerala-green">•</span> Battery-operated, standalone device — not connected to any network</li>
              <li className="flex gap-2"><span className="text-kerala-green">•</span> Consists of a Control Unit (with officer) and Ballot Unit (with voter)</li>
              <li className="flex gap-2"><span className="text-kerala-green">•</span> Can record a maximum of 2,000 votes per unit</li>
              <li className="flex gap-2"><span className="text-kerala-green">•</span> Stores votes in non-volatile memory — cannot be tampered with or erased</li>
              <li className="flex gap-2"><span className="text-kerala-green">•</span> First used in India in 1982 (Paravur, Kerala constituency)</li>
              <li className="flex gap-2"><span className="text-kerala-green">•</span> Manufactured by BEL and ECIL under ECI supervision</li>
            </ul>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3">🧾 VVPAT — Voter Verifiable Paper Audit Trail</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex gap-2"><span className="text-kerala-saffron">•</span> Attached to the EVM — shows a paper slip for 7 seconds after you vote</li>
              <li className="flex gap-2"><span className="text-kerala-saffron">•</span> Displays: candidate name, party symbol, and serial number</li>
              <li className="flex gap-2"><span className="text-kerala-saffron">•</span> Slip drops into a sealed compartment — cannot be removed</li>
              <li className="flex gap-2"><span className="text-kerala-saffron">•</span> Used to audit results in case of disputes — 5 EVMs per constituency are randomly checked</li>
              <li className="flex gap-2"><span className="text-kerala-saffron">•</span> Mandatory in all elections since 2019 General Election</li>
              <li className="flex gap-2"><span className="text-kerala-saffron">•</span> Gives voters visual confirmation of their vote</li>
            </ul>
          </div>
        </div>
      </section>

      {/* NOTA */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>🚫</span> What is NOTA?
        </h2>
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            <strong>NOTA (None Of The Above)</strong> is a ballot option that allows voters to formally reject all candidates in their constituency.
            It is the last option on the ballot unit.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">How it works</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex gap-2"><span>•</span> Press the NOTA button on the EVM (last option)</li>
                <li className="flex gap-2"><span>•</span> Your vote is recorded but not credited to any candidate</li>
                <li className="flex gap-2"><span>•</span> NOTA votes are counted and disclosed publicly</li>
                <li className="flex gap-2"><span>•</span> Even if NOTA gets the most votes, the candidate with most non-NOTA votes wins</li>
              </ul>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
              <h4 className="font-semibold text-amber-800 mb-2 text-sm">Kerala NOTA Stats</h4>
              <p className="text-amber-700 text-sm">In the 2021 Kerala election, over <strong>1.3 lakh voters</strong> chose NOTA — representing 0.8% of all votes cast. In several constituencies, NOTA votes exceeded the winner's margin.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Rights */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>⚖️</span> Your Rights as a Voter
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            "You have the right to vote without intimidation or coercion",
            "Employers must give paid leave on election day (in states observing this)",
            "You cannot be denied voting due to caste, religion, gender, or language",
            "You can demand a challenge vote if you believe someone is impersonating you",
            "Polling agents cannot enter the voting compartment",
            "You can complain to the Presiding Officer if your voting is obstructed",
            "First-time voters get special assistance if needed",
            "Persons with disabilities get priority in queues and in-booth assistance",
          ].map((right) => (
            <div key={right} className="flex gap-2 bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-800">
              <span>⚖️</span><span>{right}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Helplines */}
      <section id="helplines" className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>📞</span> Election Helplines
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { org: "ECI National Helpline", number: "1950", desc: "Election Commission of India — voter queries, complaints", available: "24x7 on election day" },
            { org: "CEO Kerala", number: "0471-2726999", desc: "Chief Electoral Officer Kerala — state-specific queries", available: "Office hours" },
            { org: "cVIGIL App", number: "App-based", desc: "Report electoral violations with photos/videos directly to ECI", available: "Download on Android/iOS" },
          ].map((h) => (
            <div key={h.org} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-1">{h.org}</h4>
              <div className="text-2xl font-black text-kerala-green mb-2">{h.number}</div>
              <p className="text-gray-500 text-xs">{h.desc}</p>
              <p className="text-xs text-green-600 mt-1 font-medium">⏰ {h.available}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
