import type { Metadata } from "next";
import { MASTER_DESTINATIONS } from "@/lib/master-destinations";

// The page body is a Firestore document whose id is the destination name
// slugified the same way the index cards build their links, so the shipped
// registry can supply a label for every row that came from it.
const bySlug = new Map(
  MASTER_DESTINATIONS.map((d) => [d.name.toLowerCase().replace(/\s+/g, "-"), d]),
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const match = bySlug.get(id);
  if (!match) {
    return {
      title: "Tanzania destination",
      description:
        "What to expect in a Tanzania park or reserve, how long to allow, and which expeditions and circuits it belongs to.",
    };
  }
  return {
    title: match.name,
    description: `${match.shortDescription} ${match.circuit}, ${match.distance.toLowerCase()}.`,
    keywords: `tanzania safari, ${match.name.toLowerCase()}, ${match.circuit.toLowerCase()} safari, ${match.type.toLowerCase()} tanzania`,
  };
}

export default function DestinationDetailLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
