import JsonLd from "./components/JsonLd";
import LandingPage from "./components/landing/LandingPage";
import { getPage, getSiteSettings } from "./lib/queries";
import { pageMetadata, pageSeoControls } from "./lib/site";
import { localBusinessJsonLd } from "./lib/structuredData";

export async function generateMetadata() {
  const [settings, home] = await Promise.all([getSiteSettings(), getPage("home")]);
  return pageMetadata({
    settings,
    title: `${home.seoTitle || settings.title} | ${settings.name}`,
    description: home.seoDescription || settings.description,
    path: "/",
    absoluteTitle: true,
    seo: pageSeoControls(home),
  });
}

export default async function Home() {
  const settings = await getSiteSettings();
  return (
    <>
      <JsonLd data={localBusinessJsonLd(settings)} />
      <LandingPage />
    </>
  );
}
