export * from "./parties";
export * from "./constituencies";
export * from "./candidates";
export * from "./results";
export * from "./booths";
export * from "./trivia";

export const STATES = [
  { id: "kerala", name: "Kerala", active: true, election: "April 2026", seats: 140, emoji: "🌴" },
  { id: "tamilnadu", name: "Tamil Nadu", active: false, election: "2026", seats: 234, emoji: "🏛" },
  { id: "westbengal", name: "West Bengal", active: false, election: "2026", seats: 294, emoji: "🐯" },
  { id: "assam", name: "Assam", active: false, election: "2026", seats: 126, emoji: "🍃" },
  { id: "up", name: "Uttar Pradesh", active: false, election: "2027", seats: 403, emoji: "🕌" },
];

export const NEWS_ITEMS = [
  "Kerala election 2026: Counting begins for all 140 constituencies | LDF leading in 55 seats",
  "Pinarayi Vijayan wins from Dharmadom by 36,125 votes | Largest margin so far",
  "Voter turnout recorded at 71.3% — one of the highest in recent Kerala elections",
  "NDA makes gains in Thrissur and Palakkad; leads in 12+ constituencies",
  "UDF leading in Ernakulam, Thiruvananthapuram, Alappuzha districts",
  "EC Kerala: All 27,498 polling booths reported smooth counting process",
  "NOTA votes cross 1.5 lakh across Kerala constituencies",
  "Results from Wayanad and Idukki districts expected by 2 PM",
];
