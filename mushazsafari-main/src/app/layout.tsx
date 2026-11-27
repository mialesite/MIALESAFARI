import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { SiteLanguageProvider } from "@/context/LanguageContext";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const SITE_URL = "https://mialesafari.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Miale Safaris | Tanzania trips planned from Arusha",
    template: "%s | Miale Safaris",
  },
  description: "Specialist wildlife expeditions in Tanzania, planned from Arusha. Big cat tracking, chimpanzee trekking, Kilimanjaro, the migration and the coast, drawn around your dates and written down before anything is booked.",
  keywords: "tanzania wildlife safari, serengeti big cat tracking, great migration itinerary, chimpanzee trekking mahale gombe, kilimanjaro lemosho route, wildlife photography safari tanzania, school group safari tanzania, expert local safari guides, zanzibar beach extension, custom tanzania safari",
  authors: [{ name: "Miale Safaris", url: SITE_URL }],
  creator: "Miale Safaris",
  publisher: "Miale Safaris",
  category: "travel",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Miale Safaris",
    title: "Miale Safaris | Tanzania trips planned from Arusha",
    description: "One country, worked end to end. Every Tanzania route is drawn, costed and written down before anything is booked.",
    images: [{ url: "/opengraph-image.jpg", width: 1200, height: 630, alt: "The Ngorongoro Crater rim at first light" }],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Miale Safaris | Tanzania trips planned from Arusha",
    description: "One country, worked end to end. Every Tanzania route is drawn, costed and written down before anything is booked.",
    images: ["/opengraph-image.jpg"],
  },
  robots: "index, follow",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${display.variable} ${sans.variable} font-sans antialiased overflow-x-hidden`}>
        <FirebaseClientProvider>
          <SiteLanguageProvider>
            <SmoothScrollProvider>
              {children}
              <SiteFooter />
              <WhatsAppButton />
              <Toaster />
            </SmoothScrollProvider>
          </SiteLanguageProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
