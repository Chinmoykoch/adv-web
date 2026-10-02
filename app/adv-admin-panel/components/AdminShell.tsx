"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { collections, collectionKeys, pageDefinitions, pageKeys } from "../lib/content";

const root = "/adv-admin-panel";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const current = pathname.split("/").at(-1) ?? "";
  const trail = pathname.startsWith(`${root}/pages/`) && Object.hasOwn(pageDefinitions, current) ? ["Pages", pageDefinitions[current as keyof typeof pageDefinitions].title]
    : Object.hasOwn(collections, current) ? [collections[current as keyof typeof collections].title] : ["Dashboard"];
  function navItem(href: string, title: string, nested = false) {
    const active = pathname === href;
    return <Link key={href} href={href} onClick={() => setMenuOpen(false)} aria-current={active ? "page" : undefined} className={`flex min-h-11 items-center justify-between rounded-lg px-3 text-sm transition-colors ${nested ? "ml-4" : ""} ${active ? "bg-primary text-white" : "text-neutral-300 hover:bg-white/5 hover:text-white"}`}><span>{title}</span>{active && <span aria-hidden="true">↗</span>}</Link>;
  }
  return (
    <div className="min-h-screen bg-canvas text-secondary lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="bg-secondary px-5 py-6 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:overflow-y-auto">
        <div className="flex items-center justify-between gap-4">
          <Link href={root} className="text-white"><span className="font-heading text-2xl">AdventureCarz<span className="text-primary">.</span></span><span className="mt-1 block text-[10px] uppercase tracking-[0.22em] text-neutral-400">Content studio</span></Link>
          <button type="button" aria-expanded={menuOpen} aria-controls="admin-navigation" onClick={() => setMenuOpen(!menuOpen)} className="min-h-11 rounded-lg border border-white/20 px-3 text-sm text-white lg:hidden">{menuOpen ? "Close" : "Menu"}</button>
        </div>
        <nav id="admin-navigation" aria-label="Admin navigation" className={`${menuOpen ? "block" : "hidden"} mt-9 space-y-1 lg:block`}>
          {navItem(root, "Dashboard")}
          <p className="px-3 pb-2 pt-6 text-[10px] uppercase tracking-[0.18em] text-neutral-400">Pages</p>
          {pageKeys.map((page) => navItem(`${root}/pages/${page}`, pageDefinitions[page].title, true))}
          <p className="px-3 pb-2 pt-6 text-[10px] uppercase tracking-[0.18em] text-neutral-400">Collections</p>
          {collectionKeys.map((key) => navItem(`${root}/${key}`, collections[key].title))}
        </nav>
        <div className="mt-8 border-t border-white/10 pt-5 lg:mt-auto lg:pt-6"><Link href="/" className="inline-flex min-h-11 items-center gap-3 text-sm text-neutral-300 hover:text-white">← View website</Link></div>
      </aside>
      <div className="min-w-0">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/20 bg-white/70 px-5 py-5 sm:px-9">
          <nav aria-label="Breadcrumb"><ol className="flex flex-wrap items-center text-xs text-muted"><li>Workspace</li>{trail.map((item, index) => <li key={item} className="flex items-center"><span aria-hidden="true" className="mx-2 text-neutral-300">/</span><span className={index === trail.length - 1 ? "text-secondary" : undefined} aria-current={index === trail.length - 1 ? "page" : undefined}>{item}</span></li>)}</ol></nav>
          <span className="rounded-full border border-primary/15 bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary">Local draft workspace</span>
        </header>
        <div className="border-b border-border/20 bg-canvas-light px-5 py-3 text-xs leading-5 text-muted sm:px-9">Saved in this browser only. Changes do not update the live website. Backend, login, and publishing are not connected yet.</div>
        <main id="admin-main" className="mx-auto max-w-7xl p-5 sm:p-9 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
