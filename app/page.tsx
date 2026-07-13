"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";

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
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

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

async function downloadImage() {
    if (!reportRef.current || !report) return;
    setDownloading(true);
    try {
      const sourceNode = reportRef.current;
      const canvas = await html2canvas(sourceNode, {
        backgroundColor: "#f2ede3",
        scale: 2,
        useCORS: true,
        onclone: (clonedDoc, clonedElement) => {
          const originalEls = sourceNode.querySelectorAll<HTMLElement>("*");
          const clonedEls = clonedElement.querySelectorAll<HTMLElement>("*");

          const applyResolvedColors = (src: HTMLElement, dst: HTMLElement) => {
            const cs = window.getComputedStyle(src);
            dst.style.color = cs.color;
            dst.style.backgroundColor = cs.backgroundColor;
            dst.style.borderColor = cs.borderColor;
            dst.style.borderTopColor = cs.borderTopColor;
            dst.style.borderBottomColor = cs.borderBottomColor;
            dst.style.borderLeftColor = cs.borderLeftColor;
            dst.style.borderRightColor = cs.borderRightColor;

            // The card and the "Case Closed" stamp use CSS animations that
            // start at opacity: 0. html2canvas clones the DOM into a fresh
            // element, which restarts those animations from their initial
            // keyframe — and it rasterizes before the animation finishes,
            // capturing the near-invisible starting state. Force the
            // animation off and opacity to its finished value.
            dst.style.animation = "none";
            dst.style.transition = "none";
            dst.style.opacity = "1";
          };

          applyResolvedColors(sourceNode, clonedElement);
          originalEls.forEach((el, i) => {
            const clone = clonedEls[i];
            if (clone) applyResolvedColors(el, clone);
          });
        },
      });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      const safeName = passion.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) || "case";
      link.download = `passion-autopsy-${safeName}-${caseNo}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate image:", err);
      setError("Couldn't generate the image. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  async function copyAsText() {
    if (!report) return;
    const text = [
      `THE PASSION AUTOPSY — CASE NO. ${caseNo}`,
      `Subject: ${passion}`,
      ``,
      `Cause of Death: ${report.cause_of_death}`,
      `Time of Death: ${report.time_of_death}`,
      ``,
      `Contributing Factors:`,
      ...report.contributing_factors.map((f) => `- ${f}`),
      ``,
      `Examiner's Notes: ${report.autopsy_notes}`,
      ``,
      `Resurrection Possibility: ${report.resurrection_possibility}`,
      ``,
      `"${report.case_closing_statement}"`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      setError("Couldn't copy to clipboard.");
    }
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
        <div
          ref={reportRef}
          className="relative bg-paper border border-hairline shadow-md rounded-sm p-6 sm:p-10 fade-up"
        >
          <div className="absolute -top-4 -right-3 sm:-top-5 sm:-right-5 stamp-animate">
            <div className="border-4 border-stamp text-stamp font-mono font-bold uppercase text-sm sm:text-base px-3 py-1 rotate-[-8deg]">
              Case Closed
            </div>
          </div>

          <div className="flex justify-between items-baseline mb-6 border-b border-hairline pb-3">
            <span className="font-mono text-xs text-inkFaint">
              CASE NO. {caseNo}
            </span>
            <span className="font-mono text-xs text-inkFaint uppercase">
              Office of Abandoned Passions
            </span>
          </div>

          <h2 className="font-serif text-xl sm:text-2xl font-bold mb-1 text-ink">
            Subject: {passion}
          </h2>
          <p className="font-mono text-xs text-inkFaint mb-6 uppercase tracking-wide">
            Autopsy Report
          </p>

          <Section label="Cause of Death" value={report.cause_of_death} />
          <Section label="Time of Death" value={report.time_of_death} />

          <div className="mb-5">
            <p className="text-xs uppercase tracking-wider text-inkFaint mb-1 font-mono">
              Contributing Factors
            </p>
            <ul className="list-disc list-inside space-y-1 font-serif text-inkStrong">
              {report.contributing_factors?.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>

          <div className="mb-5">
            <p className="text-xs uppercase tracking-wider text-inkFaint mb-1 font-mono">
              Examiner&apos;s Notes
            </p>
            <p className="font-serif text-inkStrong leading-relaxed">
              {report.autopsy_notes}
            </p>
          </div>

          <div className="mb-5">
            <p className="text-xs uppercase tracking-wider text-inkFaint mb-1 font-mono">
              Resurrection Possibility
            </p>
            <p className="font-serif text-inkStrong leading-relaxed">
              {report.resurrection_possibility}
            </p>
          </div>

          <div className="mt-8 pt-4 border-t border-hairline text-center">
            <p className="font-serif italic text-inkSoft">
              &ldquo;{report.case_closing_statement}&rdquo;
            </p>
          </div>
        </div>
      )}

      {report && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={downloadImage}
            disabled={downloading}
            className="bg-ink text-paper font-serif tracking-wide py-3 rounded-sm hover:bg-ink/90 disabled:opacity-60 transition"
          >
            {downloading ? "Preparing image..." : "Download as Image"}
          </button>
          <button
            onClick={copyAsText}
            className="bg-ink/5 hover:bg-ink/10 border border-ink/20 text-ink font-serif tracking-wide py-3 rounded-sm transition"
          >
            {copied ? "Copied!" : "Copy as Text"}
          </button>
          <button
            onClick={reset}
            className="bg-ink/5 hover:bg-ink/10 border border-ink/20 text-ink font-serif tracking-wide py-3 rounded-sm transition"
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
      <p className="text-xs uppercase tracking-wider text-inkFaint mb-1 font-mono">
        {label}
      </p>
      <p className="font-serif text-inkStrong">{value}</p>
    </div>
  );
}