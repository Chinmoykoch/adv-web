import type { MetadataRoute } from "next";
import { getBlogPosts, getCars, getPage } from "./lib/queries";
import { absoluteUrl, inSitemap, pageSeoControls, type SeoControls } from "./lib/site";

type Entry = Omit<MetadataRoute.Sitemap[number], "url"> & { path: string; seo: SeoControls };

// Lists every published page Google should index. Drafts and archived entries are never returned
// by the API; pages marked "Hide from Google" or pointing their canonical address elsewhere are
// left out here. It refreshes with the same tags as the pages it lists.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, cars, home, about, contact, blogs, carsPage] = await Promise.all([
    getBlogPosts(), getCars(), getPage("home"), getPage("about-us"), getPage("contact"), getPage("blogs"), getPage("cars"),
  ]);
  const entries: Entry[] = [
    { path: "/", seo: pageSeoControls(home), changeFrequency: "weekly", priority: 1 },
    { path: "/cars", seo: pageSeoControls(carsPage), changeFrequency: "weekly", priority: 0.9 },
    ...cars.map((car): Entry => ({ path: `/cars/${car.slug}`, seo: car, lastModified: car.updatedAt, changeFrequency: "monthly", priority: 0.8 })),
    { path: "/blogs", seo: pageSeoControls(blogs), changeFrequency: "weekly", priority: 0.8 },
    ...posts.map((post): Entry => ({ path: `/blogs/${post.slug}`, seo: post, lastModified: post.updatedAt ?? post.date, changeFrequency: "monthly", priority: 0.6 })),
    { path: "/aboutus", seo: pageSeoControls(about), changeFrequency: "monthly", priority: 0.7 },
    { path: "/contact", seo: pageSeoControls(contact), changeFrequency: "monthly", priority: 0.7 },
  ];
  return entries.flatMap(({ path, seo, ...entry }) => (inSitemap(path, seo) ? [{ ...entry, url: absoluteUrl(path) }] : []));
}
