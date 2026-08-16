# Deployment Instructions — Sentinel AI

This covers deploying the backend (FastAPI) and frontend (React/Vite) separately, plus MongoDB Atlas configuration. Adjust specifics to whichever hosting provider you choose — the steps below use common, beginner-friendly options.

---

## 1. Database — MongoDB Atlas (Production Checklist)

1. Create a **dedicated production cluster** separate from your dev cluster, if possible.
2. Under **Network Access**, **do not leave `0.0.0.0/0` (allow-all) enabled in production.** Instead, whitelist the specific static IP(s) of your deployed backend server. Most hosting providers (Render, Railway, etc.) publish their static egress IPs, or provide a way to obtain one.
3. Under **Database Access**, create a dedicated database user for production with a strong, unique password (not the same credentials used in local dev).
4. Copy the new production connection string for use as `MONGO_URI` in your deployed backend's environment variables (see below) — **never reuse or commit development credentials.**

---

## 2. Backend Deployment (FastAPI)

### Option A — Render / Railway / Fly.io (recommended for simplicity)

1. Push your backend code to GitHub (see [Version Control Setup](#4-version-control-setup) below).
2. Create a new **Web Service** on your chosen platform, pointing to the `backend/` directory.
3. Set the **build command**:
   ```bash
   pip install -r requirements.txt
   ```
4. Set the **start command**:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
   (Most platforms inject a `$PORT` environment variable automatically.)
5. Add all required environment variables in the platform's dashboard (do **not** upload your `.env` file directly):
   - `MONGO_URI`
   - `VT_API_KEY`
   - `GEMINI_API_KEY`
   - `HIBP_API_KEY` (optional)
6. Deploy, then check the service logs for the same startup confirmation block used in local dev:
   ```
   VT_API_KEY: configured
   GEMINI_API_KEY: configured
   MONGO_URI: configured
   Database: {'connected': True, ...}
   ```

### Option B — Docker (portable across any host)

Create `backend/Dockerfile`:
```dockerfile
FROM python:3.13-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t sentinel-ai-backend .
docker run -p 8000:8000 --env-file .env sentinel-ai-backend
```

---

## 3. Frontend Deployment (React/Vite)

### Option A — Vercel / Netlify (recommended)

1. Push your frontend code to GitHub.
2. Import the repository into Vercel/Netlify, setting the **root directory** to `frontend/`.
3. Build command: `npm run build`
4. Output directory: `dist`
5. **Update the API base URL** before deploying — currently hardcoded in `frontend/src/services/api.ts`:
   ```ts
   const API_BASE = "http://127.0.0.1:8000";
   ```
   Change this to your deployed backend's public URL, ideally via an environment variable:
   ```ts
   const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
   ```
   Then set `VITE_API_BASE_URL` in Vercel/Netlify's environment variable settings to your production backend URL.

### Option B — Static hosting (any provider)

```bash
cd frontend
npm run build
```
This produces a `dist/` folder — upload its contents to any static host (S3 + CloudFront, GitHub Pages, etc.).

---

## 4. Version Control Setup

If the project isn't already in Git:

```bash
cd Shadow-Shield
git init
```

Create a `.gitignore` at the project root (if one doesn't already exist) including at minimum:
```
# Backend
backend/.env
backend/venv/
backend/__pycache__/
backend/app/**/__pycache__/
*.pyc

# Frontend
frontend/node_modules/
frontend/dist/

# OS
.DS_Store
Thumbs.db
```

Then:
```bash
git add -A
git commit -m "Initial commit"
```

Create a new repository on GitHub (via the GitHub website — click **New Repository**, don't initialize with a README since you already have one), then:
```bash
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git branch -M main
git push -u origin main
```

**⚠️ Before your first push, double-check `.env` is not tracked:**
```bash
git status
```
If `backend/.env` appears in the list of files to be committed, it means `.gitignore` isn't catching it — stop and fix `.gitignore` before pushing, to avoid leaking API keys and database credentials publicly.

---

## 5. CORS Configuration (Production)

Once frontend and backend are on different domains in production, ensure FastAPI's CORS middleware (in `main.py`) allows your deployed frontend's origin:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

*(Check `main.py` for existing CORS setup and update the `allow_origins` list — do not leave it as `["*"]` in production if the app requires authentication, since that combined with `allow_credentials=True` is insecure.)*

---

## 6. Post-Deployment Verification Checklist

- [ ] Backend `/docs` loads at the production URL
- [ ] Startup logs confirm all API keys + database connected
- [ ] Frontend loads and successfully calls the deployed backend (check Network tab for CORS errors)
- [ ] Run a real investigation end-to-end (domain, username, and email query types)
- [ ] Register a new account and confirm persistence across a page refresh
- [ ] Confirm MongoDB Atlas Network Access is restricted to the backend's actual IP, not `0.0.0.0/0`
- [ ] Confirm `.env` / secrets are not present in the deployed repository's Git history
