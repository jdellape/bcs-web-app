export const AGENCY_COLUMNS = [
  { key: "name", header: "Name" },
  { key: "address_line_one", header: "Address" },
  { key: "city", header: "City" },
  { key: "state_code", header: "State" },
  { key: "zip_code", header: "ZIP" },
  { key: "phone_num", header: "Phone" },
  { key: "contact_name", header: "Contact" },
  { key: "email", header: "Email" },
  { key: "services", header: "Services" },
  { key: "services_description", header: "Services description" },
  { key: "last_audited_date", header: "Last audited date" },
];

export function formatServices(services) {
  if (Array.isArray(services)) {
    return services.join("; ");
  }
  if (services && typeof services === "object") {
    return Object.keys(services)
      .sort((a, b) => a.localeCompare(b))
      .join("; ");
  }
  return "";
}

export function toTableRow(agency) {
  return {
    id: agency.id,
    name: agency.name || "",
    address_line_one: agency.address_line_one || "",
    city: agency.city || "",
    state_code: agency.state_code || "",
    zip_code: agency.zip_code || "",
    phone_num: agency.phone_num || "",
    contact_name: agency.contact_name || "",
    email: agency.email || "",
    services: formatServices(agency.services),
    services_description: agency.services_description || "",
    last_audited_date: agency.last_audited_date || "",
  };
}

export function escapeCsvField(value) {
  const str = value == null ? "" : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replaceAll('"', '""')}"`;
  }
  return str;
}

export function rowsToCsv(rows, columns = AGENCY_COLUMNS) {
  const header = columns.map((col) => escapeCsvField(col.header)).join(",");
  const lines = rows.map((row) =>
    columns.map((col) => escapeCsvField(row[col.key])).join(",")
  );
  return `${[header, ...lines].join("\r\n")}\r\n`;
}

export function csvFilename(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `blair-county-agencies-${year}-${month}-${day}.csv`;
}

export function downloadCsv(csvText, filename) {
  const blob = new Blob([`\uFEFF${csvText}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
