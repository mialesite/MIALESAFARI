"use client";

import React, { use, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import Image from "next/image";
import { mediaFor } from "@/lib/media";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Compass, ArrowLeft, ArrowRight, ShieldCheck,
  Loader2, Globe, Clock, Mountain, Info
} from "lucide-react";
import { useDoc, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, where } from "firebase/firestore";
import { notFound } from "next/navigation";
import { CircuitMap } from "@/components/CircuitMap";
import { useLanguage } from "@/context/LanguageContext";
import { TOURS } from "@/lib/tours";

export default function DestinationDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const id = params.id;
  const db = useFirestore();
  const { t } = useLanguage();
  
  const destRef = doc(db, "destinations", id);
  const { data: destination, loading: destLoading } = useDoc(destRef);

  // Discovery of related itineraries
  // Option A: Manual Selection
  // Option B: Live itineraries matched to this destination by name keywords,
  // then the static signature line as fallback. No itinerary doc carries a
  // destinations array, so array-contains can never match.
  const isManual = Array.isArray(destination?.manualItineraries) && destination.manualItineraries.length > 0;
  const itinerariesQuery = useMemoFirebase(() => {
    if (!destination) return null;
    if (isManual) {
      return query(collection(db, "itineraries"), where("__name__", "in", destination.manualItineraries.slice(0, 10)));
    }
    return query(collection(db, "itineraries"), where("status", "==", "active"));
  }, [db, destination, id, isManual]);

  const { data: activeTours, loading: toursLoading } = useCollection(itinerariesQuery);

  const relatedTours = useMemo(() => {
    if (!destination) return [];
    const tokens = destination.name.toLowerCase().split(/\s+/)
      .filter((w: string) => w.length > 2 && !["mount", "national", "park", "island"].includes(w));
    const matches = (t: any) => {
      const hay = `${t.title || ""} ${t.focus || ""}`.toLowerCase();
      return tokens.some((w: string) => hay.includes(w));
    };
    const live = (activeTours || []).filter((t: any) => isManual || matches(t));
    if (live.length > 0) return live.slice(0, 4);
    return TOURS.filter(matches).slice(0, 4);
  }, [activeTours, destination, isManual]);

  if (destLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-safari-white gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-secondary" />
        <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-muted-foreground">Opening Destinations...</p>
      </div>
    );
  }

  if (!destination || destination.status !== 'active') return notFound();

  const stats = [
    { label: "Area", val: destination.statistics?.area, icon: Globe },
    { label: "Elevation", val: destination.statistics?.elevation, icon: Mountain },
    { label: "UNESCO", val: destination.statistics?.unesco, icon: ShieldCheck },
    { label: "Best Time", val: destination.statistics?.bestTime, icon: Clock },
  ].filter(s => s.val);

  return (
    <main className="min-h-screen bg-safari-white">
      <Navbar />
      
      {/* Hero Header */}
      <section className="relative w-full overflow-hidden">
        <Image
          src={mediaFor(destination.featuredImage).src}
          alt={destination.name}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(13,26,18,0.92)_0%,rgba(13,26,18,0.66)_45%,rgba(13,26,18,0.28)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1A12] via-[#0D1A12]/35 to-transparent" />

        <div className="relative z-10 w-full px-6 md:px-12 lg:px-24 pt-32 md:pt-44 pb-12 md:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-end"
          >
            <div className="lg:col-span-8 text-center lg:text-left">
              <Link href="/destinations">
                <Button variant="ghost" className="text-white hover:text-secondary p-0 mb-6 gap-2 uppercase tracking-[0.3em] font-space text-[10px]">
                  <ArrowLeft className="w-4 h-4" /> Back to Destinations
                </Button>
              </Link>

              <span className="text-secondary font-space font-bold uppercase tracking-[0.5em] text-xs mb-4 block">
                {destination.circuit}
              </span>
              <h1 className="text-5xl md:text-7xl xl:text-8xl font-serif text-white leading-[0.95] tracking-tighter mb-6">
                {destination.name}
              </h1>
              <p className="text-xl md:text-2xl text-white/75 font-serif italic max-w-2xl mx-auto lg:mx-0">
                {destination.shortDescription}
              </p>
            </div>

            <div className="lg:col-span-4">
              <div className="p-5 md:p-6 max-w-sm w-full mx-auto lg:mx-0 lg:ml-auto">
                <p className="text-accent font-space font-bold uppercase tracking-[0.4em] text-[10px] mb-3">
                  {t("ds.mapPark")}
                </p>
                <CircuitMap activeNames={[destination.name]} glass />
                <p className="mt-4 text-[9px] font-space uppercase tracking-[0.2em] text-white/70">
                  {t("ds.mapFootnote")}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-16 md:space-y-20">

            {/* Discovery Section */}
            <section className="space-y-8">
              <h2 className="text-4xl font-serif text-primary">The <span className="italic font-light">Discovery</span></h2>
              <div className="text-xl text-muted-foreground font-light leading-relaxed max-w-3xl whitespace-pre-wrap">
                {destination.description}
              </div>
            </section>

            {/* Quick Statistics Grid */}
            {stats.length > 0 && (
              <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                  <div key={i} className="p-6 bg-white rounded-3xl border border-muted/50 text-center flex flex-col items-center">
                    <stat.icon className="w-5 h-5 text-secondary mb-3" />
                    <p className="text-[8px] uppercase tracking-widest text-muted-foreground font-bold mb-1">{stat.label}</p>
                    <p className="text-sm font-bold text-primary">{stat.val}</p>
                  </div>
                ))}
              </section>
            )}

            {/* Facts Grid */}
            {destination.facts && destination.facts.length > 0 && (
              <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {destination.facts.map((fact: any, i: number) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="p-10 bg-white rounded-[3rem] border border-muted/50 shadow-sm hover:shadow-xl transition-all"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-secondary mb-8">
                      <Info className="w-6 h-6" />
                    </div>
                    <h4 className="font-space font-bold uppercase tracking-widest text-[11px] text-primary mb-4">{fact.title}</h4>
                    <p className="text-sm text-muted-foreground font-light leading-relaxed">{fact.description}</p>
                  </motion.div>
                ))}
              </section>
            )}

            {/* Related Tours Section */}
            <section className="space-y-10">
               <div className="flex items-center justify-between">
                 <h2 className="text-3xl font-serif text-primary">Signature <span className="italic font-light">Expeditions</span></h2>
                 <Link href="/itineraries">
                   <Button variant="link" className="text-secondary font-bold uppercase tracking-widest text-[10px]">View All <ArrowRight className="ml-2 w-3 h-3" /></Button>
                 </Link>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {toursLoading ? (
                    <div className="col-span-2 py-20 text-center"><Loader2 className="animate-spin mx-auto text-secondary" /></div>
                  ) : relatedTours.length === 0 ? (
                    <div className="col-span-2 p-12 text-center bg-muted/10 rounded-3xl border border-dashed text-muted-foreground">
                       <p className="text-sm font-light leading-relaxed mb-5">
                         No expeditions are published for {destination.name} yet. Tell the desk your dates and the route will be shaped around them.
                       </p>
                       <Link href="/contact">
                         <Button variant="link" className="text-secondary font-bold uppercase tracking-widest text-[10px] p-0 h-auto">Talk to the desk <ArrowRight className="ml-2 w-3 h-3" /></Button>
                       </Link>
                    </div>
                  ) : (
                    relatedTours.map((tour: any) => (
                      <Link key={tour.id || tour.slug} href={`/tours/${tour.slug || tour.id}`} className="group block relative aspect-[4/3] rounded-[2.5rem] overflow-hidden">
                        <Image src={mediaFor(tour.featuredImage).src} alt={tour.title} fill quality={70} className="object-cover transition-transform duration-700 group-hover:scale-110" sizes="(min-width: 1024px) 32vw, (min-width: 768px) 48vw, 70vw" />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent" />
                        <div className="absolute bottom-8 left-8 right-8 text-white">
                           <p className="text-[10px] uppercase tracking-widest text-secondary font-bold mb-2">{tour.duration}</p>
                           <h4 className="text-2xl font-serif font-bold group-hover:text-secondary transition-colors">{tour.title}</h4>
                        </div>
                      </Link>
                    ))
                  )}
               </div>
            </section>
          </div>

          {/* Sidebar / Circuit Hub */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-8">
              <div className="p-10 bg-primary rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-[40px] -mr-16 -mt-16" />
                <div className="flex items-center gap-3 text-secondary mb-10">
                  <Compass className="w-6 h-6" />
                  <span className="text-[11px] font-space font-bold uppercase tracking-[0.4em]">Safari Circuit</span>
                </div>
                
                <div className="space-y-10 mb-12">
                  {destination.circuit && (
                    <div>
                      <p className="text-[8px] uppercase tracking-[0.4em] text-white/40 mb-3 font-bold">Circuit</p>
                      <p className="text-2xl font-serif font-bold text-secondary leading-none">{destination.circuit}</p>
                    </div>
                  )}
                  {destination.distance && (
                    <div>
                      <p className="text-[8px] uppercase tracking-[0.4em] text-white/40 mb-3 font-bold">Getting There</p>
                      <p className="text-sm font-light text-white/80 leading-relaxed">{destination.distance}</p>
                    </div>
                  )}
                </div>

                <Link href="/contact">
                  <Button className="w-full h-16 rounded-full bg-secondary text-white hover:bg-accent transition-all font-space font-bold uppercase tracking-[0.2em] text-[10px] group">
                    Plan My Route
                    <ArrowRight className="ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              <div className="p-10 bg-white rounded-[3rem] border border-muted/50 text-center shadow-sm">
                <Info className="w-10 h-10 text-secondary mx-auto mb-6" />
                <h4 className="text-sm font-serif font-bold text-primary uppercase tracking-widest mb-4">Planning Note</h4>
                <p className="text-xs text-muted-foreground font-light leading-relaxed italic">
                  The desk builds {destination.name} the way it builds everything else: route first, costed against the
                  season you travel, and written down before anything is booked.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
