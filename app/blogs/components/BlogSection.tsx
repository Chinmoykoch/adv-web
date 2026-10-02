"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { blogPosts, formatDate, readingMinutes, type BlogPost } from "../data";

export default function BlogSection() {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!selectedPost) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    dialog.scrollTop = 0;
    document.body.style.overflow = "hidden";

    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [selectedPost]);

  return (
    <section aria-labelledby="travel-notes-title">
      <header className="mb-9 flex flex-wrap items-end justify-between gap-5 sm:mb-10">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Expedition Dispatch</p>
          <h1 id="travel-notes-title" className="text-4xl tracking-tight sm:text-5xl">Travel Notes.</h1>
        </div>
       
      </header>

      <div id="all-stories" className="grid scroll-mt-8 grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post) => (
          <article key={post.id} className="group flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition-shadow hover:shadow-md motion-reduce:transition-none">
            <div className="relative aspect-[1.6] overflow-hidden">
              <Image src={post.image} alt={post.imageAlt} fill sizes="(min-width: 1280px) 410px, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transform-none motion-reduce:transition-none" />
              <span className="absolute left-3 top-3 bg-secondary/75 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">{post.category}</span>
            </div>
            <div className="flex flex-1 flex-col p-5 sm:p-6">
              <p className="mb-2 text-[10px] tracking-wide text-body">
                <time dateTime={post.date}>{formatDate(post.date)}</time> · {readingMinutes(post)} min read
              </p>
              <h2 className="font-body text-base font-semibold leading-snug text-secondary sm:text-lg">{post.title}</h2>
              <p className="mb-5 mt-3 line-clamp-2 text-sm leading-relaxed text-muted">{post.excerpt}</p>
              <button type="button" onClick={() => setSelectedPost(post)} aria-haspopup="dialog" aria-controls="blog-dialog" aria-label={`Read more: ${post.title}`} className="mt-auto inline-flex min-h-11 cursor-pointer items-center gap-2 self-start text-sm font-semibold text-primary hover:text-primary-700">
                Read more <span aria-hidden="true">↗</span>
              </button>
            </div>
          </article>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        id="blog-dialog"
        aria-labelledby="blog-dialog-title"
        onCancel={() => setSelectedPost(null)}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const rect = event.currentTarget.getBoundingClientRect();
          if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) setSelectedPost(null);
        }}
        className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto overscroll-contain rounded-2xl border-0 bg-canvas-light p-0 text-body shadow-2xl backdrop:bg-black/65 backdrop:backdrop-blur-sm"
      >
        {selectedPost && (
          <>view all
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-black/5 bg-canvas-light/95 px-5 py-3 backdrop-blur-md sm:px-8">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Expedition Dispatch</span>
              <button type="button" onClick={() => setSelectedPost(null)} aria-label="Close article" className="flex size-11 cursor-pointer items-center justify-center rounded-full bg-secondary/5 text-2xl text-secondary hover:bg-secondary/10">×</button>
            </div>
            <article>
              <div className="relative aspect-[2/1]">
                <Image src={selectedPost.image} alt={selectedPost.imageAlt} fill sizes="(min-width: 768px) 768px, 100vw" className="object-cover" />
              </div>
              <div className="px-5 py-8 sm:px-10 sm:py-10">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">{selectedPost.category}</p>
                <h2 id="blog-dialog-title" className="text-3xl leading-tight sm:text-4xl">{selectedPost.title}</h2>
                <p className="mt-4 text-xs text-muted"><time dateTime={selectedPost.date}>{formatDate(selectedPost.date)}</time> · {readingMinutes(selectedPost)} min read · AdventureCarz Editorial</p>
                <p className="mt-7 text-lg leading-relaxed text-secondary/80">{selectedPost.introduction}</p>
                {selectedPost.sections.map((section) => (
                  <section key={section.heading} className="mt-8">
                    <h3 className="text-2xl">{section.heading}</h3>
                    <p className="mt-3 text-base leading-8">{section.content}</p>
                  </section>
                ))}
                <div className="mt-10 border-t border-black/10 pt-5">
                  <button type="button" onClick={() => setSelectedPost(null)} className="min-h-11 cursor-pointer text-sm font-semibold text-primary hover:text-primary-700">← Back to all stories</button>
                </div>
              </div>
            </article>
          </>
        )}
      </dialog>
    </section>
  );
}
