import { useEffect, useMemo, useRef, useState } from "react";
import { fetchAgenciesByService } from "./api";

export default function ServiceRename({ services, loading, submitting, onRename }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [newName, setNewName] = useState("");
  const [usage, setUsage] = useState(null);
  const newNameRef = useRef(null);

  const filteredServices = useMemo(() => {
    const q = query.trim().toLowerCase();
    const names = [...services].sort((a, b) => a.localeCompare(b));
    if (!q) return names;
    return names.filter((name) => name.toLowerCase().includes(q));
  }, [services, query]);

  useEffect(() => {
    if (!selected) {
      setUsage(null);
      return undefined;
    }

    let cancelled = false;
    setUsage({ loading: true, agencies: [], error: null });
    (async () => {
      try {
        const agencies = await fetchAgenciesByService(selected);
        if (!cancelled) {
          setUsage({ loading: false, agencies, error: null });
        }
      } catch (e) {
        if (!cancelled) {
          setUsage({
            loading: false,
            agencies: [],
            error: e.message || "Could not load agencies for this service",
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selected]);

  useEffect(() => {
    if (selected) newNameRef.current?.focus();
  }, [selected]);

  const selectService = (name) => {
    if (submitting) return;
    setSelected(name);
    setNewName("");
  };

  const clearSelection = () => {
    if (submitting) return;
    setSelected(null);
    setNewName("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = newName.trim();
    if (!selected || !next || next === selected || submitting) return;

    const count = usage && !usage.loading && !usage.error ? usage.agencies.length : null;
    const scope =
      count === null
        ? "every agency that offers it"
        : `${count} ${count === 1 ? "agency" : "agencies"}`;
    const confirmed = window.confirm(
      `Rename "${selected}" to "${next}"? This updates ${scope}.`
    );
    if (!confirmed) return;

    try {
      const result = await onRename(selected, next);
      const renamedTo = result?.new_name || next;
      setSelected(renamedTo);
      setNewName("");
    } catch {
      // The parent surfaces the error.
    }
  };

  const trimmedNewName = newName.trim();
  const unchanged = !trimmedNewName || trimmedNewName === selected;

  return (
    <div className="layout">
      <aside className="panel list-panel">
        <div className="list-panel__toolbar">
          <input
            type="search"
            placeholder="Filter services…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Filter services"
          />
        </div>

        {loading ? (
          <p className="muted list-panel__empty">Loading services…</p>
        ) : filteredServices.length === 0 ? (
          <p className="muted list-panel__empty">No services found.</p>
        ) : (
          <ul className="agency-list">
            {filteredServices.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  className={`agency-list__item${
                    selected === name ? " agency-list__item--active" : ""
                  }`}
                  onClick={() => selectService(name)}
                >
                  {name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <section className="panel form-panel">
        {!selected ? (
          <div className="empty-state">
            <h2>Select a service</h2>
            <p className="muted">
              Choose a service to rename it on every agency that offers it.
            </p>
          </div>
        ) : (
          <form className="agency-form" onSubmit={handleSubmit}>
            <div className="agency-form__header">
              <h2>Rename service</h2>
              <p className="muted service-rename__hint">
                The new name replaces this service on every agency that offers
                it. Schedule details stay with the service.
              </p>
            </div>

            <div className="form-grid">
              <label className="field field--full">
                <span>Current name</span>
                <input value={selected} readOnly />
              </label>
              <label className="field field--full">
                <span>New name</span>
                <input
                  ref={newNameRef}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </label>
            </div>

            <div className="service-usage-block">
              {usage?.loading ? (
                <p className="muted">Checking which agencies offer this service…</p>
              ) : null}
              {usage?.error ? (
                <p className="muted">{usage.error}</p>
              ) : null}
              {usage && !usage.loading && !usage.error ? (
                <>
                  <p className="service-usage-block__count">
                    {usage.agencies.length === 1
                      ? "1 agency offers this service."
                      : `${usage.agencies.length} agencies offer this service.`}
                  </p>
                  {usage.agencies.length > 0 ? (
                    <ul className="service-usage">
                      {usage.agencies.map((agency) => (
                        <li key={agency.id || agency.name}>{agency.name}</li>
                      ))}
                    </ul>
                  ) : null}
                </>
              ) : null}
            </div>

            <div className="agency-form__actions">
              <button
                type="submit"
                className="btn btn--primary"
                disabled={submitting || unchanged || Boolean(usage?.loading)}
              >
                {submitting ? "Renaming…" : "Rename service"}
              </button>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={clearSelection}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
