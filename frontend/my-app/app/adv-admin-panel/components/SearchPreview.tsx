"use client";

import { carSeoDescription, carSeoTitle, defaultPageTitles, resolveSiteSettings, site, truncate, type SiteSettings } from "../../lib/site";
import { useApi } from "../lib/api";
import { initialContent, pageDefinitions, slugify, type CollectionKey, type PageKey } from "../lib/content";

type Snippet = { title: string; absoluteTitle?: boolean; description: string; path: string };
type Values = Record<string, string>;

// What each page shows in Google when its SEO fields are empty. Mirrors generateMetadata on the
// website, using the same fallback helpers, so the preview matches what is published.
export function collectionSnippet(collection: CollectionKey, values: Values) {
  const slug = values.slug?.trim() || slugify(values.title ?? "") || "your-slug";
  return (): Snippet | null => {
    if (collection === "blogs") return { title: values.seoTitle?.trim() || values.title?.trim() || "Article title", description: values.seoDescription?.trim() || values.excerpt?.trim() || "", path: `/blogs/${slug}` };
    if (collection === "fleet") {
      const name = values.title?.trim() || "vehicle";
      const description = values.seoDescription?.trim() || carSeoDescription({ name, seats: values.seats ?? "", fuel: values.fuel ?? "", transmission: values.transmission ?? "" });
      return { title: values.seoTitle?.trim() || carSeoTitle(name), description, path: `/cars/${slug}` };
    }
    return null;
  };
}

export function pageSnippet(page: PageKey, values: Values) {
  return (settings: SiteSettings): Snippet | null => {
    if (page === "site-settings") return null;
    const description = values.seoDescription?.trim() || settings.description;
    if (page === "home") return { title: `${values.seoTitle?.trim() || settings.title} | ${settings.name}`, absoluteTitle: true, description, path: "/" };
    return { title: values.seoTitle?.trim() || defaultPageTitles[page], description, path: pageDefinitions[page].href };
  };
}

// An approximation of a Google result: site name, address, title and description. Google trims
// titles at roughly 600 pixels (about 60 characters) and descriptions at about 160 characters.
export default function SearchPreview({ snippet, values }: { snippet: (settings: SiteSettings) => Snippet | null; values: Values }) {
  const saved = useApi<{ content: Values }>("/api/admin/pages/site-settings");
  const settings = resolveSiteSettings({ ...initialContent.pages["site-settings"].values, ...saved.data?.content });
  const result = snippet(settings);
  if (!result) return null;

  const fullTitle = result.absoluteTitle ? result.title : `${result.title} | ${settings.name}`;
  const canonical = values.canonicalUrl?.trim();
  const ownUrl = new URL(result.path, `${site.url}/`);
  // An unfinished canonical link is ignored here; validation reports it on save.
  const shownUrl = (() => { try { return new URL(canonical || result.path, `${site.url}/`); } catch { return ownUrl; } })();
  const crumbs = [shownUrl.host, ...shownUrl.pathname.split("/").filter(Boolean)].join(" › ");
  const pointsElsewhere = canonical && shownUrl.href !== ownUrl.href;
  const hidden = values.noindex === "true";
  const description = truncate(result.description);

  return <div>
    <div style={{ fontFamily: "Arial, sans-serif" }} className={`max-w-[600px] rounded-lg border border-border/25 bg-white p-4 ${hidden ? "opacity-50" : ""}`}>
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full bg-surface text-xs font-bold text-secondary">{settings.name.charAt(0)}</span>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm text-[#202124]">{settings.name}</p>
          <p className="truncate text-xs text-[#4d5156]">{`${shownUrl.protocol}//${crumbs}`}</p>
        </div>
      </div>
      <p className="mt-2 truncate text-xl leading-snug text-[#1a0dab]">{fullTitle}</p>
      {description
        ? <p className="mt-1 line-clamp-2 text-sm leading-[1.58] text-[#4d5156]">{description}</p>
        : <p className="mt-1 text-sm italic text-muted">No description: Google will pick some text from the page.</p>}
    </div>
    <p className="mt-2 text-xs leading-5 text-muted">
      {hidden ? <strong className="font-semibold text-danger">Hidden from Google: this page will not appear in search results. </strong> : null}
      {pointsElsewhere ? <strong className="font-semibold text-secondary">Canonical address set: Google is told the main version is {shownUrl.href}, so this page’s own address may not be listed. </strong> : null}
      An approximation; Google sometimes rewrites titles and descriptions.{fullTitle.length > 60 ? ` The title is ${fullTitle.length} characters, so Google will likely shorten it.` : ""}
    </p>
  </div>;
}
