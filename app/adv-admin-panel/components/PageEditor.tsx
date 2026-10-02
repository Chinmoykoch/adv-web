"use client";

import Link from "next/link";
import { useState } from "react";
import { pageDefinitions, type PageKey, type PageContent } from "../lib/content";
import { useContent } from "../lib/store";
import EditorFields, { primaryButton, secondaryButton, useUnsavedChanges, validateFields } from "./EditorFields";

export default function PageEditor({ page }: { page: PageKey }) {
  const store = useContent();
  if (store.loading) return <p role="status">Loading page draft…</p>;
  if (store.error) return <p role="alert" className="text-danger">{store.error}</p>;
  return <PageForm page={page} initial={store.data.pages[page]} />;
}

function PageForm({ page, initial }: { page: PageKey; initial: PageContent }) {
  const { update } = useContent();
  const definition = pageDefinitions[page];
  const [values, setValues] = useState(initial.values);
  const [saved, setSaved] = useState(initial);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const dirty = JSON.stringify(values) !== JSON.stringify(saved.values);
  useUnsavedChanges(dirty);

  return <>
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4"><div><p className="mb-2 text-xs uppercase tracking-widest text-primary">Pages / {definition.title}</p><h1 className="text-4xl">Edit {definition.title}</h1><p className="mt-3 text-sm text-muted">Give every heading, paragraph, and image a little attention.</p></div><Link href={definition.href} target="_blank" rel="noopener noreferrer" className={secondaryButton}>View current website ↗</Link></div>
    <form onSubmit={(event) => {
      event.preventDefault();
      setMessage("");
      const validation = validateFields(definition.groups.flatMap((group) => group.fields), values);
      if (validation) { setError(validation); return; }
      try {
        const next = { values, updatedAt: new Date().toISOString() };
        update((current) => {
          if (JSON.stringify(current.pages[page]) !== JSON.stringify(saved)) throw new Error("This page changed in another tab. Reload to review the latest draft before saving.");
          return { ...current, pages: { ...current.pages, [page]: next } };
        });
        setSaved(next); setError(""); setMessage("Draft saved in this browser.");
      } catch (issue) { setError(issue instanceof Error ? issue.message : "Could not save draft."); }
    }}>
      {definition.groups.length > 4 && <nav aria-label="Page sections" className="mb-5 flex flex-wrap gap-2">{definition.groups.map((group, index) => <button key={group.title} type="button" onClick={() => document.getElementById(`group-${index}`)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" })} className="min-h-9 cursor-pointer rounded-full border border-border/30 bg-white px-3.5 text-xs font-medium text-secondary hover:border-primary/40 hover:text-primary">{group.title}</button>)}</nav>}
      <div className="space-y-5">{definition.groups.map((group, index) => <fieldset key={group.title} id={`group-${index}`} className="scroll-mt-6 rounded-xl border border-border/20 bg-white p-5 sm:p-7"><legend className="px-2 font-heading text-xl">{group.title}</legend><EditorFields fields={group.fields} values={values} onChange={(key, value) => { setValues((current) => ({ ...current, [key]: value })); setMessage(""); }} /></fieldset>)}</div>
      <div className="sticky bottom-3 z-10 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/30 bg-white/95 p-4 shadow-lg backdrop-blur-sm">
        <div><p className="text-xs text-muted">{dirty ? "You have unsaved changes" : saved.updatedAt ? "All changes saved locally" : "Starter content · not saved yet"}</p>{message && <p role="status" className="mt-1 text-sm text-primary">{message}</p>}{error && <p role="alert" className="mt-1 max-w-lg text-sm text-danger">{error}</p>}</div>
        <div className="flex gap-2"><button type="button" disabled={!dirty} className={secondaryButton} onClick={() => { if (window.confirm("Discard unsaved changes to this page?")) { setValues(saved.values); setError(""); setMessage(""); } }}>Discard</button><button type="submit" className={primaryButton}>Save draft</button></div>
      </div>
    </form>
  </>;
}
