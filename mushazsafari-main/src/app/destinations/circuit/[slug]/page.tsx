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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const circuit = CIRCUITS[slug];
  return {
    title: circuit ? `${circuit} | Miale Safaris` : "Destinations | Miale Safaris",
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
