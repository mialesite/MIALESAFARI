import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact the desk",
  description:
    "Send the Miale desk in Arusha your dates and party. The route is drawn, costed against the season and written up before anything is booked.",
  keywords: "contact miale safaris, arusha safari planner, tanzania safari inquiry, custom tanzania itinerary",
};

export default function ContactLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
