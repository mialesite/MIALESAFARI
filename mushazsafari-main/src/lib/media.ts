import registry from "./media.json";

export type MediaAsset = {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  bytes: number;
  kind: string;
  license?: string;
  author?: string;
  wikimediaFile?: string;
  credit?: string;
  sourceUrl?: string;
};

export const MEDIA = registry.images as MediaAsset[];

const byId = new Map(MEDIA.map((asset) => [asset.id, asset]));

/**
 * Migration table for references that predate the in-app library: content ids
 * used in code and filenames still stored in Firestore rows. Keyed by filename
 * stem so a CMS value resolves to a shipped file instead of an off-host fetch.
 */
const LEGACY: Record<string, string> = {
  "hero-serengeti-sunrise": "serengeti-balloons-sunrise",
  "hero-lion": "lion-pride-on-kopje",
  "safari-hero": "mara-river-crossing",
  "safari-editorial": "tent-deck-bathtub-view",
  "about-arusha": "afcon-arusha-city",
  migration: "wildebeest-river-crossing",
  "ngorongoro-hero": "ngorongoro-crater-rim",
  "elephant-herd": "elephant-family-crossing",
  "giraffe-acacia": "giraffes-at-dead-tree",
  "kilimanjaro-trek": "kilimanjaro-summit-clear",
  "zanzibar-beach": "mafia-island-lagoon",
  "manyara-lake": "manyara-lakeshore-wildlife",
  "mount-meru": "rift-valley-escarpment",
  "arusha-park": "giraffe-above-shrubs",
  "ruaha-wilderness": "ruaha-open-savanna",
  "nyerere-river": "hippo-pool",
  "mikumi-savanna": "zebras-at-waterhole",
  "mahale-mountains": "mahale-chimpanzee",
  "katavi-untamed": "sable-antelope-portrait",
  "lake-natron": "lake-natron-flamingos",
  "gombe-stream": "gombe-chimpanzee",
  "olduvai-gorge": "olduvai-gorge-rim",
  "tanzania-wild-sky-rcGU1VUgLos-unsplash": "serengeti-balloons-sunrise",
  "steve-ody-rb9amyVVD3Q-unsplash": "lion-pride-on-kopje",
  "tanzania-wild-sky-NHQOJBbJgdk-unsplash": "elephant-family-crossing",
  "elliot-paris-Q3AXzPB5bCA-unsplash": "giraffes-at-dead-tree",
  "jorge-tung-1pZJqQlgpsY-unsplash": "wildebeest-river-crossing",
  "mwandwe-chileshe-q9SMUy4Hee8-unsplash": "ngorongoro-crater-rim",
  "uzuri-safaris-tanzania-tyxN9RIba8U-unsplash": "tent-deck-bathtub-view",
  "olga-budko-hl0W9gS0C6k-unsplash": "mafia-island-lagoon",
  "stephan-bechert-xQWelDCacZE-unsplash": "kilimanjaro-summit-clear",
  "k15-photos-_21baKUW_cw-unsplash": "rift-valley-escarpment",
  "hu-chen-BRXn1JtdXtc-unsplash": "manyara-lakeshore-wildlife",
  "jeff-lemond-bwr9XpsYK98-unsplash": "giraffe-above-shrubs",
  "tanzania-wild-sky-esqhSWDzOWk-unsplash": "hippo-pool",
  "GettyImages-1361427581-2": "mahale-chimpanzee",
  "dmitry-limonov-tey68pExQKM-unsplash": "sable-antelope-portrait",
  "Gombe_Stream_NP_Mutter_und_Kind": "gombe-chimpanzee",
  "Oldupai_Hairy_Scrambler1": "olduvai-gorge-rim",
};

/**
 * Retired assets: they contain identifiable people, which the brand does not
 * publish. Checked before byId so a retired ref never resolves to its own
 * asset, even if the entry returns to media.json or a CMS row still holds it.
 */
const RETIRED: Record<string, string> = {
  "birding-guide-fieldwork": "lilac-breasted-roller-branch",
  "walking-safari-briefing": "udzungwa-montane-forest",
  "maasai-adumu-dance": "maasai-enkaji-house",
  "maasai-firecraft": "maasai-manyatta-aerial",
  "maasai-warriors-highlands": "rift-valley-escarpment",
  "afcon-zanzibar-city": "mafia-island-lagoon",
  "afcon-zanzibar-stadium": "afcon-mkapa-stadium",
  "zanzibar-dhow-sail": "mafia-island-lagoon",
};

const FALLBACK = byId.get("mara-river-crossing")!;
const warned = new Set<string>();

export function mediaFor(ref?: string | null): MediaAsset {
  if (!ref) return FALLBACK;
  const stem = ref.replace(/[?#].*$/, "").replace(/^.*\//, "").replace(/\.[a-z0-9]+$/i, "");
  const retired = RETIRED[ref] || RETIRED[stem];
  if (retired) return byId.get(retired) ?? FALLBACK;
  const exact = byId.get(ref);
  if (exact) return exact;
  const target = LEGACY[ref] || LEGACY[stem];
  const resolved = target ? byId.get(target) : undefined;
  if (resolved) return resolved;
  if (!warned.has(ref)) {
    warned.add(ref);
    console.warn(`[media] No in-app asset for "${ref}". Add it to LEGACY in src/lib/media.ts.`);
  }
  return FALLBACK;
}

export function mediaSrc(ref?: string | null): string {
  return mediaFor(ref).src;
}

/** Assets the admin pickers offer, grouped so a large library stays scannable. */
export const MEDIA_BY_KIND = MEDIA.reduce<Record<string, MediaAsset[]>>((groups, asset) => {
  (groups[asset.kind] ||= []).push(asset);
  return groups;
}, {});
