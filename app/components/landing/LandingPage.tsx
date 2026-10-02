import HeroSection from "./components/heroSection/HeroSection";
import ServicesMarquee from "./components/servicesMarquee/ServicesMarquee";
import About from "./components/about/About";
import Service from "./components/service/Service";
import CarFleet from "./components/cars/CarFleet";
import BannerSection from "./components/bannerSection/BannerSection";
import WhyChooseUs from "./components/whyChooseUs/WhyChooseUs";
import Testimonial from "./components/testimonials/Testimonial";
import CustomerMemories from "./components/customerMemories/CustomerMemories";

export default function LandingPage(){
    return <>
    <HeroSection />
    <div id="hero-end" />
    <ServicesMarquee />
    <About />
    <Service />
    <CarFleet />
    <BannerSection />
    <WhyChooseUs />
    {/* <CustomerMemories /> */}
    <Testimonial />
    </>
}
