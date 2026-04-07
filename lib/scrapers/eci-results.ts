/**
 * ECI Results Scraper
 * -------------------
 * Scrapes https://results.eci.gov.in for live counting data.
 *
 * ECI publishes state election results at URLs like:
 *   https://results.eci.gov.in/ResultAcGenMar2022/   (UP 2022)
 *   https://results.eci.gov.in/AcResultGenJune2024/  (some 2024 states)
 *
 * The HTML contains a table with constituency-wise results.
 * We also check the JSON endpoint they expose via XHR for quicker parsing.
 *
 * For the Kerala 2026 election, the base URL will be set in ECI_RESULTS_URL
 * env variable once the election is announced.
 */

import * as cheerio from "cheerio";
import pRetry from "p-retry";

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

const DEFAULT_TIMEOUT_MS = 10_000;

// Fetch with timeout + retry
async function fetchWithRetry(url: string, opts?: RequestInit): Promise<string> {
  return pRetry(
    async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
      try {
        const res = await fetch(url, {
          ...opts,
          signal: controller.signal,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (compatible; IndiaElectionPortal/1.0; +https://indiaelectionportal.in/bot)",
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
      maxTimeout: 8000,
      onFailedAttempt: (err) =>
        console.warn(`[ECI] Attempt ${err.attemptNumber} failed: ${err.message}`),
    }
  );
}

/**
 * Parses the ECI state results page.
 * ECI uses a consistent HTML structure with a table id="resulttable"
 * containing constituency-wise rows.
 *
 * Columns (typical):
 *   AC# | Constituency | Leading Candidate | Leading Party | Trailing Candidate | Trailing Party | Margin | Status
 */
export async function scrapeEciResults(
  baseUrl: string
): Promise<EciConstituencyResult[]> {
  // ECI typically has a results index page listing all constituencies
  const indexUrl = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";

  console.log(`[ECI] Fetching results index: ${indexUrl}`);

  // Try the JSON endpoint first (ECI exposes this for their own frontend)
  const jsonResult = await tryJsonEndpoint(indexUrl);
  if (jsonResult) return jsonResult;

  // Fall back to HTML scraping
  const html = await fetchWithRetry(indexUrl);
  return parseEciHtml(html);
}

/**
 * ECI results portal exposes a JSON API at:
 *   /ConstituencywiseS01.json  (for state 01 etc.)
 * Try to fetch it before falling back to HTML.
 */
async function tryJsonEndpoint(
  baseUrl: string
): Promise<EciConstituencyResult[] | null> {
  // Common ECI JSON endpoints for state elections
  const jsonPaths = [
    "ConstituencywiseS21.json",  // Kerala is state 21
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
      // Not available at this path, try next
    }
  }
  return null;
}

/** Parse ECI-style JSON response (structure varies slightly year to year) */
function parseEciJson(data: unknown): EciConstituencyResult[] {
  const rows: EciConstituencyResult[] = [];

  // ECI JSON shape (observed from past elections):
  // { "N01": { "cname": "Perambra", "c1": "Candidate A", "p1": "CPI(M)", ... }, ... }
  // Or it may be an array
  const items = Array.isArray(data) ? data : Object.values(data as Record<string, unknown>);

  for (const item of items as Record<string, unknown>[]) {
    try {
      const status = normaliseStatus(String(item.status || item.sts || "Pending"));
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
        status,
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

/** Parse ECI results from HTML (the classic table at #resulttable) */
function parseEciHtml(html: string): EciConstituencyResult[] {
  const $ = cheerio.load(html);
  const rows: EciConstituencyResult[] = [];

  // ECI HTML uses table rows — columns may vary but the order is consistent
  $("table#resulttable tr, table.table-result tr").each((i, el) => {
    if (i === 0) return; // skip header row

    const cells = $(el)
      .find("td")
      .map((_, c) => $(c).text().trim())
      .get();

    if (cells.length < 6) return;

    try {
      // Typical column order from ECI HTML:
      // 0: AC No | 1: Constituency | 2: Leading Cand | 3: Leading Party | 4: Trailing Cand | 5: Trailing Party | 6: Margin | 7: Status
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

/**
 * Scrape party-wise tally from ECI results page.
 * ECI shows a summary table at the top.
 */
export async function scrapeEciPartyTally(
  baseUrl: string
): Promise<EciPartyTally[]> {
  const url = (baseUrl.endsWith("/") ? baseUrl : baseUrl + "/") + "partywiseresult-S21.htm";
  try {
    const html = await fetchWithRetry(url);
    return parsePartyTallyHtml(html);
  } catch {
    console.warn("[ECI] Party tally page not available, computing from constituency results");
    return [];
  }
}

function parsePartyTallyHtml(html: string): EciPartyTally[] {
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
}

function normaliseStatus(raw: string): EciConstituencyResult["status"] {
  const s = raw.toLowerCase();
  if (s.includes("won") || s.includes("elected")) return "Won";
  if (s.includes("lead")) return "Leading";
  if (s.includes("count")) return "Counting";
  return "Pending";
}
