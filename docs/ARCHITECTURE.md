# System Architecture — Sentinel AI

## High-Level Overview

```
                   ┌─────────────────┐
                   │     FRONTEND    │
                   │  React + TS     │
                   │   (Vite/SPA)    │
                   └────────┬────────┘
                            │
                            │ REST API (JSON over HTTPS)
                            ↓
                   ┌─────────────────┐
                   │     FASTAPI     │
                   │    (backend)    │
                   └────────┬────────┘
                            │
                   InvestigationService
                            │
          ┌─────────────────┼─────────────────────┐
          ↓                 ↓                      ↓
      Connectors      Correlation Engine          AI
   (15+ OSINT APIs)   (entities/relations/    (Gemini summary,
                         pivots, graph)          graceful fallback)
          │                 │                      │
          └────────┬────────┴──────────┬───────────┘
                    ↓                   ↓
              Risk Service       Timeline Service
                    │                   │
                    └─────────┬─────────┘
                               ↓
                     Investigation Response
                               ↓
                          Dashboard UI
                               │
                               ↓
                      MongoDB Atlas (persistence:
                      users, cases, watchlists, alerts)
```

---

## Request Flow — Single Investigation

1. **Frontend** — `SearchBar` captures the query, `detectType()` classifies it (`email` / `username` / `domain` / `phone` / `wallet`), and `investigate()` in `services/api.ts` sends `POST /api/investigate`.

2. **FastAPI route** — validates the request against `InvestigationRequest` (Pydantic), delegates to `InvestigationService.investigate()`.

3. **`InvestigationService`** — based on `query_type`, fans out to the relevant connectors **in parallel** via `asyncio.gather()`, each wrapped in `call_with_resilience()` for timeout/retry handling. Example for a domain query: RDAP, VirusTotal, crt.sh, Wayback, DNS, WHOIS run concurrently; a follow-up IP geolocation lookup runs afterward using the first resolved A record.

4. **Connector results** — each connector returns a standardized `ConnectorResult` (`source`, `success`, `data`, `error`). Failures (timeouts, 4xx/5xx, exceptions) are caught individually — **one failing source does not abort the investigation.**

5. **`EntityCorrelationEngine`** — parses every successful connector's `data` into typed entities (domain, username, email, organization, nameserver, certificate, etc.), tracks per-entity source provenance, and applies correlation rules (e.g. email-local-part ↔ username matching, organization ↔ domain ownership) to produce `entities`, `relationships`, and `pivot_points`.

6. **Downstream services** (all run off the same correlation output):
   - `ProfileService` — builds a consolidated attribute profile
   - `RiskService` — calculates a risk score/level from sources + correlation
   - `CorrelationService` — converts correlation data into graph `nodes`/`edges` for visualization
   - `TimelineService` — extracts and normalizes dated events from RDAP, WHOIS, crt.sh, GitHub, VirusTotal, and Wayback into a consistent, deduplicated, chronologically sorted event list
   - `AISummaryService` — sends collected source data to Gemini for a natural-language summary; falls back to a clear error message (not a crash) on quota/overload/misconfiguration
   - Image correlation and synthetic-identity signal detection run with their own try/except isolation, same principle: a failure here never breaks the whole investigation

7. **Response assembly** — `InvestigationService` combines everything into a single `InvestigationResponse` object, validated by Pydantic before being returned to the frontend.

8. **Frontend rendering** — `Dashboard.tsx` receives the response and distributes slices of it to `SummaryCards`, `LinkAnalysis`, `EntityCorrelation`, `Timeline`, `Copilot` (AI summary), `SourcesTable`, and `ExportBar`.

---

## Design Principles Applied

- **Graceful degradation** — every external dependency (connectors, AI, image correlation) is isolated with its own error handling so a single failing source degrades that one panel, never the whole investigation.
- **Provenance tracking** — every discovered entity records which source(s) it came from, supporting investigator trust/verification.
- **No fabricated data** — the timeline explicitly refuses to invent timestamps; if a source provides no date, no event is created for it.
- **Pluggable connector architecture** — adding a new OSINT source means adding one connector file implementing `BaseConnector.lookup()` and registering it in `InvestigationService`, without touching correlation/timeline/risk logic.

---

## Data Persistence

MongoDB Atlas stores:
- **Users** — registered accounts, credentials (hashed), auth tokens
- **Cases** — saved investigations with tags/notes, linked to a user
- **Watchlist entries** — identifiers being monitored on an interval
- **Alerts** — generated when a watched identifier's investigation results change

A background **APScheduler** job (`services/scheduler.py`) periodically sweeps the watchlist collection to check for changes and generate alerts.

> See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for exact collection field structures.

---

## External Dependencies (Third-Party APIs)

| Service | Purpose | Auth Required |
|---|---|---|
| RDAP (rdap.org) | Domain registration data | No |
| WHOIS | Domain registration data (fallback/supplement to RDAP) | No |
| VirusTotal | Domain reputation/categories | Yes (API key) |
| crt.sh | Certificate Transparency logs | No |
| Wayback Machine (archive.org) | Web archive snapshots | No |
| GitHub API | Username/profile lookups | No (rate-limited without auth) |
| Gravatar | Email-linked avatar/profile data | No |
| Holehe | Email account enumeration across services | No |
| HIBP (Have I Been Pwned) | Breach exposure data | Yes (API key, optional) |
| Google Gemini | AI-generated investigation summaries | Yes (API key) |
| MongoDB Atlas | Persistence layer | Yes (connection string) |

---

## Known Architectural Gaps (as of last review)

- **Rate limiting** on outbound connector requests is not implemented.
- **`resilience.py`**'s actual retry/backoff behavior has not been fully audited against the "handle 429/500/502/503/504 with sensible limits" requirement.
- **Pivot point generation** only scores `email→username` and `username→profile` relationships; `organization→domain` relationships (a common real-world result) do not currently generate pivot suggestions.
- **`/api/sources/health`** endpoint's backend implementation has not been confirmed to exist/function.
