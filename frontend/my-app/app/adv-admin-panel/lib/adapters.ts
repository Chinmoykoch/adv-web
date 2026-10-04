import type { CollectionKey, Entry } from "./content";

// The admin forms edit every field as text, keyed as in content.ts (title, category, price...).
// The API uses typed, descriptive fields (name, categories[], publishedOn...). Each adapter maps one
// to the other so the editors stay generic.

export type ApiItem = Record<string, unknown> & { id: string; archived: boolean; updatedAt: string | null; revision?: number };
export type EntryWithMeta = Entry & { revision?: number };

type Adapter = {
  // Form field -> API field, for plain text fields.
  text: Record<string, string>;
  // Fields that need converting, in both directions.
  toValues?: (item: ApiItem) => Record<string, string>;
  toBody?: (values: Record<string, string>) => Record<string, unknown>;
};

const str = (value: unknown) => (value === null || value === undefined ? "" : String(value));
const shared = { image: "image", imageAlt: "imageAlt" };
// Search controls on articles and cars. "Hide from Google" is a checkbox, stored in the form as "true" or "".
const seo = { seoTitle: "seoTitle", seoDescription: "seoDescription", canonicalUrl: "canonicalUrl", shareImage: "shareImage", shareImageAlt: "shareImageAlt" };
const noindexValue = (item: ApiItem) => (item.noindex ? "true" : "");

export const adapters: Record<CollectionKey, Adapter> = {
  blogs: {
    text: { title: "title", slug: "slug", category: "category", excerpt: "excerpt", ...shared, body: "body", ...seo, status: "status" },
    toValues: (item) => ({ date: str(item.publishedOn), noindex: noindexValue(item) }),
    toBody: (values) => ({ publishedOn: values.date || null, noindex: values.noindex === "true" }),
  },
  fleet: {
    text: { title: "name", slug: "slug", badge: "badge", description: "description", ...shared, fuel: "fuel", transmission: "transmission", seats: "seats", ...seo, status: "status" },
    toValues: (item) => ({ category: (item.categories as string[] | undefined)?.join(", ") ?? "", noindex: noindexValue(item), showOnHome: item.showOnHome ? "true" : "" }),
    toBody: (values) => ({
      categories: (values.category ?? "").split(",").map((part) => part.trim()).filter(Boolean),
      noindex: values.noindex === "true",
      showOnHome: values.showOnHome === "true",
    }),
  },
  services: {
    text: { title: "title", category: "label", description: "description", ...shared, featureBadge: "featureBadge", featureTitle: "featureTitle", featureDescription: "featureDescription" },
  },
  testimonials: {
    text: { title: "customerName", category: "tripOrRole", quote: "quote", ...shared, permission: "permissionNotes" },
    toValues: (item) => ({ rating: str(item.rating) }),
    toBody: (values) => ({ rating: values.rating ? Number(values.rating) : null }),
  },
  "happy-customers": {
    text: { title: "title", category: "category", destination: "destination", ...shared, description: "caption", permission: "permissionNotes" },
  },
};

export function toEntry(collection: CollectionKey, item: ApiItem): EntryWithMeta {
  const adapter = adapters[collection];
  const values = Object.fromEntries(Object.entries(adapter.text).map(([field, apiField]) => [field, str(item[apiField])]));
  return { id: item.id, archived: item.archived, updatedAt: item.updatedAt, revision: item.revision, values: { ...values, ...adapter.toValues?.(item) } };
}

export function toBody(collection: CollectionKey, values: Record<string, string>) {
  const adapter = adapters[collection];
  const body: Record<string, unknown> = Object.fromEntries(Object.entries(adapter.text).map(([field, apiField]) => [apiField, (values[field] ?? "").trim()]));
  // An empty slug is left out so the server creates one from the name.
  if (body.slug === "") delete body.slug;
  return { ...body, ...adapter.toBody?.(values) };
}

// Maps an API field name in a validation error back to the form field, so the message can use its label.
export function formFieldFor(collection: CollectionKey, apiField: string) {
  const root = apiField.split(".")[0];
  const adapter = adapters[collection];
  const direct = Object.entries(adapter.text).find(([, name]) => name === root)?.[0];
  return direct ?? ({ publishedOn: "date", categories: "category", rating: "rating" } as Record<string, string>)[root] ?? root;
}
