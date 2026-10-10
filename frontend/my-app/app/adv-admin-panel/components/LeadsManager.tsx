"use client";

import { useState } from "react";
import { apiRequest, errorMessage, useApi } from "../lib/api";
import { inputClass, primaryButton, secondaryButton, useUnsavedChanges } from "./EditorFields";

const statuses = ["new", "contacted", "booked", "closed", "spam"] as const;
type Status = (typeof statuses)[number];
const statusLabels: Record<Status, string> = { new: "New", contacted: "Contacted", booked: "Booked", closed: "Closed", spam: "Spam" };
const statusStyles: Record<Status, string> = {
  new: "bg-primary text-white",
  contacted: "bg-amber-100 text-amber-900",
  booked: "bg-emerald-100 text-emerald-900",
  closed: "bg-surface text-secondary",
  spam: "bg-surface text-muted line-through",
};

type Lead = {
  id: string; createdAt: string; updatedAt: string; name: string; phone: string; email: string | null; message: string | null;
  carName: string | null; pickupDate: string | null; returnDate: string | null; sourcePath: string | null;
  utmSource: string | null; utmMedium: string | null; utmCampaign: string | null; consent: boolean;
  extra: Record<string, string>; status: Status; adminNotes: string | null; revision: number;
};
type LeadHistory = { revision: number; savedAt: string; savedBy: string | null; snapshot: { status: Status; adminNotes: string | null } };
type LeadPage = { items: Lead[]; total: number; page: number; pageSize: number };

const when = (value: string) => new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
const day = (value: string | null) => (value ? new Date(`${value}T00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "");
const digits = (value: string) => value.replace(/[^\d]/g, "");

function StatusBadge({ status }: { status: Status }) {
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusStyles[status]}`}>{statusLabels[status]}</span>;
}

// Every enquiry from the website's contact form. Leads are never deleted: mark unwanted ones
// as Spam or Closed. Each status or note change is kept in the lead's history.
export default function LeadsManager() {
  const [status, setStatus] = useState<Status | "all">("new");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);

  const params = new URLSearchParams({ page: String(page), pageSize: "25" });
  if (status !== "all") params.set("status", status);
  if (query) params.set("q", query);
  const leads = useApi<LeadPage>(`/api/admin/leads?${params}`);
  const summary = useApi<Record<Status, number>>("/api/admin/leads/summary");
  const total = summary.data ? statuses.reduce((sum, key) => sum + (summary.data![key] ?? 0), 0) : undefined;

  if (selected) return <LeadDetail id={selected} onClose={() => setSelected(null)} onSaved={() => { leads.reload(); summary.reload(); }} />;

  const pages = leads.data ? Math.max(1, Math.ceil(leads.data.total / leads.data.pageSize)) : 1;
  const tabs: (Status | "all")[] = ["new", "contacted", "booked", "closed", "spam", "all"];

  return <>
    <div className="mb-5"><p className="mb-2 text-xs uppercase tracking-widest text-primary">Customers</p><h1 className="text-3xl">Enquiries</h1><p className="mt-1.5 text-sm text-muted">Every enquiry sent from the website’s contact form, newest first. Enquiries are kept permanently.</p></div>

    <div className="rounded-xl border border-border/20 bg-white">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border/20 p-5">
        <div role="tablist" aria-label="Filter by status" className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const count = tab === "all" ? total : summary.data?.[tab];
            return <button key={tab} type="button" role="tab" aria-selected={status === tab} onClick={() => { setStatus(tab); setPage(1); }}
              className={`min-h-9 cursor-pointer rounded-full border px-3.5 text-xs font-medium ${status === tab ? "border-primary bg-primary text-white" : "border-border/30 bg-white text-secondary hover:border-primary/40"}`}>
              {tab === "all" ? "All" : statusLabels[tab]}{count !== undefined && <span className="ml-1.5 tabular-nums opacity-80">{count}</span>}
            </button>;
          })}
        </div>
        <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); setQuery(search.trim()); setPage(1); }}>
          <label htmlFor="lead-search" className="sr-only">Search enquiries</label>
          <input id="lead-search" type="search" value={search} onChange={(event) => { setSearch(event.target.value); if (!event.target.value) { setQuery(""); setPage(1); } }} placeholder="Name, phone, email or car…" className={`${inputClass} w-64`} />
          <button type="submit" className={secondaryButton}>Search</button>
        </form>
      </div>

      {leads.loading ? <p role="status" className="p-6 text-sm">Loading enquiries…</p>
        : leads.error ? <div role="alert" className="p-6 text-sm text-danger"><p>{leads.error}</p><button type="button" className={`${secondaryButton} mt-3`} onClick={leads.reload}>Try again</button></div>
        : !leads.data?.items.length ? <div className="px-6 py-16 text-center"><h2 className="text-2xl">{query ? "No matching enquiries" : status === "new" ? "No new enquiries" : "Nothing here yet"}</h2><p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted">{query ? "Try a different name, phone number or car." : "Enquiries from the contact form appear here as soon as they’re sent."}</p></div>
        : <ul className="divide-y divide-border/20">{leads.data.items.map((lead) => (
          <li key={lead.id}>
            <button type="button" onClick={() => setSelected(lead.id)} className="grid w-full cursor-pointer gap-2 p-5 text-left hover:bg-canvas-light sm:grid-cols-[1.3fr_1fr_auto] sm:items-center sm:gap-6">
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-2"><span className="font-semibold">{lead.name}</span><StatusBadge status={lead.status} /></span>
                <span className="mt-1 block truncate text-xs text-muted">{lead.phone}{lead.email ? ` · ${lead.email}` : ""}</span>
              </span>
              <span className="min-w-0 text-xs text-muted">
                <span className="block truncate font-medium text-secondary">{lead.carName ?? "No car chosen"}</span>
                {(lead.pickupDate || lead.returnDate) && <span className="block">{day(lead.pickupDate)}{lead.returnDate ? ` → ${day(lead.returnDate)}` : ""}</span>}
              </span>
              <span className="text-xs tabular-nums text-muted sm:text-right">{when(lead.createdAt)}</span>
            </button>
          </li>
        ))}</ul>}

      {leads.data && leads.data.total > 0 && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/20 px-5 py-4 text-xs text-muted">
        <span>{leads.data.total} {leads.data.total === 1 ? "enquiry" : "enquiries"}</span>
        {pages > 1 && <span className="flex items-center gap-2">
          <button type="button" className={secondaryButton} disabled={page <= 1} onClick={() => setPage(page - 1)}>← Newer</button>
          <span className="tabular-nums">Page {page} of {pages}</span>
          <button type="button" className={secondaryButton} disabled={page >= pages} onClick={() => setPage(page + 1)}>Older →</button>
        </span>}
      </div>}
    </div>
  </>;
}

function LeadDetail({ id, onClose, onSaved }: { id: string; onClose: () => void; onSaved: () => void }) {
  const loaded = useApi<Lead & { history: LeadHistory[] }>(`/api/admin/leads/${id}`);
  if (loaded.loading) return <p role="status">Loading enquiry…</p>;
  if (loaded.error || !loaded.data) return <div role="alert" className="text-danger"><p>{loaded.error}</p><button type="button" className={`${secondaryButton} mt-4`} onClick={onClose}>← Back to enquiries</button></div>;
  return <LeadForm key={loaded.data.revision} lead={loaded.data} onClose={onClose} onSaved={() => { loaded.reload(); onSaved(); }} />;
}

function LeadForm({ lead, onClose, onSaved }: { lead: Lead & { history: LeadHistory[] }; onClose: () => void; onSaved: () => void }) {
  const [status, setStatus] = useState<Status>(lead.status);
  const [notes, setNotes] = useState(lead.adminNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const dirty = status !== lead.status || notes.trim() !== (lead.adminNotes ?? "");
  useUnsavedChanges(dirty && !saving);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setError(""); setMessage("");
    try {
      await apiRequest(`/api/admin/leads/${lead.id}`, { method: "PATCH", body: { status, adminNotes: notes.trim() } });
      setMessage("Saved.");
      onSaved();
    } catch (issue) { setError(errorMessage(issue, "Could not save.")); setSaving(false); }
  }

  const contactLinks = [
    { label: "Call", href: `tel:${lead.phone.replace(/[^\d+]/g, "")}` },
    { label: "WhatsApp", href: `https://wa.me/${digits(lead.phone)}` },
    ...(lead.email ? [{ label: "Email", href: `mailto:${lead.email}` }] : []),
  ];
  const facts = [
    ["Phone", lead.phone], ["Email", lead.email], ["Car", lead.carName], ["Pickup", day(lead.pickupDate)], ["Return", day(lead.returnDate)],
    ["Received", when(lead.createdAt)], ["Sent from", lead.sourcePath],
    ["Campaign", [lead.utmSource, lead.utmMedium, lead.utmCampaign].filter(Boolean).join(" / ")],
    ["Consent to contact", lead.consent ? "Yes" : "No"],
    ...Object.entries(lead.extra ?? {}).map(([key, value]) => [key === "pickupTime" ? "Pickup time (IST)" : key, value]),
  ].filter(([, value]) => value) as [string, string][];

  return <>
    <button type="button" onClick={() => { if (!dirty || window.confirm("Discard unsaved changes?")) onClose(); }} className="mb-6 min-h-11 cursor-pointer text-sm text-primary">← Back to enquiries</button>
    <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
      <div><p className="mb-2 text-xs uppercase tracking-widest text-primary">Enquiry</p><h1 className="flex flex-wrap items-center gap-3 text-3xl">{lead.name} <StatusBadge status={lead.status} /></h1></div>
      <div className="flex flex-wrap gap-2">{contactLinks.map((link) => <a key={link.label} href={link.href} className={secondaryButton} {...(link.href.startsWith("https://") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{link.label}</a>)}</div>
    </div>

    <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
      <section className="rounded-xl border border-border/40 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-2xl">Details</h2>
        <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">{facts.map(([label, value]) => <div key={label}><dt className="text-[10px] font-semibold uppercase tracking-widest text-muted">{label}</dt><dd className="mt-1 break-words text-sm">{value}</dd></div>)}</dl>
        {lead.message && <div className="mt-6 border-t border-border/20 pt-5"><h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted">Message</h3><p className="mt-2 whitespace-pre-line text-sm leading-6">{lead.message}</p></div>}
      </section>

      <div className="space-y-6">
        <form onSubmit={save} className="rounded-xl border border-border/40 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-2xl">Follow-up</h2>
          <label htmlFor="lead-status" className="mb-2 mt-4 block text-sm font-medium">Status</label>
          <select id="lead-status" value={status} onChange={(event) => setStatus(event.target.value as Status)} className={inputClass}>
            {statuses.map((value) => <option key={value} value={value}>{statusLabels[value]}</option>)}
          </select>
          <label htmlFor="lead-notes" className="mb-2 mt-4 block text-sm font-medium">Notes</label>
          <textarea id="lead-notes" rows={5} maxLength={5000} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Called on…, quoted…, follow up on…" className={inputClass} />
          {error && <p role="alert" className="mt-4 text-sm text-danger">{error}</p>}
          {message && <p role="status" className="mt-4 text-sm text-primary">{message}</p>}
          <button type="submit" disabled={!dirty || saving} className={`${primaryButton} mt-5`}>{saving ? "Saving…" : "Save"}</button>
        </form>

        <section className="rounded-xl border border-border/40 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-2xl">History</h2>
          <ol className="mt-4 space-y-4 text-sm">
            <li><p className="font-medium">Current: {statusLabels[lead.status]}</p><p className="text-xs text-muted">Since {when(lead.updatedAt)}</p></li>
            {lead.history.map((entry) => <li key={entry.revision} className="border-t border-border/15 pt-4">
              <p className="font-medium">{statusLabels[entry.snapshot.status]}</p>
              <p className="text-xs text-muted">{entry.revision === 1 ? `Received ${when(entry.savedAt)}` : `Saved ${when(entry.savedAt)}${entry.savedBy ? ` by ${entry.savedBy}` : ""}`}</p>
              {entry.snapshot.adminNotes && <p className="mt-1 whitespace-pre-line text-xs leading-5 text-muted">{entry.snapshot.adminNotes}</p>}
            </li>)}
          </ol>
        </section>
      </div>
    </div>
  </>;
}
