import { useCallback, useEffect, useMemo, useState } from "react";
import AgencyForm from "./AgencyForm";
import {
  createAgency,
  deleteAgency,
  fetchAgency,
  fetchAgencyList,
  fetchServices,
  updateAgency,
} from "./api";

export default function App() {
  const [agencyList, setAgencyList] = useState([]);
  const [services, setServices] = useState([]);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("idle"); // idle | create | edit
  const [selectedId, setSelectedId] = useState(null);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingAgency, setLoadingAgency] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // { type, message }
  const [loadError, setLoadError] = useState(null);

  const refreshLists = useCallback(async () => {
    setLoadError(null);
    try {
      const [agencies, svc] = await Promise.all([
        fetchAgencyList(),
        fetchServices(),
      ]);
      setAgencyList(agencies);
      setServices(svc);
    } catch (e) {
      setLoadError(e.message || "Failed to load data");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    refreshLists();
  }, [refreshLists]);

  const filteredAgencies = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return agencyList;
    return agencyList.filter((a) => (a.name || "").toLowerCase().includes(q));
  }, [agencyList, query]);

  const showStatus = (type, message) => {
    setStatus({ type, message });
  };

  const startCreate = () => {
    setMode("create");
    setSelectedId(null);
    setSelectedAgency(null);
    setStatus(null);
  };

  const selectAgency = async (agencyId) => {
    setMode("edit");
    setSelectedId(agencyId);
    setLoadingAgency(true);
    setStatus(null);
    try {
      const agency = await fetchAgency(agencyId);
      setSelectedAgency(agency);
    } catch (e) {
      showStatus("error", e.message || "Failed to load agency");
      setMode("idle");
      setSelectedId(null);
      setSelectedAgency(null);
    } finally {
      setLoadingAgency(false);
    }
  };

  const clearSelection = () => {
    setMode("idle");
    setSelectedId(null);
    setSelectedAgency(null);
  };

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setStatus(null);
    try {
      if (mode === "create") {
        const result = await createAgency(payload);
        showStatus("success", `Created "${result.name}".`);
        await refreshLists();
        if (result.id) {
          await selectAgency(result.id);
        } else {
          clearSelection();
        }
      } else if (mode === "edit" && selectedId) {
        const result = await updateAgency(selectedId, payload);
        showStatus("success", `Updated "${result.name}".`);
        await refreshLists();
        await selectAgency(selectedId);
      }
    } catch (e) {
      showStatus("error", e.message || "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    const name = selectedAgency?.name || "this agency";
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;

    setSubmitting(true);
    setStatus(null);
    try {
      await deleteAgency(selectedId);
      showStatus("success", `Deleted "${name}".`);
      clearSelection();
      await refreshLists();
    } catch (e) {
      showStatus("error", e.message || "Delete failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <p className="eyebrow">Blair County Services</p>
          <h1>Agency Data Entry</h1>
        </div>
        <button type="button" className="btn btn--primary" onClick={startCreate}>
          Add Agency
        </button>
      </header>

      {status ? (
        <div
          className={`banner banner--${status.type}`}
          role="status"
        >
          {status.message}
        </div>
      ) : null}

      {loadError ? (
        <div className="banner banner--error" role="alert">
          {loadError}{" "}
          <button type="button" className="btn btn--link" onClick={refreshLists}>
            Retry
          </button>
        </div>
      ) : null}

      <div className="layout">
        <aside className="panel list-panel">
          <div className="list-panel__toolbar">
            <input
              type="search"
              placeholder="Filter Agencies…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Filter agencies"
            />
          </div>

          {loadingList ? (
            <p className="muted list-panel__empty">Loading agencies…</p>
          ) : filteredAgencies.length === 0 ? (
            <p className="muted list-panel__empty">No agencies found.</p>
          ) : (
            <ul className="agency-list">
              {filteredAgencies.map((agency) => (
                <li key={agency.id}>
                  <button
                    type="button"
                    className={`agency-list__item${
                      selectedId === agency.id ? " agency-list__item--active" : ""
                    }`}
                    onClick={() => selectAgency(agency.id)}
                  >
                    {agency.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <section className="panel form-panel">
          {mode === "idle" ? (
            <div className="empty-state">
              <h2>Select an agency</h2>
              <p className="muted">
                Choose an agency from the list to edit, or create a new one.
              </p>
            </div>
          ) : null}

          {mode === "edit" && loadingAgency ? (
            <p className="muted">Loading agency…</p>
          ) : null}

          {mode === "create" ? (
            <AgencyForm
              mode="create"
              agency={null}
              allServices={services}
              submitting={submitting}
              onSubmit={handleSubmit}
              onCancel={clearSelection}
            />
          ) : null}

          {mode === "edit" && !loadingAgency && selectedAgency ? (
            <AgencyForm
              mode="edit"
              agency={selectedAgency}
              allServices={services}
              submitting={submitting}
              onSubmit={handleSubmit}
              onDelete={handleDelete}
              onCancel={clearSelection}
            />
          ) : null}
        </section>
      </div>
    </div>
  );
}
