import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How the Miale desk in Arusha collects, uses and stores the details you send with a safari enquiry, and how to ask for them to be removed.",
};

export default function PrivacyLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
