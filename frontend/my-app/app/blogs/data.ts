import type { SeoControls } from "../lib/site";

export type BlogPost = SeoControls & {
  id: string;
  // URL segment for /blogs/[slug]. Changing it changes the public URL, so keep it stable once published.
  slug: string;
  // Optional search overrides; the title and excerpt are used when these are empty.
  seoTitle?: string;
  seoDescription?: string;
  updatedAt?: string;
  category: string;
  title: string;
  date: string;
  image: string;
  imageAlt: string;
  excerpt: string;
  introduction: string;
  // A section's content may hold several paragraphs separated by a blank line.
  sections: { heading: string; content: string }[];
};

// Starter articles: the seed data for Supabase. The website reads articles from the database.
export const blogPosts: BlogPost[] = [
  {
    id: "mountain-road-trip",
    slug: "mountain-drive-tips",
    seoTitle: "5 Tips for an Unforgettable Mountain Drive",
    category: "Travel Guide",
    title: "5 Ways to Make Your Next Mountain Drive Unforgettable",
    date: "2026-09-24",
    image: "/banner3.png",
    imageAlt: "An SUV overlooking a river valley and mountains at sunset",
    excerpt: "A little preparation, a slower pace, and room for discovery: your guide to a more memorable mountain escape.",
    introduction: "Some journeys stay with you long after you return home. The bend that opens onto a valley, a quiet breakfast overlooking the hills, or an unplanned stop can become the best part of a mountain escape. Give those moments room to happen with a journey that feels as good as the destination.",
    sections: [
      { heading: "1. Build a relaxed itinerary", content: "Choose fewer stops and give each one more time. A route that looks short on a map can take much longer when you include winding roads, photo breaks, and lunch. Leave enough daylight for the final stretch so arrival feels calm instead of rushed." },
      { heading: "2. Choose comfort for the whole group", content: "Think about passengers and luggage together when choosing your car. Everyone should have a comfortable seat, and bags should fit without crowding the cabin. A vehicle that suits your route and your group makes the hours between destinations part of the holiday." },
      { heading: "3. Prepare before you set off", content: "Review your route, arrange a vehicle check, and save essential journey information before departure. Keep water, extra layers, charging cables, and everyday essentials within reach. Check local road and weather updates close to the journey, and allow your plans to change when conditions do." },
      { heading: "4. Make the stops count", content: "Trade a long checklist of viewpoints for a few places you can enjoy properly. Stop at designated parking areas, stretch your legs, and make time for a meal. Keep the journey considerate of the people who live along your route and take everything you brought away with you." },
      { heading: "5. Leave space for the unexpected", content: "Keep a little room in the schedule for a recommendation from your host or another hour at a favourite spot. You do not need to fill every afternoon. Often, the quietest moments become the stories you tell most often when you get home." },
    ],
  },
  {
    id: "chauffeur-or-self-drive",
    slug: "chauffeur-vs-self-drive-india",
    seoTitle: "Chauffeur vs Self-Drive in India",
    category: "Fleet Advice",
    title: "The Executive Guide: Chauffeur vs Self-Drive in India",
    date: "2026-09-18",
    image: "/car1.png",
    imageAlt: "A black luxury sedan on a winding road through a pine forest",
    excerpt: "Balance the freedom of the open road with the ease of having someone else take the wheel.",
    introduction: "The right journey starts with a simple question: how do you want to spend your time on the road? Some travellers enjoy every kilometre behind the wheel. Others want to arrive with their attention and energy reserved for what comes next. Both approaches have their place.",
    sections: [
      { heading: "When a chauffeur suits the trip", content: "A chauffeur-driven journey can be a good fit for a full schedule, a special occasion, or a holiday where you would rather watch the scenery. Share your itinerary, expected stops, and timing in advance so the journey can be planned around your needs." },
      { heading: "When self-drive feels right", content: "Self-drive gives you direct control over your pace and stops. It can suit travellers who enjoy driving and are comfortable with the route. Choose a vehicle you feel confident handling, and make sure everyone in the group is happy with the expected time on the road." },
      { heading: "Compare the complete journey", content: "Look beyond the headline price. Ask what is included, how extra time or distance is handled, and which expenses are separate. For self-drive, review the rental agreement and vehicle handover details. For a chauffeured trip, confirm the schedule and arrangements for any overnight stops." },
      { heading: "Make the choice around your priorities", content: "Picture the journey itself: a conversation with friends, a quiet ride before a meeting, or the pleasure of driving a scenic road. Pick the option that supports that experience. Clear expectations before departure are the foundation of a comfortable trip." },
    ],
  },
  {
    id: "weekend-road-trip",
    slug: "weekend-road-trip-guide",
    seoTitle: "How to Plan a Weekend Road Trip",
    category: "Road Trips",
    title: "The Art of an Unforgettable Weekend Road Trip",
    date: "2026-09-10",
    image: "/car2.png",
    imageAlt: "An expedition SUV parked beside a rugged mountain landscape",
    excerpt: "Open landscapes, unhurried mornings, and a thoughtfully planned route. Make a short escape feel like a real break.",
    introduction: "A memorable weekend away does not need a long itinerary. The best short escapes balance a beautiful drive with enough time to settle into a place. Start with the feeling you want to come home with, then build a simple journey around it.",
    sections: [
      { heading: "Choose one base", content: "Staying in one place gives you more time to explore and less time packing. Pick a base that suits your idea of a break, whether that means quiet surroundings, walks, or a lively town. Treat nearby excursions as options instead of obligations." },
      { heading: "Let the drive be part of the experience", content: "Plan a comfortable departure time and a proper break along the way. Choose stops where you can park safely and take your time. A relaxed lunch can do more for the mood of a trip than squeezing in another attraction." },
      { heading: "Pack for ease", content: "Keep your weekend luggage simple and leave room in the car. Bring the essentials you use every day, a layer for changing weather, and something to enjoy during downtime. Have your accommodation details and route available before setting off." },
      { heading: "Protect a little unscheduled time", content: "Give yourself a morning without an alarm or an afternoon without a booking. A weekend can feel surprisingly spacious when you are not constantly moving between plans. Enjoy the place you chose rather than measuring the trip by how many stops you made." },
      { heading: "Make the return comfortable too", content: "Plan the return with the same care as the outward journey. Allow breaks and a little margin before your next commitment. Coming home rested is part of a successful escape, and a gentler final day helps the holiday feeling last." },
    ],
  },
];

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "2-digit", year: "numeric", timeZone: "UTC",
  }).format(new Date(date));
}

export function readingMinutes(post: BlogPost) {
  const words = [post.introduction, ...post.sections.map((section) => `${section.heading} ${section.content}`)].join(" ").split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

// Splits text into paragraphs at blank lines.
export const paragraphs = (text: string) => text.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
