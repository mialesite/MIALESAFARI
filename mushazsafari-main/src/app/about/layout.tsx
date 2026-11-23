import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About the Arusha planning desk",
  description:
    "Who Miale Safaris is, how an enquiry becomes a Tanzania itinerary, and which circuits and parks the Arusha desk plans across.",
  keywords: "about miale safari, arusha safari operator, tanzania safari planner, northern circuit, tanzania itinerary design",
};

export default function AboutLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
