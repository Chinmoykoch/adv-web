// Loads the website's current starter content into Supabase, so the site looks the same on
// day one of running from the database. Safe to run more than once:
//   * a page is only inserted if it has no row yet (admin edits are never overwritten);
//   * a collection is only filled if its table is empty.
// Run with: npm run seed
import { initialContent } from "../../../frontend/my-app/app/adv-admin-panel/lib/content";
import { cars } from "../../../frontend/my-app/app/components/landing/components/cars/carData";
import { check, unwrap } from "../lib/http";
import { db } from "../lib/supabase";

type Values = Record<string, string>;
const v = (value: string | undefined) => (value && value.trim() ? value.trim() : null);

async function seedPages() {
  const rows = Object.entries(initialContent.pages).map(([key, page]) => ({ key, content: page.values }));
  // ignoreDuplicates turns the upsert into "insert if missing".
  const inserted = unwrap(await db.from("pages").upsert(rows, { onConflict: "key", ignoreDuplicates: true }).select("key"));
  console.log(`pages: ${inserted.length ? `added ${inserted.map((row) => row.key).join(", ")}` : "all already present, left unchanged"}`);
}

async function seedTable(table: string, rows: Record<string, unknown>[]) {
  const { count, error } = await db.from(table).select("id", { count: "exact", head: true });
  check({ error });
  if (count) return console.log(`${table}: already has ${count} rows, skipped`);
  check(await db.from(table).insert(rows));
  console.log(`${table}: added ${rows.length}`);
}

const entries = (key: keyof typeof initialContent.collections) =>
  initialContent.collections[key].filter((entry) => !entry.archived).map((entry) => entry.values as Values);

async function main() {
  await seedPages();

  await seedTable("blog_posts", entries("blogs").map((post) => ({
    slug: post.slug, title: post.title, category: post.category, published_on: v(post.date),
    excerpt: v(post.excerpt), image: v(post.image), image_alt: v(post.imageAlt), body: post.body,
    seo_title: v(post.seoTitle), seo_description: v(post.seoDescription), status: "published",
  })));

  // Cars come straight from the site's data file, which has fields the admin form lacks (categories list, image framing).
  await seedTable("cars", cars.map((car, position) => ({
    slug: car.slug, name: car.name, categories: car.categories, badge: car.badge, featured: car.featuredBadge ?? false,
    description: car.description, image: car.image, image_alt: car.imageAlt, image_position: car.imagePosition,
    fuel: car.fuel, transmission: car.transmission, seats: car.seats,
    seo_title: car.seoTitle ?? null, seo_description: car.seoDescription ?? null, status: "published", position,
    show_on_home: position < 4,
  })));

  await seedTable("services", entries("services").map((service, position) => ({
    title: service.title, label: v(service.category), description: service.description, image: v(service.image),
    image_alt: v(service.imageAlt), feature_badge: v(service.featureBadge), feature_title: v(service.featureTitle),
    feature_description: v(service.featureDescription), position,
  })));

  await seedTable("testimonials", entries("testimonials").map((item, position) => ({
    customer_name: item.title, trip_or_role: v(item.category), quote: item.quote,
    rating: item.rating ? Number(item.rating) : null, image: v(item.image), image_alt: v(item.imageAlt),
    permission_notes: v(item.permission), position,
  })));

  await seedTable("happy_customers", entries("happy-customers").map((item, position) => ({
    title: item.title, category: v(item.category), destination: v(item.destination), image: v(item.image),
    image_alt: v(item.imageAlt), caption: v(item.description), permission_notes: v(item.permission), position,
  })));
}

main().then(() => console.log("Seed complete."), (error) => {
  console.error("Seed failed:", error instanceof Error ? `${error.message}${"details" in error && error.details ? ` (${error.details})` : ""}` : error);
  process.exit(1);
});
