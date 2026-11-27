import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tanzania national parks",
  description:
    "Every park and reserve Miale plans into a Tanzania itinerary, on a map of the country and one card per park: what the place is known for, how long to allow and how it joins the circuit around it.",
  keywords: "tanzania national parks, serengeti national park, tarangire elephants, ngorongoro crater, ruaha national park, mahale mountains chimpanzees, gombe stream",
};

export default function ParksLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
