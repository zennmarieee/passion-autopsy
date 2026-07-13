import { NextRequest, NextResponse } from "next/server";
import { buildPrompt } from "@/lib/prompt";
import { isValidAutopsyReport } from "@/lib/types";

// Adjust the model name if you have access to a different Gemini model.
const GEMINI_MODEL = "gemini-3.1-flash-lite";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX_REQUESTS = 5;
const requestLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT_MAX_REQUESTS;
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : "unknown";
}

const MAX_FIELD_LENGTH = 300;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          error:
            "The examiner's office is busy right now — please wait a few minutes before opening another case.",
        },
        { status: 429 }
      );
    }

    const { passion, timeframe, context } = await req.json();

    if (!passion || typeof passion !== "string") {
      return NextResponse.json(
        { error: "Please describe the passion you used to have." },
        { status: 400 }
      );
    }

    if (
      passion.length > MAX_FIELD_LENGTH ||
      (timeframe && timeframe.length > MAX_FIELD_LENGTH) ||
      (context && context.length > MAX_FIELD_LENGTH)
    ) {
      return NextResponse.json(
        { error: `Please keep each field under ${MAX_FIELD_LENGTH} characters.` },
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
          temperature: 0.8,
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

    const cleaned = rawText.replace(/```json|```/g, "").trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("Failed to parse Gemini JSON:", cleaned);
      return NextResponse.json(
        { error: "The report came back unreadable. Please try again." },
        { status: 500 }
      );
    }

    if (!isValidAutopsyReport(parsed)) {
      console.error("Gemini response failed schema validation:", parsed);
      return NextResponse.json(
        { error: "The report came back incomplete. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ report: parsed });
  } catch (err) {
    console.error("Autopsy route error:", err);
    return NextResponse.json(
      { error: "Something went wrong opening the case file." },
      { status: 500 }
    );
  }
}