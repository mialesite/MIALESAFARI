
"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Loader2, RefreshCw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParkCard } from "@/components/ParkCard";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where, writeBatch, doc, serverTimestamp, getDocs, limit } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { MASTER_DESTINATIONS } from "@/lib/master-destinations";
import { uniqueByName } from "@/lib/uniqueByName";
import { mediaFor } from "@/lib/media";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { CIRCUIT_LABEL, labelFor } from "@/lib/i18n";

type Circuit = "All" | "Northern Circuit" | "Southern Circuit" | "Western Frontiers" | "Zanzibar & Islands" | "The Peaks";

const CIRCUITS: Circuit[] = ["All", "Northern Circuit", "Southern Circuit", "Western Frontiers", "Zanzibar & Islands", "The Peaks"];

export const InteractiveExplorer = () => {
  const db = useFirestore();
  const { user } = useUser();
  const { lang, t } = useLanguage();
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
  const allDestinations = uniqueByName(
    firestoreData && firestoreData.length > 0
      ? firestoreData
      : MASTER_DESTINATIONS.map((d, i) => ({
          ...d,
          id: d.name.toLowerCase().replace(/\s+/g, '-'),
          featuredImage: mediaFor(d.imageId).src
        }))
  ).filter(d => activeCircuit === "All" || d.circuit === activeCircuit);

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
          const imgData = mediaFor(master.imageId);
          batch.set(docRef, {
            ...master,
            featuredImage: imgData.src,
            gallery: [],
            status: "active",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
      }
      await batch.commit();
      toast({ title: t("ex.syncToast") });
    } catch (err: any) {
      toast({ variant: "destructive", title: t("ex.syncError") });
    } finally {
      setSyncing(false);
    }
  };

  const loadMore = useCallback(() => setVisibleCount(prev => prev + 8), []);

  return (
    <section className="py-24 md:py-28 px-6 md:px-12 bg-safari-white" id="destinations">
      <div className="max-w-[1800px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-8">
          <div className="max-w-2xl">
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-secondary mb-4 block">{t("ex.eyebrow")}</span>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif text-primary leading-none">
              {t("ex.title")} <br />
              <span className="font-serif text-muted-foreground italic">{t("ex.titleAccent")}</span>
            </h2>
          </div>
          <p className="text-lg text-muted-foreground font-light max-w-sm border-l-2 border-secondary/40 pl-8 py-2">
            {t("ex.side")}
          </p>
        </div>

        <div className="mb-12 flex flex-wrap gap-3 justify-start">
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
              {circuit && labelFor(CIRCUIT_LABEL, lang, circuit)}
            </button>
          ))}
        </div>

        {loading && !firestoreData ? (
          <div className="py-40 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <Loader2 className="w-10 h-10 animate-spin text-secondary" />
            <p className="text-xs uppercase font-bold tracking-[0.3em]">{t("ex.loading")}</p>
          </div>
        ) : visibleDestinations.length === 0 ? (
          <div className="py-24 text-center bg-muted/10 rounded-[3rem] border border-dashed border-muted/30 max-w-4xl mx-auto flex flex-col items-center">
            <Compass className="w-12 h-12 text-secondary/20 mx-auto mb-6" />
            <p className="text-muted-foreground font-serif italic text-2xl mb-4">{t("ex.empty")}</p>
            {user && (
              <button 
                onClick={handleSync} 
                disabled={syncing}
                className="bg-primary text-white rounded-full px-8 h-12 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2"
              >
                {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {t("ex.sync")}
              </button>
            )}
          </div>
        ) : (
          <>
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              <AnimatePresence mode="popLayout">
                {visibleDestinations.map((dest: any, i) => (
                  <motion.div
                    key={dest.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5, delay: (i % 6) * 0.05 }}
                  >
                    <ParkCard
                      park={dest}
                      index={i}
                      badge={labelFor(CIRCUIT_LABEL, lang, dest.circuit)}
                    />
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
                  {t("ex.loadMore")}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};
