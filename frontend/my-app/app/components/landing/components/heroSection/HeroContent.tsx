import HeroHighlights from "./HeroHighlights";

// imagePosition is a Tailwind class list (responsive framing), set per slide in LandingPage.
export type HeroSlide = { image: string; imageAlt: string; imagePosition: string; title: string; emphasis: string; description: string };
export type HeroCopy = { eyebrow: string; buttonLabel: string; buttonHref: string; highlights: string[] };

const action =
  "inline-flex min-h-12 items-center justify-center gap-3 rounded-[10px] px-4.5 py-3 text-sm font-bold transition-colors motion-reduce:transition-none sm:px-6.5";

export default function HeroContent({ slide, copy }: { slide: HeroSlide; copy: HeroCopy }) {
  return (
    <div key={slide.image} className="col-span-full min-w-0 max-w-155 animate-fade-in motion-reduce:animate-none lg:col-span-7">
      {copy.eyebrow && (
        <p className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.12em] sm:text-xs sm:tracking-[.16em]">
          <span className="size-1.5 shrink-0 rounded-full bg-primary" /> {copy.eyebrow}
        </p>
      )}
      <h1 className="text-[clamp(32px,8.5vw,54px)] leading-[1.03] tracking-[-.05em] wrap-break-word text-white text-shadow-[0_2px_24px_#0005] sm:text-[clamp(40px,6vw,60px)] lg:text-[clamp(40px,4.4vw,68px)]">
        <span className="block font-body font-normal">{slide.title}</span>
        {slide.emphasis && <em className="block font-heading font-semibold tracking-[-.04em]">{slide.emphasis}</em>}
      </h1>
      {slide.description && <p className="mt-4.5 text-[15px] leading-[1.55] text-white/90 sm:text-[17px]">{slide.description}</p>}
      <div className="mt-5.5 flex flex-wrap gap-2.5 sm:mt-7 sm:gap-3">
        {copy.buttonLabel && (
          <a href={copy.buttonHref || "/contact"} className={`${action} bg-primary shadow-[0_6px_18px_#d6460038] hover:bg-primary-600`}>
            {copy.buttonLabel} <span aria-hidden="true">&rarr;</span>
          </a>
        )}
        <a href="#cars" className={`${action} border border-white/25 bg-white/10 backdrop-blur-sm hover:bg-white/20`}>
          Explore Fleet
        </a>
      </div>
      <HeroHighlights items={copy.highlights} />
    </div>
  );
}
