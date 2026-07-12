"use client";

import { useState } from "react";

interface AutopsyReport {
  cause_of_death: string;
  time_of_death: string;
  contributing_factors: string[];
  autopsy_notes: string;
  resurrection_possibility: string;
  case_closing_statement: string;
}

const LOADING_MESSAGES = [
  "Opening the case file...",
  "Dusting for prints...",
  "Reviewing the timeline of events...",
  "Consulting the examiner's notes...",
];

function caseNumber() {
  const n = Math.floor(1000 + Math.random() * 9000);
  const y = new Date().getFullYear();
  return `PA-${y}-${n}`;
}

export default function Home() {
  const [passion, setPassion] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<AutopsyReport | null>(null);
  const [caseNo] = useState(caseNumber());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!passion.trim()) return;

    setLoading(true);
    setError(null);
    setReport(null);

    let msgIndex = 0;
    const interval = setInterval(() => {
      msgIndex = (msgIndex + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[msgIndex]);
    }, 1400);

    try {
      const res = await fetch("/api/autopsy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passion, timeframe, context }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setReport(data.report);
      }
    } catch (err) {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  }

  function reset() {
    setReport(null);
    setPassion("");
    setTimeframe("");
    setContext("");
    setError(null);
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10 sm:py-16">
      <header className="text-center mb-10">
        <p className="uppercase tracking-[0.3em] text-xs text-ink/50 mb-2">
          Case File
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
          The Passion Autopsy
        </h1>
        <p className="mt-3 text-ink/60 font-serif italic text-sm sm:text-base">
          A compassionate case file for the passions we&apos;ve let go.
        </p>
      </header>

      {!report && (
        <form
          onSubmit={handleSubmit}
          className="bg-manila/60 border border-ink/15 rounded-sm shadow-sm p-6 sm:p-8 space-y-5"
        >
          <div>
            <label className="block text-xs uppercase tracking-wider text-ink/60 mb-1">
              What did you used to love?
            </label>
            <input
              value={passion}
              onChange={(e) => setPassion(e.target.value)}
              placeholder="e.g. playing guitar, competitive swimming, writing fiction"
              required
              className="w-full bg-paper border border-ink/20 rounded-sm px-3 py-2 font-serif text-ink placeholder:text-ink/30 focus:outline-none focus:ring-1 focus:ring-ink/40"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-ink/60 mb-1">
              Roughly when did you stop?
            </label>
            <input
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              placeholder="e.g. about 3 years ago, after college, sometime in 2021"
              className="w-full bg-paper border border-ink/20 rounded-sm px-3 py-2 font-serif text-ink placeholder:text-ink/30 focus:outline-none focus:ring-1 focus:ring-ink/40"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-ink/60 mb-1">
              What happened? <span className="text-ink/40">(optional)</span>
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="A sentence or two — what changed, what got in the way, how it ended"
              rows={3}
              className="w-full bg-paper border border-ink/20 rounded-sm px-3 py-2 font-serif text-ink placeholder:text-ink/30 focus:outline-none focus:ring-1 focus:ring-ink/40 resize-none"
            />
          </div>

          {error && (
            <p className="text-stamp text-sm font-serif">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-paper font-serif tracking-wide py-3 rounded-sm hover:bg-ink/90 disabled:opacity-60 transition"
          >
            {loading ? loadingMsg : "Open the Case File"}
          </button>
        </form>
      )}

      {report && (
        <div className="relative bg-paper border border-ink/20 shadow-md rounded-sm p-6 sm:p-10 fade-up">
          <div className="absolute -top-4 -right-3 sm:-top-5 sm:-right-5 stamp-animate">
            <div className="border-4 border-stamp text-stamp font-mono font-bold uppercase text-sm sm:text-base px-3 py-1 rotate-[-8deg] opacity-90">
              Case Closed
            </div>
          </div>

          <div className="flex justify-between items-baseline mb-6 border-b border-ink/20 pb-3">
            <span className="font-mono text-xs text-ink/50">
              CASE NO. {caseNo}
            </span>
            <span className="font-mono text-xs text-ink/50 uppercase">
              Office of Abandoned Passions
            </span>
          </div>

          <h2 className="font-serif text-xl sm:text-2xl font-bold mb-1">
            Subject: {passion}
          </h2>
          <p className="font-mono text-xs text-ink/50 mb-6 uppercase tracking-wide">
            Autopsy Report
          </p>

          <Section label="Cause of Death" value={report.cause_of_death} />
          <Section label="Time of Death" value={report.time_of_death} />

          <div className="mb-5">
            <p className="text-xs uppercase tracking-wider text-ink/50 mb-1 font-mono">
              Contributing Factors
            </p>
            <ul className="list-disc list-inside space-y-1 font-serif text-ink/90">
              {report.contributing_factors?.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>

          <div className="mb-5">
            <p className="text-xs uppercase tracking-wider text-ink/50 mb-1 font-mono">
              Examiner&apos;s Notes
            </p>
            <p className="font-serif text-ink/90 leading-relaxed">
              {report.autopsy_notes}
            </p>
          </div>

          <div className="mb-5">
            <p className="text-xs uppercase tracking-wider text-ink/50 mb-1 font-mono">
              Resurrection Possibility
            </p>
            <p className="font-serif text-ink/90 leading-relaxed">
              {report.resurrection_possibility}
            </p>
          </div>

          <div className="mt-8 pt-4 border-t border-ink/20 text-center">
            <p className="font-serif italic text-ink/70">
              &ldquo;{report.case_closing_statement}&rdquo;
            </p>
          </div>

          <button
            onClick={reset}
            className="mt-8 w-full bg-ink/5 hover:bg-ink/10 border border-ink/20 text-ink font-serif tracking-wide py-3 rounded-sm transition"
          >
            Open a New Case
          </button>
        </div>
      )}
    </main>
  );
}

function Section({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-5">
      <p className="text-xs uppercase tracking-wider text-ink/50 mb-1 font-mono">
        {label}
      </p>
      <p className="font-serif text-ink/90">{value}</p>
    </div>
  );
}
