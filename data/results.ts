export interface ConstituencyResult {
  constituencyId: number;
  constituencyName: string;
  district: string;
  leadingCandidate: string;
  leadingParty: string;
  leadingAlliance: string;
  leadingVotes: number;
  runnerUpCandidate: string;
  runnerUpParty: string;
  runnerUpVotes: number;
  totalVotesCounted: number;
  totalVoters: number;
  status: "Counting" | "Leading" | "Won" | "Pending";
  margin: number;
  roundsComplete: number;
  totalRounds: number;
}

export interface AllianceTally {
  alliance: string;
  won: number;
  leading: number;
  total: number;
  color: string;
  majorityNeeded: number;
}

// Mock partial results — simulating counting in progress
export const RESULTS: ConstituencyResult[] = [
  { constituencyId: 1, constituencyName: "Manjeshwar", district: "Kasaragod", leadingCandidate: "Manjeswaram Sreekant", leadingParty: "BJP", leadingAlliance: "NDA", leadingVotes: 45231, runnerUpCandidate: "T. Hamsa", runnerUpParty: "INC", runnerUpVotes: 42108, totalVotesCounted: 112456, totalVoters: 172453, status: "Leading", margin: 3123, roundsComplete: 8, totalRounds: 12 },
  { constituencyId: 8, constituencyName: "Dharmadom", district: "Kannur", leadingCandidate: "Pinarayi Vijayan", leadingParty: "CPI(M)", leadingAlliance: "LDF", leadingVotes: 78234, runnerUpCandidate: "K. Anil Kumar", runnerUpParty: "INC", runnerUpVotes: 42109, totalVotesCounted: 148901, totalVoters: 179345, status: "Won", margin: 36125, roundsComplete: 12, totalRounds: 12 },
  { constituencyId: 15, constituencyName: "Azhikode", district: "Kannur", leadingCandidate: "V. D. Satheesan", leadingParty: "INC", leadingAlliance: "UDF", leadingVotes: 54321, runnerUpCandidate: "P. Jayaraj", runnerUpParty: "CPI(M)", runnerUpVotes: 48012, totalVotesCounted: 132456, totalVoters: 167845, status: "Won", margin: 6309, roundsComplete: 12, totalRounds: 12 },
  { constituencyId: 48, constituencyName: "Palakkad", district: "Palakkad", leadingCandidate: "K. Surendran", leadingParty: "BJP", leadingAlliance: "NDA", leadingVotes: 62341, runnerUpCandidate: "Shafi Parambil", runnerUpParty: "INC", runnerUpVotes: 61234, totalVotesCounted: 178901, totalVoters: 213456, status: "Leading", margin: 1107, roundsComplete: 10, totalRounds: 14 },
  { constituencyId: 64, constituencyName: "Thrissur", district: "Thrissur", leadingCandidate: "Suresh Gopi", leadingParty: "BJP", leadingAlliance: "NDA", leadingVotes: 58901, runnerUpCandidate: "Benny Behanan", runnerUpParty: "INC", runnerUpVotes: 56234, totalVotesCounted: 165432, totalVoters: 224567, status: "Leading", margin: 2667, roundsComplete: 9, totalRounds: 15 },
  { constituencyId: 45, constituencyName: "Manjeri", district: "Malappuram", leadingCandidate: "P. K. Kunhalikutty", leadingParty: "IUML", leadingAlliance: "UDF", leadingVotes: 73456, runnerUpCandidate: "V. P. Sadanandan", runnerUpParty: "CPI(M)", runnerUpVotes: 38901, totalVotesCounted: 145678, totalVoters: 201234, status: "Won", margin: 34555, roundsComplete: 12, totalRounds: 12 },
  { constituencyId: 76, constituencyName: "Ernakulam", district: "Ernakulam", leadingCandidate: "Hibi Eden", leadingParty: "INC", leadingAlliance: "UDF", leadingVotes: 71234, runnerUpCandidate: "K. J. Shine", runnerUpParty: "CPI(M)", runnerUpVotes: 52109, totalVotesCounted: 168901, totalVoters: 231456, status: "Won", margin: 19125, roundsComplete: 12, totalRounds: 12 },
  { constituencyId: 130, constituencyName: "Thiruvananthapuram", district: "Thiruvananthapuram", leadingCandidate: "Antony Raju", leadingParty: "INC", leadingAlliance: "UDF", leadingVotes: 67234, runnerUpCandidate: "O. Rajagopal", runnerUpParty: "BJP", runnerUpVotes: 54321, totalVotesCounted: 178901, totalVoters: 228901, status: "Won", margin: 12913, roundsComplete: 12, totalRounds: 12 },
  { constituencyId: 133, constituencyName: "Nemom", district: "Thiruvananthapuram", leadingCandidate: "E. Chandrasekharan", leadingParty: "BJP", leadingAlliance: "NDA", leadingVotes: 58901, runnerUpCandidate: "V. K. Prasanth", runnerUpParty: "CPI(M)", runnerUpVotes: 52109, totalVotesCounted: 145678, totalVoters: 183456, status: "Won", margin: 6792, roundsComplete: 12, totalRounds: 12 },
  { constituencyId: 90, constituencyName: "Pala", district: "Kottayam", leadingCandidate: "Jose K. Mani", leadingParty: "KC(M)", leadingAlliance: "UDF", leadingVotes: 54321, runnerUpCandidate: "N. Jayaraj", runnerUpParty: "LJD", runnerUpVotes: 34201, totalVotesCounted: 121456, totalVoters: 174321, status: "Won", margin: 20120, roundsComplete: 12, totalRounds: 12 },
  { constituencyId: 100, constituencyName: "Alappuzha", district: "Alappuzha", leadingCandidate: "T. J. Vinod", leadingParty: "INC", leadingAlliance: "UDF", leadingVotes: 61234, runnerUpCandidate: "A. M. Ariff", runnerUpParty: "CPI(M)", runnerUpVotes: 59012, totalVotesCounted: 155678, totalVoters: 201234, status: "Won", margin: 2222, roundsComplete: 12, totalRounds: 12 },
  { constituencyId: 124, constituencyName: "Varkala", district: "Thiruvananthapuram", leadingCandidate: "Veena George", leadingParty: "CPI(M)", leadingAlliance: "LDF", leadingVotes: 67234, runnerUpCandidate: "V. K. Ibrahim Kutty", runnerUpParty: "INC", runnerUpVotes: 45123, totalVotesCounted: 134567, totalVoters: 178901, status: "Won", margin: 22111, roundsComplete: 12, totalRounds: 12 },
  // Pending constituencies
  { constituencyId: 17, constituencyName: "Mananthavady", district: "Wayanad", leadingCandidate: "-", leadingParty: "-", leadingAlliance: "-", leadingVotes: 0, runnerUpCandidate: "-", runnerUpParty: "-", runnerUpVotes: 0, totalVotesCounted: 0, totalVoters: 148901, status: "Pending", margin: 0, roundsComplete: 0, totalRounds: 10 },
  { constituencyId: 85, constituencyName: "Idukki", district: "Idukki", leadingCandidate: "-", leadingParty: "-", leadingAlliance: "-", leadingVotes: 0, runnerUpCandidate: "-", runnerUpParty: "-", runnerUpVotes: 0, totalVotesCounted: 0, totalVoters: 143210, status: "Pending", margin: 0, roundsComplete: 0, totalRounds: 10 },
];

export const ALLIANCE_TALLY: AllianceTally[] = [
  { alliance: "LDF", won: 48, leading: 12, total: 60, color: "#e63946", majorityNeeded: 71 },
  { alliance: "UDF", won: 43, leading: 15, total: 58, color: "#0077b6", majorityNeeded: 71 },
  { alliance: "NDA", won: 8, leading: 6, total: 14, color: "#f77f00", majorityNeeded: 71 },
  { alliance: "Others", won: 2, leading: 6, total: 8, color: "#6c757d", majorityNeeded: 71 },
];

export const ELECTION_STATS = {
  totalSeats: 140,
  majorityMark: 71,
  totalVoters: 26398885,
  totalBooths: 27498,
  seatsReported: 101,
  seatsPending: 39,
  voterTurnout: 71.3,
  electionDate: "2026-04-23",
  resultDate: "2026-04-25",
};
