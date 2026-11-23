/**
 * @fileOverview Wildlife and tag facts for the park cards.
 * These are general geographic and wildlife facts about Tanzanian parks,
 * not Miale business claims. Descriptions are written in the desk voice.
 */

export interface ParkFacts {
  animals: string[];
  tags: string[];
  blurb: string;
}

export const PARK_FACTS: Record<string, ParkFacts> = {
  "Serengeti National Park": {
    animals: ["Lion", "Leopard", "Cheetah", "Elephant", "Wildebeest"],
    tags: ["Great Migration", "Big Five", "Balloon Safaris"],
    blurb: "The migration's stage. Open plains the size of a region, and the predators that never leave them.",
  },
  "Ngorongoro Crater": {
    animals: ["Black rhino", "Lion", "Elephant", "Flamingo"],
    tags: ["The Crater", "Big Five", "Black Rhino"],
    blurb: "A complete ecosystem on a crater floor, where black rhino and lion prides share the same view.",
  },
  "Tarangire National Park": {
    animals: ["Elephant", "Lion", "Cheetah", "Buffalo"],
    tags: ["Elephant Herds", "Baobabs", "Dry Season"],
    blurb: "In the dry months the river pulls every elephant herd into one valley. The baobabs stand over all of it.",
  },
  "Lake Manyara": {
    animals: ["Flamingo", "Tree-climbing lion", "Elephant", "Buffalo"],
    tags: ["Tree-climbing Lions", "Flamingos", "Rift Valley"],
    blurb: "A green ribbon under the escarpment: flamingos on the shallows, lions that climb, forest below the wall.",
  },
  "Mount Kilimanjaro": {
    animals: ["Elephant", "Buffalo", "Colobus monkey"],
    tags: ["Uhuru Peak", "Five Eco-zones", "Trekking"],
    blurb: "Five climate zones on one walk. The desk picks the route that fits your dates and your pace.",
  },
  "Zanzibar Archipelago": {
    animals: ["Red colobus", "Dolphin"],
    tags: ["Stone Town", "Spice Farms", "Beach Days"],
    blurb: "Stone Town for the history, the coast for the days after the mainland.",
  },
  "Nyerere National Park": {
    animals: ["African wild dog", "Hippo", "Crocodile", "Lion"],
    tags: ["Boat Safari", "Rufiji River", "Wild Dogs"],
    blurb: "Boat safaris on the Rufiji and wild dogs in country few vehicles reach.",
  },
  "Mahale Mountains": {
    animals: ["Chimpanzee", "Red colobus", "Forest buffalo"],
    tags: ["Chimpanzee Trekking", "Lake Tanganyika", "Forest Camps"],
    blurb: "Chimpanzees in the forested mountains above Lake Tanganyika, reached by boat or small plane.",
  },
};

export function parkFacts(name: string): ParkFacts | undefined {
  return PARK_FACTS[name];
}
