import Link from "next/link";
import { breadcrumbJsonLd } from "../lib/structuredData";
import JsonLd from "./JsonLd";

// Renders the visible trail and the matching BreadcrumbList data from one list.
export default function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-xs text-muted">
      <JsonLd data={breadcrumbJsonLd(items)} />
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-2">
              {last ? (
                <span aria-current="page" className="text-secondary">{item.name}</span>
              ) : (
                <>
                  <Link href={item.path} className="hover:text-primary">{item.name}</Link>
                  <span aria-hidden="true">/</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
