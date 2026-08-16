# Sentinel AI — OSINT Aggregator & Correlation Platform


## 1. Architecture

```
frontend/                React + Vite + Tailwind + Framer Motion
  src/dashboardV2/        Main investigation dashboard (search, graph, timeline,
                           entity correlation, sources, export, saved cases)
  src/services/api.ts      Thin fetch wrapper around the backend REST API

backend/                 FastAPI (async Python)
  app/connectors/          One file per OSINT source. Each exposes a single
                            async `lookup(query)` returning a ConnectorResult.
  app/services/
    investigation_service.py   Orchestrates connector fan-out per query type
    entity_correlation.py      Extracts entities + relationships from raw
                                connector output, scores confidence, finds
                                pivot points
    correlation_service.py     Builds the graph (nodes/edges) for the
                                link-analysis visualization
    profile_service.py         Rolls correlated entities into a single
                                consolidated profile card
    risk_service.py            Produces a 0-100 risk score + level
    timeline_service.py        Builds a chronological activity timeline
    image_correlation_service.py  Perceptual-hash matching of discovered
                                   profile photos (reverse-image bonus)
    case_service.py            Case-wise save / tag / notes (Mongo)
    monitor_service.py         Watchlist re-checks + alerting (bonus)
    ai_summary_service.py      LLM-generated investigator summary
  app/utils/
    resilience.py             Retry + backoff + circuit breaker + per-source
                               health tracking, wraps every connector call
    transliteration.py        Hindi/Gujarati/Hinglish query variants (bonus)
  app/database/mongo.py     Async Mongo (Motor) connection, shared Atlas
                             cluster, lazy — case/watchlist endpoints degrade
                             to a clear 503 if MONGO_URI isn't set
  app/api/                  investigate.py, cases.py, watchlist.py,
                             sources_health.py — FastAPI routers
```

**Data flow for one investigation:**

1. `POST /api/investigate {query, type}` hits `investigate.py`.
2. `InvestigationService` picks the connector set for that query type and
   fans them out concurrently with `asyncio.gather`, each call wrapped by
   `call_with_resilience` (retry/backoff/circuit-breaker + health recording).
3. Raw connector results go to `EntityCorrelationEngine`, which extracts
   typed entities (email, username, domain, IP, wallet, breach, etc.),
   scores confidence per relationship, and flags pivot points.
4. `ProfileService`, `RiskService`, `CorrelationService` (graph),
   `TimelineService`, and `image_correlation_service` all derive their
   output from the same correlated entity set.
5. `AISummaryService` asks Gemini for a plain-English investigator summary
   and recommendations.
6. Everything is assembled into one `InvestigationResponse` and returned.

## 2. Source Connectors

| Connector | Query type | What it returns | Auth |
|---|---|---|---|
| RDAP | domain | Registrar, dates, registrant org | none |
| WHOIS (fallback) | domain | Supplemental registrant/geo fields RDAP omits | none |
| DNS | domain | A/AAAA/MX/NS/TXT/SOA records, SPF/DMARC hints | none |
| crt.sh | domain | Certificate transparency log entries (subdomains) | none |
| Wayback Machine | domain | Historical snapshot availability | none |
| VirusTotal | domain | Reputation / malicious verdicts | API key |
| GitHub | username | Public profile, repos, bio, avatar | none (rate-limited) |
| Username Enum | username | Presence check across 30 platforms (Sherlock-style) | none |
| Gravatar | email | Linked avatar/profile if registered | none |
| Holehe | email | Which services the email is registered on | none |
| HIBP | email | Breach names/dates/data-classes (not credentials) | API key |
| PhoneIntel | phone | Carrier, region, line type, timezone (libphonenumber) | none |
| Bitcoin | wallet | Balance, tx count, first/last activity | none |
| Ethereum | wallet | Balance, token holdings | free demo key |

All connectors share the same `BaseConnector` interface, so adding a new
source is: drop a new file in `app/connectors/`, implement `lookup()`,
register it in `investigation_service.py`'s per-type fan-out list — no
other code changes required (pluggable connector architecture, objective 1.2).

### Rate-limiting, retries, health (objective 1.3)

`app/utils/resilience.py` wraps every connector call:
- Exponential backoff with jitter, up to 3 attempts, only for errors that
  look transient (timeouts, 429/502/503).
- A circuit breaker trips after 3 consecutive failures and cools a source
  down for 60s so a dead/rate-limited API doesn't get hammered.
- Rolling per-source stats (reliability %, avg latency, last error) are
  exposed at `GET /api/sources/health` and shown live in the sidebar and
  Sources table.

## 3. Entity Correlation Logic (objective 2)

`entity_correlation.py` normalizes every connector's output into typed
entities (`email`, `username`, `domain`, `organization`, `wallet`,
`breach`, `nameserver`, `carrier`, `profile`, ...), de-duplicating by
value and merging their source lists.

Relationships are then derived with explicit rules, each carrying a
confidence score, e.g.:
- `username → profile` (Sherlock match) — confidence scales with how many
  independent sources also surfaced that profile URL.
- `organization → domain`, `email → breach`, `registrar → domain`, etc.

**Pivot points** (objective 2.3) are entities that accumulate confidence
from multiple independent sources/relationships — these are surfaced back
to the UI so an investigator can click straight into the next hop (e.g.
clicking a discovered username re-runs the investigation on it).

## 4. Reverse-Image / Face-Similarity (bonus)

Rather than doing internet-wide facial recognition against a target photo
(the approach used by controversial tools like Clearview/PimEyes),
`image_correlation_service.py` takes a narrower, explainable approach:
it perceptual-hashes (`pHash`) every avatar already discovered by other
connectors (GitHub, Gravatar) and flags pairs with a small Hamming
distance as "same photo reused across platforms" — a strong identity
signal without scraping the open web for biometric matches. A pluggable
hook for true reverse-image search via Google Cloud Vision's Web
Detection API is included (set `GOOGLE_VISION_API_KEY`) for teams that
want to extend it further.

## 5. Monitoring & Alerting (bonus)

`app/services/scheduler.py` runs an APScheduler sweep every 15 minutes.
Any watched target (`POST /api/watchlist`) whose `interval_hours` has
elapsed is re-investigated; if the new entity set contains anything not
seen in the previous snapshot, an alert is written and surfaced via
`GET /api/alerts`.

## 6. Local-Language / Transliteration (bonus)

`GET /api/transliterate?query=priya` returns Devanagari and Gujarati
script variants (or the romanized/Hinglish form if you pass in an Indic
script query), using the `indic_transliteration` library. Useful for
fanning username/search queries out across the way an identity might
actually be spelled online.

## 7. Reporting & Export (objective 4)

- **PDF** — generated client-side with jsPDF, now includes a source-cited
  evidence table (every discovered data point next to the exact connector
  that produced it) in addition to the summary and recommendations.
- **CSV / JSON** — implemented client-side (were "coming soon" stubs
  before); CSV flattens every data point with its source column, JSON
  exports the full raw investigation payload.
- **Case-wise saving, tagging, notes** (objective 4.4) — `POST /api/cases`
  persists a full investigation to MongoDB; `PATCH /api/cases/{id}/notes`
  and `/tags` annotate it; the "Saved Cases" sidebar tab lists and reopens
  them.

## 8. Environment variables (`backend/.env`)

```
PORT=8000
MONGO_URI=            # your Atlas connection string — enables persistent storage.
                       # If left blank, the app automatically falls back to an
                       # in-memory database (mongomock_motor) so everything still
                       # works for local dev/demo — it just won't survive a restart.
SECRET_KEY=            # used to sign JWTs — set this to something real for anything
                       # beyond local testing
ENV=
VT_API_KEY=           # VirusTotal
GEMINI_API_KEY=       # Google Gemini, for AI summaries
HIBP_API_KEY=         # optional — haveibeenpwned.com/API/Key
ETHPLORER_API_KEY=    # optional — defaults to the public "freekey"
GOOGLE_VISION_API_KEY=# optional — enables true reverse-image search (Web Detection)
```

Nothing above is required for the app to run — every feature that needs a
key degrades to a clear "not configured" state (visible in Sources /
Source Health) instead of failing silently or crashing.

## 9. Login & accounts

`POST /api/auth/register`, `/api/auth/login`, `GET /api/auth/me`. Passwords
are hashed with bcrypt; sessions are JWT bearer tokens (7-day expiry),
sent as `Authorization: Bearer <token>` — no cookies, so there's no
cross-origin cookie configuration to fight with between the Vite dev
server and the API.

**Login is optional, not a gate.** Investigations run anonymously same as
before. Signing in only scopes your saved cases and watchlist to your
account instead of the anonymous bucket, and lets you access them from
another device. The Navbar's user icon opens the sign-in/register modal;
signed-in state persists via `localStorage`.

Cases and watchlist entries are strictly owned by whoever created them
(including "anonymous" as its own scope) — every list/get/update/delete
query filters on `user_id` explicitly, so there's no path for one
account (or an anonymous session) to enumerate or reach another's saved
data by guessing an ID.

## 10. Notifications

The bell icon in the Navbar polls `GET /api/alerts` every 30s and shows
an unread badge; clicking the check mark on an alert calls
`POST /api/alerts/{id}/acknowledge`. Alerts are produced by the
watchlist sweep described in section 5.

## 11. Fake / synthetic identity signals

`synthetic_identity_service.py` produces an explainable 0-100 signal
score (not a verdict) from patterns already surfaced by other
connectors: disposable/burner email domains, auto-generated-looking
usernames, near-zero cross-platform footprint, freshly-registered
domains, and a profile photo reused across multiple discovered
profiles. Each contributing signal is returned with a plain-English
reason and the panel carries an explicit disclaimer that these are
patterns to look closer at, not a determination about a real person.
Shown in the "Identity Signals" card in the dashboard.

This is deliberately different from a criminal-background-check
feature (which this project does not and will not include — see
section 12) — it flags account *characteristics* commonly associated
with throwaway/sock-puppet accounts, without asserting anything about
who a real person is or what they've done.

## 12. Cross-case pattern linking

`case_linking_service.py` checks your own saved cases for any that
share a correlated entity (same email, wallet, domain, discovered
profile, etc.) with the investigation you're currently looking at, and
surfaces them in the "Linked to Past Cases" card — click one to reopen
it. Scoped strictly to the same `user_id` as the current session (or
the anonymous bucket), so it can never surface another investigator's
cases.

## 13. IP Geolocation

For domain investigations, once DNS resolves an A record, `IPGeo`
geolocates the first IP via ip-api.com's free, keyless endpoint
(country/region/city/ISP/ASN) — infrastructure metadata, not personal
geolocation of any individual.

## 14. What was intentionally left out

**Criminal background checks.** There's no legitimate general-purpose API
for this. Real criminal record data lives behind jurisdiction-specific
authorized access (court systems, national repositories) and lawfully
querying it typically requires a permissible purpose and often a
licensed provider relationship — not something an OSINT dashboard can
just fetch. The accuracy problem compounds this: names collide
constantly, records get expunged without always being reflected, and
this project's correlation engine works on confidence scores, not
certainty. Auto-attaching "criminal record" to the wrong person because
they share a name with someone else is the kind of output that can end
someone's career or get them harassed — a risk that doesn't go away
because the tool is well-intentioned. Sections 11-12 (synthetic-identity
signals and cross-case linking) cover the legitimate version of "spot
patterns and fake accounts" without making claims about anyone's real
history.

**Arbitrary reverse phone-number lookup (e.g. Truecaller-style "who owns
this number").** There's no legitimate public API for this — Truecaller
and similar services only expose that data through scraping their app's
private endpoints or paid data-broker access, both of which exist
specifically to de-anonymize random people's phone numbers. `PhoneIntel`
sticks to carrier/region/line-type, which is genuinely public metadata.
If your team has a licensed data source for this, the connector
architecture is pluggable enough to add it yourselves.

## 15. Security notes

While wiring up auth, an access-control gap was found and fixed: case and
watchlist queries originally only filtered by `user_id` when a request
*was* authenticated, meaning an anonymous request could list or fetch
cases belonging to any logged-in user by guessing/enumerating their
Mongo ObjectIds. Every case/watchlist/alert query now explicitly filters
on `user_id` (including `None` for anonymous), verified with a test that
confirms a logged-out request gets a 404 on another user's case.

`SECRET_KEY` in `.env` signs every JWT — treat it like a password. The
placeholder default in `security.py` is intentionally obviously insecure
so it's not mistaken for a real one in production.

## 16. Running it

```bash
# backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# frontend
cd frontend
npm install
npm run dev
```
