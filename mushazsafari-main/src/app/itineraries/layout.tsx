import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tanzania safari expeditions",
  description:
    "Signature Tanzania expeditions across the Northern, Southern and Western circuits, the peaks and the coast, each with its duration, the parks it visits and what the trip is built around.",
  keywords: "tanzania safari packages, serengeti migration itinerary, northern circuit safari, southern tanzania safari, kilimanjaro trekking package, zanzibar beach extension",
};

export default function ItinerariesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
