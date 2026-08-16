# Sentinel AI — OSINT Investigation Platform

An OSINT (Open Source Intelligence) investigation platform built for law-enforcement-style investigative workflows. Investigators enter an email, username, domain, phone number, or crypto wallet address; the system queries multiple public intelligence sources in parallel, correlates the discovered entities, builds a relationship graph and chronological timeline, scores risk, and presents everything in a single consolidated dashboard.

---

## Features

- **Multi-source OSINT querying** — RDAP, WHOIS, VirusTotal, Certificate Transparency (crt.sh), Wayback Machine, DNS records, GitHub, Gravatar, Holehe, HIBP breach data, username enumeration, IP geolocation, phone/wallet lookups
- **Entity correlation engine** — automatically discovers relationships between entities (e.g. email → username → organization → domain) with confidence scoring
- **Interactive link analysis graph** — visual network of discovered entities and relationships
- **Chronological investigation timeline** — normalized, deduplicated events from every source that provides real dates
- **AI-generated investigation summaries** — via Google Gemini, with graceful fallback if the AI service is unavailable
- **Risk scoring** — automated risk level calculation based on correlated findings
- **Case management** — save, tag, and revisit past investigations
- **Watchlist & alerts** — monitor identifiers for changes over time
- **JSON / CSV / PDF export** — download investigation results
- **User authentication** — register/login, persisted via MongoDB

---

## Tech Stack

**Backend:** Python, FastAPI, `httpx` (async HTTP), MongoDB Atlas (`motor`/`pymongo`), Google Gemini AI (`google-genai`), APScheduler, Pydantic

**Frontend:** React + TypeScript, Vite, Tailwind CSS, Framer Motion, lucide-react, react-hot-toast

---

## Project Structure

```
Shadow-Shield/
├── backend/
│   ├── app/
│   │   ├── api/                 # Route handlers
│   │   ├── connectors/          # One file per OSINT source (RDAP, WHOIS, VirusTotal, etc.)
│   │   ├── database/            # MongoDB connection setup
│   │   ├── models/               # Pydantic schemas (connector, investigation, case, user, watchlist)
│   │   ├── reports/               # PDF export logic
│   │   ├── services/              # Business logic (correlation, timeline, risk, AI summary, profile, scheduler)
│   │   ├── utils/                  # Resilience/retry helpers
│   │   ├── __init__.py
│   │   └── main.py                 # FastAPI application entrypoint
│   ├── .env                        # Environment variables (not committed — see below)
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── App.tsx                  # Entrypoint, renders dashboardV2
    │   ├── main.tsx
    │   ├── index.css
    │   ├── context/     
    │   ├── components/
    │   ├── services/
    │   └── dashboardV2/               
    │       ├── Dashboard.tsx
    │       └── components/
    ├── package.json
    ├── tailwind.config.js
    ├── vite.config.ts
    └── tsconfig.json
```

---

## Prerequisites

- **Python** 3.11+ (tested on 3.13)
- **Node.js** 18+ and npm
- **MongoDB Atlas** account (free tier is sufficient) — or a self-hosted MongoDB instance
- API keys (see [Environment Variables](#environment-variables) below)

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Shadow-Shield
```

### 2. Backend setup

```bash
cd backend
python -m venv venv

# Activate the virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file inside `backend/` (see [Environment Variables](#environment-variables)).

Run the backend:

```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://127.0.0.1:8000`, with interactive docs at `http://127.0.0.1:8000/docs`.

**On first run, check the startup log** — it prints the configuration status of each API key and the database connection:

```
==================================================
VT_API_KEY: configured
GEMINI_API_KEY: configured
HIBP_API_KEY: missing (optional)
MONGO_URI: configured
==================================================
Database: {'connected': True, 'mode': 'mongodb', 'persistent': True}
```

If `Database: {'connected': False, ...}`, see [Troubleshooting](#troubleshooting) below.

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173` (default Vite port).

---

## Environment Variables

Create `backend/.env` with the following:

```env
# MongoDB Atlas connection string
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority

# VirusTotal API key — free tier at https://www.virustotal.com/gui/join-us
VT_API_KEY=your_virustotal_api_key

# Google Gemini API key — from https://ai.google.dev
GEMINI_API_KEY=your_gemini_api_key

# Optional — Have I Been Pwned API key (breach data connector)
HIBP_API_KEY=your_hibp_api_key
```

**No spaces around `=`. No quotes needed unless the value itself contains spaces.**

> ⚠️ **Never commit `.env` to version control.** Ensure it's listed in `.gitignore`.

---

## Running an Investigation (Quick Test)

1. Start both backend and frontend as above.
2. Open `http://localhost:5173` in your browser.
3. Enter a domain (e.g. `google.com`), username, or email in the search bar and click **Investigate**.
4. Results should populate: risk score, entity graph, correlation, timeline, AI summary, and source list.

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| `Database: {'connected': False, ...}` with an SSL handshake error | Your IP isn't in MongoDB Atlas's Network Access allowlist | Atlas dashboard → Network Access → Add Current IP Address |
| VirusTotal source returns `success: false` with a header/`TypeError` | `VT_API_KEY` missing or not loading | Confirm `.env` exists at `backend/.env`, confirm `load_dotenv()` runs in `main.py`, restart the server |
| AI summary shows "Unable to generate AI summary" / mentions `429` or `RESOURCE_EXHAUSTED` | Gemini free-tier daily quota (20 requests/day) exhausted | Wait for quota reset, or upgrade to a paid Gemini tier |
| AI summary shows a `503`/`UNAVAILABLE` error | Gemini servers under temporary high demand (external, not a bug) | Retry after a few minutes |
| crt.sh source returns `HTTP 404` | crt.sh returned zero certificates for the query, or is rate-limiting | Verify directly at `https://crt.sh/?q=<domain>&output=json` in a browser |
| Sign-in modal renders cut off at the top of the screen | A `position: sticky`/`transform` ancestor creates a new CSS containing block for the modal's `position: fixed` | Ensure the modal is rendered as a sibling of any sticky/transformed wrapper, not nested inside it |

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment instructions.

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for a full system architecture overview.

## API Reference

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for endpoint documentation.

## Database Schema

See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for MongoDB collection structures.

---

## License

*(Add your chosen license here — e.g. MIT, Apache 2.0, or proprietary/internal use only.)*
