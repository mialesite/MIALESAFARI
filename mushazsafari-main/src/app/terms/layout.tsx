import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of service",
  description:
    "The terms behind a Miale safari quotation: what a bespoke itinerary covers, how payment and cancellation work, and what the guides and lodges are contracted to provide.",
};

export default function TermsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
