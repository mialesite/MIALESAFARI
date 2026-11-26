
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { mediaFor } from "@/lib/media";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Compass } from "lucide-react";
import Link from "next/link";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where, limit } from "firebase/firestore";
import { SIGNATURE_SHOWCASE, TOUR_DATA } from "@/lib/tours";
import { useLanguage } from "@/context/LanguageContext";
import { CATEGORY_LABEL, EXPERIENCE_LABEL, labelFor } from "@/lib/i18n";

/**
 * @fileOverview Signature experiences
 * Six routes, named for what you do on them rather than where they are. An edited
 * Firestore row wins; the static registry keeps the section full on a cold read.
 */
export const FeaturedTours = () => {
  const db = useFirestore();
  const { lang, t } = useLanguage();

  const toursQuery = useMemoFirebase(() =>
    query(collection(db, "itineraries"), where("status", "==", "active"), limit(50)),
  [db]);
  const { data: firestoreTours } = useCollection(toursQuery);

  const showcase = SIGNATURE_SHOWCASE.map((slug) => {
    const row: any = firestoreTours?.find((tour: any) => tour.slug === slug) || TOUR_DATA[slug];
    return row ? { ...row, slug: row.slug || slug, id: row.slug || slug } : null;
  }).filter(Boolean);

  return (
    <section className="py-24 md:py-28 px-6 md:px-12 bg-white" id="tours">
      <div className="max-w-[1800px] mx-auto">
        <div className="flex flex-col lg:flex-row items-end justify-between mb-14 gap-8">
          <div className="max-w-2xl">
            <span className="text-secondary font-space font-bold uppercase tracking-[0.4em] text-[10px] mb-4 block">
              {t("ft.eyebrow")}
            </span>
            <h2 className="text-5xl md:text-8xl font-serif tracking-tighter leading-[0.9]">
              {t("ft.title")} <br />
              <span className="italic font-light">{t("ft.titleAccent")}</span>
            </h2>
          </div>
          <p className="text-muted-foreground text-lg md:text-xl font-light max-w-sm border-l-2 border-muted pl-8 py-2">
            {t("ft.side")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {showcase.map((tour: any, index: number) => {
            const experience = labelFor(EXPERIENCE_LABEL, lang, tour.slug) || tour.title;
            return (
              <motion.div
                key={tour.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-50px" }}
                className="group accelerate"
              >
                <Link href={`/tours/${tour.slug || tour.id}`} className="block">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] mb-8 shadow-sm">
                    <Image
                      src={mediaFor(tour.featuredImage).src}
                      alt={experience}
                      fill
                      quality={70}
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                      sizes="(min-width: 1024px) 32vw, (min-width: 768px) 48vw, 70vw"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(36,66,46,0.96),rgba(36,66,46,0.78)_30%,rgba(36,66,46,0.15)_62%,transparent_80%)]" />

                    <div className="absolute top-6 left-6">
                      <span className="glass px-4 py-1.5 rounded-full text-white text-[9px] font-space font-bold uppercase tracking-widest">
                        {labelFor(CATEGORY_LABEL, lang, tour.category)}
                      </span>
                    </div>

                    <div className="absolute bottom-8 left-8 right-8 text-white">
                      <div className="flex items-center gap-4 text-[10px] font-space font-bold uppercase tracking-widest mb-4">
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Clock className="w-3 h-3 text-secondary" />
                          <span>{tour.duration}</span>
                        </div>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Compass className="w-3 h-3 text-secondary shrink-0" />
                          <span className="truncate">{tour.title}</span>
                        </div>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-serif font-medium leading-tight text-white group-hover:text-secondary transition-colors duration-500">
                        {experience}
                      </h3>
                    </div>
                  </div>

                  <div className="flex justify-between items-center px-4">
                    <div className="space-y-1">
                      {/* Seed rows carry invented priceFrom figures, so only a written price is publishable here. */}
                      <p className="text-lg font-serif font-bold text-primary">{tour.priceString?.trim() || t("ft.priceLine")}</p>
                    </div>
                    <Button variant="ghost" className="rounded-full w-12 h-12 p-0 border border-muted group-hover:bg-primary group-hover:text-white transition-all duration-500">
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <Button 
            variant="outline" 
            asChild
            className="h-16 px-12 rounded-full border-primary text-primary hover:bg-primary hover:text-white transition-all font-space font-bold uppercase tracking-widest"
          >
            <Link href="/itineraries">{t("ft.cta")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
