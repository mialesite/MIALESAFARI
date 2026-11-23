import type { Metadata } from "next";

// Leftover template route, pending deletion. Kept out of the index so the old
// storefront copy cannot be crawled under the Miale brand.
export const metadata: Metadata = { robots: "noindex, nofollow" };

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
