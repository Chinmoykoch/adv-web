"use client";

import { useState } from "react";
import { formFieldFor, toBody, toEntry, type ApiItem, type EntryWithMeta } from "../lib/adapters";
import { ApiError, apiRequest, errorMessage, useApi } from "../lib/api";
import { collections, type CollectionKey } from "../lib/content";
import { truncate } from "../../lib/site";
import SearchPreview, { collectionSnippet } from "./SearchPreview";
import EditorFields, { inputClass, primaryButton, resolveSlug, secondaryButton, Thumbnail, useUnsavedChanges, validateFields } from "./EditorFields";

// Public URL prefix for collections that have their own pages.
const publicPath: Partial<Record<CollectionKey, string>> = { blogs: "/blogs", fleet: "/cars" };
// Blogs and testimonials keep every earlier version (see the database migration).
const tracked: CollectionKey[] = ["blogs", "testimonials"];
// Blogs are ordered by date; everything else by hand.
const orderable = (collection: CollectionKey) => collection !== "blogs";
const hasStatus = (collection: CollectionKey) => collection === "blogs" || collection === "fleet";
// The home page's "Curated Garage" shows this many cars, chosen with "Show on home page".
const HOME_CARS = 4;

type DeletedItem = { id: string; revision: number; lastSavedAt: string; lastSavedBy: string | null; snapshot: ApiItem };
type Revision = { revision: number; action: "update" | "delete"; savedAt: string; savedBy: string | null; snapshot: ApiItem };

const endpoint = (collection: CollectionKey) => `/api/admin/collections/${collection}`;
const formatDate = (value: string) => new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

// Turns API validation errors into a message that uses the form's labels.
function describeError(collection: CollectionKey, issue: unknown) {
  if (issue instanceof ApiError && issue.fields) {
    const labels = Object.fromEntries(collections[collection].fields.map((field) => [field.key, field.label]));
    const details = Object.entries(issue.fields).map(([field, message]) => `${labels[formFieldFor(collection, field)] ?? field}: ${message}`);
    return `${issue.message} ${details.join(" · ")}`;
  }
  return errorMessage(issue, "Could not save.");
}

export default function CollectionEditor({ collection }: { collection: CollectionKey }) {
  const definition = collections[collection];
  const list = useApi<{ items: ApiItem[] }>(endpoint(collection));
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"active" | "archived" | "deleted">("active");
  const [editing, setEditing] = useState<EntryWithMeta | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");

  if (list.loading) return <p role="status">Loading {definition.title.toLowerCase()}…</p>;
  if (list.error || !list.data) return <div role="alert" className="text-danger"><p>{list.error}</p><button type="button" className={`${secondaryButton} mt-4`} onClick={list.reload}>Try again</button></div>;

  const entries = list.data.items.map((item) => toEntry(collection, item));
  if (editing) return <EntryForm key={editing.id || "new"} collection={collection} initial={editing} others={entries.filter((entry) => entry.id !== editing.id)}
    onClose={() => setEditing(null)}
    onSaved={(saved, wasNew) => {
      const items = list.data!.items;
      list.setData({ items: wasNew ? [...items, saved] : items.map((item) => (item.id === saved.id ? saved : item)) });
      setEditing(null); setActionError("");
      setMessage(wasNew ? "Saved to the database." : "Changes saved to the database.");
    }}
  />;

  const shown = entries.filter((entry) => (status === "archived" ? entry.archived : !entry.archived) && `${entry.values.title} ${entry.values.category ?? ""}`.toLowerCase().includes(query.toLowerCase()));
  const active = entries.filter((item) => !item.archived);
  const onHome = entries.filter((item) => item.values.showOnHome === "true").length;

  async function run(action: () => Promise<void>, success: string) {
    setBusy(true); setMessage(""); setActionError("");
    try { await action(); setMessage(success); }
    catch (issue) { setActionError(errorMessage(issue)); }
    finally { setBusy(false); }
  }
  const archive = (entry: EntryWithMeta) => {
    // Archiving a car also frees its home page slot.
    if (!entry.archived && !window.confirm(`Archive “${entry.values.title}”? It will be hidden from the website${entry.values.showOnHome === "true" ? " and removed from the home page" : ""}. You can restore it later.`)) return;
    run(async () => {
      const saved = await apiRequest<ApiItem>(`${endpoint(collection)}/${entry.id}`, { method: "PATCH", body: { archived: !entry.archived, ...(collection === "fleet" && !entry.archived ? { showOnHome: false } : {}) } });
      list.setData({ items: list.data!.items.map((item) => (item.id === saved.id ? saved : item)) });
    }, entry.archived ? "Entry restored." : "Entry archived.");
  };
  const remove = (entry: EntryWithMeta) => {
    const note = tracked.includes(collection) ? "It can be brought back from “Recently deleted”." : "This cannot be undone.";
    if (!window.confirm(`Delete “${entry.values.title}”? ${note}`)) return;
    run(async () => {
      await apiRequest(`${endpoint(collection)}/${entry.id}`, { method: "DELETE" });
      list.setData({ items: list.data!.items.filter((item) => item.id !== entry.id) });
    }, "Entry deleted.");
  };
  const toggleHome = (entry: EntryWithMeta) => {
    const add = entry.values.showOnHome !== "true";
    run(async () => {
      const saved = await apiRequest<ApiItem>(`${endpoint(collection)}/${entry.id}`, { method: "PATCH", body: { showOnHome: add } });
      list.setData({ items: list.data!.items.map((item) => (item.id === saved.id ? saved : item)) });
    }, add ? `“${entry.values.title}” added to the home page.` : `“${entry.values.title}” removed from the home page.`);
  };
  const move = (entry: EntryWithMeta, direction: number) => run(async () => {
    const ids = active.map((item) => item.id);
    const from = ids.indexOf(entry.id);
    [ids[from], ids[from + direction]] = [ids[from + direction], ids[from]];
    // Archived entries keep their place after the visible ones.
    const order = [...ids, ...entries.filter((item) => item.archived).map((item) => item.id)];
    await apiRequest(`${endpoint(collection)}/order`, { method: "PUT", body: { ids: order } });
    const byId = new Map(list.data!.items.map((item) => [item.id, item]));
    list.setData({ items: order.map((id, position) => ({ ...byId.get(id)!, position })) });
  }, "Display order saved.");
  const startNew = () => {
    setMessage("");
    setEditing({ id: "", archived: false, updatedAt: null, values: collection === "testimonials" ? { rating: "5" } : hasStatus(collection) ? { status: "draft" } : {} });
  };

  return <>
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-xs uppercase tracking-widest text-primary">Collections</p><h1 className="text-3xl">{definition.title}</h1><p className="mt-1.5 text-sm text-muted">{definition.description}</p></div><button type="button" className={primaryButton} onClick={startNew}>+ Add {definition.singular}</button></div>
    <div className="rounded-xl border border-border/40 bg-white shadow-sm">
      <div className="flex flex-wrap items-end gap-4 border-b border-border/20 p-5">
        {status !== "deleted" && <div className="min-w-48 flex-1"><label htmlFor="collection-search" className="mb-2 block text-xs font-medium">Search {definition.title.toLowerCase()}</label><input id="collection-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or category…" className={inputClass} /></div>}
        <div><label htmlFor="collection-status" className="mb-2 block text-xs font-medium">Show</label><select id="collection-status" value={status} onChange={(event) => { setStatus(event.target.value as typeof status); setMessage(""); }} className={inputClass}><option value="active">Active entries</option><option value="archived">Archived entries</option>{tracked.includes(collection) && <option value="deleted">Recently deleted</option>}</select></div>
      </div>
      {status === "deleted" ? <DeletedList collection={collection} onRestored={(item) => { list.setData({ items: [...list.data!.items, item] }); setStatus(item.archived ? "archived" : "active"); setMessage("Entry restored with its full history."); }} />
        : shown.length ? <ul className="divide-y divide-border/20">{shown.map((entry) => {
          const position = active.findIndex((item) => item.id === entry.id);
          const draft = hasStatus(collection) && entry.values.status !== "published";
          return <li key={entry.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
            <Thumbnail src={entry.values.image} className={`size-16 sm:h-16 sm:w-24 ${entry.archived ? "opacity-50 grayscale" : ""}`} />
            <div className="min-w-0 flex-1">
              <p className="mb-2 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-widest text-primary">{entry.values.category || definition.singular}{draft && !entry.archived && <span className="rounded-full bg-surface px-2 py-0.5 text-muted">Draft · hidden</span>}{collection === "fleet" && entry.values.showOnHome === "true" && <span className="rounded-full bg-primary-50 px-2 py-0.5 text-primary">★ On home page</span>}</p>
              <h2 className="break-words font-body text-base font-semibold">{entry.values.title}</h2>
              <p className="mt-2 text-xs text-muted">{entry.archived ? "Archived" : draft ? "Not on the website yet" : "On the website"}{entry.updatedAt ? ` · saved ${new Date(entry.updatedAt).toLocaleDateString()}` : ""}{collection === "fleet" && entry.values.category ? ` · ${entry.values.category}` : ""}{collection === "testimonials" && entry.values.rating ? ` · ${entry.values.rating} / 5 stars` : ""}{collection === "blogs" && entry.values.date ? ` · ${new Date(`${entry.values.date}T00:00`).toLocaleDateString()}` : ""}</p>
              {publicPath[collection] && entry.values.slug && <p className="mt-1 break-all font-mono text-[11px] text-muted">{publicPath[collection]}/{entry.values.slug}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              {!entry.archived && <>
                {orderable(collection) && <><button type="button" className={secondaryButton} disabled={busy || !!query || position === 0} aria-label={`Move ${entry.values.title} up`} onClick={() => move(entry, -1)}>↑</button><button type="button" className={secondaryButton} disabled={busy || !!query || position === active.length - 1} aria-label={`Move ${entry.values.title} down`} onClick={() => move(entry, 1)}>↓</button></>}
                {collection === "fleet" && <button type="button" className={secondaryButton} disabled={busy || (entry.values.showOnHome !== "true" && onHome >= HOME_CARS)} title={entry.values.showOnHome !== "true" && onHome >= HOME_CARS ? "4 cars are already on the home page. Remove one first." : undefined} onClick={() => toggleHome(entry)}>{entry.values.showOnHome === "true" ? "Remove from home" : "Add to home"}</button>}
                <button type="button" className={secondaryButton} disabled={busy} onClick={() => { setMessage(""); setEditing(entry); }}>Edit</button>
              </>}
              <button type="button" className={secondaryButton} disabled={busy} onClick={() => archive(entry)}>{entry.archived ? "Restore" : "Archive"}</button>
              {entry.archived && <button type="button" className={`${secondaryButton} text-danger hover:border-danger/40`} disabled={busy} onClick={() => remove(entry)}>Delete</button>}
            </div>
          </li>;
        })}</ul> : <div className="px-6 py-16 text-center"><h2 className="text-2xl">{query ? "No matching entries" : status === "archived" ? "Nothing archived" : `Your first ${definition.singular} starts here`}</h2><p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted">{query ? "Try another name or category." : status === "archived" ? "Archived entries are hidden from the website and can be restored." : "Add your own content. Customer material should be approved before publication."}</p></div>}
      {status !== "deleted" && <div className="border-t border-border/20 px-5 py-4 text-xs text-muted">{shown.length} {shown.length === 1 ? "entry" : "entries"} · {status === "archived" ? "Restore an entry to show it again, or delete it." : orderable(collection) ? "Use the arrows to set display order." : "Articles are listed newest first."}{collection === "fleet" && ` · Home page: ${onHome} of ${HOME_CARS} chosen${onHome < HOME_CARS ? "; the next cars in display order fill the gaps" : ""}.`}</div>}
    </div>
    {message && <p role="status" className="mt-4 text-sm text-primary">{message}</p>}{actionError && <p role="alert" className="mt-4 text-sm text-danger">{actionError}</p>}
  </>;
}

function DeletedList({ collection, onRestored }: { collection: CollectionKey; onRestored: (item: ApiItem) => void }) {
  const deleted = useApi<{ items: DeletedItem[] }>(`${endpoint(collection)}/deleted`);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  if (deleted.loading) return <p role="status" className="p-5 text-sm">Loading deleted entries…</p>;
  if (deleted.error || !deleted.data) return <p role="alert" className="p-5 text-sm text-danger">{deleted.error}</p>;
  if (!deleted.data.items.length) return <div className="px-6 py-16 text-center"><h2 className="text-2xl">Nothing deleted</h2><p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted">Deleted entries appear here with their final version, ready to restore.</p></div>;

  async function restore(item: DeletedItem) {
    setBusyId(item.id); setError("");
    try {
      const restored = await apiRequest<ApiItem>(`${endpoint(collection)}/${item.id}/revisions/${item.revision}/restore`, { method: "POST" });
      deleted.setData({ items: deleted.data!.items.filter((other) => other.id !== item.id) });
      onRestored(restored);
    } catch (issue) { setError(errorMessage(issue)); }
    finally { setBusyId(""); }
  }
  return <>
    <ul className="divide-y divide-border/20">{deleted.data.items.map((item) => {
      const entry = toEntry(collection, item.snapshot);
      return <li key={item.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="min-w-0 flex-1"><h2 className="break-words font-body text-base font-semibold">{entry.values.title}</h2><p className="mt-1 text-xs text-muted">Deleted {formatDate(item.lastSavedAt)}{item.lastSavedBy ? ` by ${item.lastSavedBy}` : ""}</p></div>
        <button type="button" className={secondaryButton} disabled={!!busyId} onClick={() => restore(item)}>{busyId === item.id ? "Restoring…" : "Restore"}</button>
      </li>;
    })}</ul>
    {error && <p role="alert" className="px-5 pb-5 text-sm text-danger">{error}</p>}
  </>;
}

function EntryForm({ collection, initial, others, onClose, onSaved }: { collection: CollectionKey; initial: EntryWithMeta; others: EntryWithMeta[]; onClose: () => void; onSaved: (item: ApiItem, wasNew: boolean) => void }) {
  const definition = collections[collection];
  const isNew = !initial.id;
  const [values, setValues] = useState(initial.values);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(values) !== JSON.stringify(initial.values);
  useUnsavedChanges(dirty && !saving);
  // Empty search fields fall back to generated text; show it so editors know what Google gets.
  const generated = collectionSnippet(collection, { ...values, seoTitle: "", seoDescription: "" })();
  const placeholders = generated ? { seoTitle: generated.title, seoDescription: truncate(generated.description) } : undefined;
  function cancel() { if (!dirty || window.confirm("Discard unsaved changes?")) onClose(); }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateFields(definition.fields, values);
    if (validation) return setError(validation);
    let toSave = values;
    if (definition.fields.some((field) => field.type === "slug")) {
      const resolved = resolveSlug(values, others);
      if (resolved.error) return setError(resolved.error);
      toSave = resolved.values!;
    }
    setSaving(true); setError("");
    try {
      const saved = await apiRequest<ApiItem>(isNew ? endpoint(collection) : `${endpoint(collection)}/${initial.id}`, { method: isNew ? "POST" : "PUT", body: toBody(collection, toSave) });
      onSaved(saved, isNew);
    } catch (issue) {
      setError(describeError(collection, issue));
      setSaving(false);
    }
  }

  return <>
    <button type="button" onClick={cancel} className="mb-3 min-h-11 cursor-pointer text-sm text-primary">← Back to {definition.title.toLowerCase()}</button>
    <h1 className="mb-1.5 text-3xl">{isNew ? "Add" : "Edit"} {definition.singular}</h1><p className="mb-5 text-sm text-muted">Saving updates the database. Required fields are marked with an asterisk.</p>
    <form className="rounded-xl border border-border/40 bg-white p-4 shadow-sm sm:p-5" onSubmit={save}>
      <EditorFields fields={definition.fields} values={values} folder={collection} placeholders={placeholders} preview={<SearchPreview snippet={collectionSnippet(collection, values)} values={values} />} onChange={(key, value) => setValues((current) => ({ ...current, [key]: value }))} />
      {error && <p role="alert" className="mt-5 text-sm text-danger">{error}</p>}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/30 pt-4"><p className="text-xs text-muted">{dirty ? "Unsaved changes" : isNew ? "Not saved yet" : `Saved ${initial.updatedAt ? formatDate(initial.updatedAt) : ""}`}</p><div className="flex gap-2"><button type="button" onClick={cancel} className={secondaryButton}>Cancel</button><button type="submit" className={primaryButton} disabled={saving}>{saving ? "Saving…" : "Save"}</button></div></div>
    </form>
    {!isNew && tracked.includes(collection) && <History collection={collection} id={initial.id} dirty={dirty} onRestored={(item) => onSaved(item, false)} />}
  </>;
}

// Earlier versions of a blog post or testimonial. Restoring saves the current version first,
// so a restore can itself be undone from this list.
function History({ collection, id, dirty, onRestored }: { collection: CollectionKey; id: string; dirty: boolean; onRestored: (item: ApiItem) => void }) {
  const history = useApi<{ items: Revision[] }>(`${endpoint(collection)}/${id}/revisions`);
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState("");
  const preview = (snapshot: ApiItem) => String(snapshot.body ?? snapshot.quote ?? "").replace(/\s+/g, " ").slice(0, 140);

  async function restore(revision: Revision) {
    if (!window.confirm(`Restore version ${revision.revision}? ${dirty ? "Your unsaved changes will be lost. " : ""}The current version is kept in this history.`)) return;
    setBusy(revision.revision); setError("");
    try { onRestored(await apiRequest<ApiItem>(`${endpoint(collection)}/${id}/revisions/${revision.revision}/restore`, { method: "POST" })); }
    catch (issue) { setError(errorMessage(issue)); setBusy(0); }
  }

  return <section aria-labelledby="history-heading" className="mt-4 rounded-xl border border-border/40 bg-white p-4 shadow-sm sm:p-5">
    <h2 id="history-heading" className="text-2xl">Version history</h2>
    <p className="mt-2 text-sm text-muted">Every earlier version is kept. Restore one to make it current again.</p>
    {history.loading ? <p role="status" className="mt-4 text-sm">Loading history…</p>
      : history.error ? <p role="alert" className="mt-4 text-sm text-danger">{history.error}</p>
      : !history.data?.items.length ? <p className="mt-4 text-sm text-muted">No earlier versions yet. They appear here after the first change is saved.</p>
      : <ol className="mt-4 divide-y divide-border/15">{history.data.items.map((revision) => <li key={revision.revision} className="flex flex-wrap items-start justify-between gap-4 py-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Version {revision.revision} · {String(revision.snapshot.title ?? revision.snapshot.customerName ?? "")}</p>
          <p className="mt-1 text-xs text-muted">Saved {formatDate(revision.savedAt)}{revision.savedBy ? ` by ${revision.savedBy}` : ""}</p>
          {preview(revision.snapshot) && <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted">{preview(revision.snapshot)}…</p>}
        </div>
        <button type="button" className={secondaryButton} disabled={!!busy} onClick={() => restore(revision)}>{busy === revision.revision ? "Restoring…" : "Restore"}</button>
      </li>)}</ol>}
    {error && <p role="alert" className="mt-4 text-sm text-danger">{error}</p>}
  </section>;
}
