
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Compass, Clock, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where, limit, writeBatch, doc, serverTimestamp, getDocs } from "firebase/firestore";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { TOURS } from "@/lib/tours";

/**
 * @fileOverview Featured Expeditions Grid
 * Optimized for performance: uses responsive image sizing and hardware acceleration.
 */
export const FeaturedTours = () => {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);

  // Status check is required for public listing
  const toursQuery = useMemoFirebase(() => 
    query(collection(db, "itineraries"), where("status", "==", "active"), limit(6)), 
  [db]);
  const { data: firestoreTours, loading } = useCollection(toursQuery);

  // "Direct-to-App" Logic: Fallback to static master data for near-instant loads
  const featuredTours = firestoreTours && firestoreTours.length > 0 
    ? firestoreTours 
    : TOURS.slice(0, 6).map((t, i) => ({ ...t, id: t.slug || `local-${i}` }));

  const handleSync = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Admin Authorization",
        description: "Log in as an admin to restore signature expeditions.",
      });
      return;
    }

    setSyncing(true);
    const batch = writeBatch(db);
    let count = 0;

    try {
      for (const master of TOURS) {
        const existingQuery = query(collection(db, "itineraries"), where("slug", "==", master.slug));
        const existingSnap = await getDocs(existingQuery);
        
        if (existingSnap.empty) {
          const docRef = doc(collection(db, "itineraries"));
          batch.set(docRef, {
            ...master,
            status: "active",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          count++;
        }
      }

      if (count > 0) {
        await batch.commit();
        toast({ title: "Collection Synchronized", description: `Imported ${count} signature expeditions.` });
      } else {
        toast({ title: "Itineraries Up to Date" });
      }
    } catch (err: any) {
      toast({ 
        variant: "destructive", 
        title: "Sync Error", 
        description: err.message || "Authorization required." 
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <section className="py-32 px-6 md:px-12 bg-white" id="tours">
      <div className="max-w-[1800px] mx-auto">
        <div className="flex flex-col lg:flex-row items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <span className="text-secondary font-space font-bold uppercase tracking-[0.4em] text-[10px] mb-4 block">
              Curated Collections
            </span>
            <h2 className="text-5xl md:text-8xl font-serif tracking-tighter leading-[0.9]">
              Signature <br />
              <span className="italic font-light">Experiences</span>
            </h2>
          </div>
          <p className="text-muted-foreground text-lg md:text-xl font-light max-w-sm border-l-2 border-muted pl-8 py-2">
            Hand-picked expeditions that define the standard of Tanzanian hospitality. Available instantly via app persistence.
          </p>
        </div>

        {loading && !firestoreTours ? (
          <div className="py-32 flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="w-12 h-12 animate-spin text-honey-gold mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest">Accessing Registry...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredTours.map((tour: any, index) => (
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
                      src={tour.featuredImage || "https://picsum.photos/seed/safari/1200/800"}
                      alt={tour.title}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/20 to-transparent" />
                    
                    <div className="absolute top-6 left-6">
                      <span className="glass px-4 py-1.5 rounded-full text-white text-[9px] font-space font-bold uppercase tracking-widest">
                        {tour.category}
                      </span>
                    </div>

                    <div className="absolute bottom-8 left-8 right-8 text-white">
                      <div className="flex items-center gap-4 text-[10px] font-space font-bold uppercase tracking-widest mb-4">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 3 text-secondary" />
                          <span>{tour.duration}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Compass className="w-3 h-3 text-secondary" />
                          <span>{tour.focus || 'Wilderness'}</span>
                        </div>
                      </div>
                      <h3 className="text-3xl font-serif font-medium leading-tight text-white group-hover:text-secondary transition-colors duration-500">
                        {tour.title}
                      </h3>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center px-4">
                    <div className="space-y-1">
                      <p className="text-lg font-serif font-bold text-primary">{tour.priceString || `$${tour.priceFrom?.toLocaleString()}`}</p>
                    </div>
                    <Button variant="ghost" className="rounded-full w-12 h-12 p-0 border border-muted group-hover:bg-primary group-hover:text-white transition-all duration-500">
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-24 text-center">
          <Button 
            variant="outline" 
            asChild
            className="h-16 px-12 rounded-full border-primary text-primary hover:bg-primary hover:text-white transition-all font-space font-bold uppercase tracking-widest"
          >
            <Link href="/itineraries">Explore All Safaris</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
