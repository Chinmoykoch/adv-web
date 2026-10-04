import { Suspense } from "react";
import JsonLd from "../components/JsonLd";
import Navbar from "../components/Navbar";
import { getCars, getPage, getSiteSettings } from "../lib/queries";
import { defaultPageTitles, pageMetadata, pageSeoControls } from "../lib/site";
import { localBusinessJsonLd } from "../lib/structuredData";
import EnquiryForm from "./EnquiryForm";

export async function generateMetadata() {
  const [settings, page] = await Promise.all([getSiteSettings(), getPage("contact")]);
  return pageMetadata({
    settings,
    title: page.seoTitle || defaultPageTitles["contact"],
    description: page.seoDescription || settings.description,
    seo: pageSeoControls(page),
    path: "/contact",
  });
}

const digits = (value: string) => value.replace(/[^\d+]/g, "");

export default async function ContactPage() {
  const [page, settings, cars] = await Promise.all([getPage("contact"), getSiteSettings(), getCars()]);
  const b = settings.business;
  // Phone, email, address and hours come from Site settings so they match the structured data
  // Google reads; WhatsApp and the map link are set on the Contact page.
  const address = [b.streetAddress, b.locality, [b.region, b.postalCode].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  const details = [
    b.phone && { label: "Phone", value: b.phone, href: `tel:${digits(b.phone)}` },
    page.whatsapp && { label: "WhatsApp", value: page.whatsapp, href: `https://wa.me/${digits(page.whatsapp).replace(/^\+/, "")}` },
    b.email && { label: "Email", value: b.email, href: `mailto:${b.email}` },
    address && { label: "Address", value: address, href: page.mapLink || undefined },
    b.openingHours && { label: "Hours", value: b.openingHours, href: undefined },
  ].filter(Boolean) as { label: string; value: string; href?: string }[];

  return (
    <div className="min-h-screen bg-canvas-light px-5 py-4 sm:px-8 sm:py-6">
      <JsonLd data={localBusinessJsonLd(settings)} />
      <div className="mx-auto max-w-7xl">
        <Navbar />
        <main className="grid gap-12 py-12 sm:py-16 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:py-20">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[.16em] text-primary">Contact</p>
            <h1 className="text-[clamp(36px,5vw,60px)] leading-[1.05] tracking-[-.02em] text-secondary">{page.heading}</h1>
            {page.description && <p className="mt-5 max-w-lg text-base leading-7 text-body">{page.description}</p>}
            {details.length > 0 && (
              <dl className="mt-10 grid gap-5 sm:grid-cols-2">
                {details.map((detail) => (
                  <div key={detail.label} className="rounded-2xl border border-black/5 bg-white p-5">
                    <dt className="text-[10px] font-bold uppercase tracking-[.12em] text-primary">{detail.label}</dt>
                    <dd className="mt-2 whitespace-pre-line break-words text-sm font-medium text-secondary">
                      {detail.href ? <a href={detail.href} className="hover:text-primary" {...(detail.href.startsWith("https://") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{detail.value}</a> : detail.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
          {/* useSearchParams in the form needs a Suspense boundary so the rest of the page stays static. */}
          <Suspense>
            <EnquiryForm
              cars={cars.filter((car) => car.id).map((car) => ({ id: car.id!, slug: car.slug, name: car.name }))}
              copy={{ heading: page.formHeading, description: page.formDescription, button: page.formButton, success: page.formSuccess }}
            />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
