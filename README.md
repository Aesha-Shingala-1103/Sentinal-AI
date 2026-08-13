# Sentinel AI

AI-powered OSINT Investigation Platform.

## Project Structure

```
.
├── frontend/          # React (Vite) client
└── backend/           # FastAPI server
```

## Prerequisites

- Node.js 18+
- Python 3.11+

## Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Health check: `GET http://localhost:8000/` → `{"status":"Sentinel AI Backend Running"}`

API docs: `http://localhost:8000/docs`

## Frontend

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:5173`

## Architecture

### Frontend

| Layer       | Purpose                                      |
|-------------|----------------------------------------------|
| `pages/`    | Route-level views                            |
| `components/` | Reusable UI building blocks                |
| `services/` | API client (Axios)                           |

### Backend

| Layer         | Purpose                                      |
|---------------|----------------------------------------------|
| `api/`        | HTTP route handlers                          |
| `connectors/` | External OSINT data source integrations      |
| `services/`   | Business logic (correlation, graph, risk…)   |
| `models/`     | Pydantic schemas and domain models           |
| `database/`   | Persistence layer                            |
| `reports/`    | Report generation and export                 |
| `utils/`      | Shared helpers                               |

## License

Proprietary — Sentinel AI
