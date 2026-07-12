# The Passion Autopsy

A compassionate "case file" for the passions we've let go — describe a hobby
you used to love and stopped, and get back an AI-generated autopsy report
exploring why it faded, and whether it could be revived.

Built for the DEV Weekend Challenge: Passion Edition.

## Setup

```bash
npm install
cp .env.local.example .env.local
# then edit .env.local and add your Gemini API key
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Your Google AI Studio / Gemini API key |

Get a key at https://aistudio.google.com/apikey

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import it in Vercel.
3. Add `GEMINI_API_KEY` as an environment variable in the Vercel project settings.
4. Deploy.

## Notes

- The Gemini model used is `gemini-2.0-flash` (set in `app/api/autopsy/route.ts`).
  If you have access to a different model, change `GEMINI_MODEL` there.
- No database is used — everything lives in component state for the session.
