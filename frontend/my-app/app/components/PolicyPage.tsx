import type { Metadata } from "next";
import Link from "next/link";
import policies from "../content/policies.json";
import { getSiteSettingsOrDefault } from "../lib/queries";
import { pageMetadata } from "../lib/site";
import Breadcrumbs from "./Breadcrumbs";
import DocumentBlocks from "./DocumentBlocks";
import Navbar from "./Navbar";

type Policy = (typeof policies)[number];
export function policyFor(slug: string): Policy {
  const policy = policies.find((item) => item.slug === slug);
  if (!policy) throw new Error(`Unknown policy: ${slug}`);
  return policy;
}

export async function policyMetadata(slug: string): Promise<Metadata> {
  const policy = policyFor(slug);
  return pageMetadata({ settings: await getSiteSettingsOrDefault(), title: policy.title, description: policy.introduction[0], path: `/${policy.slug}` });
}

function Contents({ policy }: { policy: Policy }) {
  return <ol className="space-y-1">{policy.sections.map((section) => <li key={section.id}><a href={`#${section.id}`} className="inline-flex min-h-11 items-center rounded-sm py-2 text-xs leading-5 text-muted transition-colors hover:text-primary motion-reduce:transition-none">{section.title}</a></li>)}</ol>;
}

export default function PolicyPage({ slug }: { slug: string }) {
  const policy = policyFor(slug);
  return <div className="min-h-screen bg-canvas-light px-5 py-4 sm:px-8 sm:py-6 lg:px-12">
    <div className="mx-auto max-w-7xl">
      <Navbar />
      <main className="py-10 sm:py-14 lg:py-16">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: policy.title, path: `/${policy.slug}` }]} />
        <header className="mb-9 border-b border-border/30 pb-8 sm:mb-12 sm:pb-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[.18em] text-primary">Adventurecarz · Legal & policies</p>
          <h1 className="max-w-4xl text-[clamp(2rem,4.5vw,3.5rem)] leading-tight tracking-tight text-secondary">{policy.title}</h1>
          <dl className="mt-5 flex flex-col gap-2 text-xs leading-6 text-muted sm:flex-row sm:gap-8">
            <div className="flex gap-2"><dt>Effective date:</dt><dd><time dateTime={policy.dateISO}>{policy.effectiveDate}</time></dd></div>
            <div className="flex gap-2"><dt>Last updated:</dt><dd><time dateTime={policy.dateISO}>{policy.lastUpdated}</time></dd></div>
          </dl>
        </header>
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.65fr)_minmax(0,2fr)] lg:gap-14">
          <aside className="min-w-0 lg:sticky lg:top-6">
            <nav aria-label="Policy sections" className="hidden lg:block"><h2 className="mb-4 font-body text-xs font-semibold uppercase tracking-widest text-primary">On this page</h2><Contents policy={policy} /></nav>
            <details className="rounded-lg border border-border/30 bg-white lg:hidden"><summary className="min-h-12 cursor-pointer px-4 py-3 text-sm font-semibold text-secondary">On this page</summary><nav aria-label="Policy sections" className="px-4 pb-4"><Contents policy={policy} /></nav></details>
          </aside>
          <article className="min-w-0 max-w-3xl">
            <DocumentBlocks blocks={policy.introduction} />
            <div className="mt-9 space-y-9 sm:mt-12 sm:space-y-12">
              {policy.sections.map((section) => <section key={section.id} id={section.id} aria-labelledby={`${section.id}-heading`} className="scroll-mt-8 border-t border-border/25 pt-7 sm:pt-8">
                <h2 id={`${section.id}-heading`} className="mb-5 font-body text-base font-semibold leading-7 text-secondary sm:text-lg">{section.title}</h2>
                <DocumentBlocks blocks={section.blocks} />
              </section>)}
            </div>
            <nav aria-label="Related policies" className="mt-12 flex flex-wrap gap-x-6 gap-y-2 border-t border-border/30 pt-6">{policies.filter((item) => item.slug !== slug).map((item) => <Link key={item.slug} href={`/${item.slug}`} className="inline-flex min-h-11 items-center text-sm font-semibold text-primary hover:text-primary-700">{item.title}<span aria-hidden="true" className="ml-2">→</span></Link>)}</nav>
          </article>
        </div>
      </main>
    </div>
  </div>;
}
