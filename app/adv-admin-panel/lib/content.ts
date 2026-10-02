import { blogPosts } from "../../blogs/data";
import { cars } from "../../components/landing/components/cars/carData";

export type Field = { key: string; label: string; type?: "textarea" | "number" | "date" | "email"; required?: boolean; min?: number; max?: number; hint?: string };
export type Entry = { id: string; values: Record<string, string>; archived: boolean; updatedAt: string | null };
export type PageContent = { values: Record<string, string>; updatedAt: string | null };
const imageHint = "Use an existing file such as /car1.png, or an HTTPS link. Uploads need a storage connection.";
const imageFields: Field[] = [
  { key: "image", label: "Image path or HTTPS URL", hint: imageHint },
  { key: "imageAlt", label: "Image description (alt text)", hint: "Describe what the image shows for people using screen readers." },
];
const image = (prefix: string, label: string): Field[] => [
  { key: `${prefix}Image`, label: `${label} image`, hint: imageHint },
  { key: `${prefix}ImageAlt`, label: `${label} image description` },
];
const listHint = "One item per line.";

export const collections = {
  blogs: { title: "Blogs", singular: "article", description: "Shape the stories behind the journeys.", fields: [
    { key: "title", label: "Article title", required: true }, { key: "category", label: "Category", required: true },
    { key: "date", label: "Article date", type: "date" }, { key: "excerpt", label: "Short introduction", type: "textarea" },
    ...imageFields, { key: "body", label: "Full article", type: "textarea", required: true, hint: "Plain text draft. Separate paragraphs with a blank line. A short first line in a paragraph becomes its heading." },
  ] },
  fleet: { title: "Fleet", singular: "vehicle", description: "Organize your cars and the details travellers need.", fields: [
    { key: "title", label: "Vehicle name", required: true }, { key: "category", label: "Categories", hint: "Comma separated. The website filters by SUV & 4x4, Sedan, MUV, and Luxury." },
    { key: "badge", label: "Badge", hint: "For example: MUV · 7 Seater" }, ...imageFields, { key: "fuel", label: "Fuel type" }, { key: "transmission", label: "Transmission" },
    { key: "seats", label: "Seating capacity" }, { key: "price", label: "Price per day (INR)", type: "number", min: 0, required: true },
  ] },
  services: { title: "Services", singular: "service", description: "Introduce the ways you help people get away.", fields: [
    { key: "title", label: "Service name", required: true }, { key: "category", label: "Short label", hint: "Shown above the name, for example: Freedom" },
    { key: "description", label: "Description", type: "textarea", required: true },
    ...imageFields, { key: "featureBadge", label: "Feature badge", hint: "Shown on the image, for example: Self-drive certified" },
    { key: "featureTitle", label: "Feature heading" }, { key: "featureDescription", label: "Feature paragraph", type: "textarea" },
  ] },
  "happy-customers": { title: "Happy Customers", singular: "memory", description: "Curate the photographs and moments from every escape.", fields: [
    { key: "title", label: "Photo title", required: true }, { key: "category", label: "Trip category" },
    { key: "destination", label: "Destination" }, ...imageFields,
    { key: "description", label: "Caption", type: "textarea" }, { key: "permission", label: "Photo permission / attribution", hint: "Record approval before using a customer photograph publicly." },
  ] },
  testimonials: { title: "Testimonials", singular: "testimonial", description: "Keep approved customer feedback together.", fields: [
    { key: "title", label: "Customer name", required: true }, { key: "category", label: "Trip or role" },
    { key: "quote", label: "Review", type: "textarea", required: true }, { key: "rating", label: "Rating out of 5", type: "number", min: 1, max: 5 },
    ...imageFields, { key: "permission", label: "Approval notes", hint: "Record when and how the customer agreed to be quoted." },
  ] },
} satisfies Record<string, { title: string; singular: string; description: string; fields: Field[] }>;
export type CollectionKey = keyof typeof collections;
export const collectionKeys = Object.keys(collections) as CollectionKey[];
const sharedPageFields: Field[] = [{ key: "seoTitle", label: "Search engine title", hint: "Around 50–60 characters." }, { key: "seoDescription", label: "Search engine description", type: "textarea", hint: "Around 150–160 characters." }];

export const pageDefinitions = {
  home: { title: "Home", href: "/", groups: [
    { title: "Hero", fields: [
      { key: "eyebrow", label: "Eyebrow" }, { key: "heading", label: "Main heading", required: true },
      { key: "emphasis", label: "Emphasized heading" }, { key: "description", label: "Introduction", type: "textarea" },
      ...imageFields, { key: "buttonLabel", label: "Primary button text" }, { key: "buttonHref", label: "Primary button destination" },
      { key: "highlights", label: "Hero highlights", type: "textarea", hint: listHint },
    ] }, { title: "Additional hero slides", fields: [
      { key: "slide2Heading", label: "Slide 2 heading" }, { key: "slide2Emphasis", label: "Slide 2 emphasized heading" }, { key: "slide2Description", label: "Slide 2 paragraph", type: "textarea" }, ...image("slide2", "Slide 2"),
      { key: "slide3Heading", label: "Slide 3 heading" }, { key: "slide3Emphasis", label: "Slide 3 emphasized heading" }, { key: "slide3Description", label: "Slide 3 paragraph", type: "textarea" }, ...image("slide3", "Slide 3"),
    ] }, { title: "Services ticker", fields: [
      { key: "marquee", label: "Scrolling service names", type: "textarea", hint: listHint },
    ] }, { title: "About section", fields: [
      { key: "aboutEyebrow", label: "Eyebrow" }, { key: "aboutHeading", label: "Heading", hint: "Use a new line to start each animated line." },
      { key: "aboutDescription", label: "Opening paragraph", type: "textarea" }, { key: "aboutSecondParagraph", label: "Second paragraph", type: "textarea" },
      ...image("about", "About"), { key: "aboutBadgeLabel", label: "Image badge label" }, { key: "aboutBadgeText", label: "Image badge text" },
      { key: "aboutButtonLabel", label: "Link text" }, { key: "aboutButtonHref", label: "Link destination" },
    ] }, { title: "Services introduction", fields: [
      { key: "servicesEyebrow", label: "Eyebrow" }, { key: "servicesHeading", label: "Heading" }, { key: "servicesEmphasis", label: "Emphasized heading" },
      { key: "servicesDescription", label: "Paragraph", type: "textarea", hint: "Individual services are managed in the Services collection." },
    ] }, { title: "Fleet introduction", fields: [
      { key: "fleetEyebrow", label: "Eyebrow" }, { key: "fleetHeading", label: "Heading" }, { key: "fleetEmphasis", label: "Emphasized heading", hint: "Vehicles are managed in the Fleet collection." },
    ] }, { title: "Banner", fields: [
      { key: "bannerEyebrow", label: "Eyebrow" }, { key: "bannerHeading", label: "Heading" }, { key: "bannerEmphasis", label: "Emphasized heading" },
      { key: "bannerDescription", label: "Paragraph", type: "textarea" },
    ] }, { title: "Why choose us", fields: [
      { key: "whyEyebrow", label: "Eyebrow" }, { key: "whyHeading", label: "Heading" }, { key: "whyEmphasis", label: "Emphasized heading" },
      { key: "whyDescription", label: "Paragraph", type: "textarea" }, { key: "checkTitle", label: "Assurance title" }, { key: "checkDescription", label: "Assurance text" },
      ...[1, 2, 3, 4].flatMap((n): Field[] => [{ key: `benefit${n}Title`, label: `Benefit ${n} title` }, { key: `benefit${n}Description`, label: `Benefit ${n} text` }]),
    ] }, { title: "Statistics", fields:
      [1, 2, 3, 4].flatMap((n): Field[] => [{ key: `stat${n}Value`, label: `Statistic ${n} value`, hint: n === 1 ? "Include the suffix, for example: 10+ or 4.9 / 5" : undefined }, { key: `stat${n}Label`, label: `Statistic ${n} label` }]),
    }, { title: "Testimonials introduction", fields: [
      { key: "testimonialsEyebrow", label: "Eyebrow" }, { key: "testimonialsHeading", label: "Heading" }, { key: "testimonialsEmphasis", label: "Emphasized heading", hint: "Reviews are managed in the Testimonials collection." },
    ] }, { title: "Search appearance", fields: sharedPageFields },
  ] },
  "about-us": { title: "About Us", href: "/aboutus", groups: [
    { title: "Our story", fields: [
      { key: "eyebrow", label: "Eyebrow" }, { key: "heading", label: "Heading", required: true },
      { key: "description", label: "Opening paragraph", type: "textarea" }, { key: "secondParagraph", label: "Second paragraph", type: "textarea" },
      ...imageFields, { key: "buttonLabel", label: "Button text" }, { key: "buttonHref", label: "Button destination" },
    ] }, { title: "Happy Customers introduction", fields: [
      { key: "customersEyebrow", label: "Eyebrow" }, { key: "customersHeading", label: "Gallery heading" },
      { key: "customersDescription", label: "Gallery paragraph", type: "textarea", hint: "Photographs are managed in the Happy Customers collection." },
      { key: "customersNote", label: "Gallery footnote" },
    ] }, { title: "Search appearance", fields: sharedPageFields },
  ] },
  contact: { title: "Contact", href: "/contact", groups: [
    { title: "Page introduction", fields: [{ key: "heading", label: "Heading", required: true }, { key: "description", label: "Introduction", type: "textarea" }, ...imageFields] },
    { title: "Contact information", fields: [
      { key: "phone", label: "Phone" }, { key: "email", label: "Email", type: "email" }, { key: "address", label: "Address", type: "textarea" },
      { key: "hours", label: "Business hours" }, { key: "whatsapp", label: "WhatsApp number", hint: "Include the country code, for example: +91…" }, { key: "mapLink", label: "Map link", hint: "Must start with https://" },
    ] }, { title: "Enquiry form", fields: [
      { key: "formHeading", label: "Form heading" }, { key: "formDescription", label: "Form introduction", type: "textarea" },
      { key: "formButton", label: "Submit button text" }, { key: "formSuccess", label: "Confirmation message", type: "textarea", hint: "Shown after someone sends an enquiry." },
    ] }, { title: "Search appearance", fields: sharedPageFields },
  ] },
} satisfies Record<string, { title: string; href: string; groups: { title: string; fields: Field[] }[] }>;
export type PageKey = keyof typeof pageDefinitions;
export const pageKeys = Object.keys(pageDefinitions) as PageKey[];
export type ContentStore = { version: 1; pages: Record<PageKey, PageContent>; collections: Record<CollectionKey, Entry[]> };
const entry = (id: string, values: Record<string, string>): Entry => ({ id, values, archived: false, updatedAt: null });
const unsplash = (photo: string) => `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=1200&q=85`;

export const initialContent: ContentStore = {
  version: 1,
  pages: {
    home: { updatedAt: null, values: {
      eyebrow: "Self-drive car rental · Guwahati", heading: "Explore Assam.", emphasis: "At your own pace.", description: "Self-drive cars from Guwahati for trips across the Northeast.", image: "/banner1", imageAlt: "A journey through Assam", buttonLabel: "Enquire Now", buttonHref: "/contact",
      highlights: "Hatchbacks to 7-seaters\nHelp planning your trip",
      slide2Heading: "Pick your car.", slide2Emphasis: "Drive it your way.", slide2Description: "From city hatchbacks to 7-seat SUVs, ready when you are.", slide2Image: "/banner2.png",
      slide3Heading: "Take the scenic route.", slide3Emphasis: "Stop where you like.", slide3Description: "Your self-drive trip through Assam starts here.", slide3Image: "/banner3.png",
      marquee: "High-Altitude 4x4\nSelf Drive\nChauffeur Driven\nOutstation Expeditions\nAirport Transfers\nCorporate Fleet",
      aboutEyebrow: "About Adventure Carz", aboutHeading: "DRIVE YOUR WAY.\nEXPLORE NORTHEAST.",
      aboutDescription: "At AdventureCarz, we make self-drive car rentals simple, convenient, and stress-free. Whether you’re heading out for a weekend getaway, travelling for work, catching a flight, or planning a road trip across Assam and the Northeast, you get a well-maintained car and the freedom to travel your way.",
      aboutSecondParagraph: "From choosing the right car to getting back home, we keep the rental experience straightforward. With transparent pricing, flexible rental options, and dependable support whenever you need it, we’re here to make every drive comfortable, smooth, and worth remembering.",
      aboutImage: "/car2.png", aboutImageAlt: "Adventure Carz SUV with a roof tent on a gravel track through the mountains", aboutBadgeLabel: "Overland certified", aboutBadgeText: "High-altitude calibrated & tested", aboutButtonLabel: "Our Story", aboutButtonHref: "/contact",
      servicesEyebrow: "Services & Experiences", servicesHeading: "MORE THAN A RENTAL.", servicesEmphasis: "IT'S YOUR JOURNEY.",
      servicesDescription: "Your journey starts with the right car. From exploring Guwahati to heading out on a road trip across Assam and the Northeast, AdventureCarz gives you the freedom to drive at your own pace, with convenient doorstep and airport delivery options.",
      fleetEyebrow: "Curated Garage", fleetHeading: "Choose Your", fleetEmphasis: "Ride.",
      bannerEyebrow: "The Adventure Ethos", bannerHeading: "NOT JUST A CAR.", bannerEmphasis: "A BETTER WAY TO TRAVEL.",
      bannerDescription: "We eliminate the friction of luxury travel. Transparent reservations, rally-certified machinery, and comprehensive roadside backing guarantee your story continues without pause.",
      whyEyebrow: "The Adventure Advantage", whyHeading: "Why Adventure", whyEmphasis: "Carz?",
      whyDescription: "Standard rental portals provide basic transit. We curate high-calibre vehicles engineered for mountain summit elevations, interstate grand tours, and executive mobility.",
      checkTitle: "150-Point Technical Check", checkDescription: "Brakes, tires, suspension, fluids & sensors certified before each dispatch.",
      benefit1Title: "Reliable Fleet", benefit1Description: "Strict preventive servicing and low-odometer machinery deliver unconditional dependability on long highways.",
      benefit2Title: "Simple Booking", benefit2Description: "Instant digital KYC, zero concealed charges, and prompt automated security deposit returns within 48 hours.",
      benefit3Title: "Transparent Service", benefit3Description: "Prompt doorstep delivery and collection directly at your airport gate, luxury hotel, or residence on your exact schedule.",
      benefit4Title: "24/7 VIP Support", benefit4Description: "Dedicated concierge dispatch and rapid pan-India roadside vehicle swap guarantee your vacation never stalls.",
      stat1Value: "10+", stat1Label: "Years Operating", stat2Value: "100+", stat2Label: "Premium Vehicles", stat3Value: "5,000+", stat3Label: "Journeys Logged", stat4Value: "4.9 / 5", stat4Label: "Client Rating",
      testimonialsEyebrow: "Client Stories", testimonialsHeading: "Loved by", testimonialsEmphasis: "Travelers.",
      seoTitle: "AdventureCarz | Self-drive car rentals",
    } },
    "about-us": { updatedAt: null, values: {
      eyebrow: "About us · Your travel & car rental partner", heading: "Every journey begins with possibility.",
      description: "At AdventureCarz, we believe a great trip starts long before you reach your destination. It starts with the freedom to choose your route, the comfort of the right car, and the excitement of discovering somewhere new.",
      secondParagraph: "We bring travel planning and car rentals together around the way you want to explore. From everyday city journeys to family holidays and scenic weekend escapes, our focus is simple: thoughtful planning, personal service, and a journey that feels like your own.",
      image: "/banner3.png", imageAlt: "An AdventureCarz SUV overlooking a river valley and green hills in Assam at sunset", buttonLabel: "Let’s plan your next journey", buttonHref: "/contact",
      customersEyebrow: "The people. The places. The memories.", customersHeading: "Happy customers. Lasting memories.",
      customersDescription: "Behind every journey is a reason to get away. A family reunion, a weekend with friends, or a long-awaited outstation holiday. At AdventureCarz, we help make the miles in between feel just as special as the places you discover together.",
      customersNote: "Travel inspiration gallery · Illustrative photos",
      seoTitle: "About Us | AdventureCarz", seoDescription: "Meet AdventureCarz, your travel and car rental partner for everyday journeys, scenic escapes, and adventures at your own pace.",
    } },
    contact: { updatedAt: null, values: { heading: "Contact Us", description: "Plan your next journey with AdventureCarz.", formButton: "Send enquiry", seoTitle: "Contact | AdventureCarz" } },
  },
  collections: {
    blogs: blogPosts.map((post) => entry(post.id, { title: post.title, category: post.category, date: post.date, excerpt: post.excerpt, image: post.image, imageAlt: post.imageAlt, body: [post.introduction, ...post.sections.map((section) => `${section.heading}\n${section.content}`)].join("\n\n") })),
    fleet: cars.map((car, index) => entry(`car-${index}`, { title: car.name, category: car.categories.join(", "), badge: car.badge, image: car.image, imageAlt: car.name, fuel: car.fuel, transmission: car.transmission, seats: car.seats, price: String(car.pricePerDay) })),
    services: [
      entry("self-drive", { title: "Self-drive car rentals", category: "Freedom", description: "Drive on your own schedule with our fleet of clean, well-maintained vehicles. Perfect for city travel, business trips, family outings, and Northeast road adventures.", image: "/car1.png", imageAlt: "Black sedan driving along a forest road", featureBadge: "Self-drive certified", featureTitle: "Effortless Key Handover & GPS Guided Freedom", featureDescription: "Delivered right to your doorstep or airport terminal with full tank and sanitization certification." }),
      entry("airport", { title: "Airport car delivery", category: "Executive", description: "Get your self-drive car delivered directly to Lokpriya Gopinath Bordoloi International Airport and start your journey the moment you arrive.", image: "/car3.png", imageAlt: "White MPV parked outside a modern villa at sunset", featureBadge: "Chauffeur driven", featureTitle: "Sit Back While a Vetted Driver Takes the Wheel", featureDescription: "Trained drivers who know the routes, arriving on time and ready when you are." }),
      entry("doorstep", { title: "Doorstep car delivery", category: "Concierge", description: "Skip the hassle of pickup locations. We deliver your booked vehicle directly to your home, hotel, or preferred location in Guwahati.", image: "/banner3.png", imageAlt: "SUV parked on a hillside road overlooking the Brahmaputra", featureBadge: "Flight tracked", featureTitle: "Met at Arrivals, Driven Straight to Your Stay", featureDescription: "We track your flight, wait at the terminal, and handle the luggage for you." }),
      entry("outstation", { title: "Local & outstation self-drive", category: "Expeditions", description: "Whether you’re exploring Guwahati or planning a trip across Assam and the Northeast, enjoy the convenience and flexibility of self-drive travel.", image: "/car2.png", imageAlt: "SUV with a roof tent on a gravel mountain track", featureBadge: "Overland ready", featureTitle: "Rigs Built for High Passes and Rough Roads", featureDescription: "High-clearance 4x4s with roof carriers and all-weather gear for the long way round." }),
    ],
    "happy-customers": [
      entry("mountain-escapes", { title: "Together, a little further", category: "Mountain escapes", image: unsplash("photo-1551632811-561732d1e306"), imageAlt: "Travellers hiking together through a mountain landscape", description: "Fresh air, a scenic drive, and a trail shared with your favourite people. Make room for the moments beyond the destination.", permission: "Illustrative stock photo (Unsplash). Replace with an approved customer photograph." }),
      entry("friends-getaways", { title: "Good company. Great memories.", category: "Friends & getaways", image: unsplash("photo-1529156069898-49953e39b3ac"), imageAlt: "Friends spending time together outdoors", description: "The best part of getting away is who comes along. Turn a free weekend into a shared adventure and a new story to bring home.", permission: "Illustrative stock photo (Unsplash). Replace with an approved customer photograph." }),
      entry("camping-weekends", { title: "A slower kind of weekend", category: "Camping weekends", image: unsplash("photo-1478131143081-fd1d3e8dc7a4"), imageAlt: "A campsite in a scenic outdoor setting", description: "Leave the everyday rush behind for open skies and unhurried evenings. A comfortable journey is just the beginning of your escape.", permission: "Illustrative stock photo (Unsplash). Replace with an approved customer photograph." }),
      entry("outstation-journeys", { title: "Take the scenic way", category: "Outstation journeys", image: unsplash("photo-1500534623283-312aade485b7"), imageAlt: "Open countryside beneath a bright sky", description: "A change of scenery can change the whole weekend. Enjoy the stops along the way and travel at a pace that feels like your own.", permission: "Illustrative stock photo (Unsplash). Replace with an approved customer photograph." }),
      entry("hill-station-breaks", { title: "Views worth the journey", category: "Hill station breaks", image: unsplash("photo-1464822759023-fed622ff2c3b"), imageAlt: "Dramatic mountain peaks rising into the clouds", description: "From winding roads to wide-open views, let your next outstation trip bring a little more wonder into the everyday.", permission: "Illustrative stock photo (Unsplash). Replace with an approved customer photograph." }),
      entry("coastal-holidays", { title: "Chasing a little sunshine", category: "Coastal holidays", image: unsplash("photo-1507525428034-b723cf961d3e"), imageAlt: "A sandy tropical beach beside clear blue water", description: "Pack for long conversations, ocean air, and time together. Some journeys are simply about finding a place to slow down.", permission: "Illustrative stock photo (Unsplash). Replace with an approved customer photograph." }),
    ],
    testimonials: [
      entry("rajesh-vardhan", { title: "Rajesh Vardhan", category: "Executive Director · Delhi NCR (Spiti Overland Tour)", quote: "Smooth booking, pristine car condition, and excellent roadside assistance throughout our Himachal tour. The Defender handled Spiti valley river passes with total authority.", rating: "5", permission: "Supplied in the design reference. Confirm approval before publishing." }),
      entry("ananya-deshmukh", { title: "Ananya Deshmukh", category: "VP Corporate Operations", quote: "We rented the Mercedes E-Class for our board delegation in Gurgaon. Punctual airport handover, immaculate cabin, and transparent billing.", rating: "5", permission: "Supplied in the design reference. Confirm approval before publishing." }),
    ],
  },
};
