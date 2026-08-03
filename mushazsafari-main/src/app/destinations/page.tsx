
"use client";

import { Navbar } from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Compass, MapPin, Gauge, Zap, Loader2, ArrowRight, RefreshCw } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where, writeBatch, doc, serverTimestamp, getDocs } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { MASTER_DESTINATIONS } from "@/lib/master-destinations";
import { getImageById } from "@/app/lib/placeholder-images";

type Circuit = "All" | "Northern Circuit" | "Southern Circuit" | "Western Frontiers" | "Zanzibar & Islands" | "The Peaks";

const CIRCUITS: Circuit[] = [
  "All",
  "Northern Circuit",
  "Southern Circuit",
  "Western Frontiers",
  "Zanzibar & Islands",
  "The Peaks"
];

export default function DestinationsIndexPage() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [activeCircuit, setActiveCircuit] = useState<Circuit>("All");
  const [syncing, setSyncing] = useState(false);

  // Status check is REQUIRED by security rules to list successfully
  const destinationsQuery = useMemoFirebase(() => 
    query(collection(db, "destinations"), where("status", "==", "active")), 
  [db]);
  const { data: firestoreData, loading, error } = useCollection(destinationsQuery);

  // "Direct-to-App" Logic: Use static data as fallback for instant results
  const destinations = firestoreData && firestoreData.length > 0 
    ? firestoreData 
    : MASTER_DESTINATIONS.map((d, i) => ({ 
        ...d, 
        id: d.name.toLowerCase().replace(/\s+/g, '-'),
        featuredImage: getImageById(d.imageId).imageUrl 
      }));

  const filteredDestinations = destinations?.filter(d => 
    activeCircuit === "All" || d.circuit === activeCircuit
  ) || [];

  const handleSync = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Admin Access Required",
        description: "Please log in to the Admin Console to synchronize Destinations.",
      });
      return;
    }

    setSyncing(true);
    const batch = writeBatch(db);
    let count = 0;

    try {
      for (const master of MASTER_DESTINATIONS) {
        // Name check to avoid duplicates
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
          count++;
        }
      }

      if (count > 0) {
        await batch.commit();
        toast({ title: "Destinations Synchronized", description: `Imported ${count} destinations.` });
      } else {
        toast({ title: "Registry Up to Date", description: "Master landmarks are already in your registry." });
      }
    } catch (err: any) {
      toast({ 
        variant: "destructive", 
        title: "Sync Error", 
        description: err.message || "Authorization required for registry updates." 
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <main className="min-h-screen bg-safari-white">
      <Navbar />
      
      <section className="pt-40 pb-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-[1800px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-20 text-center lg:text-left"
          >
            <span className="text-secondary font-space font-bold uppercase tracking-[0.5em] text-xs mb-4 block">Signature Landmarks</span>
            <h1 className="text-6xl md:text-8xl font-serif text-primary leading-tight tracking-tighter mb-8">
              Our <br />
              <span className="italic">Destinations</span>
            </h1>
            <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Navigate through Tanzania's legendary landscapes. From the endless plains of the Serengeti to the spice-scented alleys of Zanzibar, discover the heart of the wild.
            </p>
          </motion.div>

          <div className="mb-16 flex flex-wrap gap-3 justify-center lg:justify-start">
            {CIRCUITS.map((circuit) => (
              <button
                key={circuit}
                onClick={() => setActiveCircuit(circuit)}
                className={cn(
                  "px-8 py-3 rounded-full text-[10px] font-space font-bold uppercase tracking-widest transition-all duration-300 border",
                  activeCircuit === circuit 
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
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
              <p className="text-xs uppercase font-bold tracking-[0.3em]">Synchronizing Destinations...</p>
            </div>
          ) : filteredDestinations.length === 0 ? (
            <div className="py-32 text-center bg-white rounded-[3rem] border border-dashed shadow-inner flex flex-col items-center">
               <Compass className="w-12 h-12 text-secondary/20 mx-auto mb-6" />
               <p className="text-muted-foreground font-serif italic text-2xl mb-4">No destinations found in this circuit.</p>
               <Button onClick={() => setActiveCircuit("All")} variant="outline" className="rounded-full px-8 h-12 font-bold uppercase tracking-widest text-[10px]">
                 View All Circuits
               </Button>
            </div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              <AnimatePresence mode="popLayout">
                {filteredDestinations.map((dest: any, i) => (
                  <motion.div
                    key={dest.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
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
                      <h3 className="text-3xl font-serif font-bold mb-4 text-white group-hover:text-secondary transition-colors leading-tight">{dest.name}</h3>
                      
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
          )}
        </div>
      </section>

      {/* Explore Itineraries CTA */}
      <section className="py-24 bg-primary text-white text-center px-6">
        <div className="max-w-4xl mx-auto">
          <span className="text-secondary font-space font-bold uppercase tracking-[0.4em] text-[10px] mb-8 block">Plan Your Route</span>
          <h2 className="text-4xl md:text-6xl font-serif italic mb-12">"The destination is just the beginning of the conversation."</h2>
          <Button asChild className="h-16 px-12 rounded-full bg-secondary text-white hover:bg-accent transition-all font-space font-bold uppercase tracking-widest">
            <Link href="/itineraries">View All Itineraries</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
