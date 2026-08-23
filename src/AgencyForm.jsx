import { useEffect, useState } from "react";

const EMPTY_FORM = {
  name: "",
  address_line_one: "",
  city: "",
  state_code: "PA",
  zip_code: "",
  phone_num: "",
  contact_name: "",
  email: "",
  services_description: "",
};

function agencyToForm(agency) {
  if (!agency) return { ...EMPTY_FORM };
  return {
    name: agency.name || "",
    address_line_one: agency.address_line_one || "",
    city: agency.city || "",
    state_code: agency.state_code || "PA",
    zip_code: agency.zip_code || "",
    phone_num: agency.phone_num || "",
    contact_name: agency.contact_name || "",
    email: agency.email || "",
    services_description: agency.services_description || "",
  };
}

function agencyToSelectedServices(agency) {
  if (!agency?.services) return [];
  return Object.keys(agency.services).sort((a, b) => a.localeCompare(b));
}

export default function AgencyForm({
  mode,
  agency,
  allServices,
  submitting,
  onSubmit,
  onDelete,
  onCancel,
}) {
  const [form, setForm] = useState(() => agencyToForm(agency));
  const [selectedServices, setSelectedServices] = useState(() =>
    agencyToSelectedServices(agency)
  );
  const [newService, setNewService] = useState("");

  useEffect(() => {
    setForm(agencyToForm(agency));
    setSelectedServices(agencyToSelectedServices(agency));
    setNewService("");
  }, [agency, mode]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleService = (service) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service].sort((a, b) => a.localeCompare(b))
    );
  };

  const addCustomService = () => {
    const name = newService.trim();
    if (!name) return;
    setSelectedServices((prev) =>
      prev.includes(name)
        ? prev
        : [...prev, name].sort((a, b) => a.localeCompare(b))
    );
    setNewService("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.address_line_one.trim() || !form.phone_num.trim()) {
      window.alert("Name, address, and phone are required.");
      return;
    }
    onSubmit({
      ...form,
      name: form.name.trim(),
      address_line_one: form.address_line_one.trim(),
      city: form.city.trim(),
      state_code: form.state_code.trim() || "PA",
      zip_code: form.zip_code.trim(),
      phone_num: form.phone_num.trim(),
      contact_name: form.contact_name.trim(),
      email: form.email.trim(),
      services_description: form.services_description.trim(),
      services: selectedServices,
    });
  };

  const serviceOptions = Array.from(
    new Set([...allServices, ...selectedServices])
  ).sort((a, b) => a.localeCompare(b));

  return (
    <form className="agency-form" onSubmit={handleSubmit}>
      <div className="agency-form__header">
        <h2>{mode === "edit" ? "Edit Agency" : "Add Agency"}</h2>
        {mode === "edit" && agency?.name ? (
          <p className="agency-form__subtitle">{agency.name}</p>
        ) : null}
      </div>

      <div className="form-grid">
        <label className="field field--full">
          <span>Name *</span>
          <input
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            required
          />
        </label>

        <label className="field field--full">
          <span>Address *</span>
          <input
            value={form.address_line_one}
            onChange={(e) => updateField("address_line_one", e.target.value)}
            required
          />
        </label>

        <label className="field">
          <span>City</span>
          <input
            value={form.city}
            onChange={(e) => updateField("city", e.target.value)}
          />
        </label>

        <label className="field field--narrow">
          <span>State</span>
          <input
            value={form.state_code}
            onChange={(e) => updateField("state_code", e.target.value)}
            maxLength={2}
          />
        </label>

        <label className="field field--narrow">
          <span>ZIP</span>
          <input
            value={form.zip_code}
            onChange={(e) => updateField("zip_code", e.target.value)}
          />
        </label>

        <label className="field">
          <span>Phone *</span>
          <input
            value={form.phone_num}
            onChange={(e) => updateField("phone_num", e.target.value)}
            required
          />
        </label>

        <label className="field">
          <span>Contact name</span>
          <input
            value={form.contact_name}
            onChange={(e) => updateField("contact_name", e.target.value)}
          />
        </label>

        <label className="field field--full">
          <span>Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
          />
        </label>

        <label className="field field--full">
          <span>Services description</span>
          <textarea
            rows={4}
            value={form.services_description}
            onChange={(e) => updateField("services_description", e.target.value)}
          />
        </label>
      </div>

      <fieldset className="services">
        <legend>Services</legend>
        {serviceOptions.length === 0 ? (
          <p className="muted">No services yet. Add one below.</p>
        ) : (
          <div className="services__list">
            {serviceOptions.map((service) => (
              <label key={service} className="services__item">
                <input
                  type="checkbox"
                  checked={selectedServices.includes(service)}
                  onChange={() => toggleService(service)}
                />
                <span>{service}</span>
              </label>
            ))}
          </div>
        )}

        <div className="services__add">
          <input
            type="text"
            placeholder="Add a new service name"
            value={newService}
            onChange={(e) => setNewService(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomService();
              }
            }}
          />
          <button type="button" className="btn btn--secondary" onClick={addCustomService}>
            Add
          </button>
        </div>
      </fieldset>

      <div className="agency-form__actions">
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? "Saving…" : mode === "edit" ? "Save changes" : "Create agency"}
        </button>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </button>
        {mode === "edit" && onDelete ? (
          <button
            type="button"
            className="btn btn--danger"
            onClick={onDelete}
            disabled={submitting}
          >
            Delete
          </button>
        ) : null}
      </div>
    </form>
  );
}
