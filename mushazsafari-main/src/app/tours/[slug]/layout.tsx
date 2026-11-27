import type { Metadata } from "next";
import { TOUR_DATA } from "@/lib/tours";

// The detail page itself is a client component reading Firestore, so the
// document title is built from the seed row: the slug is the key, and a live
// edit to a title changes the page body but not the SEO label.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tour = TOUR_DATA[slug];
  if (!tour) return { title: "Safari expedition" };
  return {
    title: tour.title,
    description: `${tour.title} is a ${tour.duration} Tanzania expedition${tour.focus ? ` built around ${tour.focus.toLowerCase()}` : ""}. ${tour.overview || ""}`.slice(0, 300),
    keywords: `tanzania safari, ${tour.slug?.replace(/-/g, " ")}, ${tour.duration?.toLowerCase()} safari, ${tour.category?.toLowerCase()} safari tanzania`,
  };
}

export default function TourDetailLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
