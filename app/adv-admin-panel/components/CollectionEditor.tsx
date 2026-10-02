"use client";

import { useState } from "react";
import { collections, type CollectionKey, type Entry } from "../lib/content";
import { useContent } from "../lib/store";
import EditorFields, { inputClass, primaryButton, secondaryButton, Thumbnail, useUnsavedChanges, validateFields } from "./EditorFields";

export default function CollectionEditor({ collection }: { collection: CollectionKey }) {
  const { data, loading, error, update } = useContent();
  const definition = collections[collection];
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("active");
  const [editing, setEditing] = useState<Entry | null>(null);
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");
  if (loading) return <p role="status">Loading {definition.title.toLowerCase()}…</p>;
  if (error) return <p role="alert" className="text-danger">{error}</p>;
  if (editing) return <EntryForm key={editing.id} collection={collection} initial={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); setMessage("Draft saved in this browser."); }} />;
  const entries = data.collections[collection];
  const shown = entries.filter((entry) => (status === "archived" ? entry.archived : !entry.archived) && `${entry.values.title} ${entry.values.category ?? ""}`.toLowerCase().includes(query.toLowerCase()));

  function archive(entry: Entry) {
    if (!entry.archived && !window.confirm(`Archive “${entry.values.title}”? You can restore it later.`)) return;
    try {
      update((current) => ({ ...current, collections: { ...current.collections, [collection]: current.collections[collection].map((item) => item.id === entry.id ? { ...item, archived: !item.archived, updatedAt: new Date().toISOString() } : item) } }));
      setMessage(entry.archived ? "Entry restored." : "Entry archived."); setActionError("");
    } catch (issue) { setActionError(issue instanceof Error ? issue.message : "Could not update entry."); }
  }
  function remove(entry: Entry) {
    if (!window.confirm(`Permanently delete “${entry.values.title}”? This cannot be undone.`)) return;
    try {
      update((current) => ({ ...current, collections: { ...current.collections, [collection]: current.collections[collection].filter((item) => item.id !== entry.id) } }));
      setMessage("Entry deleted."); setActionError("");
    } catch (issue) { setActionError(issue instanceof Error ? issue.message : "Could not delete entry."); }
  }
  function move(entry: Entry, direction: number) {
    try {
      update((current) => {
        const items = [...current.collections[collection]];
        const visible = items.filter((item) => !item.archived);
        const index = visible.findIndex((item) => item.id === entry.id);
        const other = visible[index + direction];
        if (!other) return current;
        const first = items.findIndex((item) => item.id === entry.id);
        const second = items.findIndex((item) => item.id === other.id);
        [items[first], items[second]] = [items[second], { ...items[first], updatedAt: new Date().toISOString() }];
        return { ...current, collections: { ...current.collections, [collection]: items } };
      });
      setMessage("Display order saved locally."); setActionError("");
    } catch (issue) { setActionError(issue instanceof Error ? issue.message : "Could not reorder entries."); }
  }

  return <>
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4"><div><p className="mb-2 text-xs uppercase tracking-widest text-primary">Collections</p><h1 className="text-4xl">{definition.title}</h1><p className="mt-3 text-sm text-muted">{definition.description}</p></div><button type="button" className={primaryButton} onClick={() => { setEditing({ id: crypto.randomUUID(), values: collection === "testimonials" ? { rating: "5" } : {}, archived: false, updatedAt: null }); setMessage(""); }}>+ Add {definition.singular}</button></div>
    <div className="rounded-xl border border-border/20 bg-white">
      <div className="flex flex-wrap items-end gap-4 border-b border-border/20 p-5"><div className="min-w-48 flex-1"><label htmlFor="collection-search" className="mb-2 block text-xs font-medium">Search {definition.title.toLowerCase()}</label><input id="collection-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or category…" className={inputClass} /></div><div><label htmlFor="collection-status" className="mb-2 block text-xs font-medium">Show</label><select id="collection-status" value={status} onChange={(event) => setStatus(event.target.value)} className={inputClass}><option value="active">Active entries</option><option value="archived">Archived entries</option></select></div></div>
      {shown.length ? <ul className="divide-y divide-border/20">{shown.map((entry) => {
        const active = entries.filter((item) => !item.archived);
        const position = active.findIndex((item) => item.id === entry.id);
        return <li key={entry.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
          <Thumbnail src={entry.values.image} className={`size-16 sm:h-16 sm:w-24 ${entry.archived ? "opacity-50 grayscale" : ""}`} />
          <div className="min-w-0 flex-1"><p className="mb-2 text-[10px] uppercase tracking-widest text-primary">{entry.values.category || definition.singular}</p><h2 className="break-words font-body text-base font-semibold">{entry.values.title}</h2><p className="mt-2 text-xs text-muted">{entry.archived ? "Archived" : entry.updatedAt ? "Local draft" : "Starter content"}{entry.updatedAt ? ` · ${new Date(entry.updatedAt).toLocaleDateString()}` : ""}{collection === "fleet" && entry.values.price ? ` · INR ${Number(entry.values.price).toLocaleString("en-IN")} / day` : ""}{collection === "testimonials" && entry.values.rating ? ` · ${entry.values.rating} / 5 stars` : ""}{collection === "blogs" && entry.values.date ? ` · ${new Date(`${entry.values.date}T00:00`).toLocaleDateString()}` : ""}</p></div>
          <div className="flex flex-wrap gap-2">{!entry.archived && <><button type="button" className={secondaryButton} disabled={!!query || position === 0} aria-label={`Move ${entry.values.title} up`} onClick={() => move(entry, -1)}>↑</button><button type="button" className={secondaryButton} disabled={!!query || position === active.length - 1} aria-label={`Move ${entry.values.title} down`} onClick={() => move(entry, 1)}>↓</button><button type="button" className={secondaryButton} onClick={() => setEditing(entry)}>Edit</button></>}<button type="button" className={secondaryButton} onClick={() => archive(entry)}>{entry.archived ? "Restore" : "Archive"}</button>{entry.archived && <button type="button" className={`${secondaryButton} text-danger hover:border-danger/40`} onClick={() => remove(entry)}>Delete</button>}</div>
        </li>;
      })}</ul> : <div className="px-6 py-16 text-center"><h2 className="text-2xl">{query ? "No matching entries" : status === "archived" ? "Nothing archived" : `Your first ${definition.singular} starts here`}</h2><p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted">{query ? "Try another name or category." : status === "archived" ? "Archived entries will appear here and can be restored." : "Add your own content and save it as a draft. Customer material should be approved before publication."}</p></div>}
      <div className="border-t border-border/20 px-5 py-4 text-xs text-muted">{shown.length} {shown.length === 1 ? "entry" : "entries"} · {status === "archived" ? "Restore an entry to show it again, or delete it permanently." : "Use the arrows to set display order."}</div>
    </div>
    {message && <p role="status" className="mt-4 text-sm text-primary">{message}</p>}{actionError && <p role="alert" className="mt-4 text-sm text-danger">{actionError}</p>}
  </>;
}

function EntryForm({ collection, initial, onClose, onSaved }: { collection: CollectionKey; initial: Entry; onClose: () => void; onSaved: () => void }) {
  const { update } = useContent();
  const definition = collections[collection];
  const [values, setValues] = useState(initial.values);
  const [error, setError] = useState("");
  const dirty = JSON.stringify(values) !== JSON.stringify(initial.values);
  useUnsavedChanges(dirty);
  function cancel() { if (!dirty || window.confirm("Discard unsaved changes?")) onClose(); }

  return <>
    <button type="button" onClick={cancel} className="mb-6 min-h-11 cursor-pointer text-sm text-primary">← Back to {definition.title.toLowerCase()}</button>
    <h1 className="mb-3 text-4xl">{initial.values.title ? "Edit" : "Add"} {definition.singular}</h1><p className="mb-8 text-sm text-muted">Save a local draft. Required fields are marked with an asterisk.</p>
    <form className="rounded-xl border border-border/20 bg-white p-5 sm:p-7" onSubmit={(event) => {
      event.preventDefault();
      const validation = validateFields(definition.fields, values);
      if (validation) { setError(validation); return; }
      try {
        update((current) => {
          const entries = current.collections[collection];
          const existing = entries.find((entry) => entry.id === initial.id);
          if (existing && JSON.stringify(existing) !== JSON.stringify(initial)) throw new Error("This entry changed in another tab. Go back and reopen it before saving.");
          const next = { ...initial, values, updatedAt: new Date().toISOString() };
          return { ...current, collections: { ...current.collections, [collection]: existing ? entries.map((entry) => entry.id === initial.id ? next : entry) : [...entries, next] } };
        });
        onSaved();
      } catch (issue) { setError(issue instanceof Error ? issue.message : "Could not save draft."); }
    }}>
      <EditorFields fields={definition.fields} values={values} onChange={(key, value) => setValues((current) => ({ ...current, [key]: value }))} />
      {error && <p role="alert" className="mt-5 text-sm text-danger">{error}</p>}
      <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-border/20 pt-5"><p className="text-xs text-muted">{dirty ? "Unsaved changes" : "Stored only in this browser"}</p><div className="flex gap-2"><button type="button" onClick={cancel} className={secondaryButton}>Cancel</button><button type="submit" className={primaryButton}>Save draft</button></div></div>
    </form>
  </>;
}
