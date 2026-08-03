import { getImageById } from "@/app/lib/placeholder-images";

/**
 * MASTER SOURCE OF TRUTH: Signature Itineraries
 * These are used by the "Sync Signature Collection" button in the Admin Console 
 * and the "Restore Signature Line" button on the public Expeditions page.
 * This list has been synchronized with the original products registry.
 */
export const TOUR_DATA: Record<string, any> = {
  "serengeti-migration-journey": {
    title: "Serengeti Migration Journey",
    slug: "serengeti-migration-journey",
    duration: "10 Days",
    category: "Luxury",
    priceFrom: 6500,
    priceString: "Starts $6,500",
    priceUSD: 6500,
    focus: "Great Migration",
    featuredImage: getImageById('migration').imageUrl,
    overview: "Experience the apex of luxury with our Serengeti Migration Journey. Miale provides exclusive access to Tanzania's most iconic landscapes with refined logistics and elite guiding.",
    highlights: ["Witness the Mara River crossing", "Private 4x4 luxury logistics", "Elite mobile camp accommodation"],
    plan: [
      { day: 1, title: "Arusha Arrival", desc: "VIP meet and greet at JRO and transfer to Arusha luxury estate." },
      { day: "2-9", title: "Serengeti Immersion", desc: "Eight days following the herds with private guides and exclusive air transfers." },
      { day: 10, title: "Departure", desc: "Bush flight back to Arusha for your international connection." }
    ],
    inclusions: ["All domestic flights", "Luxury accommodation", "Expert guiding", "Park fees"],
    exclusions: ["International flights", "Gratuities", "Premium drinks"],
    status: "active"
  },
  "central-serengeti-deep-dive": {
    title: "Central Serengeti Deep Dive",
    slug: "central-serengeti-deep-dive",
    duration: "6 Days",
    category: "Luxury",
    priceFrom: 4200,
    priceUSD: 4200,
    focus: "Big Cat Discovery",
    featuredImage: getImageById('ngorongoro-hero').imageUrl,
    overview: "Explore the heart of the Serengeti, world-renowned for its high density of predators and iconic kopjes. This expedition focuses on the Seronera Valley and its rich biodiversity.",
    highlights: ["Daily big cat tracking", "Luxury tented camp experience", "Seronera valley exploration"],
    plan: [
      { day: 1, title: "Seronera Arrival", desc: "Bush flight directly into the heart of the Serengeti." },
      { day: "2-5", title: "Predator Tracking", desc: "Expert-led game drives focusing on lions, leopards, and cheetahs." },
      { day: 6, title: "Farewell", desc: "Final game drive before flying back to Arusha." }
    ],
    status: "active"
  },
  "ndutu-calving-season": {
    title: "Ndutu Calving Season",
    slug: "ndutu-calving-season",
    duration: "7 Days",
    category: "Migration",
    priceFrom: 3200,
    priceUSD: 3200,
    focus: "Birthing Season",
    featuredImage: getImageById('migration').imageUrl,
    overview: "Witness the miracle of life as hundreds of thousands of wildebeest give birth on the southern plains of the Serengeti ecosystem.",
    highlights: ["Unrivaled predator action", "Off-road driving permitted in Ndutu", "Mobile migration camp"],
    plan: [
      { day: 1, title: "Ndutu Arrival", desc: "Transfer to your luxury mobile camp." },
      { day: "2-6", title: "Calving Discovery", desc: "Witness the massive herds and the predators they attract." },
      { day: 7, title: "Return", desc: "Charter flight back to the logistics hub." }
    ],
    status: "active"
  },
  "kilimanjaro-lemosho-route": {
    title: "Kilimanjaro Lemosho Route",
    slug: "kilimanjaro-lemosho-route",
    duration: "8 Days",
    category: "Mountain",
    priceFrom: 2300,
    priceString: "Starts $2,300",
    priceUSD: 2300,
    focus: "Summit Success",
    featuredImage: getImageById('kilimanjaro-trek').imageUrl,
    overview: "The Lemosho route is widely considered the most scenic path up Mount Kilimanjaro, offering high summit success rates due to excellent acclimatization.",
    highlights: ["Highest success rate on the mountain", "Traverse five distinct eco-zones", "Premium mountain equipment and crew"],
    plan: [
      { day: 1, title: "Londorossi Gate", desc: "Begin the ascent through the pristine rainforest." },
      { day: "2-7", title: "High Altitude Traverse", desc: "Climb through moorland and alpine desert." },
      { day: 8, title: "The Summit", desc: "Uhuru Peak success followed by descent." }
    ],
    inclusions: ["Elite mountain crew", "Oxygen and safety gear", "All park permits"],
    exclusions: ["Personal climbing gear", "Tipping for crew"],
    status: "active"
  },
  "tarangire-elephant-heritage": {
    title: "Tarangire Elephant Heritage",
    slug: "tarangire-elephant-heritage",
    duration: "4 Days",
    category: "Migration",
    priceFrom: 850,
    priceString: "Starts $850",
    priceUSD: 850,
    focus: "Land of Giants",
    featuredImage: getImageById('elephant-herd').imageUrl,
    overview: "Discover the hidden gem of the Northern Circuit. Tarangire is famous for its massive elephant herds and ancient baobab trees.",
    highlights: ["Highest density of elephants in Tanzania", "Ancient baobab tree forests", "Dry season river wildlife viewing"],
    plan: [
      { day: 1, title: "Arusha to Tarangire", desc: "Morning drive to the park." },
      { day: "2-3", title: "River Safaris", desc: "Explore the Tarangire River banks." },
      { day: 4, title: "Departure", desc: "Final game drive before returning to Arusha." }
    ],
    status: "active"
  },
  "zanzibar-stone-town-beach": {
    title: "Zanzibar Stone Town & Beach",
    slug: "zanzibar-stone-town-beach",
    duration: "7 Days",
    category: "Zanzibar",
    priceFrom: 1400,
    priceString: "Starts $1,400",
    priceUSD: 1400,
    focus: "Island Paradise",
    featuredImage: getImageById('zanzibar-beach').imageUrl,
    overview: "A perfect blend of culture and relaxation. Explore historic Stone Town before retreating to white sand beaches.",
    highlights: ["UNESCO Stone Town tour", "Spice plantation visit", "Pristine white sand beaches"],
    plan: [
      { day: "1-2", title: "Stone Town Culture", desc: "Immerse in the history of the island's capital." },
      { day: "3-6", title: "Beach Relaxation", desc: "Transfer to Nungwi for world-class sun and sand." },
      { day: 7, title: "Farewell", desc: "Transfer to the airport for your flight home." }
    ],
    status: "active"
  },
  "nyerere-river-boat-safari": {
    title: "Nyerere River Boat Safari",
    slug: "nyerere-river-boat-safari",
    duration: "4 Days",
    category: "Bespoke",
    priceFrom: 1500,
    priceString: "Starts $1,500",
    priceUSD: 1500,
    focus: "Southern Circuit",
    featuredImage: getImageById('nyerere-river').imageUrl,
    overview: "Explore the untamed wilderness of Africa's largest park via unique boat safaris on the Rufiji River.",
    highlights: ["Rufiji River boat safaris", "Walking wilderness tours", "High density of wild dogs"],
    plan: [
      { day: 1, title: "Arrival", desc: "Bush flight from Arusha and evening boat safari." },
      { day: "2-3", title: "Wilderness Track", desc: "Game drives and guided walking safaris." },
      { day: 4, title: "Departure", desc: "Morning activity before flying back." }
    ],
    status: "active"
  },
  "ruaha-wilderness-expedition": {
    title: "Ruaha Wilderness Expedition",
    slug: "ruaha-wilderness-expedition",
    duration: "6 Days",
    category: "Luxury",
    priceFrom: 1680,
    priceUSD: 1680,
    focus: "Remote Safari",
    featuredImage: getImageById('ruaha-wilderness').imageUrl,
    overview: "Venture into the rugged, baobab-studded landscapes of Ruaha for a truly wild experience far from the crowds.",
    highlights: ["High predator density", "Exclusive lodge experience", "Ancient baobab landscapes"],
    plan: [
      { day: 1, title: "Ruaha Arrival", desc: "Fly into the southern highlands." },
      { day: "2-5", title: "Wilderness Game Drives", desc: "Explore the vast Ruaha river system." },
      { day: 6, title: "Return", desc: "Charter flight back to logistics hub." }
    ],
    status: "active"
  },
  "mikumi-savanna-escape": {
    title: "Mikumi Savanna Escape",
    slug: "mikumi-savanna-escape",
    duration: "3 Days",
    category: "Classic",
    priceFrom: 480,
    priceUSD: 480,
    focus: "Savanna Quick-look",
    featuredImage: getImageById('mikumi-savanna').imageUrl,
    overview: "A perfect short break to the 'Little Serengeti' of the South, offering excellent game viewing in a compact timeframe.",
    highlights: ["Open savanna game viewing", "Easy access from Dar es Salaam", "Mkata Floodplain herds"],
    plan: [
      { day: 1, title: "Dar to Mikumi", desc: "Scenic drive into the park for evening game viewing." },
      { day: 2, title: "Savanna Discovery", desc: "Full day following the herds in the Mkata Floodplain." },
      { day: 3, title: "Departure", desc: "Morning game drive and return to Dar es Salaam." }
    ],
    status: "active"
  },
  "gombe-chimpanzee-trek": {
    title: "Gombe Chimpanzee Trek",
    slug: "gombe-chimpanzee-trek",
    duration: "5 Days",
    category: "Bespoke",
    priceFrom: 2100,
    priceString: "Starts $2,100",
    priceUSD: 2100,
    focus: "Primate Discovery",
    featuredImage: getImageById('gombe-stream').imageUrl,
    overview: "A rare opportunity to walk in the footsteps of Jane Goodall. This expedition takes you deep into the Gombe Stream National Park.",
    highlights: ["Daily chimpanzee trekking", "Lake Tanganyika boat expeditions", "Exclusive forest lodge stay"],
    plan: [
      { day: 1, title: "Kigoma Arrival", desc: "Transfer by boat to Gombe Stream National Park." },
      { day: "2-4", title: "Forest Discovery", desc: "Guided forest walks to locate chimpanzees." },
      { day: 5, title: "Return", desc: "Boat transfer back to Kigoma." }
    ],
    status: "active"
  },
  "mahale-mountains-luxury": {
    title: "Mahale Mountains Luxury",
    slug: "mahale-mountains-luxury",
    duration: "6 Days",
    category: "Bespoke",
    priceFrom: 3000,
    priceUSD: 3000,
    focus: "Primate & Lake",
    featuredImage: getImageById('mahale-mountains').imageUrl,
    overview: "One of the most remote and exclusive destinations in Africa, where the forest meets the crystal waters of Lake Tanganyika.",
    highlights: ["Chimpanzee trekking", "Lake Tanganyika sunset cruises", "Bespoke beach dining"],
    plan: [
      { day: 1, title: "Charter to Mahale", desc: "Private charter to the remote forest air strip." },
      { day: "2-5", title: "Chimp & Lake", desc: "Mornings in the forest, afternoons on the water." },
      { day: 6, title: "Departure", desc: "Final breakfast on the beach before your charter." }
    ],
    status: "active"
  }
};

export const TOURS = Object.values(TOUR_DATA);
