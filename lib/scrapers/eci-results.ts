/**
 * ECI Results Scraper
 * -------------------
 * Scrapes https://results.eci.gov.in for live counting data.
 */

import * as cheerio from "cheerio";
import { withRetry } from "@/lib/retry";

export interface EciConstituencyResult {
  constituencyNumber: number;
  constituencyName: string;
  leadingCandidate: string;
  leadingParty: string;
  leadingVotes: number;
  trailingCandidate: string;
  trailingParty: string;
  trailingVotes: number;
  margin: number;
  status: "Won" | "Leading" | "Counting" | "Pending";
  totalVotesCounted: number;
  roundsComplete: number;
  totalRounds: number;
}

export interface EciPartyTally {
  party: string;
  won: number;
  leading: number;
  total: number;
}

const TIMEOUT_MS = 10_000;

async function fetchWithRetry(url: string, opts?: RequestInit): Promise<string> {
  return withRetry(
    async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        const res = await fetch(url, {
          ...opts,
          signal: controller.signal,
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; IndiaElectionPortal/1.0)",
            Accept: "text/html,application/xhtml+xml,application/json,*/*",
            ...opts?.headers,
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
        return res.text();
      } finally {
        clearTimeout(timer);
      }
    },
    {
      retries: 3,
      minTimeout: 2000,
      onFailedAttempt: (err, attempt) =>
        console.warn(`[ECI] Attempt ${attempt} failed: ${err.message}`),
    }
  );
}

export async function scrapeEciResults(baseUrl: string): Promise<EciConstituencyResult[]> {
  const indexUrl = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";
  console.log(`[ECI] Fetching results index: ${indexUrl}`);

  const jsonResult = await tryJsonEndpoint(indexUrl);
  if (jsonResult) return jsonResult;

  const html = await fetchWithRetry(indexUrl);
  return parseEciHtml(html);
}

async function tryJsonEndpoint(baseUrl: string): Promise<EciConstituencyResult[] | null> {
  const jsonPaths = [
    "ConstituencywiseS21.json",
    "ConstituencyWiseResult.json",
    "result.json",
  ];

  for (const path of jsonPaths) {
    try {
      const url = baseUrl + path;
      console.log(`[ECI] Trying JSON endpoint: ${url}`);
      const text = await fetchWithRetry(url);
      const data = JSON.parse(text);
      return parseEciJson(data);
    } catch {
      // Try next path
    }
  }
  return null;
}

function parseEciJson(data: unknown): EciConstituencyResult[] {
  const rows: EciConstituencyResult[] = [];
  const items = Array.isArray(data) ? data : Object.values(data as Record<string, unknown>);

  for (const item of items as Record<string, unknown>[]) {
    try {
      rows.push({
        constituencyNumber: parseInt(String(item.ac_no || item.acno || item.no || 0)),
        constituencyName: String(item.ac_name || item.cname || item.name || ""),
        leadingCandidate: String(item.leading_candidate || item.c1 || item.winner || ""),
        leadingParty: String(item.leading_party || item.p1 || ""),
        leadingVotes: parseInt(String(item.leading_votes || item.v1 || 0)),
        trailingCandidate: String(item.trailing_candidate || item.c2 || ""),
        trailingParty: String(item.trailing_party || item.p2 || ""),
        trailingVotes: parseInt(String(item.trailing_votes || item.v2 || 0)),
        margin: parseInt(String(item.margin || item.mrg || 0)),
        status: normaliseStatus(String(item.status || item.sts || "Pending")),
        totalVotesCounted: parseInt(String(item.total_votes || item.tv || 0)),
        roundsComplete: parseInt(String(item.rounds || item.rnd || 0)),
        totalRounds: parseInt(String(item.total_rounds || item.trnd || 0)),
      });
    } catch (e) {
      console.warn("[ECI] Failed to parse result row:", e);
    }
  }
  return rows;
}

function parseEciHtml(html: string): EciConstituencyResult[] {
  const $ = cheerio.load(html);
  const rows: EciConstituencyResult[] = [];

  $("table#resulttable tr, table.table-result tr").each((i, el) => {
    if (i === 0) return;
    const cells = $(el).find("td").map((_, c) => $(c).text().trim()).get();
    if (cells.length < 6) return;

    try {
      rows.push({
        constituencyNumber: parseInt(cells[0]) || 0,
        constituencyName: cells[1] || "",
        leadingCandidate: cells[2] || "",
        leadingParty: cells[3] || "",
        leadingVotes: parseInt(cells[8]?.replace(/,/g, "") || "0") || 0,
        trailingCandidate: cells[4] || "",
        trailingParty: cells[5] || "",
        trailingVotes: parseInt(cells[9]?.replace(/,/g, "") || "0") || 0,
        margin: parseInt(cells[6]?.replace(/,/g, "") || "0") || 0,
        status: normaliseStatus(cells[7] || "Pending"),
        totalVotesCounted: 0,
        roundsComplete: 0,
        totalRounds: 0,
      });
    } catch (e) {
      console.warn("[ECI] Failed to parse HTML row:", cells, e);
    }
  });

  console.log(`[ECI] Parsed ${rows.length} results from HTML`);
  return rows;
}

export async function scrapeEciPartyTally(baseUrl: string): Promise<EciPartyTally[]> {
  const url = (baseUrl.endsWith("/") ? baseUrl : baseUrl + "/") + "partywiseresult-S21.htm";
  try {
    const html = await fetchWithRetry(url);
    const $ = cheerio.load(html);
    const tallies: EciPartyTally[] = [];
    $("table tr").each((i, el) => {
      if (i === 0) return;
      const cells = $(el).find("td").map((_, c) => $(c).text().trim()).get();
      if (cells.length < 3) return;
      tallies.push({
        party: cells[0],
        won: parseInt(cells[1]) || 0,
        leading: parseInt(cells[2]) || 0,
        total: (parseInt(cells[1]) || 0) + (parseInt(cells[2]) || 0),
      });
    });
    return tallies;
  } catch {
    console.warn("[ECI] Party tally page not available");
    return [];
  }
}

function normaliseStatus(raw: string): EciConstituencyResult["status"] {
  const s = raw.toLowerCase();
  if (s.includes("won") || s.includes("elected")) return "Won";
  if (s.includes("lead")) return "Leading";
  if (s.includes("count")) return "Counting";
  return "Pending";
}
