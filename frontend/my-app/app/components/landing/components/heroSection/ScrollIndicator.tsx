// A plain in-page link; smooth scrolling comes from `motion-safe:scroll-smooth` on <html> in app/layout.tsx.
export default function ScrollIndicator() {
  return (
    <a
      href="#hero-end"
      aria-label="Scroll down to explore"
      className="flex flex-col items-center gap-1.75 py-2.5 sm:absolute sm:left-1/2 sm:-translate-x-1/2 sm:px-2.5"
    >
      <span className="whitespace-nowrap text-[8px] font-semibold uppercase tracking-[.12em] sm:text-[10px] sm:tracking-[.2em]">
        Scroll to explore
      </span>
      <svg className="animate-scroll-hint motion-reduce:animate-none" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 4v16m-5-5 5 5 5-5" />
      </svg>
    </a>
  );
}
