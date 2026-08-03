
"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Gauge, Zap, Compass, Loader2, RefreshCw, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where, writeBatch, doc, serverTimestamp, getDocs, limit } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { MASTER_DESTINATIONS } from "@/lib/master-destinations";
import { getImageById } from "@/app/lib/placeholder-images";
import { useToast } from "@/hooks/use-toast";

type Circuit = "All" | "Northern Circuit" | "Southern Circuit" | "Western Frontiers" | "Zanzibar & Islands" | "The Peaks";

const CIRCUITS: Circuit[] = ["All", "Northern Circuit", "Southern Circuit", "Western Frontiers", "Zanzibar & Islands", "The Peaks"];

export const InteractiveExplorer = () => {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [activeCircuit, setActiveCircuit] = useState<Circuit>("All");
  const [syncing, setSyncing] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);

  // Performance Optimization: Use Firestore limit to reduce initial RAM load
  const destinationsQuery = useMemoFirebase(() => {
    let baseQuery = query(collection(db, "destinations"), where("status", "==", "active"));
    if (activeCircuit !== "All") {
      baseQuery = query(baseQuery, where("circuit", "==", activeCircuit));
    }
    return query(baseQuery, limit(50));
  }, [db, activeCircuit]);

  const { data: firestoreData, loading, error } = useCollection(destinationsQuery);

  // "Direct-to-App" Logic: Fallback to static master data for instant results
  const allDestinations = firestoreData && firestoreData.length > 0 
    ? firestoreData 
    : MASTER_DESTINATIONS.map((d, i) => ({ 
        ...d, 
        id: d.name.toLowerCase().replace(/\s+/g, '-'),
        featuredImage: getImageById(d.imageId).imageUrl 
      })).filter(d => activeCircuit === "All" || d.circuit === activeCircuit);

  const visibleDestinations = allDestinations.slice(0, visibleCount);

  const handleSync = async () => {
    if (!user) return;
    setSyncing(true);
    const batch = writeBatch(db);
    try {
      for (const master of MASTER_DESTINATIONS) {
        const existingQuery = query(collection(db, "destinations"), where("name", "==", master.name));
        const existingSnap = await getDocs(existingQuery);
        if (existingSnap.empty) {
          const docRef = doc(collection(db, "destinations"));
          const imgData = getImageById(master.imageId);
          batch.set(docRef, {
            ...master,
            featuredImage: imgData.imageUrl,
            gallery: [],
            status: "active",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
      }
      await batch.commit();
      toast({ title: "Destinations Synchronized" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Sync Error" });
    } finally {
      setSyncing(false);
    }
  };

  const loadMore = useCallback(() => setVisibleCount(prev => prev + 8), []);

  return (
    <section className="py-32 px-6 md:px-12 bg-safari-white" id="destinations">
      <div className="max-w-[1800px] mx-auto">
        <div className="flex flex-col lg:flex-row items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-secondary mb-4 block">Primary Circuits</span>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif text-primary uppercase leading-none">
              Explore <br />
              <span className="font-serif lowercase text-muted-foreground italic">the wild</span>
            </h2>
          </div>
          <p className="text-lg text-muted-foreground font-light max-w-sm border-r-2 border-secondary pr-8 py-2">
            Curated safari destinations managed instantly via persistent app cache. Near-zero latency discovery.
          </p>
        </div>

        <div className="mb-16 flex flex-wrap gap-3 justify-center lg:justify-start">
          {CIRCUITS.map((circuit) => (
            <button
              key={circuit}
              onClick={() => { setActiveCircuit(circuit); setVisibleCount(6); }}
              className={cn(
                "px-6 py-2 rounded-full text-[10px] font-space font-bold uppercase tracking-widest transition-all duration-300 border",
                activeCircuit === circuit 
                  ? "bg-primary text-white border-primary shadow-lg" 
                  : "bg-white text-muted-foreground border-muted hover:border-secondary hover:text-secondary"
              )}
            >
              {circuit}
            </button>
          ))}
        </div>

        {loading && !firestoreData ? (
          <div className="py-40 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <Loader2 className="w-10 h-10 animate-spin text-honey-gold" />
            <p className="text-xs uppercase font-bold tracking-[0.3em]">Synchronizing Landmarks...</p>
          </div>
        ) : visibleDestinations.length === 0 ? (
          <div className="py-24 text-center bg-muted/10 rounded-[3rem] border border-dashed border-muted/30 max-w-4xl mx-auto flex flex-col items-center">
            <Compass className="w-12 h-12 text-secondary/20 mx-auto mb-6" />
            <p className="text-muted-foreground font-serif italic text-2xl mb-4">No landmarks found.</p>
            {user && (
              <button 
                onClick={handleSync} 
                disabled={syncing}
                className="bg-primary text-white rounded-full px-8 h-12 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2"
              >
                {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Synchronize Registry
              </button>
            )}
          </div>
        ) : (
          <>
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              <AnimatePresence mode="popLayout">
                {visibleDestinations.map((dest: any, i) => (
                  <motion.div
                    key={dest.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5, delay: (i % 6) * 0.05 }}
                    className="group relative h-[400px] rounded-[2.5rem] overflow-hidden shadow-2xl cursor-pointer accelerate"
                  >
                    <Image
                      src={dest.featuredImage || "https://picsum.photos/seed/safari/800/1200"}
                      alt={dest.name}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/30 to-transparent" />
                    
                    <div className="absolute top-8 left-8">
                      <div className="glass px-4 py-2 rounded-full border-white/20 text-[10px] font-bold text-white uppercase tracking-widest">
                        {dest.circuit}
                      </div>
                    </div>

                    <div className="absolute bottom-10 left-10 right-10 text-white">
                      <div className="flex items-center gap-2 text-secondary mb-2">
                        <Compass className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{dest.type}</span>
                      </div>
                      <h3 className="text-2xl font-serif font-bold mb-4 text-white leading-tight">{dest.name}</h3>
                      
                      <Link href={`/destinations/${dest.id}`} className="w-full">
                        <Button variant="outline" className="w-full rounded-full border-white/20 bg-white/10 hover:bg-white hover:text-primary transition-all font-bold text-[10px] uppercase tracking-[0.2em] py-5 h-auto">
                          Discovery Details
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {allDestinations.length > visibleCount && (
              <div className="mt-16 text-center">
                <Button 
                  variant="outline" 
                  onClick={loadMore}
                  className="h-16 px-12 rounded-full border-primary text-primary hover:bg-primary hover:text-white transition-all font-space font-bold uppercase tracking-widest text-[10px] group shadow-xl"
                >
                  <Plus className="mr-2 w-4 h-4 group-hover:rotate-90 transition-transform" />
                  Load More Landmarks
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};
