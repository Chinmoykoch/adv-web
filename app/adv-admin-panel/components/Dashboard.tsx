"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { collections, collectionKeys, pageDefinitions, pageKeys } from "../lib/content";
import { useContent } from "../lib/store";
import { primaryButton, secondaryButton } from "./EditorFields";

export default function Dashboard() {
  const { data, loading, error, exportDrafts, importDrafts, resetDrafts } = useContent();
  if (loading) return <p role="status">Loading your workspace…</p>;
  const entries = collectionKeys.flatMap((key) => data.collections[key]);
  const changedPages = pageKeys.filter((key) => data.pages[key].updatedAt);
  const recent = [
    ...pageKeys.map((key) => ({ title: pageDefinitions[key].title, group: "Page", href: `/adv-admin-panel/pages/${key}`, date: data.pages[key].updatedAt })),
    ...collectionKeys.flatMap((key) => data.collections[key].map((entry) => ({ title: entry.values.title, group: collections[key].title, href: `/adv-admin-panel/${key}`, date: entry.updatedAt }))),
  ].filter((item) => item.date).sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "")).slice(0, 5);
  return <>
    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Your website, thoughtfully managed</p>
    <h1 className="text-4xl tracking-tight sm:text-5xl">Welcome to your studio.</h1>
    <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">A home for your stories, services, and the journeys in between. Start with a page or build your next collection.</p>
    {error && <p role="alert" className="mt-5 rounded-lg bg-primary-50 p-4 text-sm text-danger">{error}</p>}
    <div className="my-8 grid grid-cols-2 gap-4 xl:grid-cols-4">{[
      ["Website pages", pageKeys.length, "Home, About Us, Contact"], ["Collection entries", entries.filter((entry) => !entry.archived).length, "Available in this workspace"],
      ["Saved drafts", entries.filter((entry) => entry.updatedAt && !entry.archived).length + changedPages.length, "Stored in this browser"], ["Archived entries", entries.filter((entry) => entry.archived).length, "Can be restored anytime"],
    ].map(([label, count, hint]) => <div key={label} className="rounded-xl border border-border/20 bg-white p-5"><p className="text-xs text-muted">{label}</p><p className="my-3 text-4xl font-semibold tabular-nums">{count}</p><p className="text-xs text-muted">{hint}</p></div>)}</div>
    <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
      <section className="rounded-xl border border-border/20 bg-white p-6"><h2 className="text-2xl">Your pages</h2><p className="mb-3 mt-2 text-sm text-muted">Refresh the words and images that introduce your brand.</p>{pageKeys.map((key) => <Link key={key} href={`/adv-admin-panel/pages/${key}`} className="flex items-center justify-between gap-3 border-b border-border/15 py-5 last:border-0"><span><span className="block text-sm font-semibold">{pageDefinitions[key].title}</span><span className="text-xs text-muted">{pageDefinitions[key].href}</span></span><span className="text-sm text-primary">Edit page ↗</span></Link>)}</section>
      <section className="rounded-xl border border-border/20 bg-white p-6"><h2 className="text-2xl">Recent changes</h2>{recent.length ? <ul className="mt-4">{recent.map((item, index) => <li key={`${item.href}-${index}`} className="border-b border-border/15 py-3 last:border-0"><Link href={item.href} className="block truncate text-sm font-medium hover:text-primary">{item.title}</Link><p className="mt-1 text-xs text-muted">{item.group} · {new Date(item.date!).toLocaleDateString()}</p></li>)}</ul> : <div className="py-10"><p className="text-sm font-medium">A fresh start.</p><p className="mt-2 text-sm leading-6 text-muted">Save your first draft and your recent changes will appear here.</p></div>}</section>
    </div>
    <section className="mt-9"><h2 className="mb-5 text-2xl">Explore your collections</h2><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{collectionKeys.map((key) => <Link key={key} href={`/adv-admin-panel/${key}`} className="rounded-xl border border-border/20 bg-white p-5 transition-colors hover:border-primary/50"><div className="flex justify-between"><span className="text-sm font-semibold">{collections[key].title}</span><span className="text-primary">↗</span></div><p className="mt-3 text-xs leading-5 text-muted">{collections[key].description}</p><p className="mt-4 text-xs font-medium">{data.collections[key].filter((entry) => !entry.archived).length} entries</p></Link>)}</div></section>
    <WorkspaceTools exportDrafts={exportDrafts} importDrafts={importDrafts} resetDrafts={resetDrafts} />
  </>;
}

function WorkspaceTools({ exportDrafts, importDrafts, resetDrafts }: { exportDrafts: () => string; importDrafts: (text: string) => void; resetDrafts: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [failure, setFailure] = useState("");
  function report(action: () => void, success: string) {
    try { action(); setMessage(success); setFailure(""); }
    catch (issue) { setFailure(issue instanceof Error ? issue.message : "Something went wrong."); setMessage(""); }
  }
  function download() {
    const url = URL.createObjectURL(new Blob([exportDrafts()], { type: "application/json" }));
    const link = Object.assign(document.createElement("a"), { href: url, download: `adventurecarz-drafts-${new Date().toISOString().slice(0, 10)}.json` });
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Backup downloaded."); setFailure("");
  }
  async function upload(file: File | undefined) {
    if (fileRef.current) fileRef.current.value = "";
    if (!file || !window.confirm("Replace every draft in this browser with the contents of this backup?")) return;
    const text = await file.text();
    report(() => importDrafts(text), "Backup imported.");
  }
  return <section aria-labelledby="workspace-tools-heading" className="mt-9 rounded-xl border border-border/20 bg-white p-6">
    <div className="flex flex-wrap items-start justify-between gap-5">
      <div className="max-w-xl"><h2 id="workspace-tools-heading" className="text-2xl">Keep your drafts safe</h2><p className="mt-2 text-sm leading-6 text-muted">Drafts live only in this browser. Download a backup to move them to another device or share them with your developer, and import it when you need it again.</p></div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={primaryButton} onClick={download}>Download backup</button>
        <button type="button" className={secondaryButton} onClick={() => fileRef.current?.click()}>Import backup</button>
        <button type="button" className={`${secondaryButton} text-danger hover:border-danger/40`} onClick={() => { if (window.confirm("Reset the workspace to the starter content? Every saved draft in this browser will be removed.")) report(resetDrafts, "Workspace reset to starter content."); }}>Reset workspace</button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" tabIndex={-1} aria-label="Choose a backup file" onChange={(event) => upload(event.target.files?.[0])} />
      </div>
    </div>
    {message && <p role="status" className="mt-4 text-sm text-primary">{message}</p>}{failure && <p role="alert" className="mt-4 text-sm text-danger">{failure}</p>}
  </section>;
}
