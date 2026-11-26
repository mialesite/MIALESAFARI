"use client";

import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { FeaturedTours } from "@/components/FeaturedTours";
import { MigrationTracker } from "@/components/MigrationTracker";
import { TrustBadges } from "@/components/TrustBadges";
import { ContactSection } from "@/components/ContactSection";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
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

      {/* The Philosophy: full-bleed forest band speaking the same language as
          the migration tracker below it. */}
      <section className="py-20 md:py-28 lg:py-32 px-6 md:px-12 lg:px-24 bg-primary text-white overflow-hidden" id="about">
        <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] gap-12 lg:gap-16 xl:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            className="relative h-[360px] sm:h-[460px] lg:h-[620px]"
          >
            <div className="relative h-full w-full rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl ring-1 ring-white/10">
              <Image
                src={editorialImage.src}
                alt={editorialImage.alt}
                fill
                quality={70}
                className="object-cover"
                sizes="(min-width: 1024px) 560px, 92vw"
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(13,26,18,0.4),transparent_45%)]" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.15 }}
            viewport={{ once: true }}
            className="space-y-8 md:space-y-10"
          >
            <div className="space-y-5">
              <span className="text-[10px] md:text-[11px] font-space font-bold text-secondary uppercase tracking-[0.45em] block">{t("ed.eyebrow")}</span>
              <h2 className="text-5xl md:text-7xl font-serif leading-[0.98] tracking-tighter text-white">
                {t("ed.title")}{" "}
                <span className="font-light italic text-white/55">{t("ed.titleAccent")}</span>
              </h2>
            </div>

            <div className="rounded-[2rem] bg-white/[0.04] ring-1 ring-white/10 backdrop-blur-sm p-6 md:p-8">
              <p className="text-[15px] md:text-lg text-white/75 font-light leading-relaxed">
                {t("ed.statement")}
              </p>
              <div className="grid grid-cols-3 gap-4 md:gap-8 mt-6 md:mt-8">
                {[
                  { value: t("ed.fact1.value"), label: t("ed.fact1.label") },
                  { value: t("ed.fact2.value"), label: t("ed.fact2.label") },
                  { value: t("ed.fact3.value"), label: t("ed.fact3.label") },
                ].map((fact) => (
                  <div key={fact.value} className="border-t border-secondary/40 pt-3 md:pt-4">
                    <p className="text-lg md:text-2xl font-serif font-bold text-white leading-tight">{fact.value}</p>
                    <p className="text-[9px] md:text-[10px] uppercase tracking-[0.16em] text-white/45 font-bold font-space mt-2">{fact.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/about"
              className="group inline-flex items-center gap-2.5 text-[10px] md:text-[11px] font-space font-bold uppercase tracking-[0.3em] text-secondary hover:text-white transition-colors"
            >
              {t("ed.cta")}
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1.5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <MigrationTracker />
      <FeaturedTours />
      <ContactSection />

    </main>
  );
}