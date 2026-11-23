import type { Metadata } from "next";
import { DestinationsView } from "@/components/destinations/DestinationsView";

export const metadata: Metadata = {
  title: "Destinations | Miale Safaris",
  description:
    "Tanzania region by region: the northern parks, the southern rivers, the western forests, the peaks and the coast.",
};

export default function DestinationsIndexPage() {
  return <DestinationsView circuit="All" />;
}
