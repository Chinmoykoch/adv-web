export default function BannerSection() {
  return (
    <section
      aria-labelledby="adventure-ethos-heading"
      className="relative isolate flex min-h-[410px] items-center justify-center overflow-hidden bg-[#111111] px-6 py-20 sm:py-24"
    >
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 1120 410"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
        fill="none"
      >
        <path
          d="M-30 225 C180 125 320 145 520 205 S900 310 1150 195"
          stroke="white"
          strokeOpacity="0.045"
          strokeWidth="2.5"
          strokeDasharray="11 11"
        />
      </svg>

      <div className="mx-auto w-full max-w-5xl text-center">
        <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
          The Adventure Ethos
        </p>
        <h2
          id="adventure-ethos-heading"
          className="text-[clamp(30px,4.6vw,52px)] leading-[1.02] tracking-[-0.035em] text-white"
        >
          <span className="block">&ldquo;NOT JUST A CAR.</span>
          <em className="mt-1 block font-normal text-[#cccccc]">
            A BETTER WAY TO TRAVEL.&rdquo;
          </em>
        </h2>
        <p className="mx-auto mt-5 max-w-[590px] text-sm font-light leading-[1.55] text-neutral-400">
          We eliminate the friction of luxury travel. Transparent reservations,
          rally-certified machinery, and comprehensive roadside backing guarantee
          your story continues without pause.
        </p>
      </div>
    </section>
  );
}
