"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toEntry, type ApiItem } from "../lib/adapters";
import { apiRequest, errorMessage } from "../lib/api";
import { collections, collectionKeys, pageDefinitions, websitePageKeys, type CollectionKey, type PageKey } from "../lib/content";
import { primaryButton, secondaryButton } from "./EditorFields";

type Overview = {
  pages: { key: PageKey; updatedAt: string | null }[];
  collections: Record<CollectionKey, ApiItem[]>;
  leads: Record<string, number>;
};

async function loadOverview(): Promise<Overview> {
  const [pages, leads, ...lists] = await Promise.all([
    apiRequest<{ items: Overview["pages"] }>("/api/admin/pages"),
    apiRequest<Record<string, number>>("/api/admin/leads/summary"),
    ...collectionKeys.map((key) => apiRequest<{ items: ApiItem[] }>(`/api/admin/collections/${key}`)),
  ]);
  return { pages: pages.items, leads, collections: Object.fromEntries(collectionKeys.map((key, index) => [key, lists[index].items])) as Overview["collections"] };
}

export default function Dashboard() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    loadOverview().then((data) => { if (active) { setOverview(data); setError(""); } }, (issue) => { if (active) setError(errorMessage(issue, "Couldn’t load your workspace.")); });
    return () => { active = false; };
  }, [attempt]);

  if (error) return <div role="alert" className="text-danger"><p>{error}</p><button type="button" className={`${secondaryButton} mt-4`} onClick={() => setAttempt((value) => value + 1)}>Try again</button></div>;
  if (!overview) return <p role="status">Loading your workspace…</p>;

  const items = collectionKeys.flatMap((key) => overview.collections[key].map((item) => ({ key, item })));
  const live = items.filter(({ item }) => !item.archived && item.status !== "draft").length;
  const drafts = items.filter(({ item }) => !item.archived && item.status === "draft").length;
  const recent = [
    ...overview.pages.filter((page) => page.key in pageDefinitions).map((page) => ({ title: pageDefinitions[page.key].title, group: page.key === "site-settings" ? "Settings" : "Page", href: `/adv-admin-panel/pages/${page.key}`, date: page.updatedAt })),
    ...items.map(({ key, item }) => ({ title: toEntry(key, item).values.title, group: collections[key].title, href: `/adv-admin-panel/${key}`, date: item.updatedAt })),
  ].filter((item) => item.date).sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "")).slice(0, 6);

  return <>
    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Your website, thoughtfully managed</p>
    <h1 className="text-4xl tracking-tight sm:text-5xl">Welcome to your studio.</h1>
    <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">A home for your stories, services, and the journeys in between. Start with a page or build your next collection.</p>
    <BrowserDraftsNotice />
    <div className="my-8 grid grid-cols-2 gap-4 xl:grid-cols-4">{([
      ["Website pages", websitePageKeys.length, websitePageKeys.map((key) => pageDefinitions[key].title).join(", ")],
      ["On the website", live, "Published collection entries"],
      ["Drafts", drafts, "Hidden until you publish them"],
      ["New enquiries", overview.leads.new ?? 0, "Waiting for a reply · open Enquiries"],
    ] as const).map(([label, count, hint]) => <div key={label} className="rounded-xl border border-border/20 bg-white p-5"><p className="text-xs text-muted">{label}</p><p className="my-3 text-4xl font-semibold tabular-nums">{count}</p><p className="text-xs text-muted">{hint}</p></div>)}</div>
    <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
      <section className="rounded-xl border border-border/20 bg-white p-6"><h2 className="text-2xl">Your pages</h2><p className="mb-3 mt-2 text-sm text-muted">Refresh the words and images that introduce your brand.</p>{websitePageKeys.map((key) => <Link key={key} href={`/adv-admin-panel/pages/${key}`} className="flex items-center justify-between gap-3 border-b border-border/15 py-5 last:border-0"><span><span className="block text-sm font-semibold">{pageDefinitions[key].title}</span><span className="text-xs text-muted">{pageDefinitions[key].href}</span></span><span className="text-sm text-primary">Edit page ↗</span></Link>)}</section>
      <section className="rounded-xl border border-border/20 bg-white p-6"><h2 className="text-2xl">Recent changes</h2>{recent.length ? <ul className="mt-4">{recent.map((item, index) => <li key={`${item.href}-${index}`} className="border-b border-border/15 py-3 last:border-0"><Link href={item.href} className="block truncate text-sm font-medium hover:text-primary">{item.title}</Link><p className="mt-1 text-xs text-muted">{item.group} · {new Date(item.date!).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</p></li>)}</ul> : <div className="py-10"><p className="text-sm font-medium">A fresh start.</p><p className="mt-2 text-sm leading-6 text-muted">Saved changes will appear here.</p></div>}</section>
    </div>
    <section className="mt-9"><h2 className="mb-5 text-2xl">Explore your collections</h2><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{collectionKeys.map((key) => <Link key={key} href={`/adv-admin-panel/${key}`} className="rounded-xl border border-border/20 bg-white p-5 transition-colors hover:border-primary/50"><div className="flex justify-between"><span className="text-sm font-semibold">{collections[key].title}</span><span className="text-primary">↗</span></div><p className="mt-3 text-xs leading-5 text-muted">{collections[key].description}</p><p className="mt-4 text-xs font-medium">{overview.collections[key].filter((item) => !item.archived).length} entries</p></Link>)}</div></section>
  </>;
}

// The studio used to save drafts in the browser. If any are left on this computer, offer them as a
// download so nothing written before the database switch is lost.
const LEGACY_DRAFTS_KEY = "adventurecarz-admin-drafts-v1";

function BrowserDraftsNotice() {
  const [drafts, setDrafts] = useState<string | null>(null);
  useEffect(() => {
    let stored: string | null = null;
    try { stored = window.localStorage.getItem(LEGACY_DRAFTS_KEY); } catch { /* storage blocked: nothing to recover */ }
    // Read after mount: localStorage is not available during server rendering.
    if (stored) queueMicrotask(() => setDrafts(stored));
  }, []);
  if (!drafts) return null;

  function download() {
    const url = URL.createObjectURL(new Blob([drafts!], { type: "application/json" }));
    Object.assign(document.createElement("a"), { href: url, download: `adventurecarz-browser-drafts-${new Date().toISOString().slice(0, 10)}.json` }).click();
    URL.revokeObjectURL(url);
  }
  function dismiss() {
    if (!window.confirm("Remove the old browser drafts from this computer? Download them first if you still need anything in them.")) return;
    try { window.localStorage.removeItem(LEGACY_DRAFTS_KEY); } catch { /* ignore */ }
    setDrafts(null);
  }
  return <section aria-labelledby="legacy-drafts" className="mt-6 rounded-xl border border-primary/20 bg-primary-50 p-5">
    <h2 id="legacy-drafts" className="text-lg">Old browser drafts found</h2>
    <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary/80">The studio now saves to the database. This computer still has drafts from before the switch, which aren’t on the website. Download them to copy anything you need into the editors, then remove them.</p>
    <div className="mt-4 flex flex-wrap gap-2"><button type="button" className={primaryButton} onClick={download}>Download drafts</button><button type="button" className={secondaryButton} onClick={dismiss}>Remove from this computer</button></div>
  </section>;
}
