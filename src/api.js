const API_BASE = import.meta.env.VITE_API_BASE?.trim().replace(/\/$/, "");

function buildApiUrl(path) {
  if (!API_BASE) {
    throw new Error(
      "Missing VITE_API_BASE. Add it to your .env (see .env.example)."
    );
  }
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

async function readError(res) {
  const err = await res.json().catch(() => ({}));
  return err.detail || res.statusText || "Request failed";
}

export async function fetchServices() {
  const res = await fetch(buildApiUrl("/services"));
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function fetchAgencyList() {
  const res = await fetch(buildApiUrl("/agencies"));
  if (!res.ok) throw new Error(await readError(res));
  const data = await res.json();
  return data
    .map((a) => ({ id: a.id, name: a.name }))
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
}

export async function fetchAgency(agencyId) {
  const res = await fetch(
    buildApiUrl(`/agencies/${encodeURIComponent(agencyId)}`)
  );
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function createAgency(payload) {
  const res = await fetch(buildApiUrl("/agencies"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function updateAgency(agencyId, payload) {
  const res = await fetch(
    buildApiUrl(`/agencies/${encodeURIComponent(agencyId)}`),
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function deleteAgency(agencyId) {
  const res = await fetch(
    buildApiUrl(`/agencies/${encodeURIComponent(agencyId)}`),
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}
