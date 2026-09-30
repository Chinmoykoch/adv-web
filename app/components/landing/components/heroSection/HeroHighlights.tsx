export default function HeroHighlights() {
  return (
    <ul
      className="mt-5.5 flex flex-wrap gap-x-7 gap-y-2.5 border-t border-white/20 pt-4 text-[13px] font-medium text-white/85 sm:mt-7 sm:pt-5 sm:text-sm"
      aria-label="Why AdventureCarz"
    >
      <li className="flex items-center gap-2">
        <svg className="shrink-0 text-primary" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 17h14M6 17l1.5-6h9L18 17M8 11l1.5-4h5L16 11M7 17v2m10-2v2" />
        </svg>
        Hatchbacks to 7-seaters
      </li>
      <li className="flex items-center gap-2">
        <svg className="shrink-0 text-primary" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 13v-2a8 8 0 0 1 16 0v6a3 3 0 0 1-3 3h-3M4 12h3v6H4zm13 0h3v6h-3zM10 20h4" />
        </svg>
        <a href="#contact" className="underline decoration-white/40 underline-offset-4 hover:text-white hover:decoration-primary">
          Help planning your trip
        </a>
      </li>
    </ul>
  );
}
