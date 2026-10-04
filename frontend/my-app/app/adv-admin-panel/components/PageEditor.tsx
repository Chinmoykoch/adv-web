"use client";

import Link from "next/link";
import { useState } from "react";
import { ApiError, apiRequest, errorMessage, useApi } from "../lib/api";
import { pageDefinitions, type PageKey } from "../lib/content";
import SearchPreview, { pageSnippet } from "./SearchPreview";
import EditorFields, { primaryButton, secondaryButton, useUnsavedChanges, validateFields } from "./EditorFields";

type SavedPage = { key: PageKey; content: Record<string, string>; updatedAt: string | null };

export default function PageEditor({ page }: { page: PageKey }) {
  const loaded = useApi<SavedPage>(`/api/admin/pages/${page}`);
  if (loaded.loading) return <p role="status">Loading page…</p>;
  if (loaded.error || !loaded.data) return <div role="alert" className="text-danger"><p>{loaded.error}</p><button type="button" className={`${secondaryButton} mt-4`} onClick={loaded.reload}>Try again</button></div>;
  return <PageForm page={page} initial={loaded.data} />;
}

function PageForm({ page, initial }: { page: PageKey; initial: SavedPage }) {
  const definition = pageDefinitions[page];
  const [values, setValues] = useState(initial.content);
  const [saved, setSaved] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const dirty = JSON.stringify(values) !== JSON.stringify(saved.content);
  useUnsavedChanges(dirty && !saving);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const fields = definition.groups.flatMap((group) => group.fields);
    const validation = validateFields(fields, values);
    if (validation) return setError(validation);
    setSaving(true); setError("");
    try {
      // The page's stored content is replaced by exactly what is in the form.
      const next = await apiRequest<SavedPage>(`/api/admin/pages/${page}`, { method: "PUT", body: { content: values } });
      setSaved(next); setValues(next.content);
      setMessage("Saved to the database.");
    } catch (issue) {
      // Name the fields the server rejected, using the form's labels.
      const labels = Object.fromEntries(fields.map((field) => [field.key, field.label]));
      const details = issue instanceof ApiError && issue.fields ? ` ${Object.entries(issue.fields).map(([key, text]) => `${labels[key] ?? key}: ${text}`).join(" · ")}` : "";
      setError(`${errorMessage(issue, "Could not save.")}${details}`);
    }
    finally { setSaving(false); }
  }

  return <>
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-xs uppercase tracking-widest text-primary">{page === "site-settings" ? "Settings" : "Pages"} / {definition.title}</p><h1 className="text-3xl">Edit {definition.title}</h1><p className="mt-1.5 text-sm text-muted">Saving replaces the page’s current text; earlier wording is not kept.</p></div><Link href={definition.href} target="_blank" rel="noopener noreferrer" className={secondaryButton}>View current website ↗</Link></div>
    <form onSubmit={save}>
      {definition.groups.length > 4 && <nav aria-label="Page sections" className="mb-4 flex flex-wrap gap-2">{definition.groups.map((group, index) => <button key={group.title} type="button" onClick={() => document.getElementById(`group-${index}`)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" })} className="min-h-9 cursor-pointer rounded-full border border-border/30 bg-white px-3.5 text-xs font-medium text-secondary hover:border-primary/40 hover:text-primary">{group.title}</button>)}</nav>}
      <div className="space-y-4">{definition.groups.map((group, index) => <fieldset key={group.title} id={`group-${index}`} className="scroll-mt-4 overflow-hidden rounded-xl border border-border/40 bg-white shadow-sm">
        <legend className="sr-only">{group.title}</legend>
        {/* A header bar per section so each one is easy to tell apart while scrolling. */}
        <div className="flex items-center gap-3 border-b border-border/30 bg-canvas-light px-4 py-3 sm:px-5"><span aria-hidden="true" className="grid size-6 shrink-0 place-items-center rounded-full bg-primary-50 text-xs font-semibold text-primary">{index + 1}</span><h2 className="font-heading text-lg">{group.title}</h2></div>
        <div className="p-4 sm:p-5"><EditorFields fields={group.fields} values={values} folder={page === "site-settings" ? "site" : "pages"} preview={<SearchPreview snippet={pageSnippet(page, values)} values={values} />} onChange={(key, value) => { setValues((current) => ({ ...current, [key]: value })); setMessage(""); }} /></div>
      </fieldset>)}</div>
      <div className="sticky bottom-3 z-10 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/30 bg-white/95 p-4 shadow-lg backdrop-blur-sm">
        <div><p className="text-xs text-muted">{dirty ? "You have unsaved changes" : saved.updatedAt ? `Saved ${new Date(saved.updatedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}` : "Not saved yet"}</p>{message && <p role="status" className="mt-1 text-sm text-primary">{message}</p>}{error && <p role="alert" className="mt-1 max-w-lg text-sm text-danger">{error}</p>}</div>
        <div className="flex gap-2"><button type="button" disabled={!dirty || saving} className={secondaryButton} onClick={() => { if (window.confirm("Discard unsaved changes to this page?")) { setValues(saved.content); setError(""); setMessage(""); } }}>Discard</button><button type="submit" className={primaryButton} disabled={saving}>{saving ? "Saving…" : "Save"}</button></div>
      </div>
    </form>
  </>;
}
