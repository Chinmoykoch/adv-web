import Navbar from "../components/Navbar";
import CarFleet from "../components/landing/components/cars/CarFleet";
import { getCars, getPage, getSiteSettings } from "../lib/queries";
import { defaultPageTitles, pageMetadata, pageSeoControls } from "../lib/site";

export async function generateMetadata() {
  const [settings, page] = await Promise.all([getSiteSettings(), getPage("cars")]);
  return pageMetadata({
    settings,
    title: page.seoTitle || defaultPageTitles["cars"],
    description: page.seoDescription || settings.description,
    seo: pageSeoControls(page),
    path: "/cars",
  });
}

export default async function CarsPage() {
  const [cars, page] = await Promise.all([getCars(), getPage("cars")]);
  return (
    <div className="min-h-screen bg-canvas-light px-5 py-4 sm:px-8 sm:py-6">
      <div className="mx-auto max-w-7xl">
        <Navbar />
      </div>
      <main>
        <CarFleet cars={cars} copy={{ eyebrow: page.eyebrow, heading: page.heading, emphasis: page.emphasis }} headingLevel="h1" />
      </main>
    </div>
  );
}
