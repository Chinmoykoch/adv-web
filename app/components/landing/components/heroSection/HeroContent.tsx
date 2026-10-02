import HeroHighlights from "./HeroHighlights";

// Each slide's copy describes what its banner shows; imagePosition keeps the subject in frame.
export const slides = [
  { image: "/banner1", imagePosition: "object-[88%_50%] sm:object-[100%_50%]", title: "Explore Assam.", emphasis: "At your own pace.", description: "Self-drive cars from Guwahati for trips across the Northeast." },
  { image: "/banner2.png", imagePosition: "object-[50%_50%] sm:object-[50%_65%]", title: "Pick your car.", emphasis: "Drive it your way.", description: "From city hatchbacks to 7-seat SUVs, ready when you are." },
  { image: "/banner3.png", imagePosition: "object-[30%_50%] sm:object-[50%_75%]", title: "Take the scenic route.", emphasis: "Stop where you like.", description: "Your self-drive trip through Assam starts here." },
] as const;

const action =
  "inline-flex min-h-12 items-center justify-center gap-3 rounded-[10px] px-4.5 py-3 text-sm font-bold transition-colors motion-reduce:transition-none sm:px-6.5";

export default function HeroContent({ activeSlide }: { activeSlide: number }) {
  const slide = slides[activeSlide] ?? slides[0];
  return (
    <div key={activeSlide} className="col-span-full min-w-0 max-w-155 animate-fade-in motion-reduce:animate-none lg:col-span-7">
      <p className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.12em] sm:text-xs sm:tracking-[.16em]">
        <span className="size-1.5 shrink-0 rounded-full bg-primary" /> Self-drive car rental &middot; Guwahati
      </p>
      <h1 className="text-[clamp(32px,8.5vw,54px)] leading-[1.03] tracking-[-.05em] wrap-break-word text-white text-shadow-[0_2px_24px_#0005] sm:text-[clamp(40px,6vw,60px)] lg:text-[clamp(40px,4.4vw,68px)]">
        <span className="block font-body font-normal">{slide.title}</span>
        <em className="block font-heading font-semibold tracking-[-.04em]">{slide.emphasis}</em>
      </h1>
      <p className="mt-4.5 text-[15px] leading-[1.55] text-white/90 sm:text-[17px]">
        From the streets of Guwahati to the hills, rivers, and hidden corners of the Northeast, choose your car and explore at your own pace. Make your own route, stop wherever you want, and enjoy the freedom to turn every drive into a memorable journey.
      </p>
      <div className="mt-5.5 flex flex-wrap gap-2.5 sm:mt-7 sm:gap-3">
        <a href="/contact" className={`${action} bg-primary shadow-[0_6px_18px_#d6460038] hover:bg-primary-600`}>
          Enquire Now <span aria-hidden="true">&rarr;</span>
        </a>
        <a href="#cars" className={`${action} border border-white/25 bg-white/10 backdrop-blur-sm hover:bg-white/20`}>
          Explore Fleet
        </a>
      </div>
      <HeroHighlights />
    </div>
  );
}
