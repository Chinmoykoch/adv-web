import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import Breadcrumbs from "../../components/Breadcrumbs";
import JsonLd from "../../components/JsonLd";
import Navbar from "../../components/Navbar";
import { getBlogPost, getBlogPosts, getRedirect, getSiteSettings } from "../../lib/queries";
import { pageMetadata, truncate } from "../../lib/site";
import { blogPostingJsonLd } from "../../lib/structuredData";
import { formatDate, paragraphs, readingMinutes, type BlogPost } from "../data";

// Articles published after the last build are rendered on their first visit, then cached.
export async function generateStaticParams() {
  return (await getBlogPosts()).map((post) => ({ slug: post.slug }));
}

const describe = (post: BlogPost) => truncate(post.seoDescription || post.excerpt);

export async function generateMetadata({ params }: PageProps<"/blogs/[slug]">) {
  const [post, settings] = await Promise.all([getBlogPost((await params).slug), getSiteSettings()]);
  if (!post) return {};
  return pageMetadata({
    settings,
    title: post.seoTitle || post.title,
    description: describe(post),
    path: `/blogs/${post.slug}`,
    image: post.image ? { url: post.image, alt: post.imageAlt } : undefined,
    seo: post,
    article: { publishedTime: post.date, modifiedTime: post.updatedAt ?? post.date, section: post.category },
  });
}

export default async function BlogPostPage({ params }: PageProps<"/blogs/[slug]">) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) {
    // A renamed article keeps its old address working (301), so links and rankings carry over.
    const moved = await getRedirect(`/blogs/${slug}`);
    if (moved) permanentRedirect(moved);
    notFound();
  }
  const [allPosts, settings] = await Promise.all([getBlogPosts(), getSiteSettings()]);
  const morePosts = allPosts.filter((other) => other.slug !== post.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-canvas-light px-5 py-4 sm:px-8 sm:py-6">
      <div className="mx-auto max-w-7xl">
        <Navbar />
        <main className="py-10 sm:py-14">
          <JsonLd data={blogPostingJsonLd(post, describe(post), settings)} />
          <article className="mx-auto max-w-3xl">
            <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Blog", path: "/blogs" }, { name: post.title, path: `/blogs/${post.slug}` }]} />
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">{post.category}</p>
            <h1 className="text-3xl leading-tight tracking-tight sm:text-5xl">{post.title}</h1>
            <p className="mt-4 text-xs text-muted">
              <time dateTime={post.date}>{formatDate(post.date)}</time> · {readingMinutes(post)} min read · {settings.name} Editorial
            </p>
            {post.image && <div className="relative mt-8 aspect-[2/1] overflow-hidden rounded-2xl">
              <Image src={post.image} alt={post.imageAlt} fill preload sizes="(min-width: 768px) 768px, 100vw" className="object-cover" />
            </div>}
            {paragraphs(post.introduction).map((paragraph) => <p key={paragraph} className="mt-8 text-lg leading-relaxed text-secondary/80">{paragraph}</p>)}
            {post.sections.map((section) => (
              <section key={section.heading} className="mt-8">
                <h2 className="text-2xl">{section.heading}</h2>
                {paragraphs(section.content).map((paragraph) => <p key={paragraph} className="mt-3 text-base leading-8">{paragraph}</p>)}
              </section>
            ))}
            <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-black/10 pt-6">
              <Link href="/blogs" className="inline-flex min-h-11 items-center text-sm font-semibold text-primary hover:text-primary-700">← Back to all stories</Link>
              <Link href="/contact" className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-700">Plan your trip</Link>
            </div>
          </article>

          {morePosts.length > 0 && (
            <section aria-labelledby="more-stories" className="mx-auto mt-16 max-w-3xl">
              <h2 id="more-stories" className="mb-5 text-2xl">More travel notes</h2>
              <ul className="grid gap-4 sm:grid-cols-2">
                {morePosts.map((other) => (
                  <li key={other.slug}>
                    <Link href={`/blogs/${other.slug}`} className="block h-full rounded-2xl border border-black/5 bg-white p-5 shadow-sm hover:shadow-md">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">{other.category}</span>
                      <span className="mt-2 block font-semibold leading-snug text-secondary">{other.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
