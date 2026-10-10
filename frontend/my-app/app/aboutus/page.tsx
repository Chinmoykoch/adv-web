import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { getHappyCustomers, getPage, getSiteSettings } from "../lib/queries";
import { defaultPageTitles, pageMetadata, pageSeoControls } from "../lib/site";
import HappyCustomers from "./components/HappyCustomers";

export async function generateMetadata() {
  const [settings, page] = await Promise.all([getSiteSettings(), getPage("about-us")]);
  return pageMetadata({
    settings,
    title: page.seoTitle || defaultPageTitles["about-us"],
    description: page.seoDescription || settings.description,
    seo: pageSeoControls(page),
    path: "/aboutus",
  });
}

export default async function AboutUsPage() {
  const [page, photos] = await Promise.all([getPage("about-us"), getHappyCustomers()]);
  // "About us · Your travel & car rental partner": the part before the dot is highlighted.
  const [eyebrowLead, ...eyebrowRest] = page.eyebrow.split(" · ");
  // The heading's last word is highlighted, as in the original design.
  const words = page.heading.trim().split(/\s+/);
  const lastWord = words.length > 1 ? words.pop() : undefined;

  return (
    <div className="min-h-screen bg-canvas-light px-5 py-4 sm:px-8 sm:py-6 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <Navbar />

        <main className="py-12 sm:py-16 lg:py-20">
          <section
            aria-labelledby="about-heading"
            className="grid items-stretch gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16"
          >
            <div className="flex flex-col">
              {page.eyebrow && (
                <p className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted sm:text-xs">
                  <span className="text-primary">{eyebrowLead}</span>
                  {eyebrowRest.length > 0 && <><span aria-hidden="true">·</span><span>{eyebrowRest.join(" · ")}</span></>}
                </p>
              )}

              <h1
                id="about-heading"
                className="max-w-xl font-body text-[clamp(2.5rem,4.2vw,4rem)] font-extrabold uppercase leading-[0.94] tracking-[-0.065em] text-secondary"
              >
                {words.join(" ")}{lastWord && <> <span className="text-primary">{lastWord}</span></>}
              </h1>

              <div
                aria-hidden="true"
                className="my-6 min-h-16 flex-1 border-l border-border/60 lg:min-h-28"
              />

              <div className="max-w-xl space-y-4 text-sm leading-7 text-body sm:text-base sm:leading-8">
                {[page.description, page.secondParagraph].filter(Boolean).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>

              {page.buttonLabel && (
                <Link
                  href={page.buttonHref || "/contact"}
                  className="mt-6 inline-flex min-h-11 items-center gap-4 self-start border-b border-primary/30 text-sm font-semibold text-primary transition-colors hover:border-primary hover:text-primary-700 motion-reduce:transition-none"
                >
                  {page.buttonLabel}
                  <span aria-hidden="true">↗</span>
                </Link>
              )}
            </div>

            {page.image && (
              <div className="relative min-h-80 overflow-hidden bg-canvas sm:min-h-[480px] lg:min-h-[640px]">
                <Image
                  src={page.image}
                  alt={page.imageAlt}
                  fill
                  preload
                  sizes="(min-width: 1440px) 608px, (min-width: 1024px) 50vw, 100vw"
                  className="object-cover object-[40%_center]"
                />
              </div>
            )}
          </section>
          <HappyCustomers
            photos={photos}
            copy={{ eyebrow: page.customersEyebrow, heading: page.customersHeading, description: page.customersDescription, note: page.customersNote }}
          />
        </main>
      </div>
    </div>
  );
}
