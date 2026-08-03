import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { LanguageCurrencyProvider } from "@/context/LanguageCurrencyContext";
import { CartProvider } from "@/context/cart-context";
import { WishlistProvider } from "@/context/wishlist-context";
import { FirebaseClientProvider } from "@/firebase/client-provider";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const space = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-space",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Miale | Premium Tanzanian Safaris & Expeditions",
  description: "Experience the heart of the wild with Miale. Bespoke luxury expeditions, expert local guiding, and signature Tanzanian hospitality in Serengeti, Ngorongoro, and Zanzibar.",
  keywords: "safari tanzania, luxury safari, serengeti tours, arusha beekeeping, zanzibar beach, miale safari",
  authors: [{ name: "Miale" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${display.variable} ${sans.variable} ${space.variable} font-sans antialiased overflow-x-hidden`}>
        <FirebaseClientProvider>
          <LanguageCurrencyProvider>
            <CartProvider>
              <WishlistProvider>
                <SmoothScrollProvider>
                  {children}
                  <Toaster />
                </SmoothScrollProvider>
              </WishlistProvider>
            </CartProvider>
          </LanguageCurrencyProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
