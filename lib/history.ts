import type { AutopsyReport } from "./types";

export interface HistoryEntry {
  id: string; // case number, doubles as a unique id
  passion: string;
  caseDate: string;
  report: AutopsyReport;
}

const STORAGE_KEY = "passion-autopsy-history";
const MAX_ENTRIES = 20;

/**
 * All history lives in the browser's localStorage only — nothing is sent
 * to a server. Wrapped in try/catch since localStorage can throw in
 * private browsing modes or when full.
 */
export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addHistoryEntry(entry: HistoryEntry): HistoryEntry[] {
  const current = getHistory();
  const updated = [entry, ...current].slice(0, MAX_ENTRIES);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Storage full or unavailable — fail silently, history is a nice-to-have.
  }
  return updated;
}

export function removeHistoryEntry(id: string): HistoryEntry[] {
  const updated = getHistory().filter((e) => e.id !== id);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
}

export function clearHistory(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}