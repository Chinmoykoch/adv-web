import "server-only";
import { initialContent, type PageKey } from "../adv-admin-panel/lib/content";
import type { BlogPost } from "../blogs/data";
import type { Car } from "../components/landing/components/cars/carData";
import { resolveSiteSettings, type SeoControls } from "./site";

// All public content comes from the Express API, which reads Supabase. Responses are cached
// and tagged; when an admin saves, the backend calls /api/revalidate with the matching tags
// so only the affected pages rebuild. The hourly revalidate is a safety net in case a call is missed.
const API = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
const SAFETY_NET_SECONDS = 3600;

async function get<T>(path: string, tags: string[]): Promise<T | null> {
  if (!API) throw new Error("Set API_URL (or NEXT_PUBLIC_API_URL) so the website can load its content.");
  const response = await fetch(`${API}/api/public${path}`, { cache: "force-cache", next: { tags, revalidate: SAFETY_NET_SECONDS } })
    .catch((error: unknown) => {
      // A network failure (backend stopped, wrong address) says only "fetch failed"; name the cause.
      throw new Error(`Content API unreachable at ${API} (${path}). Is the backend running?`, { cause: error });
    });
  if (response.status === 404) return null;
  // Throwing keeps the last good version of the page online instead of caching an error.
  if (!response.ok) throw new Error(`Content API ${response.status} for ${path}`);
  return response.json() as Promise<T>;
}

const list = async <T>(collection: string, tag: string) => (await get<{ items: T[] }>(`/collections/${collection}`, [tag]))?.items ?? [];

// ---------------------------------------------------------------------------
// Pages and site settings
// ---------------------------------------------------------------------------

export type PageContent = Record<string, string>;

// Starter text fills any field the page has never saved, so a new field never renders blank.
// A field the editor deliberately cleared stays empty.
export async function getPage(key: PageKey): Promise<PageContent> {
  const page = await get<{ content: PageContent }>(`/pages/${key}`, [`pages:${key}`]);
  return { ...initialContent.pages[key].values, ...page?.content };
}

export async function getSiteSettings() {
  const page = await get<{ content: PageContent }>("/pages/site-settings", ["site"]);
  return resolveSiteSettings({ ...initialContent.pages["site-settings"].values, ...page?.content });
}

// ---------------------------------------------------------------------------
// Blog posts
// ---------------------------------------------------------------------------

type ApiBlogPost = {
  id: string; slug: string; title: string; category: string; publishedOn: string | null; excerpt: string | null;
  image: string | null; imageAlt: string | null; body: string; seoTitle: string | null; seoDescription: string | null;
  createdAt: string; updatedAt: string;
} & ApiSeoControls;

// Search controls as the API sends them: empty fields are null.
type ApiSeoControls = { noindex: boolean; canonicalUrl: string | null; shareImage: string | null; shareImageAlt: string | null };
const seoControls = (item: ApiSeoControls): SeoControls => ({
  noindex: item.noindex,
  canonicalUrl: item.canonicalUrl ?? undefined,
  shareImage: item.shareImage ?? undefined,
  shareImageAlt: item.shareImageAlt ?? undefined,
});

// The admin edits an article as plain text: paragraphs separated by a blank line, and a paragraph
// whose short first line stands alone becomes a section heading.
function parseBody(body: string) {
  const sections: { heading: string; content: string }[] = [];
  const intro: string[] = [];
  for (const paragraph of body.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean)) {
    const [first, ...rest] = paragraph.split("\n");
    if (rest.length && first.length <= 120) sections.push({ heading: first.trim(), content: rest.join(" ").trim() });
    else if (sections.length) sections[sections.length - 1].content += `\n\n${paragraph.replace(/\n/g, " ")}`;
    else intro.push(paragraph.replace(/\n/g, " "));
  }
  return { introduction: intro.join("\n\n"), sections };
}

function toBlogPost(post: ApiBlogPost): BlogPost {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    category: post.category,
    date: post.publishedOn ?? post.createdAt.slice(0, 10),
    updatedAt: post.updatedAt,
    image: post.image ?? "",
    imageAlt: post.imageAlt ?? "",
    excerpt: post.excerpt ?? "",
    seoTitle: post.seoTitle ?? undefined,
    seoDescription: post.seoDescription ?? undefined,
    ...seoControls(post),
    ...parseBody(post.body),
  };
}

export async function getBlogPosts() {
  return (await list<ApiBlogPost>("blogs", "blogs")).map(toBlogPost);
}

export async function getBlogPost(slug: string) {
  const post = await get<ApiBlogPost>(`/collections/blogs/${encodeURIComponent(slug)}`, ["blogs", `blogs:${slug}`]);
  return post ? toBlogPost(post) : null;
}

// ---------------------------------------------------------------------------
// Fleet
// ---------------------------------------------------------------------------

type ApiCar = {
  id: string; slug: string; name: string; categories: Car["categories"]; badge: string | null; featured: boolean;
  description: string | null; image: string | null; imageAlt: string | null; imagePosition: string | null; showOnHome: boolean;
  fuel: string | null; transmission: string | null; seats: string | null;
  seoTitle: string | null; seoDescription: string | null; updatedAt: string;
} & ApiSeoControls;

// Stored framing may be a Tailwind class from the original design ("object-[40%_60%]"); turn it into
// a CSS object-position value so it works for any car, not only classes compiled into the stylesheet.
const objectPosition = (value: string | null) => {
  const match = /object-\[([^\]]+)\]/.exec(value ?? "");
  return match ? match[1].replace(/_/g, " ") : value?.trim() || "center";
};

function toCar(car: ApiCar): Car {
  return {
    id: car.id, slug: car.slug, name: car.name, badge: car.badge ?? "", featuredBadge: car.featured, showOnHome: car.showOnHome,
    image: car.image ?? "", imageAlt: car.imageAlt ?? car.name, imagePosition: objectPosition(car.imagePosition),
    categories: car.categories, fuel: car.fuel ?? "", transmission: car.transmission ?? "", seats: car.seats ?? "",
    description: car.description ?? "",
    seoTitle: car.seoTitle ?? undefined, seoDescription: car.seoDescription ?? undefined, updatedAt: car.updatedAt,
    ...seoControls(car),
  };
}

export async function getCars() {
  return (await list<ApiCar>("fleet", "cars")).map(toCar);
}

export async function getCar(slug: string) {
  const car = await get<ApiCar>(`/collections/fleet/${encodeURIComponent(slug)}`, ["cars", `cars:${slug}`]);
  return car ? toCar(car) : null;
}

// ---------------------------------------------------------------------------
// Other collections
// ---------------------------------------------------------------------------

export type Service = {
  id: string; title: string; label: string | null; description: string; image: string | null; imageAlt: string | null;
  featureBadge: string | null; featureTitle: string | null; featureDescription: string | null;
};
export type Testimonial = { id: string; customerName: string; tripOrRole: string | null; quote: string; rating: number | null };
export type HappyCustomer = { id: string; title: string; category: string | null; destination: string | null; image: string | null; imageAlt: string | null; caption: string | null };

export const getServices = () => list<Service>("services", "services");
export const getTestimonials = () => list<Testimonial>("testimonials", "testimonials");
export const getHappyCustomers = () => list<HappyCustomer>("happy-customers", "happy-customers");

// ---------------------------------------------------------------------------
// Redirects for renamed slugs
// ---------------------------------------------------------------------------

export async function getRedirect(path: string) {
  const redirects = (await get<{ items: { fromPath: string; toPath: string }[] }>("/redirects", ["redirects"]))?.items ?? [];
  return redirects.find((redirect) => redirect.fromPath === path)?.toPath ?? null;
}

// For the root layout, which also wraps the admin panel: if the API is unreachable, fall back
// to the starter settings so the admin login still works. Public pages use getSiteSettings,
// which fails instead, so they never cache placeholder business details.
export async function getSiteSettingsOrDefault() {
  try {
    return await getSiteSettings();
  } catch (error) {
    console.error("Site settings unavailable, using defaults:", error instanceof Error ? error.message : error);
    return resolveSiteSettings(initialContent.pages["site-settings"].values);
  }
}
