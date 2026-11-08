import { useMemo, useState } from "react";
import {
  AGENCY_COLUMNS,
  csvFilename,
  downloadCsv,
  rowsToCsv,
  toTableRow,
} from "./csv";

const SORTABLE_KEYS = new Set(
  AGENCY_COLUMNS.filter((col) => col.sortable).map((col) => col.key)
);

function compareRows(a, b, sortKey, sortDir) {
  const aVal = a[sortKey] || "";
  const bVal = b[sortKey] || "";
  const cmp =
    sortKey === "last_audited_date"
      ? aVal.localeCompare(bVal)
      : aVal.localeCompare(bVal, undefined, { sensitivity: "base" });
  return sortDir === "asc" ? cmp : -cmp;
}

export default function AgencyList({
  agencies,
  loading,
  error,
  onRetry,
  onSelectAgency,
}) {
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

  const rows = useMemo(
    () =>
      agencies
        .map(toTableRow)
        .sort((a, b) => compareRows(a, b, sortKey, sortDir)),
    [agencies, sortKey, sortDir]
  );

  const handleSort = (key) => {
    if (!SORTABLE_KEYS.has(key)) return;
    if (sortKey === key) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const handleDownload = () => {
    downloadCsv(rowsToCsv(rows), csvFilename());
  };

  const openAgency = (agencyId) => {
    if (agencyId) onSelectAgency(agencyId);
  };

  return (
    <section className="panel list-view">
      <div className="list-view__toolbar">
        <p className="list-view__count">
          {loading
            ? "Loading agencies…"
            : `${rows.length} ${rows.length === 1 ? "agency" : "agencies"}`}
        </p>
        <button
          type="button"
          className="btn btn--primary"
          onClick={handleDownload}
          disabled={loading || rows.length === 0}
        >
          Download CSV
        </button>
      </div>

      {error ? (
        <div className="banner banner--error list-view__banner" role="alert">
          {error}{" "}
          {onRetry ? (
            <button type="button" className="btn btn--link" onClick={onRetry}>
              Retry
            </button>
          ) : null}
        </div>
      ) : null}

      {loading ? (
        <p className="muted list-view__empty">Loading agencies…</p>
      ) : rows.length === 0 && !error ? (
        <p className="muted list-view__empty">No agencies found.</p>
      ) : rows.length > 0 ? (
        <div className="agency-table-wrap">
          <table className="agency-table">
            <caption className="sr-only">
              All agencies. Click a row to edit. Click Name or Last audited date
              to sort.
            </caption>
            <thead>
              <tr>
                {AGENCY_COLUMNS.map((col) => {
                  if (!col.sortable) {
                    return (
                      <th key={col.key} scope="col">
                        {col.header}
                      </th>
                    );
                  }

                  const isActive = sortKey === col.key;
                  const ariaSort = isActive
                    ? sortDir === "asc"
                      ? "ascending"
                      : "descending"
                    : "none";

                  return (
                    <th key={col.key} scope="col" aria-sort={ariaSort}>
                      <button
                        type="button"
                        className={
                          isActive
                            ? "agency-table__sort agency-table__sort--active"
                            : "agency-table__sort"
                        }
                        onClick={() => handleSort(col.key)}
                      >
                        {col.header}
                        <span className="agency-table__sort-indicator" aria-hidden="true">
                          {isActive ? (sortDir === "asc" ? " ▲" : " ▼") : " ↕"}
                        </span>
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id || row.name}
                  tabIndex={0}
                  onClick={() => openAgency(row.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openAgency(row.id);
                    }
                  }}
                >
                  {AGENCY_COLUMNS.map((col) => (
                    <td
                      key={col.key}
                      className={
                        col.key === "services" ||
                        col.key === "services_description"
                          ? "agency-table__cell--wide"
                          : undefined
                      }
                    >
                      <span className="agency-table__clip" title={row[col.key]}>
                        {row[col.key]}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
