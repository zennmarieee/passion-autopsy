export type CaseStatus = "Deceased" | "Dormant" | "Critical" | "Missing";

export interface AutopsyReport {
  status: CaseStatus;
  cause_of_death: string;
  time_of_death: string;
  contributing_factors: string[];
  recovered_evidence: string;
  autopsy_findings: string;
  resurrection_possibility: string;
  case_closing_statement: string;
}

const VALID_STATUSES: CaseStatus[] = ["Deceased", "Dormant", "Critical", "Missing"];

/**
 * Validates that a parsed JSON object actually matches the AutopsyReport
 * shape before we trust it and send it to the client. Gemini generally
 * follows the schema, but this guards against malformed or partial
 * responses breaking the frontend silently.
 */
export function isValidAutopsyReport(obj: unknown): obj is AutopsyReport {
  if (!obj || typeof obj !== "object") return false;
  const r = obj as Record<string, unknown>;

  const requiredStrings: (keyof AutopsyReport)[] = [
    "cause_of_death",
    "time_of_death",
    "recovered_evidence",
    "autopsy_findings",
    "resurrection_possibility",
    "case_closing_statement",
  ];

  for (const key of requiredStrings) {
    if (typeof r[key] !== "string" || !(r[key] as string).trim()) {
      return false;
    }
  }

  if (typeof r.status !== "string" || !VALID_STATUSES.includes(r.status as CaseStatus)) {
    return false;
  }

  if (
    !Array.isArray(r.contributing_factors) ||
    r.contributing_factors.length === 0 ||
    !r.contributing_factors.every((f) => typeof f === "string" && f.trim())
  ) {
    return false;
  }

  return true;
}