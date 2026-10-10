import { Suspense } from "react";
import JsonLd from "../components/JsonLd";
import Navbar from "../components/Navbar";
import FaqSection from "../components/FaqSection";
import { getCars, getPage, getSiteSettings } from "../lib/queries";
import { defaultPageTitles, openingHoursText, pageMetadata, pageSeoControls, phoneNumbers, telHref, whatsAppNumber } from "../lib/site";
import { localBusinessJsonLd } from "../lib/structuredData";
import EnquiryForm from "./EnquiryForm";
import ContactIcon, { type ContactIconName } from "./ContactIcon";

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

export default async function ContactPage() {
  const [page, settings, cars] = await Promise.all([getPage("contact"), getSiteSettings(), getCars()]);
  const b = settings.business;
  // Phone, email, address and hours come from Site settings so they match the structured data
  // Google reads; WhatsApp and the map link are set on the Contact page.
  const address = [b.streetAddress, b.locality, [b.region, b.postalCode].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  const phones = phoneNumbers(b.phone);
  const whatsApp = whatsAppNumber(page.whatsapp ?? "");
  const details = [
    ...phones.map((phone, index) => ({ label: index === 0 ? "Phone" : phones.length > 2 ? `Phone ${index + 1}` : "Alternate phone", value: phone, href: telHref(phone), icon: "phone" })),
    whatsApp && { label: "WhatsApp", value: page.whatsapp, href: `https://wa.me/${whatsApp}`, icon: "whatsapp" },
    b.email && { label: "Email", value: b.email, href: `mailto:${b.email}`, icon: "mail" },
    address && { label: "Address", value: address, href: page.mapLink || undefined, icon: "map" },
    b.openingHours && { label: "Hours", value: openingHoursText(b.openingHours), href: undefined, icon: "clock" },
  ].filter(Boolean) as { label: string; value: string; href?: string; icon: ContactIconName }[];

  return (
    <div className="min-h-screen bg-canvas-light px-5 py-4 sm:px-8 sm:py-6">
      <JsonLd data={localBusinessJsonLd(settings)} />
      <div className="mx-auto max-w-7xl">
        <Navbar />
        <main className="py-8 sm:py-10 lg:py-12">
          <header className="mb-6 sm:mb-8">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[.18em] text-primary">Contact</p>
            <h1 className="text-[clamp(34px,4vw,48px)] leading-tight tracking-[-.02em] text-secondary">{page.heading}</h1>
            {page.description && <p className="mt-3 max-w-2xl text-sm leading-6 text-body sm:text-base">{page.description}</p>}
          </header>
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)] lg:gap-6">
            <section aria-labelledby="contact-details-heading" className="min-w-0 rounded-xl border border-border/25 bg-white p-5 sm:p-6">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h2 id="contact-details-heading" className="font-body text-lg font-semibold text-secondary">Get in touch</h2>
                <a href="#contact-faqs" className="inline-flex min-h-11 items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-700">View FAQs <span aria-hidden="true">↘</span></a>
              </div>
              {details.length > 0 && (
                <dl className="divide-y divide-border/20">
                  {details.map((detail) => (
                    <div key={detail.label} className="grid gap-1 py-3.5 sm:grid-cols-[8rem_minmax(0,1fr)] sm:items-start sm:gap-3">
                      <dt className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[.12em] text-primary sm:min-h-11"><ContactIcon name={detail.icon} /><span>{detail.label}</span></dt>
                      <dd className="min-w-0 whitespace-pre-line break-words text-sm font-medium leading-6 text-secondary">
                        {detail.href ? <a href={detail.href} className="inline-flex min-h-11 max-w-full items-center rounded-sm py-1 transition-colors hover:text-primary motion-reduce:transition-none" {...(detail.href.startsWith("https://") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{detail.value}</a> : detail.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </section>
            {/* useSearchParams in the form needs a Suspense boundary so the rest of the page stays static. */}
            <Suspense>
              <EnquiryForm
                cars={cars.filter((car) => car.id).map((car) => ({ id: car.id!, slug: car.slug, name: car.name }))}
                copy={{ heading: page.formHeading, description: page.formDescription, button: page.formButton, success: page.formSuccess }}
              />
            </Suspense>
          </div>
          <FaqSection id="contact-faqs" />
        </main>
      </div>
    </div>
  );
}
