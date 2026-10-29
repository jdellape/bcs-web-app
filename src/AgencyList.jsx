import { useMemo } from "react";
import {
  AGENCY_COLUMNS,
  csvFilename,
  downloadCsv,
  rowsToCsv,
  toTableRow,
} from "./csv";

export default function AgencyList({
  agencies,
  loading,
  error,
  onRetry,
  onSelectAgency,
}) {
  const rows = useMemo(
    () =>
      agencies
        .map(toTableRow)
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" })),
    [agencies]
  );

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
              All agencies. Click a row to edit.
            </caption>
            <thead>
              <tr>
                {AGENCY_COLUMNS.map((col) => (
                  <th key={col.key} scope="col">
                    {col.header}
                  </th>
                ))}
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
