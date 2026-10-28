// Canonical local event catalogue, shared by the events list, the event
// detail page, and the nav bar's "any events available?" check.
export interface LocalEvent {
  id: string;
  slug: string;
  category: string;
  badge: string;
  title: string;
  date: string;
  time: string;
  location: string;
  price: string;
  vibe: string;
  image: string;
  attendeesCount: number;
  description: string;
  endsAt: string; // ISO timestamp; event is hidden from users after this passes
  ticketUrl?: string;
}

export const LOCAL_EVENTS: LocalEvent[] = [
  {
    id: "123e4567-e89b-12d3-a456-426614174001",
    slug: "minglee-at-wet-wars",
    category: "Party",
    badge: "Selling Fast",
    title: "WET WARS 2.0",
    date: "28th & 29th August 2026",
    time: "9:00 PM",
    location: "Unilag Guest House, Akoka",
    price: "From NGN 3,500",
    vibe: "High-Energy • Amapiano • Fun",
    image: "/assets/wet-wars.jpeg",
    attendeesCount: 142,
    endsAt: "2026-08-29T23:59:59",
    description:
      "WET WARS 2.0 is back — bigger, wetter, and wilder than ever. Join hundreds of Lagos students and young professionals for the most talked-about summer party of 2026. Expect non-stop Amapiano, water games, and an electric crowd. Dress to get soaked and come ready to have the night of your life.",
  },
  {
    id: "evt_002",
    slug: "rave-district",
    category: "Date-Friendly",
    badge: "Limited Seats",
    title: "RAVE DISTRICT",
    date: "27th August 2026",
    time: "9:00 PM",
    location: "Unilag Guest House, Akoka",
    price: "From NGN 4,000",
    vibe: "Warm • Intimate • Conversational",
    image: "/assets/rave-district.jpeg",
    attendeesCount: 98,
    endsAt: "2026-08-27T23:59:59",
    description:
      "RAVE DISTRICT is the perfect evening for those who want more than just a party. A carefully curated date-friendly event designed to spark real connections in a warm, intimate atmosphere. Think deep cuts on the decks, low lighting, great company, and conversations worth having.",
  },
  {
    id: "evt_003",
    slug: "campus-sunset-brunch",
    category: "Social",
    badge: "Campus Mixer",
    title: "CAMPUS SUNSET BRUNCH",
    date: "5th September 2026",
    time: "4:00 PM",
    location: "PAU Main Terrace, Ibeju-Lekki",
    price: "From NGN 2,500",
    vibe: "Cocktails • Good Music • Chill",
    image: "/match-poster.png",
    attendeesCount: 76,
    endsAt: "2026-09-05T23:59:59",
    description:
      "A golden-hour social mixer on the PAU terrace. Cocktails, curated playlist, bites, and the kind of crowd that actually wants to meet new people. Whether you're coming solo or with friends, Campus Sunset Brunch is your mid-semester reset — easy, fun, and full of good vibes.",
  },
];

export function isEventExpired(event: LocalEvent, now: Date = new Date()): boolean {
  return new Date(event.endsAt).getTime() < now.getTime();
}

export function getUpcomingLocalEvents(now: Date = new Date()): LocalEvent[] {
  return LOCAL_EVENTS.filter((event) => !isEventExpired(event, now));
}

export function hasUpcomingLocalEvents(now: Date = new Date()): boolean {
  return LOCAL_EVENTS.some((event) => !isEventExpired(event, now));
}
