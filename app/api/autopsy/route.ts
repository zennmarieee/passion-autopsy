import { NextRequest, NextResponse } from "next/server";

// Adjust the model name if you have access to a different Gemini model.
const GEMINI_MODEL = "gemini-3.1-flash-lite";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

interface AutopsyReport {
  cause_of_death: string;
  time_of_death: string;
  contributing_factors: string[];
  autopsy_notes: string;
  resurrection_possibility: string;
  case_closing_statement: string;
}

function buildPrompt(passion: string, timeframe: string, context: string) {
  return `You are a compassionate forensic examiner writing an "autopsy report" for an abandoned passion or hobby — this is a metaphor, not a real death. Never be mocking, generic, or clinical-cold. Be warm, specific, and a little wry, like a thoughtful friend who happens to write like a case file.

Passion in question: "${passion}"
Roughly when it faded: "${timeframe}"
Additional context from the person (may be empty): "${context || "none provided"}"

Write a JSON object with exactly these keys:
- "cause_of_death": a short, punchy phrase (5-10 words) naming the most likely cause, written like an official cause-of-death line but insightful and specific to what was described.
- "time_of_death": a short phrase restating when it likely faded, in report style (e.g. "Approximately early 2022, though signs of decline appeared months prior.").
- "contributing_factors": an array of exactly 3 short bullet-style factors (each under 15 words) that plausibly contributed, based on common patterns of why passions fade (time, identity shift, external pressure, comparison, burnout, life changes, etc.) — grounded in what the person shared.
- "autopsy_notes": a paragraph (4-6 sentences) written in first-person-examiner voice, showing genuine insight into why passions like this one commonly fade, tying it back to what the person described. Avoid generic self-help language.
- "resurrection_possibility": a short paragraph (2-4 sentences) honestly assessing whether and how this could realistically be revived — not falsely optimistic, not dismissive.
- "case_closing_statement": a single, poignant closing sentence, the kind that would stick with someone after reading the report.

Return ONLY valid JSON with no markdown fences, no preamble, and no trailing commentary.`;
}

export async function POST(req: NextRequest) {
  try {
    const { passion, timeframe, context } = await req.json();

    if (!passion || typeof passion !== "string") {
      return NextResponse.json(
        { error: "Please describe the passion you used to have." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server is missing GEMINI_API_KEY." },
        { status: 500 }
      );
    }

    const prompt = buildPrompt(passion, timeframe || "unspecified", context || "");

    const geminiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API error:", errText);
      return NextResponse.json(
        { error: "The examiner's office is unreachable right now. Try again shortly." },
        { status: 502 }
      );
    }

    const data = await geminiRes.json();
    const rawText: string | undefined =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return NextResponse.json(
        { error: "No report could be generated. Try rephrasing your passion." },
        { status: 500 }
      );
    }

    // Defensive cleanup in case the model wraps the JSON in fences anyway.
    const cleaned = rawText.replace(/```json|```/g, "").trim();

    let report: AutopsyReport;
    try {
      report = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("Failed to parse Gemini JSON:", cleaned);
      return NextResponse.json(
        { error: "The report came back unreadable. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ report });
  } catch (err) {
    console.error("Autopsy route error:", err);
    return NextResponse.json(
      { error: "Something went wrong opening the case file." },
      { status: 500 }
    );
  }
}
