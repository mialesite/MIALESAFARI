/**
 * @fileOverview Maps destination names from the registry to the boundary
 * shapes embedded in parks-geo, plus on-map label placement. Shared by the
 * park cards, the parks map and the destinations circuit map.
 */

export const SHAPE_KEYS_BY_DEST: Record<string, string[]> = {
  "Serengeti National Park": ["serengeti"],
  "Ngorongoro Crater": ["ngorongoro"],
  "Tarangire National Park": ["tarangire"],
  "Lake Manyara": ["manyara"],
  "Mount Kilimanjaro": ["kilimanjaro"],
  "Zanzibar Archipelago": ["unguja", "pemba"],
  "Nyerere National Park": ["nyerere"],
  "Mahale Mountains": ["mahale"],
};

export const SHAPE_LABEL: Record<string, { text: string; dx?: number; dy?: number }> = {
  serengeti: { text: "Serengeti" },
  ngorongoro: { text: "Ngorongoro", dy: 32 },
  tarangire: { text: "Tarangire", dx: 2, dy: 40 },
  manyara: { text: "Lake Manyara", dx: -16, dy: 38 },
  kilimanjaro: { text: "Kilimanjaro", dy: -16 },
  unguja: { text: "Zanzibar", dx: 4, dy: 8 },
  pemba: { text: "Pemba", dy: -10 },
  nyerere: { text: "Nyerere", dy: 6 },
  mahale: { text: "Mahale", dx: 30, dy: 4 },
  ruaha: { text: "Ruaha", dy: 4 },
  mikumi: { text: "Mikumi", dy: 6 },
  gombe: { text: "Gombe", dx: 34, dy: 0 },
};

/** Signature itineraries by slug, mapped to the ground their plans cover. */
export const TOUR_SHAPE_KEYS: Record<string, string[]> = {
  "serengeti-migration-journey": ["serengeti"],
  "central-serengeti-deep-dive": ["serengeti"],
  "ndutu-calving-season": ["serengeti", "ngorongoro"],
  "kilimanjaro-lemosho-route": ["kilimanjaro"],
  "tarangire-elephant-heritage": ["tarangire"],
  "zanzibar-stone-town-beach": ["unguja"],
  "nyerere-river-boat-safari": ["nyerere"],
  "ruaha-wilderness-expedition": ["ruaha"],
  "mikumi-savanna-escape": ["mikumi"],
  "gombe-chimpanzee-trek": ["gombe"],
  "mahale-mountains-luxury": ["mahale"],
};
