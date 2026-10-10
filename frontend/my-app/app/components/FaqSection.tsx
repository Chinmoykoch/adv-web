import faq from "../content/faqs.json";
import DocumentBlocks from "./DocumentBlocks";

const topics = [
  { key: "fleet", title: "Cars & travel", description: "Vehicles, rental duration and destinations", questions: [1, 4, 5, 8, 9, 10, 11] },
  { key: "booking", title: "Booking & eligibility", description: "Reservations, documents and drivers", questions: [2, 3, 6, 7, 19] },
  { key: "payments", title: "Pricing & cancellations", description: "Charges, deposits and changes to your plans", questions: [12, 13, 14, 15, 16] },
  { key: "support", title: "On-road support", description: "Breakdowns, damage and getting in touch", questions: [17, 18, 20] },
] as const;

export default function FaqSection({ id }: { id: string }) {
  return <section id={id} aria-labelledby={`${id}-heading`} className="mt-14 min-w-0 rounded-2xl border border-border/25 bg-canvas p-4 sm:mt-20 sm:p-8 lg:p-10">
    <header className="mx-auto max-w-2xl pb-7 pt-3 text-center sm:pb-9">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[.2em] text-primary">The details, before the drive</p>
      <h2 id={`${id}-heading`} className="text-3xl leading-tight tracking-tight text-secondary sm:text-4xl lg:text-[42px]">Frequently asked questions</h2>
      <p className="mt-4 text-sm leading-7 text-muted">{faq.introduction}</p>
    </header>

    <nav aria-label="FAQ topics" className="mb-8 flex flex-wrap justify-center gap-2 sm:mb-10">
      {topics.map((topic) => <a key={topic.key} href={`#${id}-${topic.key}`} className="inline-flex min-h-11 items-center justify-center rounded-full border border-border/30 bg-white px-4 py-2 text-xs font-semibold text-secondary transition-colors hover:border-primary/50 hover:bg-primary-50 hover:text-primary motion-reduce:transition-none">{topic.title}</a>)}
    </nav>

    <div className="grid items-start gap-5 lg:grid-cols-2 lg:gap-6">
      {topics.map((topic, topicIndex) => <section key={topic.key} id={`${id}-${topic.key}`} aria-labelledby={`${id}-${topic.key}-heading`} className="min-w-0 scroll-mt-8 overflow-hidden rounded-xl border border-border/25 bg-white">
        <header className="flex items-start gap-4 border-b border-border/20 px-5 py-5 sm:px-6 sm:py-6">
          <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-xs font-semibold tabular-nums text-primary">{String(topicIndex + 1).padStart(2, "0")}</span>
          <div className="min-w-0">
            <h3 id={`${id}-${topic.key}-heading`} className="font-body text-base font-semibold leading-6 text-secondary">{topic.title}</h3>
            <p className="mt-1 text-xs leading-5 text-muted">{topic.description}</p>
          </div>
        </header>
        {topic.questions.map((number) => {
          const item = faq.questions[number - 1];
          return <details key={item.id} id={`${id}-${item.id}`} name={`${id}-accordion`} className="group border-b border-border/15 last:border-b-0 open:bg-primary-50/40">
            <summary className="flex min-h-16 cursor-pointer list-none items-center gap-4 px-5 py-4 text-left font-body text-sm font-medium leading-6 text-secondary transition-colors hover:text-primary group-open:font-semibold group-open:text-primary-700 motion-reduce:transition-none sm:px-6 [&::-webkit-details-marker]:hidden">
              <span className="min-w-0 flex-1">{item.question}</span>
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border/25 text-muted group-open:border-primary/20 group-open:bg-primary-50 group-open:text-primary">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
              </span>
            </summary>
            <div className="px-5 pb-6 sm:px-6"><div className="border-l-2 border-primary/25 pl-4"><DocumentBlocks blocks={item.blocks} /></div></div>
          </details>;
        })}
      </section>)}
    </div>
  </section>;
}
