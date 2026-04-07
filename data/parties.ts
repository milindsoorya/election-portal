export type Alliance = "LDF" | "UDF" | "NDA" | "Independent";

export interface Party {
  id: string;
  name: string;
  abbreviation: string;
  alliance: Alliance;
  color: string;
  symbol: string;
  founded: number;
  ideology: string;
  manifestoHighlights: string[];
  seatsContesting: number;
}

export const PARTIES: Party[] = [
  {
    id: "cpim",
    name: "Communist Party of India (Marxist)",
    abbreviation: "CPI(M)",
    alliance: "LDF",
    color: "#e63946",
    symbol: "🔨",
    founded: 1964,
    ideology: "Marxism-Leninism, Democratic Socialism",
    manifestoHighlights: [
      "Free healthcare for all citizens below poverty line",
      "Expand KIIFB infrastructure projects to every district",
      "2 lakh new government jobs in 5 years",
      "Universal basic income pilot for 50,000 families",
      "Digital Kerala 2.0 — internet as a right",
    ],
    seatsContesting: 82,
  },
  {
    id: "inc",
    name: "Indian National Congress",
    abbreviation: "INC",
    alliance: "UDF",
    color: "#0077b6",
    symbol: "✋",
    founded: 1885,
    ideology: "Social Democracy, Secularism, Liberalism",
    manifestoHighlights: [
      "Rs 1,000/month for all women above 21",
      "10,000 crore startup fund for youth entrepreneurs",
      "Repeal controversial land reclassification bill",
      "Double agricultural support prices",
      "Free bus pass for all students",
    ],
    seatsContesting: 71,
  },
  {
    id: "bjp",
    name: "Bharatiya Janata Party",
    abbreviation: "BJP",
    alliance: "NDA",
    color: "#f77f00",
    symbol: "🪷",
    founded: 1980,
    ideology: "Hindu Nationalism, Conservatism",
    manifestoHighlights: [
      "Uniform Civil Code implementation in Kerala",
      "CAA & NRC enforcement",
      "Rs 5,000 crore temple development fund",
      "Integrate Kerala into national expressway network",
      "Subsidised LPG cylinders for all BPL families",
    ],
    seatsContesting: 140,
  },
  {
    id: "cpi",
    name: "Communist Party of India",
    abbreviation: "CPI",
    alliance: "LDF",
    color: "#c1121f",
    symbol: "⭐",
    founded: 1920,
    ideology: "Communism, Marxism",
    manifestoHighlights: [
      "Nationalise private hospitals",
      "Free education up to post-graduation",
      "Land reforms for landless farmers",
    ],
    seatsContesting: 21,
  },
  {
    id: "iuml",
    name: "Indian Union Muslim League",
    abbreviation: "IUML",
    alliance: "UDF",
    color: "#2d6a4f",
    symbol: "☽",
    founded: 1906,
    ideology: "Islamic Democracy, Minority Rights",
    manifestoHighlights: [
      "Protect minority educational institutions",
      "Waqf board reforms for community benefit",
      "Development of backward Malabar region",
    ],
    seatsContesting: 20,
  },
  {
    id: "kc-m",
    name: "Kerala Congress (M)",
    abbreviation: "KC(M)",
    alliance: "UDF",
    color: "#4cc9f0",
    symbol: "🏛",
    founded: 1979,
    ideology: "Christian Democracy, Agrarianism",
    manifestoHighlights: [
      "Rubber price support scheme",
      "Agricultural debt waiver",
      "Christian minority protection",
    ],
    seatsContesting: 14,
  },
  {
    id: "bdjs",
    name: "Bharath Dharma Jana Sena",
    abbreviation: "BDJS",
    alliance: "NDA",
    color: "#ff9e00",
    symbol: "⚡",
    founded: 2015,
    ideology: "Hindu Ezhava Community Rights",
    manifestoHighlights: [
      "SNDP Yogam community welfare expansion",
      "Reservation for Ezhava community in private sector",
      "Toddy worker welfare fund",
    ],
    seatsContesting: 9,
  },
];

export const ALLIANCES = {
  LDF: {
    name: "Left Democratic Front",
    fullName: "Left Democratic Front",
    color: "#e63946",
    bgColor: "#fff1f1",
    leader: "Pinarayi Vijayan",
    parties: ["CPI(M)", "CPI", "NCP", "JD(S)", "KC(M) splinter"],
    majorityNeeded: 71,
  },
  UDF: {
    name: "United Democratic Front",
    fullName: "United Democratic Front",
    color: "#0077b6",
    bgColor: "#f0f8ff",
    leader: "V. D. Satheesan",
    parties: ["INC", "IUML", "KC(M)", "RSP", "Kerala Congress"],
    majorityNeeded: 71,
  },
  NDA: {
    name: "National Democratic Alliance",
    fullName: "National Democratic Alliance",
    color: "#f77f00",
    bgColor: "#fff8f0",
    leader: "K. Surendran",
    parties: ["BJP", "BDJS", "NSS (informal support)"],
    majorityNeeded: 71,
  },
};
