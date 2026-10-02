import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import HappyCustomers from "./components/HappyCustomers";

export const metadata: Metadata = {
  title: "About Us | AdventureCarz",
  description:
    "Meet AdventureCarz, your travel and car rental partner for everyday journeys, scenic escapes, and adventures at your own pace.",
};

export default function AboutUsPage() {
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
              <p className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted sm:text-xs">
                <span className="text-primary">About us</span>
                <span aria-hidden="true">·</span>
                <span>Your travel &amp; car rental partner</span>
              </p>

              <h1
                id="about-heading"
                className="max-w-xl text-[clamp(2.5rem,4.2vw,4rem)] uppercase leading-[1.16] tracking-tight text-secondary"
              >
                Every journey
                <br />
                begins with
                <br />
                <span className="text-primary">possibility.</span>
              </h1>

              <div
                aria-hidden="true"
                className="my-6 min-h-16 flex-1 border-l border-border/60 lg:min-h-28"
              />

              <div className="max-w-xl space-y-4 text-sm leading-7 text-body sm:text-base sm:leading-8">
                <p>
                  At AdventureCarz, we believe a great trip starts long before
                  you reach your destination. It starts with the freedom to
                  choose your route, the comfort of the right car, and the
                  excitement of discovering somewhere new.
                </p>
                <p>
                  We bring travel planning and car rentals together around the
                  way you want to explore. From everyday city journeys to family
                  holidays and scenic weekend escapes, our focus is simple:
                  thoughtful planning, personal service, and a journey that
                  feels like your own.
                </p>
              </div>

              <Link
                href="/contact"
                className="mt-6 inline-flex min-h-11 items-center gap-4 self-start border-b border-primary/30 text-sm font-semibold text-primary transition-colors hover:border-primary hover:text-primary-700 motion-reduce:transition-none"
              >
                Let’s plan your next journey
                <span aria-hidden="true">↗</span>
              </Link>
            </div>

            <div className="relative min-h-80 overflow-hidden bg-canvas sm:min-h-[480px] lg:min-h-[640px]">
              <Image
                src="/banner3.png"
                alt="An AdventureCarz SUV overlooking a river valley and green hills in Assam at sunset"
                fill
                preload
                sizes="(min-width: 1440px) 608px, (min-width: 1024px) 50vw, 100vw"
                className="object-cover object-[40%_center]"
              />
            </div>
          </section>
          <HappyCustomers />
        </main>
      </div>
    </div>
  );
}
