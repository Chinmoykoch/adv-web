import HeroSection from "./components/heroSection/HeroSection";
import type { HeroSlide } from "./components/heroSection/HeroContent";
import ServicesMarquee from "./components/servicesMarquee/ServicesMarquee";
import About from "./components/about/About";
import Service from "./components/service/Service";
import CarFleet from "./components/cars/CarFleet";
import BannerSection from "./components/bannerSection/BannerSection";
import WhyChooseUs from "./components/whyChooseUs/WhyChooseUs";
import Testimonial from "./components/testimonials/Testimonial";
import { getCars, getPage, getServices, getTestimonials } from "../../lib/queries";

// The home page shows exactly this many cars: the ones chosen in the admin panel first, then the
// next cars in display order if fewer are chosen. The full fleet is on /cars.
const HOME_CARS = 4;
const lines = (value: string | undefined) => (value ?? "").split("\n").map((line) => line.trim()).filter(Boolean);
// Framing for each hero slide's photo; part of the design rather than the content.
const heroFraming = ["object-[88%_50%] sm:object-[100%_50%]", "object-[50%_50%] sm:object-[50%_65%]", "object-[30%_50%] sm:object-[50%_75%]"];

// Every heading, paragraph and image here is edited in the admin panel (Pages → Home);
// services, cars and reviews come from their collections.
export default async function LandingPage() {
  const [home, cars, services, testimonials] = await Promise.all([getPage("home"), getCars(), getServices(), getTestimonials()]);
  const slides: HeroSlide[] = [
    { image: home.image, imageAlt: home.imageAlt, title: home.heading, emphasis: home.emphasis, description: home.description },
    { image: home.slide2Image, imageAlt: home.slide2ImageAlt, title: home.slide2Heading, emphasis: home.slide2Emphasis, description: home.slide2Description },
    { image: home.slide3Image, imageAlt: home.slide3ImageAlt, title: home.slide3Heading, emphasis: home.slide3Emphasis, description: home.slide3Description },
  ].map((slide, index) => ({ ...slide, imagePosition: heroFraming[index] })).filter((slide) => slide.image && slide.title);
  const homeCars = [...cars.filter((car) => car.showOnHome), ...cars.filter((car) => !car.showOnHome)].slice(0, HOME_CARS);

  return <>
    <HeroSection slides={slides} copy={{ eyebrow: home.eyebrow, buttonLabel: home.buttonLabel, buttonHref: home.buttonHref, highlights: lines(home.highlights) }} />
    <div id="hero-end" />
    <ServicesMarquee services={lines(home.marquee)} />
    <About
      eyebrow={home.aboutEyebrow} heading={home.aboutHeading} paragraphs={[home.aboutDescription, home.aboutSecondParagraph].filter(Boolean)}
      image={home.aboutImage} imageAlt={home.aboutImageAlt} badgeLabel={home.aboutBadgeLabel} badgeText={home.aboutBadgeText}
      buttonLabel={home.aboutButtonLabel} buttonHref={home.aboutButtonHref}
    />
    <Service copy={{ eyebrow: home.servicesEyebrow, heading: home.servicesHeading, emphasis: home.servicesEmphasis, description: home.servicesDescription }} services={services} />
    <CarFleet
      cars={homeCars} copy={{ eyebrow: home.fleetEyebrow, heading: home.fleetHeading, emphasis: home.fleetEmphasis }}
      viewAll={{ href: "/cars", label: home.fleetLinkLabel || "View all cars" }}
    />
    <BannerSection eyebrow={home.bannerEyebrow} heading={home.bannerHeading} emphasis={home.bannerEmphasis} description={home.bannerDescription} />
    <WhyChooseUs
      copy={{ eyebrow: home.whyEyebrow, heading: home.whyHeading, emphasis: home.whyEmphasis, description: home.whyDescription, checkTitle: home.checkTitle, checkDescription: home.checkDescription }}
      benefits={[1, 2, 3, 4].map((n) => ({ title: home[`benefit${n}Title`], description: home[`benefit${n}Description`] })).filter((benefit) => benefit.title)}
      statistics={[1, 2, 3, 4].map((n) => ({ text: home[`stat${n}Value`], label: home[`stat${n}Label`] })).filter((stat) => stat.text && stat.label)}
    />
    <Testimonial copy={{ eyebrow: home.testimonialsEyebrow, heading: home.testimonialsHeading, emphasis: home.testimonialsEmphasis }} testimonials={testimonials} />
  </>;
}
