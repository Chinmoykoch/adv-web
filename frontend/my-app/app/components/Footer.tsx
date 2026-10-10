import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import policies from "../content/policies.json";
import { getPage, getSiteSettings, getWhatsAppButton } from "../lib/queries";
import { openingHoursText, phoneNumbers, telHref } from "../lib/site";

const explore = [
  { label: "Home", href: "/" },
  { label: "Cars", href: "/cars" },
  { label: "About", href: "/aboutus" },
  { label: "Blog", href: "/blogs" },
  { label: "Contact", href: "/contact" },
] as const;

// Outline icons (Lucide, ISC licence), drawn with the current text colour.
const icons: Record<string, ReactNode> = {
  instagram: <><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><path d="M17.5 6.5h.01" /></>,
  facebook: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
  map: <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>,
  youtube: <><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" /></>,
  link: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>,
  phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.2 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.7 2.79a2 2 0 0 1-.45 2.11L8.09 9.89a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.89.34 1.83.58 2.79.7A2 2 0 0 1 22 16.92z" />,
  whatsapp: <><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /><path d="m9 8 1 2-1 1a9 9 0 0 0 4 4l1-1 2 1" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
};

function FooterIcon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <svg aria-hidden="true" className={`size-[18px] shrink-0 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
}

// Names each profile link from Site settings by its site, so new links need no code change.
function profile(url: string) {
  let host: string;
  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
  if (host.endsWith("instagram.com")) return { url, name: "Instagram", icon: "instagram" };
  if (host.endsWith("facebook.com") || host === "fb.com") return { url, name: "Facebook", icon: "facebook" };
  if (host.endsWith("youtube.com")) return { url, name: "YouTube", icon: "youtube" };
  if (host === "maps.app.goo.gl" || host === "g.page" || (host.startsWith("google.") && url.includes("/maps"))) return { url, name: "Google Maps", icon: "map" };
  return { url, name: host, icon: "link" };
}

// Like the WhatsApp button, a failure here only hides the footer; it never breaks a page.
async function footerContent() {
  try {
    const [settings, contact, whatsApp] = await Promise.all([getSiteSettings(), getPage("contact"), getWhatsAppButton()]);
    return { settings, contact, whatsApp };
  } catch (error) {
    console.error("Footer unavailable:", error instanceof Error ? error.message : error);
    return null;
  }
}

const heading = "mb-5 font-body text-[11px] font-semibold uppercase tracking-[.2em] text-primary-300";
const link = "rounded-sm transition-colors duration-200 hover:text-primary-300 focus-visible:text-primary-300 motion-reduce:transition-none";

// Business details come from Site settings, the same source as the structured data Google reads,
// so the name, address and phone match everywhere. WhatsApp and the map link are set on the Contact page.
export default async function Footer() {
  const content = await footerContent();
  if (!content) return null;
  const { settings, contact, whatsApp } = content;
  const b = settings.business;
  const phones = phoneNumbers(b.phone);
  const address = [b.streetAddress, b.locality, [b.region, b.postalCode].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  const profiles = b.sameAs.map(profile).filter((item) => item !== null);
  const mapHref = contact.mapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <footer className="mt-auto border-t border-white/10 bg-secondary px-5 pb-24 pt-10 text-sm text-white/70 sm:px-8 sm:pb-28 sm:pt-12 lg:px-12 lg:pt-14">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 pb-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.55fr)] sm:gap-x-10 sm:gap-y-9 sm:pb-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1.1fr)_minmax(0,0.45fr)] lg:gap-12">
          <div className="min-w-0 sm:col-span-2 lg:col-span-1">
            <Link href="/" aria-label={`${settings.name} home`} className="inline-flex max-w-full items-center gap-2.5 text-white">
              <Image src="/logo-mark.png" alt="" width={383} height={514} sizes="36px" className="h-11 w-auto shrink-0" />
              <span className="min-w-0 break-words font-heading text-2xl font-semibold tracking-tight sm:text-[28px]">{settings.name}</span>
            </Link>
            <p className="mt-5 max-w-sm break-words leading-7 text-white/65">{settings.description}</p>
            {profiles.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-1" aria-label="Find us online">
                {profiles.map((item) => (
                  <li key={item.url} className="min-w-0 max-w-full">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className={`${link} inline-flex min-h-11 max-w-full items-center gap-2 text-xs text-white/80`}>
                      <FooterIcon name={item.icon} />
                      <span className="break-all">{item.name}</span>
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="min-w-0 border-t border-white/10 pt-7 sm:border-t-0 sm:pt-0 lg:border-l lg:pl-8">
            <h2 className={heading}>Contact</h2>
            <address className="grid gap-3 break-words not-italic">
              {phones.length > 0 && (
                <div className="flex items-start gap-3">
                  <FooterIcon name="phone" className="mt-3 text-primary-300" />
                  <p className="grid min-w-0">
                    {phones.map((phone) => <a key={phone} href={telHref(phone)} aria-label={`Call ${phone}`} className={`${link} flex min-h-11 items-center text-base font-semibold tracking-wide text-white`}>{phone}</a>)}
                  </p>
                </div>
              )}
              {whatsApp && (
                <p><a href={`https://wa.me/${whatsApp.number}`} target="_blank" rel="noopener noreferrer" className={`${link} flex min-h-11 items-center gap-3 text-white/80`}><FooterIcon name="whatsapp" className="text-primary-300" /><span className="min-w-0">WhatsApp: {contact.whatsapp}</span><span className="sr-only"> (opens in a new tab)</span></a></p>
              )}
              {b.email && <p><a href={`mailto:${b.email}`} className={`${link} flex min-h-11 items-center gap-3`}><FooterIcon name="mail" className="text-primary-300" /><span className="min-w-0 break-all">{b.email}</span></a></p>}
              {address && (
                <p className="pt-2 leading-6">
                  <a href={mapHref} target="_blank" rel="noopener noreferrer" className={`${link} flex items-start gap-3`}><FooterIcon name="map" className="mt-1 text-primary-300" /><span className="min-w-0">{address}<span className="sr-only"> (opens Google Maps in a new tab)</span></span></a>
                </p>
              )}
              {b.openingHours && <p className="mt-1 flex items-start gap-3 text-xs leading-6 text-white/65"><FooterIcon name="clock" className="mt-1 text-primary-300" /><span className="min-w-0 whitespace-pre-line">{openingHoursText(b.openingHours)}</span></p>}
            </address>
          </div>

          <nav aria-label="Footer" className="min-w-0 border-t border-white/10 pt-7 sm:border-t-0 sm:pt-0">
            <h2 className={heading}>Explore</h2>
            <ul className="grid gap-1">
              {explore.map((item) => (
                <li key={item.href}><Link href={item.href} className={`${link} inline-flex min-h-11 items-center`}>{item.label}</Link></li>
              ))}
            </ul>
          </nav>
        </div>

        <nav aria-label="Legal policies" className="flex flex-col gap-1 border-t border-white/10 py-3 text-xs text-white/70 sm:flex-row sm:flex-wrap sm:gap-x-6">
          {policies.map((policy) => <Link key={policy.slug} href={`/${policy.slug}`} className={`${link} inline-flex min-h-11 items-center`}>{policy.title}</Link>)}
        </nav>
        <div className="flex flex-col gap-2 border-t border-white/10 pt-5 text-xs leading-5 text-white/60 md:flex-row md:justify-between md:gap-6">
          <p>© {new Date().getFullYear()} {settings.name}. All rights reserved.</p>
          <p>Self-drive car rental in {[b.locality, b.region].filter(Boolean).join(", ")}.</p>
        </div>
      </div>
    </footer>
  );
}
