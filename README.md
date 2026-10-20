# Phishing Scutum — Full-Stack Job-Safety Intelligence

Phishing Scutum is a React + JavaScript + Express + MongoDB prototype for explainable job-scam risk analysis. It is designed to run locally with MongoDB optional: if MongoDB is unavailable, the API uses an in-memory store for development/demo use.

## Stack
- Frontend: React 19, JavaScript, Vite, React Router, Axios, Recharts, Lucide
- Backend: Node.js, Express, JavaScript, Zod, JWT, bcryptjs
- Data: MongoDB/Mongoose with in-memory fallback
- Risk engine: contextual, explainable text + URL + recruiter-behaviour + psychological-trigger signals
- Batch engine: concurrent analysis with a controlled 10,000–60,000 ms response window

## Run in VS Code

Requirements: Node.js 20+ and npm 10+. The entire frontend and backend source is JavaScript (React JSX on the frontend).

```powershell
cd D:\pjs\Phishing Scutum-Prototype
npm install
npm run install:all
npm run dev
```

Open `http://localhost:5173`.

If you want to start services separately:

```powershell
npm --prefix "D:\pjs\Phishing Scutum-Prototype\backend" run dev
npm --prefix "D:\pjs\Phishing Scutum-Prototype\frontend" run dev
```

Do not run `npm --prefix backend run dev` while your current directory is `frontend`; that would incorrectly resolve to `frontend/backend`.

## Demo login
- Email: `demo@PhishingScutum.app`
- Password: `Demo@12345`

The demo account is created on first login and is an admin account so the admin dashboard can be demonstrated.

## Features
- Landing page and responsive authentication
- Login/register with JWT sessions
- Explainable 0–100 risk scoring
- URL and recruiter-message signals
- Psychological manipulation analysis: scarcity/urgency, greed/desire and fear/anxiety
- Multi-signal context aggregation with confidence, signal breakdown and safe-apply verification checks
- Company verification records/fallback domain information
- Scan history and deletion
- Suspicious-offer reporting
- Admin metrics and risk distribution chart
- Light/dark mode
- Performance Lab for up to 10,000 analyses per request
- Configurable 10,000–60,000 ms batch completion window
- Optional bulk persistence of batch results

## 10,000-analysis timing feature
`POST /api/analyze/batch` accepts up to 10,000 inputs. `targetMs` is clamped to 10,000–60,000 ms. The analysis runs concurrently and, when computation finishes before the selected target, the server waits until the target before responding. This gives a predictable benchmark window rather than pretending each individual analysis takes 10–60 seconds.

Example payload shape:

```json
{
  "items": [{"inputText":"Pay a registration fee today", "url":"https://example.com/apply"}],
  "targetMs": 10000,
  "concurrency": 128,
  "persist": false
}
```

## Important
Risk scores are estimates, not proof that a job is fraudulent. The local prototype does not make external claims about real companies and does not process payments.
