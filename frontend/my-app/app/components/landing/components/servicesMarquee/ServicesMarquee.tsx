function ServiceList({ services, duplicate = false }: { services: string[]; duplicate?: boolean }) {
  return (
    <ul
      className={`flex shrink-0 motion-reduce:flex-wrap ${duplicate ? "motion-reduce:hidden" : ""}`}
      aria-hidden={duplicate || undefined}
    >
      {services.map((service) => (
        <li
          key={service}
          className="flex items-center gap-5 whitespace-nowrap py-3.25 pl-5 text-[11px] font-medium uppercase tracking-[.14em] sm:gap-7 sm:py-4 sm:pl-7 sm:text-[13px]"
        >
          {service}
          <span className="text-xs tracking-normal text-primary" aria-hidden="true">&#10022;</span>
        </li>
      ))}
    </ul>
  );
}

// Names come from the Home page's "Scrolling service names" field, one per line.
export default function ServicesMarquee({ services }: { services: string[] }) {
  if (services.length === 0) return null;
  return (
    <section className="w-full overflow-hidden border-y border-white/10 bg-secondary text-white/85" aria-label="Our services">
      {/* The list is rendered twice so the loop is seamless: the track slides exactly one copy's width. */}
      <div className="flex w-max animate-marquee max-sm:[animation-duration:30s] motion-reduce:w-auto motion-reduce:animate-none">
        <ServiceList services={services} />
        <ServiceList services={services} duplicate />
      </div>
    </section>
  );
}
