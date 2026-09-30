"use client";

import { useEffect, useRef } from "react";

const statistics = [
  { value: 10, label: "Years Operating", suffix: "+", decimals: 0 },
  { value: 100, label: "Premium Vehicles", suffix: "+", decimals: 0 },
  { value: 5000, label: "Journeys Logged", suffix: "+", decimals: 0 },
  { value: 4.9, label: "Client Rating", suffix: " / 5", decimals: 1 },
];

function formatStatistic(value: number, decimals: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

const iconProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

const benefits = [
  {
    title: "Reliable Fleet",
    description:
      "Strict preventive servicing and low-odometer machinery deliver unconditional dependability on long highways.",
    icon: (
      <svg {...iconProps}>
        <circle cx="7" cy="4" r="2" />
        <path d="M9 4h9m-3 0v2m3-2v2M6 14l1.5-5h9l1.5 5M6 14h12v6H6zM6 20v1m12-1v1M9 17h6M8 12h8" />
      </svg>
    ),
  },
  {
    title: "Simple Booking",
    description:
      "Instant digital KYC, zero concealed charges, and prompt automated security deposit returns within 48 hours.",
    icon: (
      <svg {...iconProps}>
        <path d="M8 19H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v6M3 10h18m-10 7 3 3 7-7" />
      </svg>
    ),
  },
  {
    title: "Transparent Service",
    description:
      "Prompt doorstep delivery and collection directly at your airport gate, luxury hotel, or residence on your exact schedule.",
    icon: (
      <svg {...iconProps}>
        <path d="M14 17H9m-4 0H2V5h12v12m0-9h4l4 5v4h-3m-1-9v5h4" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    ),
  },
  {
    title: "24/7 VIP Support",
    description:
      "Dedicated concierge dispatch and rapid pan-India roadside vehicle swap guarantee your vacation never stalls.",
    icon: (
      <svg {...iconProps}>
        <path d="M4 13V10a8 8 0 0 1 16 0v8a3 3 0 0 1-3 3h-4M4 12h4v7H4zm12 0h4v7h-4z" />
      </svg>
    ),
  },
];

export default function WhyChooseUs() {
  const statisticsRef = useRef<HTMLDListElement>(null);

  useEffect(() => {
    const element = statisticsRef.current;
    if (!element) return;

    const counters = element.querySelectorAll<HTMLElement>("[data-counter]");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const updateCounters = (progress: number) => {
      counters.forEach((counter, index) => {
        const { value, decimals } = statistics[index];
        const current = decimals ? value * progress : Math.floor(value * progress);
        counter.textContent = formatStatistic(current, decimals);
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        cancelAnimationFrame(frame);
        if (!entry.isIntersecting || reducedMotion.matches) {
          updateCounters(1);
          return;
        }

        // Replay each time the statistics scroll into view.
        updateCounters(0);
        const start = performance.now();
        const animate = (now: number) => {
          const progress = Math.min((now - start) / 1800, 1);
          updateCounters(1 - Math.pow(1 - progress, 3));
          if (progress < 1) frame = requestAnimationFrame(animate);
        };
        frame = requestAnimationFrame(animate);
      },
      { threshold: 0.35 },
    );

    const handleMotionChange = () => {
      if (reducedMotion.matches) {
        cancelAnimationFrame(frame);
        updateCounters(1);
      }
    };

    observer.observe(element);
    reducedMotion.addEventListener("change", handleMotionChange);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      reducedMotion.removeEventListener("change", handleMotionChange);
    };
  }, []);

  return (
    <section
      aria-labelledby="why-choose-us-heading"
      className="bg-canvas-light pt-20 [--gutter:clamp(20px,5vw,80px)] sm:pt-28"
    >
      <div className="mx-auto w-[min(100%-2*var(--gutter),1280px)] px-3 sm:px-5">
        <div className="grid items-center gap-10 border-b border-black/[0.06] pb-14 lg:grid-cols-[0.82fr_1.18fr] lg:gap-11 lg:pb-16">
          <div>
            <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              The Adventure Advantage
            </p>
            <h2
              id="why-choose-us-heading"
              className="text-[clamp(30px,3vw,40px)] leading-tight tracking-[-0.025em] text-secondary"
            >
              Why Adventure <em>Carz?</em>
            </h2>
            <p className="mt-4 text-[15px] leading-[1.55] text-body">
              Standard rental portals provide basic transit. We curate high-calibre
              vehicles engineered for mountain summit elevations, interstate grand
              tours, and executive mobility.
            </p>

            <div className="mt-5 flex items-center gap-4 rounded-2xl border border-black/[0.04] bg-canvas px-5 py-5">
              <svg {...iconProps} width={26} height={26} className="shrink-0 text-primary">
                <path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6l8-4Z" />
                <path d="m8 11 3 3 5-5" />
              </svg>
              <div>
                <h3 className="font-body text-sm font-semibold leading-snug text-secondary">
                  150-Point Technical Check
                </h3>
                <p className="mt-1 text-[11px] leading-[1.45] text-muted">
                  Brakes, tires, suspension, fluids &amp; sensors certified before
                  each dispatch.
                </p>
              </div>
            </div>
          </div>

          <ol className="grid gap-4 sm:grid-cols-2">
            {benefits.map((benefit, index) => (
              <li
                key={benefit.title}
                className="rounded-2xl border border-black/[0.08] bg-white p-6 shadow-[0_1px_2px_#00000008]"
              >
                <div className="mb-3 flex size-[38px] items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {benefit.icon}
                </div>
                <h3 className="text-base font-semibold leading-snug text-secondary">
                  {String(index + 1).padStart(2, "0")}. {benefit.title}
                </h3>
                <p className="mt-2 text-[13px] leading-[1.45] text-body">
                  {benefit.description}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <div className="pb-20 pt-9 sm:pb-24 sm:pt-10">
          <div aria-hidden="true" className="mx-auto mb-9 h-0.5 w-12 bg-primary" />
          <dl ref={statisticsRef} className="grid grid-cols-2 gap-x-6 gap-y-9 text-center sm:grid-cols-4">
            {statistics.map(({ value, label, suffix, decimals }) => (
              <div key={label} className="flex flex-col items-center">
                <dt className="order-2 mt-1 text-[10px] uppercase tracking-[0.04em] text-body">
                  {label}
                </dt>
                <dd className="font-heading text-[clamp(28px,3vw,36px)] leading-tight tabular-nums text-secondary">
                  <span className="sr-only">{formatStatistic(value, decimals)}{suffix}</span>
                  <span aria-hidden="true">
                    <span data-counter>{formatStatistic(value, decimals)}</span>
                    <span className="font-normal">{suffix}</span>
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
