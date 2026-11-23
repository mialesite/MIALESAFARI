"use client";

import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { FeaturedTours } from "@/components/FeaturedTours";
import { InteractiveExplorer } from "@/components/InteractiveExplorer";
import { MigrationTracker } from "@/components/MigrationTracker";
import { TrustBadges } from "@/components/TrustBadges";
import { ContactSection } from "@/components/ContactSection";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { mediaFor } from "@/lib/media";
import { useLanguage } from "@/context/LanguageContext";

/**
 * @fileOverview Miale Homepage
 * Optimized for performance: uses priority loading for editorial hero and efficient responsive grids.
 */
export default function Home() {
  const { t } = useLanguage();
  const editorialImage = mediaFor("tented-camp-aerial-sunset");

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <TrustBadges />

      {/* Editorial Narrative Section */}
      <section className="py-20 md:py-24 px-6 md:px-12 lg:px-24 bg-safari-white overflow-hidden" id="about">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2 }}
            viewport={{ once: true, margin: "-100px" }}
            className="relative h-[380px] sm:h-[480px] lg:h-[600px] rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl accelerate"
          >
            <Image
              src={editorialImage.src}
              alt={editorialImage.alt}
              fill
              quality={70}
              className="object-cover"
              sizes="(min-width: 1024px) 556px, 70vw"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            viewport={{ once: true }}
            className="space-y-8 md:space-y-12"
          >
            <span className="text-[10px] md:text-[11px] font-space font-bold text-secondary uppercase tracking-[0.4em] md:tracking-[0.5em]">{t("ed.eyebrow")}</span>
            <h2 className="text-4xl md:text-6xl lg:text-8xl font-serif leading-[1.1] md:leading-[0.85] tracking-tighter text-primary">
              {t("ed.title")} <br className="hidden md:block" />
              <span className="font-light italic text-muted-foreground/60">{t("ed.titleAccent")}</span> <br className="hidden md:block" />
              {t("ed.titleTail")}
            </h2>
            <div className="space-y-6 md:space-y-8 text-lg md:text-xl text-muted-foreground font-light leading-relaxed italic border-l-4 border-secondary/20 pl-6 md:pl-10">
              <p>
                {t("ed.quote")}
              </p>
              <div className="grid grid-cols-3 gap-4 md:gap-8 pt-4 md:pt-8 not-italic items-start">
                {[
                  { value: t("ed.fact1.value"), label: t("ed.fact1.label") },
                  { value: t("ed.fact2.value"), label: t("ed.fact2.label") },
                  { value: t("ed.fact3.value"), label: t("ed.fact3.label") },
                ].map((fact) => (
                  <div key={fact.value} className="border-l border-safari-sand pl-4 md:pl-8 first:border-l-0 first:pl-0">
                    <p className="text-lg md:text-2xl font-serif font-bold text-primary leading-tight min-h-[2.6rem] md:min-h-[3rem]">{fact.value}</p>
                    <p className="text-[9px] md:text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-bold font-space mt-2">{fact.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <Link
              href="/about"
              className="inline-block text-[10px] md:text-[11px] font-space font-bold uppercase tracking-[0.3em] text-secondary hover:text-primary transition-colors not-italic"
            >
              {t("ed.cta")} →
            </Link>
          </motion.div>
        </div>
      </section>

      <InteractiveExplorer />
      <MigrationTracker />
      <FeaturedTours />
      <ContactSection />

    </main>
  );
}