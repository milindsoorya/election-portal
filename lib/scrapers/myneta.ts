/**
 * MyNeta / ADR Candidate Data Scraper
 * ------------------------------------
 * Fetches candidate affidavit data from myneta.info.
 *
 * MyNeta provides:
 *   - Candidate name, party, constituency
 *   - Total assets & liabilities (from Form 26 affidavits)
 *   - Criminal cases (pending / convicted)
 *   - Educational qualifications
 *   - Terms served
 *
 * API endpoint: https://myneta.info/api/
 *   GET /myneta/api?action=getCandidates&election_id=<id>
 *   GET /myneta/api?action=getCandidate&candidate_id=<id>
 *
 * Election IDs for Kerala:
 *   2016 Kerala: 217
 *   2021 Kerala: 479
 *   2026 Kerala: TBD — set via MYNETA_KERALA_ELECTION_ID env var
 *
 * If the API is unavailable, falls back to HTML scraping of
 *   https://myneta.info/kerala<year>/index.php?action=show_winners&sort=candidate
 */

import * as cheerio from "cheerio";
import pLimit from "p-limit";
import { withRetry } from "@/lib/retry";

export interface MyNetaCandidate {
  id: string;
  name: string;
  party: string;
  constituency: string;
  constituencyNumber: number;
  age: number | null;
  gender: string | null;
  education: string | null;
  assetsLakh: number;
  liabilitiesLakh: number;
  criminalCasesTotal: number;
  criminalCasesSerious: number;
  termsServed: number;
  isIncumbent: boolean;
  affidavitUrl: string | null;
  profession: string | null;
}

const MYNETA_BASE = "https://myneta.info";
const API_BASE = "https://myneta.info/api";
const RATE_LIMIT = pLimit(5); // max 5 concurrent requests
const TIMEOUT_MS = 12_000;

async function fetchJson<T>(url: string): Promise<T> {
  return withRetry(
    async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        const res = await fetch(url, {
          signal: controller.signal,
          headers: {
            "User-Agent": "IndiaElectionPortal/1.0 (+https://indiaelectionportal.in)",
            Accept: "application/json",
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
        return res.json() as Promise<T>;
      } finally {
        clearTimeout(timer);
      }
    },
    { retries: 3, minTimeout: 2000 }
  );
}

async function fetchHtml(url: string): Promise<string> {
  return withRetry(
    async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        const res = await fetch(url, {
          signal: controller.signal,
          headers: {
            "User-Agent": "IndiaElectionPortal/1.0 (+https://indiaelectionportal.in)",
            Accept: "text/html",
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
        return res.text();
      } finally {
        clearTimeout(timer);
      }
    },
    { retries: 3, minTimeout: 2000 }
  );
}

/**
 * Fetch all candidates for a given MyNeta election ID.
 * Tries the JSON API first, falls back to HTML scraping.
 */
export async function fetchMyNetaCandidates(
  electionId: string
): Promise<MyNetaCandidate[]> {
  console.log(`[MyNeta] Fetching candidates for election ID: ${electionId}`);

  // Try JSON API
  try {
    const url = `${API_BASE}?action=getCandidates&election_id=${electionId}&format=json`;
    const data = await fetchJson<unknown>(url);
    const parsed = parseMyNetaApiResponse(data);
    if (parsed.length > 0) {
      console.log(`[MyNeta] Got ${parsed.length} candidates from API`);
      return parsed;
    }
  } catch (e) {
    console.warn("[MyNeta] API failed, falling back to HTML:", (e as Error).message);
  }

  // Fall back to HTML scraping
  return scrapeMyNetaHtml(electionId);
}

/**
 * Fetch a single candidate's detailed affidavit data.
 */
export async function fetchMyNetaCandidate(
  candidateId: string
): Promise<MyNetaCandidate | null> {
  try {
    const url = `${API_BASE}?action=getCandidate&candidate_id=${candidateId}&format=json`;
    const data = await fetchJson<Record<string, unknown>>(url);
    return parseSingleCandidate(data);
  } catch {
    return null;
  }
}

/**
 * Fetch candidates for multiple constituencies in parallel (rate-limited).
 */
export async function fetchCandidatesBatch(
  electionId: string,
  constituencyNumbers: number[]
): Promise<MyNetaCandidate[]> {
  const tasks = constituencyNumbers.map((acNo) =>
    RATE_LIMIT(() => fetchConstituencyCandidates(electionId, acNo))
  );
  const results = await Promise.allSettled(tasks);

  const candidates: MyNetaCandidate[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") candidates.push(...r.value);
  }
  return candidates;
}

async function fetchConstituencyCandidates(
  electionId: string,
  acNo: number
): Promise<MyNetaCandidate[]> {
  try {
    const url = `${API_BASE}?action=getCandidates&election_id=${electionId}&constituency_no=${acNo}&format=json`;
    const data = await fetchJson<unknown>(url);
    return parseMyNetaApiResponse(data);
  } catch {
    return [];
  }
}

function parseMyNetaApiResponse(data: unknown): MyNetaCandidate[] {
  if (!data || typeof data !== "object") return [];

  // MyNeta API returns: { "candidates": [...] } or just [...]
  const items = Array.isArray(data)
    ? data
    : Array.isArray((data as Record<string, unknown>).candidates)
      ? (data as Record<string, unknown>).candidates as unknown[]
      : Object.values(data as Record<string, unknown>);

  return items
    .filter((item) => item && typeof item === "object")
    .map((item) => parseSingleCandidate(item as Record<string, unknown>))
    .filter(Boolean) as MyNetaCandidate[];
}

function parseSingleCandidate(
  item: Record<string, unknown>
): MyNetaCandidate | null {
  try {
    const assetsRaw = String(item.total_assets || item.assets || "0");
    const liabRaw = String(item.total_liabilities || item.liabilities || "0");

    return {
      id: String(item.candidate_id || item.id || ""),
      name: String(item.candidate_name || item.name || ""),
      party: String(item.party || item.party_name || ""),
      constituency: String(item.constituency_name || item.constituency || ""),
      constituencyNumber: parseInt(String(item.constituency_no || item.ac_no || 0)),
      age: parseIntOrNull(String(item.age || "")),
      gender: normaliseGender(String(item.gender || "")),
      education: String(item.education || item.educational_qualification || "") || null,
      assetsLakh: parseRupeesToLakh(assetsRaw),
      liabilitiesLakh: parseRupeesToLakh(liabRaw),
      criminalCasesTotal: parseInt(String(item.total_criminal_cases || item.criminal_cases || 0)),
      criminalCasesSerious: parseInt(String(item.criminal_cases_serious || 0)),
      termsServed: parseInt(String(item.terms_served || 0)),
      isIncumbent: Boolean(item.is_incumbent || item.incumbent),
      affidavitUrl: String(item.affidavit_url || item.affidavit || "") || null,
      profession: String(item.profession || "") || null,
    };
  } catch {
    return null;
  }
}

/**
 * HTML scraping fallback — parses myneta.info constituency pages.
 * URL pattern: https://myneta.info/kerala2026/index.php?action=show_candidates&constituency_id=<n>
 */
async function scrapeMyNetaHtml(electionId: string): Promise<MyNetaCandidate[]> {
  // First get the list of constituencies from the index page
  const stateSlug = process.env.MYNETA_STATE_SLUG || "kerala2026";
  const indexUrl = `${MYNETA_BASE}/${stateSlug}/index.php?action=show_constituencies`;

  console.log(`[MyNeta] Scraping HTML index: ${indexUrl}`);

  const candidates: MyNetaCandidate[] = [];

  try {
    const html = await fetchHtml(indexUrl);
    const $ = cheerio.load(html);
    const constituencyLinks: { id: string; name: string }[] = [];

    // Extract constituency links from the page
    $("a[href*='constituency_id']").each((_, el) => {
      const href = $(el).attr("href") || "";
      const match = href.match(/constituency_id=(\d+)/);
      if (match) {
        constituencyLinks.push({
          id: match[1],
          name: $(el).text().trim(),
        });
      }
    });

    console.log(`[MyNeta] Found ${constituencyLinks.length} constituencies`);

    // Scrape each constituency in parallel (rate-limited)
    const tasks = constituencyLinks.map(({ id, name }) =>
      RATE_LIMIT(() => scrapeConstituencyPage(stateSlug, id, name))
    );
    const results = await Promise.allSettled(tasks);

    for (const r of results) {
      if (r.status === "fulfilled") candidates.push(...r.value);
    }
  } catch (e) {
    console.error("[MyNeta] HTML scraping failed:", e);
  }

  return candidates;
}

async function scrapeConstituencyPage(
  stateSlug: string,
  constituencyId: string,
  constituencyName: string
): Promise<MyNetaCandidate[]> {
  const url = `${MYNETA_BASE}/${stateSlug}/index.php?action=show_candidates&constituency_id=${constituencyId}`;
  const candidates: MyNetaCandidate[] = [];

  try {
    const html = await fetchHtml(url);
    const $ = cheerio.load(html);

    // MyNeta candidate table columns:
    // S.No | Candidate | Age | Gender | Category | Education | Criminal Cases | Total Assets | Liabilities | Party
    $("table.w3-table tr").each((i, el) => {
      if (i === 0) return; // header
      const cells = $(el).find("td").map((_, c) => $(c).text().trim()).get();
      if (cells.length < 8) return;

      const candidateLink = $(el).find("td:nth-child(2) a");
      const candidateIdMatch = (candidateLink.attr("href") || "").match(/candidate_id=(\d+)/);

      candidates.push({
        id: candidateIdMatch ? candidateIdMatch[1] : `${stateSlug}-${constituencyId}-${i}`,
        name: cells[1] || "",
        party: cells[9] || cells[cells.length - 1] || "",
        constituency: constituencyName,
        constituencyNumber: parseInt(constituencyId) || 0,
        age: parseIntOrNull(cells[2]),
        gender: normaliseGender(cells[3]),
        education: cells[5] || null,
        assetsLakh: parseRupeesToLakh(cells[7] || "0"),
        liabilitiesLakh: parseRupeesToLakh(cells[8] || "0"),
        criminalCasesTotal: parseInt(cells[6]?.split("(")[0]) || 0,
        criminalCasesSerious: 0,
        termsServed: 0,
        isIncumbent: false,
        affidavitUrl: candidateLink.attr("href")
          ? `${MYNETA_BASE}/${stateSlug}/${candidateLink.attr("href")}`
          : null,
        profession: null,
      });
    });
  } catch (e) {
    console.warn(`[MyNeta] Failed to scrape constituency ${constituencyId}:`, e);
  }

  return candidates;
}

// ---- Helpers ----

function parseRupeesToLakh(raw: string): number {
  // ECI affidavit amounts are in Indian numbering: "₹1,23,45,678" or "Rs.12,34,567"
  const cleaned = raw.replace(/[₹Rs.,\s]/gi, "");
  const num = parseInt(cleaned) || 0;
  return Math.round(num / 100000); // convert to lakh
}

function parseIntOrNull(s: string): number | null {
  const n = parseInt(s);
  return isNaN(n) ? null : n;
}

function normaliseGender(raw: string): string | null {
  const s = raw.toUpperCase();
  if (s === "M" || s === "MALE") return "Male";
  if (s === "F" || s === "FEMALE") return "Female";
  if (s === "O" || s === "OTHER") return "Other";
  return null;
}
