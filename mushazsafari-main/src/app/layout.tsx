import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { LanguageCurrencyProvider } from "@/context/LanguageCurrencyContext";
import { SiteLanguageProvider } from "@/context/LanguageContext";
import { CartProvider } from "@/context/cart-context";
import { WishlistProvider } from "@/context/wishlist-context";
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
  description: "Safari planning from a desk in Arusha. Miale writes Tanzania itineraries around your dates, party and season, across the Northern, Southern and Western circuits, the peaks and Zanzibar.",
  keywords: "tanzania safari planner, arusha safari operator, serengeti migration itinerary, ngorongoro crater, zanzibar beach extension, kilimanjaro trekking, custom tanzania safari",
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
            <LanguageCurrencyProvider>
              <CartProvider>
                <WishlistProvider>
                  <SmoothScrollProvider>
                    {children}
                    <SiteFooter />
                    <WhatsAppButton />
                    <Toaster />
                  </SmoothScrollProvider>
                </WishlistProvider>
              </CartProvider>
            </LanguageCurrencyProvider>
          </SiteLanguageProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
