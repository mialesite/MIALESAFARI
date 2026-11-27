import type { Metadata } from "next";
import { DestinationsView } from "@/components/destinations/DestinationsView";

export const metadata: Metadata = {
  title: "Tanzania safari destinations",
  description:
    "Tanzania region by region: the northern parks, the southern rivers, the western forests, the peaks and the coast, with the circuits that join them into one trip.",
  keywords: "tanzania safari destinations, northern circuit tanzania, southern circuit safari, western Tanzania chimpanzees, serengeti ngorongoro tarangire, zanzibar safari combo",
};

export default function DestinationsIndexPage() {
  return <DestinationsView circuit="All" />;
}
