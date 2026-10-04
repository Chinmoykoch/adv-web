import Image from "next/image";
import Link from "next/link";
import { formatDate, readingMinutes, type BlogPost } from "../data";

export default function BlogSection({ posts, eyebrow, heading }: { posts: BlogPost[]; eyebrow: string; heading: string }) {
  return (
    <section aria-labelledby="travel-notes-title">
      <header className="mb-9 flex flex-wrap items-end justify-between gap-5 sm:mb-10">
        <div>
          {eyebrow && <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>}
          <h1 id="travel-notes-title" className="text-4xl tracking-tight sm:text-5xl">{heading}</h1>
        </div>
      </header>

      <div id="all-stories" className="grid scroll-mt-8 grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          // The title link stretches over the whole card, so the card is one crawlable link with a descriptive name.
          <article key={post.slug} className="group relative flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition-shadow hover:shadow-md motion-reduce:transition-none">
            <div className="relative aspect-[1.6] overflow-hidden bg-surface">
              {post.image && <Image src={post.image} alt={post.imageAlt} fill sizes="(min-width: 1280px) 410px, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transform-none motion-reduce:transition-none" />}
              <span className="absolute left-3 top-3 bg-secondary/75 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">{post.category}</span>
            </div>
            <div className="flex flex-1 flex-col p-5 sm:p-6">
              <p className="mb-2 text-[10px] tracking-wide text-body">
                <time dateTime={post.date}>{formatDate(post.date)}</time> · {readingMinutes(post)} min read
              </p>
              <h2 className="font-body text-base font-semibold leading-snug text-secondary sm:text-lg">
                <Link href={`/blogs/${post.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none group-focus-within:underline">{post.title}</Link>
              </h2>
              <p className="mb-5 mt-3 line-clamp-2 text-sm leading-relaxed text-muted">{post.excerpt}</p>
              <span aria-hidden="true" className="mt-auto inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-primary group-hover:text-primary-700">
                Read more <span>↗</span>
              </span>
            </div>
          </article>
        ))}
      </div>
      {posts.length === 0 && <p className="py-16 text-center text-sm text-muted">New stories are on the way. Check back soon.</p>}
    </section>
  );
}
