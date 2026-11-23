
"use client";

import React, { use } from "react";
import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import Image from "next/image";
import { mediaFor } from "@/lib/media";
import { priceLabel, hasPrice } from "@/lib/tours";
import { Button } from "@/components/ui/button";
import { 
  Clock, Compass, CheckCircle2, 
  ArrowRight, ShieldCheck, MapPin, DollarSign,
  Loader2
} from "lucide-react";
import { BookingDialog } from "@/components/BookingDialog";
import { CircuitMap } from "@/components/CircuitMap";
import { notFound } from "next/navigation";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, where, limit } from "firebase/firestore";
import { TOUR_SHAPE_KEYS } from "@/lib/destination-shapes";
import { useLanguage } from "@/context/LanguageContext";

export default function TourDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = use(props.params);
  const slug = params.slug;
  const db = useFirestore();
  const { t } = useLanguage();
  const mapKeys = TOUR_SHAPE_KEYS[slug];

  // Itinerary retrieval by slug or ID
  const itineraryQuery = query(
    collection(db, "itineraries"),
    where("slug", "==", slug),
    limit(1)
  );

  const { data: results, loading } = useCollection(itineraryQuery);
  const tour = results?.[0];

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-safari-white gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-secondary" />
        <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-muted-foreground">Mapping the Journey...</p>
      </div>
    );
  }

  if (!tour || tour.status !== 'active') return notFound();

  return (
    <main className="min-h-screen bg-safari-white">
      <Navbar />
      
      {/* Hero Header */}
      <section className="relative h-[70vh] w-full overflow-hidden">
        <Image 
          src={mediaFor(tour.featuredImage).src} 
          alt={tour.title} 
          fill 
          className="object-cover brightness-75"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-safari-white via-transparent to-black/20" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-[1400px] mx-auto"
          >
            <span className="text-secondary font-space font-bold uppercase tracking-[0.4em] text-xs mb-4 block">
              Signature Expedition
            </span>
            <h1 className="text-5xl md:text-8xl font-serif text-primary leading-none tracking-tighter mb-6">
              {tour.title}
            </h1>
            <div className="flex flex-wrap items-center gap-8 text-primary/60 font-space font-bold uppercase tracking-widest text-[10px]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-secondary" />
                <span>{tour.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-secondary" />
                <span>{tour.focus || 'Tanzania'}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-secondary" />
                <span>{priceLabel(tour)}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24 py-24 grid grid-cols-1 lg:grid-cols-12 gap-20">
        
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-24">
          
          {/* Overview */}
          {tour.overview && (
            <section>
              <h2 className="text-3xl font-serif text-primary mb-6">Expedition <span className="italic">Overview</span></h2>
              <div className="text-lg text-muted-foreground font-light leading-relaxed p-8 bg-white rounded-3xl border border-muted/30 whitespace-pre-wrap">
                {tour.overview}
              </div>
            </section>
          )}

          {/* Highlights */}
          {tour.highlights && tour.highlights.length > 0 && (
            <section>
              <h2 className="text-3xl font-serif text-primary mb-10">Expedition <span className="italic">Highlights</span></h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tour.highlights.map((h: string, i: number) => (
                  <div key={i} className="flex gap-4 p-6 bg-white rounded-3xl border border-muted/30">
                    <CheckCircle2 className="w-6 h-6 text-secondary shrink-0" />
                    <p className="text-sm font-light text-muted-foreground leading-relaxed">{h}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Itinerary Plan */}
          {tour.plan && tour.plan.length > 0 && (
            <section>
              <h2 className="text-3xl font-serif text-primary mb-12">The <span className="italic">Journey</span></h2>
              <div className="space-y-12">
                {tour.plan.map((item: any, i: number) => (
                  <div key={i} className="relative pl-16">
                    <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-space font-bold text-xs">
                      {item.day || i + 1}
                    </div>
                    {i < tour.plan.length - 1 && (
                      <div className="absolute left-5 top-10 bottom-[-48px] w-px bg-muted" />
                    )}
                    <h3 className="text-xl font-serif text-primary font-bold mb-3">{item.title}</h3>
                    <p className="text-muted-foreground font-light leading-relaxed">{item.desc || item.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Fine Print */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-muted">
            <div>
              <h4 className="text-[10px] font-space font-bold uppercase tracking-[0.3em] text-secondary mb-6">What's Included</h4>
              <ul className="space-y-3">
                {(tour.inclusions || ['Professional Guide', 'Park Fees', 'Refined Stays']).map((item: string, i: number) => (
                  <li key={i} className="text-xs font-light text-muted-foreground flex items-center gap-3">
                    <div className="w-1 h-1 rounded-full bg-secondary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-space font-bold uppercase tracking-[0.3em] text-muted-foreground mb-6">Exclusions</h4>
              <ul className="space-y-3">
                {(tour.exclusions || ['International Flights', 'Travel Insurance', 'Premium Alcohol']).map((item: string, i: number) => (
                  <li key={i} className="text-xs font-light text-muted-foreground/60 flex items-center gap-3 italic">
                    <div className="w-1 h-1 rounded-full bg-muted" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        {/* Sidebar / CTA */}
        <div className="lg:col-span-4">
          <div className="sticky top-32 space-y-8">
            <div className="p-8 md:p-10 bg-primary rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-[40px] -mr-16 -mt-16" />
              
              <span className="text-[10px] font-space font-bold uppercase tracking-[0.3em] text-secondary/60 mb-2 block">Investment</span>
              <p className="text-4xl font-serif font-bold text-secondary mb-6">
                {priceLabel(tour)}
                {hasPrice(tour) && (
                  <span className="text-xs font-space font-bold text-white/40 uppercase tracking-widest ml-2">pp</span>
                )}
              </p>
              
              <p className="text-sm font-light text-white/60 mb-10 leading-relaxed">
                Rates are reflective of twin share elite occupancy during high season. Bespoke pricing available for private parties.
              </p>

              <BookingDialog>
                <Button className="w-full h-16 rounded-full bg-secondary text-white hover:bg-accent transition-all font-space font-bold uppercase tracking-widest group">
                  Enquire Now
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </BookingDialog>
            </div>

            <div className="p-8 bg-white rounded-[2.5rem] border border-muted/50">
              <div className="flex items-center gap-4 mb-6">
                <ShieldCheck className="w-8 h-8 text-secondary" />
                <div>
                  <h4 className="text-sm font-serif font-bold text-primary">Secure Planning</h4>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold font-space tracking-tighter">Planned and supported</p>
                </div>
              </div>
              <p className="text-xs font-light text-muted-foreground leading-relaxed">
                Every Miale expedition is planned against our own safety checklist and supported from the Arusha desk while you are in the country.
              </p>
            </div>

            {mapKeys && (
              <div className="p-6 md:p-8 bg-white rounded-[2.5rem] border border-muted/50">
                <p className="text-[9px] font-space font-bold uppercase tracking-[0.3em] text-secondary mb-4">{t("td.map")}</p>
                <CircuitMap activeKeys={mapKeys} />
                <p className="mt-3 text-[10px] text-muted-foreground font-light">{t("ds.mapFootnote")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
