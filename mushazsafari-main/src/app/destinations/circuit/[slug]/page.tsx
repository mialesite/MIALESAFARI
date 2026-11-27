import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DestinationsView, type DestinationsCircuit } from "@/components/destinations/DestinationsView";

const CIRCUITS: Record<string, DestinationsCircuit> = {
  "northern-circuit": "Northern Circuit",
  "southern-circuit": "Southern Circuit",
  "western-frontiers": "Western Frontiers",
  "zanzibar-islands": "Zanzibar & Islands",
  "the-peaks": "The Peaks",
};

export function generateStaticParams() {
  return Object.keys(CIRCUITS).map((slug) => ({ slug }));
}

const CIRCUIT_COPY: Record<string, string> = {
  "northern-circuit":
    "The Northern Circuit: Serengeti, Ngorongoro, Tarangire, Lake Manyara and the short grass plains, and how Miale sequences them into one trip.",
  "southern-circuit":
    "The Southern Circuit: Ruaha, Nyerere, Mikumi and the Rufiji, the quieter half of Tanzania where the herds and the predators stay put.",
  "western-frontiers":
    "The Western Frontiers: Mahale and Gombe, chimpanzee country on the shores of Lake Tanganyika.",
  "zanzibar-islands":
    "Zanzibar and the islands: Stone Town, the east coast reefs and the beach finish that closes a mainland trip.",
  "the-peaks":
    "The Peaks: Kilimanjaro, Meru and Ol Doinyo Lengai, the treks that sit alongside a safari rather than instead of one.",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const circuit = CIRCUITS[slug];
  return {
    title: circuit || "Destinations",
    description: CIRCUIT_COPY[slug] || "Tanzania safari regions and the parks inside them.",
  };
}

export default async function CircuitDestinationsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const circuit = CIRCUITS[slug];
  if (!circuit) notFound();
  return <DestinationsView circuit={circuit} />;
}
