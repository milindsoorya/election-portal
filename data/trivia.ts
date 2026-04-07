export interface TriviaCard {
  id: string;
  category: string;
  fact: string;
  year?: number;
  icon: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const TRIVIA_CARDS: TriviaCard[] = [
  {
    id: "t001",
    category: "First Election",
    fact: "Kerala's first assembly election was held in 1957, which brought the world's first democratically elected Communist government to power under E. M. S. Namboodiripad.",
    year: 1957,
    icon: "🏛",
  },
  {
    id: "t002",
    category: "Voter Turnout",
    fact: "Kerala consistently records some of India's highest voter turnout — above 75% in most elections. The 2021 election saw a record 74.06% turnout.",
    icon: "📊",
  },
  {
    id: "t003",
    category: "Women Voters",
    fact: "Kerala has more registered female voters than male voters — a unique distinction in Indian politics, reflecting the state's high gender equality index.",
    icon: "👩",
  },
  {
    id: "t004",
    category: "EMS Legacy",
    fact: "E. M. S. Namboodiripad served as Kerala's first Chief Minister in 1957 and again from 1967–1969. He is fondly called 'EMS' and remains an iconic figure in left politics.",
    year: 1957,
    icon: "⭐",
  },
  {
    id: "t005",
    category: "Swing State",
    fact: "Kerala is famous for 'anti-incumbency voting' — since 1982, no ruling government has been re-elected. The 2021 LDF victory under Pinarayi Vijayan broke this 39-year pattern.",
    icon: "🔄",
  },
  {
    id: "t006",
    category: "Largest Constituency",
    fact: "Thrissur constituency in Thrissur district has historically been one of Kerala's largest urban constituencies with over 2.2 lakh registered voters.",
    icon: "📍",
  },
  {
    id: "t007",
    category: "NOTA",
    fact: "In the 2021 Kerala election, over 1.3 lakh voters chose NOTA (None Of The Above) — more than the winning margin in several constituencies.",
    year: 2021,
    icon: "🗳",
  },
  {
    id: "t008",
    category: "Literacy & Democracy",
    fact: "Kerala's near-100% literacy rate is often credited for its high political awareness and civic participation — the state has the highest newspaper readership per capita in India.",
    icon: "📚",
  },
  {
    id: "t009",
    category: "LDF vs UDF",
    fact: "LDF and UDF have alternated power since 1982 — each ruling for 5 years at a time — until LDF's historic consecutive win in 2021. This pendulum-like pattern is unique to Kerala politics.",
    icon: "↔️",
  },
  {
    id: "t010",
    category: "Women in Assembly",
    fact: "The 2021 Kerala assembly had 19 elected women MLAs — the highest number ever. Kerala was also the first Indian state to have a woman Chief Minister: K. R. Gowri Amma in 1977 (briefly).",
    year: 2021,
    icon: "🏆",
  },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q001",
    question: "How many seats are there in the Kerala Legislative Assembly?",
    options: ["120", "130", "140", "150"],
    correctIndex: 2,
    explanation: "The Kerala Legislative Assembly has 140 seats. A party or alliance needs 71 seats for a majority.",
  },
  {
    id: "q002",
    question: "In which year was the world's first democratically elected Communist government formed in Kerala?",
    options: ["1952", "1957", "1962", "1967"],
    correctIndex: 1,
    explanation: "In 1957, E. M. S. Namboodiripad led CPI to victory, forming the world's first democratically elected Communist government.",
  },
  {
    id: "q003",
    question: "What does NOTA stand for in Indian elections?",
    options: ["No Other Trusted Alternative", "None Of The Above", "No Official Tally Available", "Not On The Agenda"],
    correctIndex: 1,
    explanation: "NOTA stands for 'None Of The Above'. It allows voters to reject all candidates. It was introduced in Indian elections from 2013.",
  },
  {
    id: "q004",
    question: "What time do polling booths open on election day in Kerala?",
    options: ["6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM"],
    correctIndex: 1,
    explanation: "Polling booths in Kerala open at 7:00 AM and close at 6:00 PM (18:00). Voters in the queue at 6:00 PM are allowed to vote.",
  },
  {
    id: "q005",
    question: "Which district has the most assembly constituencies in Kerala?",
    options: ["Thiruvananthapuram", "Thrissur", "Ernakulam", "Malappuram"],
    correctIndex: 0,
    explanation: "Thiruvananthapuram district has the most assembly constituencies in Kerala with 15 seats, followed by Thrissur (13) and Ernakulam (14).",
  },
  {
    id: "q006",
    question: "What is the full form of EVM used in Indian elections?",
    options: ["Electronic Voting Module", "Electronic Voting Machine", "Electronic Verification Machine", "Electoral Voting Method"],
    correctIndex: 1,
    explanation: "EVM stands for Electronic Voting Machine. India started using EVMs in elections from 1982, and they are now used in all elections. VVPAT (Voter Verifiable Paper Audit Trail) was added later for transparency.",
  },
  {
    id: "q007",
    question: "Which document is NOT accepted as valid voter ID in Indian elections?",
    options: ["Aadhaar Card", "PAN Card", "Ration Card", "Voter ID Card (EPIC)"],
    correctIndex: 1,
    explanation: "PAN Card is NOT accepted as standalone voter ID. Valid IDs include: Voter ID (EPIC), Aadhaar Card, Passport, Driving Licence, MGNREGA Job Card, Ration Card with photo, and a few others.",
  },
  {
    id: "q008",
    question: "Which alliance has traditionally been the biggest rival of LDF in Kerala elections?",
    options: ["NDA", "UDF", "Third Front", "Grand Alliance"],
    correctIndex: 1,
    explanation: "UDF (United Democratic Front) led by the Indian National Congress has been the main rival of LDF (Left Democratic Front) in Kerala since 1980. The two coalitions have dominated Kerala politics for over 4 decades.",
  },
];
