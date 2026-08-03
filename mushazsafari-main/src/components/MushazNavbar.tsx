"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Compass, Menu, Search, User, Map } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const MushazNavbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const logoUrl = "https://uploads.mushazsafari.com/Miale.png";

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-6 md:px-12",
        scrolled ? "py-4 glass-nav" : "bg-transparent"
      )}
    >
      <div className="max-w-[1800px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link href="/" className="group">
            <div className="relative w-48 h-12 md:w-64 md:h-16 transition-all duration-500">
              <Image 
                src={logoUrl}
                alt="Miale"
                fill
                className="object-contain transition-all duration-500"
                priority
              />
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {["Destinations", "Itineraries", "Conservation", "Experiences"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground hover:text-primary transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
            <Search className="w-4 h-4 text-primary" />
          </Button>
          <Button className="hidden md:flex rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 text-xs font-bold uppercase tracking-widest h-11">
            Plan My Adventure
          </Button>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="w-6 h-6 text-primary" />
          </Button>
        </div>
      </div>
    </nav>
  );
};
