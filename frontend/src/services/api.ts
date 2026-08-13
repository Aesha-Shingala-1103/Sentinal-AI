const API_BASE = "http://127.0.0.1:8000";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("sentinel_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle(response: Response) {
  if (!response.ok) {
    let detail = "Request failed";
    try {
      const body = await response.json();
      detail = body.detail ?? detail;
    } catch {
      // ignore parse failure, use default message
    }
    throw new Error(detail);
  }
  return response.json();
}

export async function investigate(query: string, type: string) {
  const response = await fetch(`${API_BASE}/api/investigate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ query, type }),
  });

  if (!response.ok) {
    throw new Error("Investigation failed");
  }

  return response.json();
}

// ---------------------------------------------------------------------
// Auth (basic login feature)
// ---------------------------------------------------------------------

export async function registerUser(name: string, email: string, password: string) {
  const response = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  return handle(response);
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handle(response);
}

export async function getMe(token: string) {
  const response = await fetch(`${API_BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handle(response);
}

// ---------------------------------------------------------------------
// Case management (save / list / tag / annotate investigations)
// ---------------------------------------------------------------------

export async function saveCase(
  query: string,
  type: string,
  result: any,
  tags: string[] = [],
  notes: string = ""
) {
  const response = await fetch(`${API_BASE}/api/cases`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ query, type, result, tags, notes }),
  });
  return handle(response);
}

export async function listCases(tag?: string) {
  const url = tag
    ? `${API_BASE}/api/cases?tag=${encodeURIComponent(tag)}`
    : `${API_BASE}/api/cases`;
  const response = await fetch(url, { headers: authHeaders() });
  return handle(response);
}

export async function getCase(caseId: string) {
  const response = await fetch(`${API_BASE}/api/cases/${caseId}`, {
    headers: authHeaders(),
  });
  return handle(response);
}

export async function updateCaseNotes(caseId: string, notes: string) {
  const response = await fetch(`${API_BASE}/api/cases/${caseId}/notes`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ notes }),
  });
  return handle(response);
}

export async function updateCaseTags(caseId: string, tags: string[]) {
  const response = await fetch(`${API_BASE}/api/cases/${caseId}/tags`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ tags }),
  });
  return handle(response);
}

export async function deleteCase(caseId: string) {
  const response = await fetch(`${API_BASE}/api/cases/${caseId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handle(response);
}

export function exportCaseUrl(caseId: string, format: "json" | "csv") {
  return `${API_BASE}/api/cases/${caseId}/export.${format}`;
}

export async function authorizedDownload(url: string, filename: string) {
  const response = await fetch(url, { headers: authHeaders() });
  if (!response.ok) {
    throw new Error("Download failed.");
  }
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}

// ---------------------------------------------------------------------
// Watchlist / alerting (monitoring bonus objective)
// ---------------------------------------------------------------------

export async function addWatch(
  query: string,
  type: string,
  intervalHours: number = 24,
  label?: string
) {
  const response = await fetch(`${API_BASE}/api/watchlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({
      query,
      type,
      interval_hours: intervalHours,
      label,
    }),
  });
  return handle(response);
}

export async function listWatches() {
  const response = await fetch(`${API_BASE}/api/watchlist`, {
    headers: authHeaders(),
  });
  return handle(response);
}

export async function removeWatch(watchId: string) {
  const response = await fetch(`${API_BASE}/api/watchlist/${watchId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handle(response);
}

export async function listAlerts(unacknowledgedOnly: boolean = false) {
  const response = await fetch(
    `${API_BASE}/api/alerts?unacknowledged_only=${unacknowledgedOnly}`,
    { headers: authHeaders() }
  );
  return handle(response);
}

export async function acknowledgeAlert(alertId: string) {
  const response = await fetch(`${API_BASE}/api/alerts/${alertId}/acknowledge`, {
    method: "POST",
    headers: authHeaders(),
  });
  return handle(response);
}

// ---------------------------------------------------------------------
// Source health monitoring
// ---------------------------------------------------------------------

export async function getSourcesHealth() {
  const response = await fetch(`${API_BASE}/api/sources/health`);
  return handle(response);
}

// ---------------------------------------------------------------------
// Local-language / transliteration (bonus objective)
// ---------------------------------------------------------------------

export async function transliterate(query: string) {
  const response = await fetch(
    `${API_BASE}/api/transliterate?query=${encodeURIComponent(query)}`
  );
  return handle(response);
}
