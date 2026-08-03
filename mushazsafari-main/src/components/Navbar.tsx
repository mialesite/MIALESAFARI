"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/context/wishlist-context";

// Lazy load BookingDialog to save RAM during initial landing
const BookingDialog = dynamic(() => import("./BookingDialog").then(mod => mod.BookingDialog), {
  ssr: false,
  loading: () => <Button className="rounded-full px-8 text-[10px] font-space font-bold uppercase tracking-widest h-12 opacity-50">Loading...</Button>
});

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems: wishlistCount } = useWishlist();

  useEffect(() => {
    const handleScroll = () => {
      // Memory efficient check: only update state if crossed the threshold
      const isScrolled = window.scrollY > 50;
      setScrolled(prev => prev !== isScrolled ? isScrolled : prev);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Destinations", href: "/destinations" },
    { name: "Expeditions", href: "/itineraries" },
    { name: "Parks", href: "/parks" },
    { name: "The Base", href: "/#about" },
    { name: "Contact", href: "/contact" },
  ];

  const logoUrl = "https://uploads.mushazsafari.com/Miale.png";

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-700 px-4 md:px-12",
        scrolled ? "py-3 md:py-4 bg-white/95 backdrop-blur-2xl shadow-sm border-b" : "py-6 md:py-8 bg-transparent"
      )}
    >
      <div className="max-w-[1800px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6 lg:gap-12">
          <Link href="/" className="group flex items-center shrink-0">
            <div className="relative w-32 h-8 md:w-56 md:h-14 transition-transform duration-500 group-hover:scale-105">
              <Image 
                src={logoUrl}
                alt="Miale"
                fill
                className={cn(
                  "object-contain transition-all duration-500",
                  !scrolled && "brightness-0 invert"
                )}
                sizes="(max-width: 768px) 128px, 224px"
                priority
              />
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-8 xl:gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "text-[10px] uppercase tracking-[0.4em] font-space font-bold transition-all duration-500 hover:text-secondary",
                  scrolled ? "text-primary" : "text-white/80"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/wishlist" className={cn(
            "relative p-2 rounded-full transition-colors",
            scrolled ? "text-primary hover:bg-muted" : "text-white hover:bg-white/10"
          )}>
            <Heart className="w-4 h-4 md:w-5 md:h-5" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 md:w-4 md:h-4 bg-secondary text-white text-[7px] md:text-[8px] font-bold rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          <div className="hidden sm:block">
            <BookingDialog>
              <Button 
                className={cn(
                  "rounded-full px-6 md:px-8 text-[9px] md:text-[10px] font-space font-bold uppercase tracking-widest h-10 md:h-12 transition-all duration-500 shadow-xl",
                  scrolled 
                    ? "bg-primary text-white hover:bg-primary/90" 
                    : "bg-white text-primary hover:bg-secondary hover:text-white"
                )}
              >
                Plan Your Safari
              </Button>
            </BookingDialog>
          </div>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className={cn(
              "p-2 rounded-full lg:hidden transition-colors",
              scrolled ? "text-primary hover:bg-muted" : "text-white hover:bg-white/10"
            )}
            aria-label="Open Menu"
          >
            <Menu className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-primary flex flex-col p-8 md:p-12"
          >
            <div className="flex justify-between items-center mb-16 md:mb-20">
              <div className="relative w-36 h-8 md:w-48 md:h-12">
                <Image 
                  src={logoUrl}
                  alt="Miale"
                  fill
                  className="object-contain brightness-0 invert"
                  sizes="(max-width: 768px) 144px, 192px"
                />
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)} 
                className="text-white p-2 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Close Menu"
              >
                <X className="w-6 h-6 md:w-8 md:h-8" />
              </button>
            </div>
            <div className="flex flex-col gap-6 md:gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-3xl md:text-5xl font-serif text-white hover:text-secondary transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};