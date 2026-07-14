# 🩺 The Passion Autopsy

> *A compassionate case file for the passions we've left behind.*

**The Passion Autopsy** is an AI-powered storytelling experience that transforms forgotten hobbies into fictional forensic reports.

Tell the app about a passion you once loved, when it started fading, and what happened. The **Chief Examiner of the Department of Lost Passions** will investigate the case and produce an official autopsy report—complete with a cause of death, supporting evidence, examiner's findings, and an honest assessment of whether that passion still has a chance to return.

Built for the **DEV Weekend Challenge: Passion Edition**.

---

## ✨ Features

- 📝 Describe a forgotten passion in three simple prompts
- 🤖 AI-generated forensic case file written entirely in character
- 📄 Beautiful report with:
  - Case number
  - Status (Deceased, Dormant, Critical, or Missing)
  - Cause of Death
  - Contributing Factors
  - Evidence recovered from your own words
  - Examiner's Findings
  - Resurrection Assessment
  - Closing museum-style inscription
- 🖼️ Download the report as a shareable image
- 📋 Copy the report as plain text
- 💾 Automatic local history (stored only in your browser)
- 🗑️ Delete individual reports or clear all history
- 🔒 No login, database, or tracking

---

## 🚀 Getting Started

```bash
npm install
cp .env.local.example .env.local
```

Add your Gemini API key to `.env.local`:

```env
GEMINI_API_KEY=your_api_key_here
```

Run the development server:

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## 🔑 Environment Variables

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google AI Studio / Gemini API key |

Get an API key from:

https://aistudio.google.com/apikey

---

## ☁️ Deployment

Deploy easily with **Vercel**:

1. Push the repository to GitHub.
2. Import the project into Vercel.
3. Add `GEMINI_API_KEY` to your environment variables.
4. Deploy.

---

## 📂 Project Structure

```text
app/
├── api/autopsy/route.ts     # API route, validation, rate limiting
├── page.tsx                 # Main UI
├── layout.tsx
└── globals.css

lib/
├── history.ts               # localStorage helpers
├── prompt.ts                # Chief Examiner prompt
└── types.ts                 # Shared types & schema validation
```

---

## ⚙️ Technical Highlights

- Uses **Gemini** to generate structured JSON responses.
- Server-side schema validation prevents malformed AI output.
- Prompt-injection protection through isolated input blocks.
- Lightweight per-IP rate limiting and origin checks.
- Reports are saved locally using `localStorage` (no database).
- Image export powered by `html2canvas` with custom fixes for accurate Tailwind color rendering and animation handling.

---

## 🛠️ Built With

- Next.js
- TypeScript
- Tailwind CSS
- Gemini API
- html2canvas

---

## ⚠️ Disclaimer

This project is a fictional storytelling experience designed for personal reflection. It is **not** intended to provide mental health advice or professional guidance.