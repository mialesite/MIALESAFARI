"use client";

import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { FeaturedTours } from "@/components/FeaturedTours";
import { InteractiveExplorer } from "@/components/InteractiveExplorer";
import { TrustBadges } from "@/components/TrustBadges";
import { ContactSection } from "@/components/ContactSection";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Instagram, Youtube, Phone, Mail, MapPin, Facebook, Linkedin, Settings } from "lucide-react";

/**
 * @fileOverview Miale Homepage
 * Optimized for performance: uses priority loading for editorial hero and efficient responsive grids.
 */
export default function Home() {
  const logoUrl = "https://uploads.mushazsafari.com/Miale.png";
  const editorialImageUrl = "https://development.orbituniverse.co.tz/uploads/Mushaz%20safaris/Destinations/uzuri-safaris-tanzania-tyxN9RIba8U-unsplash.jpg";

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <TrustBadges />
      
      {/* Editorial Narrative Section */}
      <section className="py-16 md:py-32 px-6 md:px-12 lg:px-24 bg-safari-white overflow-hidden" id="about">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2 }}
            viewport={{ once: true, margin: "-100px" }}
            className="relative h-[400px] sm:h-[500px] lg:h-[700px] rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-2xl accelerate"
          >
            <Image 
              src={editorialImageUrl} 
              alt="Luxury Safari Ambience" 
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 border-[15px] md:border-[30px] border-white/5 m-4 md:m-10 rounded-[2rem] md:rounded-[3rem]" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            viewport={{ once: true }}
            className="space-y-8 md:space-y-12"
          >
            <span className="text-[10px] md:text-[11px] font-space font-bold text-secondary uppercase tracking-[0.4em] md:tracking-[0.5em]">The Miale Philosophy</span>
            <h2 className="text-4xl md:text-6xl lg:text-8xl font-serif leading-[1.1] md:leading-[0.85] tracking-tighter text-primary">
              Where Elegance <br className="hidden md:block" />
              <span className="font-light italic text-muted-foreground/60">encounters</span> <br className="hidden md:block" />
              The Wild.
            </h2>
            <div className="space-y-6 md:space-y-8 text-lg md:text-xl text-muted-foreground font-light leading-relaxed italic border-l-4 border-secondary/20 pl-6 md:pl-10">
              <p>
                "At Miale, we believe a safari is more than a trip; it's a profound dialogue with the earth. We engineer lifelong memories through high-end logistics and unrivaled access to Africa's most pristine environments."
              </p>
              <div className="flex items-center gap-6 md:gap-10 pt-4 md:pt-8 not-italic">
                <div className="text-center">
                  <p className="text-3xl md:text-4xl font-serif font-bold text-primary">15+</p>
                  <p className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-muted-foreground font-bold font-space mt-2">Years Excellence</p>
                </div>
                <div className="h-12 md:h-16 w-px bg-safari-sand" />
                <div className="text-center">
                  <p className="text-3xl md:text-4xl font-serif font-bold text-primary">500+</p>
                  <p className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-muted-foreground font-bold font-space mt-2">Private Journeys</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <InteractiveExplorer />
      <FeaturedTours />
      <ContactSection />

      {/* Luxury Brand Footer */}
      <footer className="bg-safari-charcoal py-16 px-6 md:px-12">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 border-b border-white/5 pb-12">
            <div className="space-y-6 md:space-y-8 max-w-md w-full">
              <div className="relative w-48 h-10 md:w-64 md:h-14">
                <Image 
                  src={logoUrl}
                  alt="Miale"
                  fill
                  className="object-contain brightness-0 invert"
                />
              </div>
              <p className="text-white/40 text-xs md:text-sm font-light leading-relaxed">
                The benchmark for luxury Tanzanian travel. Crafting unparalleled wildlife encounters and bespoke expeditions across the continent's most iconic landscapes.
              </p>
              <div className="flex gap-4">
                <a href="#" target="_blank" rel="noopener noreferrer" className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-secondary hover:border-secondary transition-all" aria-label="Facebook">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="https://instagram.com/mialesafari?utm_source=qr&igsh=dTF5ZnlzMXdkbDhn" target="_blank" rel="noopener noreferrer" className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-secondary hover:border-secondary transition-all" aria-label="Instagram">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-secondary hover:border-secondary transition-all" aria-label="LinkedIn">
                  <Linkedin className="w-4 h-4" />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-secondary hover:border-secondary transition-all" aria-label="YouTube">
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-24 w-full md:w-auto">
              <div className="space-y-4 md:space-y-6">
                <p className="text-[9px] md:text-[10px] font-space font-bold text-secondary uppercase tracking-[0.3em] md:tracking-[0.4em]">Destinations</p>
                <ul className="space-y-3 md:space-y-4 text-white/50 text-[10px] md:text-xs font-light">
                  <li><Link href="/destinations" className="hover:text-white transition-colors">Explorer</Link></li>
                  <li><Link href="/parks" className="hover:text-white transition-colors">National Parks</Link></li>
                </ul>
              </div>
              <div className="space-y-4 md:space-y-6">
                <p className="text-[9px] md:text-[10px] font-space font-bold text-secondary uppercase tracking-[0.3em] md:tracking-[0.4em]">Company</p>
                <ul className="space-y-3 md:space-y-4 text-white/50 text-[10px] md:text-xs font-light">
                  <li><Link href="/#about" className="hover:text-white transition-colors">Our Story</Link></li>
                  <li><Link href="/itineraries" className="hover:text-white transition-colors">Expeditions</Link></li>
                  <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                </ul>
              </div>
              <div className="space-y-6 md:space-y-8 col-span-2 md:col-span-1 pt-6 md:pt-0 border-t border-white/5 md:border-none">
                <p className="text-[9px] md:text-[10px] font-space font-bold text-secondary uppercase tracking-[0.3em] md:tracking-[0.4em]">The Base</p>
                
                <div className="flex items-center gap-3 md:gap-4 group">
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all duration-500 shrink-0">
                    <Phone className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </div>
                  <div>
                    <h4 className="text-[7px] md:text-[8px] text-white/40 uppercase tracking-widest font-bold font-space">Direct Line</h4>
                    <p className="text-xs md:text-sm font-serif font-bold text-white">0769 333 331</p>
                    <p className="text-[8px] md:text-[10px] font-bold text-secondary">+44 7769 202031</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 md:gap-4 group">
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all duration-500 shrink-0">
                    <Mail className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[7px] md:text-[8px] text-white/40 uppercase tracking-widest font-bold font-space">Email Inquiries</h4>
                    <p className="text-xs md:text-sm font-serif font-bold text-white truncate">info@mialesafari.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 md:gap-4 group">
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all duration-500 shrink-0">
                    <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </div>
                  <div>
                    <h4 className="text-[7px] md:text-[8px] text-white/40 uppercase tracking-widest font-bold font-space">Arusha Base</h4>
                    <p className="text-xs md:text-sm font-serif font-bold text-white">Sombetini JR, Arusha</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-center">
              <p className="text-white/20 text-[9px] md:text-[10px] font-space font-bold uppercase tracking-[0.2em] md:tracking-[0.3em]">
                © 2026 MIALE • ALL RIGHTS RESERVED
              </p>
              <span className="hidden md:block text-white/10">•</span>
              <p className="text-white/20 text-[9px] md:text-[10px] font-space font-bold uppercase tracking-[0.2em] md:tracking-[0.3em]">
                <a href="https://orbituniverse.co.tz/" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">
                  BY ORBIT UNIVERSE
                </a>
              </p>
            </div>
            <div className="flex gap-6 md:gap-8 text-white/20 text-[9px] md:text-[10px] font-space font-bold uppercase tracking-widest items-center">
              <Link href="/privacy" className="hover:text-secondary transition-colors">Privacy Policy</Link>
              <div className="flex items-center gap-2 group">
                <Link href="/terms" className="hover:text-secondary transition-colors">Terms of Service</Link>
                <Link 
                  href="/admin" 
                  className="opacity-20 group-hover:opacity-100 transition-opacity hover:text-secondary"
                  aria-label="Admin Console"
                >
                  <Settings className="w-3  h-3 md:w-3.5 md:h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <WhatsAppButton />
    </main>
  );
}