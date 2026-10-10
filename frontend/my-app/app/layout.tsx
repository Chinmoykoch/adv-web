import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import Footer from "./components/Footer";
import EnquiryPopup from "./components/EnquiryPopup";
import JsonLd from "./components/JsonLd";
import PublicOnly from "./components/PublicOnly";
import WhatsAppButton from "./components/WhatsAppButton";
import { getSiteSettingsOrDefault, getWhatsAppButton } from "./lib/queries";
import { site } from "./lib/site";
import { websiteJsonLd } from "./lib/structuredData";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

// Site name, default title and description, share image and the Search Console code are all
// edited in the admin panel (Site settings).
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettingsOrDefault();
  const verification = settings.googleVerification || process.env.GOOGLE_SITE_VERIFICATION;
  return {
    metadataBase: new URL(site.url),
    title: { default: `${settings.name} | ${settings.title}`, template: `%s | ${settings.name}` },
    description: settings.description,
    applicationName: settings.name,
    openGraph: { type: "website", siteName: settings.name, locale: site.locale, images: [settings.image] },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
    verification: verification ? { google: verification } : undefined,
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [settings, whatsApp] = await Promise.all([getSiteSettingsOrDefault(), getWhatsAppButton()]);
  return (
    <html
      lang="en-IN"
      className={`${manrope.variable} ${playfairDisplay.variable} h-full antialiased motion-safe:scroll-smooth`}
    >
      <body className="min-h-full flex flex-col">
        <JsonLd data={websiteJsonLd(settings)} />
        {children}
        <PublicOnly><Footer /></PublicOnly>
        <PublicOnly><EnquiryPopup /></PublicOnly>
        {whatsApp && <WhatsAppButton config={whatsApp} />}
      </body>
    </html>
  );
}
