"use client";

import React, { use } from "react";
import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  MapPin, Compass, Zap, ArrowLeft, ArrowRight, ShieldCheck, 
  Trees, Camera, Loader2, Globe, Clock, Mountain, Info
} from "lucide-react";
import { useDoc, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, where } from "firebase/firestore";
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";

export default function DestinationDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const id = params.id;
  const db = useFirestore();
  
  const destRef = doc(db, "destinations", id);
  const { data: destination, loading: destLoading } = useDoc(destRef);

  // Discovery of related itineraries
  // Option A: Manual Selection
  // Option B: Fallback (Any tour that has this destination ID in its array)
  const itinerariesQuery = useMemoFirebase(() => {
    if (!destination) return null;
    if (destination.manualItineraries && destination.manualItineraries.length > 0) {
      return query(collection(db, "itineraries"), where("__name__", "in", destination.manualItineraries.slice(0, 10)));
    }
    return query(collection(db, "itineraries"), where("destinations", "array-contains", id));
  }, [db, destination, id]);

  const { data: relatedTours, loading: toursLoading } = useCollection(itinerariesQuery);

  if (destLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-safari-white gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-honey-gold" />
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
      <section className="relative h-[80vh] w-full overflow-hidden">
        <Image 
          src={destination.featuredImage || "https://picsum.photos/seed/safari/1920/1080"} 
          alt={destination.name} 
          fill 
          className="object-cover brightness-75"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-safari-white via-transparent to-black/30" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-[1400px] mx-auto"
          >
            <Link href="/destinations">
              <Button variant="ghost" className="text-white hover:text-secondary p-0 mb-8 gap-2 uppercase tracking-[0.3em] font-space text-[10px]">
                <ArrowLeft className="w-4 h-4" /> Back to Destinations
              </Button>
            </Link>
            
            <span className="text-secondary font-space font-bold uppercase tracking-[0.5em] text-xs mb-4 block">
              {destination.circuit}
            </span>
            <h1 className="text-6xl md:text-9xl font-serif text-primary leading-none tracking-tighter mb-6 uppercase">
              {destination.name}
            </h1>
            <p className="text-primary/60 font-serif italic text-2xl md:text-3xl max-w-2xl">
              "{destination.shortDescription}"
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-24">
            
            {/* Discovery Section */}
            <section className="space-y-10">
              <h2 className="text-4xl font-serif text-primary uppercase">The <span className="italic font-light">Discovery</span></h2>
              <div className="text-xl text-muted-foreground font-light leading-relaxed whitespace-pre-wrap">
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
                    <p className="text-sm font-bold text-primary truncate w-full">{stat.val}</p>
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
            <section className="space-y-12">
               <div className="flex items-center justify-between">
                 <h2 className="text-3xl font-serif text-primary uppercase">Signature <span className="italic font-light">Expeditions</span></h2>
                 <Link href="/itineraries">
                   <Button variant="link" className="text-secondary font-bold uppercase tracking-widest text-[10px]">View All <ArrowRight className="ml-2 w-3 h-3" /></Button>
                 </Link>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {toursLoading ? (
                    <div className="col-span-2 py-20 text-center"><Loader2 className="animate-spin mx-auto text-honey-gold" /></div>
                  ) : !relatedTours || relatedTours.length === 0 ? (
                    <div className="col-span-2 p-12 text-center bg-muted/10 rounded-3xl border border-dashed italic text-muted-foreground">
                       Our curators are currently designing signature tours for this destination.
                    </div>
                  ) : (
                    relatedTours.map((tour: any) => (
                      <Link key={tour.id} href={`/tours/${tour.slug || tour.id}`} className="group block relative aspect-[4/3] rounded-[2.5rem] overflow-hidden">
                        <Image src={tour.featuredImage || "https://picsum.photos/seed/tour/800/600"} alt="" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent" />
                        <div className="absolute bottom-8 left-8 right-8 text-white">
                           <p className="text-[10px] uppercase tracking-widest text-secondary font-bold mb-2">{tour.duration}</p>
                           <h4 className="text-2xl font-serif font-bold group-hover:text-secondary transition-colors uppercase">{tour.title}</h4>
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
                  <div>
                    <p className="text-[8px] uppercase tracking-[0.4em] text-white/40 mb-3 font-bold">Regional Authority</p>
                    <p className="text-2xl font-serif font-bold text-secondary uppercase leading-none">{destination.circuit}</p>
                  </div>
                  <div>
                    <p className="text-[8px] uppercase tracking-[0.4em] text-white/40 mb-3 font-bold">Logistics Access</p>
                    <p className="text-sm font-light text-white/80 leading-relaxed italic">"Accessible via {destination.distance?.toLowerCase() || 'professional logistics'}"</p>
                  </div>
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
                <h4 className="text-sm font-serif font-bold text-primary uppercase tracking-widest mb-4">Elite Consultation</h4>
                <p className="text-xs text-muted-foreground font-light leading-relaxed italic">
                  Our travel designers specialize in integrating the {destination.name} into bespoke frontiers tailored for private expeditions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
