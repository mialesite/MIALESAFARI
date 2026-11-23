"use client";

import { Navbar } from "@/components/Navbar";
import { TanzaniaParksMap } from "@/components/TanzaniaParksMap";
import { ParkCard } from "@/components/ParkCard";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Compass, Loader2, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, writeBatch, doc, serverTimestamp, getDocs, where } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { MASTER_DESTINATIONS } from "@/lib/master-destinations";
import { uniqueByName } from "@/lib/uniqueByName";
import { mediaFor } from "@/lib/media";

/**
 * @fileOverview Parks Index Page
 * Every active park and reserve, grouped by the circuit the desk plans them into.
 */

const CIRCUIT_ORDER = [
  "Northern Circuit",
  "Southern Circuit",
  "Western Frontiers",
  "The Peaks",
  "Zanzibar & Islands",
];

export default function ParksPage() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);

  // Status check is required to list documents under security rules
  const parksQuery = useMemoFirebase(() => 
    query(collection(db, "destinations"), where("status", "==", "active")), 
  [db]);
  const { data: results, loading, error } = useCollection(parksQuery);

  const parks = uniqueByName(results || []);

  const groups = CIRCUIT_ORDER.map((circuit) => ({
    circuit,
    items: parks.filter((park: any) => (park.circuit || "").trim() === circuit),
  })).filter((group) => group.items.length > 0);

  const ungrouped = parks.filter(
    (park: any) => !CIRCUIT_ORDER.includes((park.circuit || "").trim())
  );
  if (ungrouped.length > 0) groups.push({ circuit: "Beyond the circuits", items: ungrouped });

  const handleSync = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Admin Access Required",
        description: "Please log in to synchronize wildlife sanctuaries.",
      });
      return;
    }

    setSyncing(true);
    const batch = writeBatch(db);
    let count = 0;

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
          count++;
        }
      }

      if (count > 0) {
        await batch.commit();
        toast({ title: "Destinations Synchronized", description: `Imported ${count} wildlife sanctuaries.` });
      } else {
        toast({ title: "Registry Up to Date", description: "No new parks were found in the master list." });
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

      <h1 className="sr-only">Tanzania Parks</h1>

      <TanzaniaParksMap destinations={(parks as any[]).map((p) => ({ id: p.id, name: p.name }))} />

      <section className="pb-16 md:pb-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-[1400px] mx-auto">
          {loading ? (
            <div className="py-40 flex flex-col items-center justify-center gap-4 text-muted-foreground">
              <Loader2 className="w-10 h-10 animate-spin text-secondary" />
              <p className="text-xs uppercase font-bold tracking-[0.3em]">Opening Destinations...</p>
            </div>
          ) : error ? (
            <div className="py-24 text-center bg-red-50 rounded-[3rem] border border-red-100 flex flex-col items-center">
               <p className="text-red-500 font-bold mb-2">Sync Access Denied</p>
               <p className="text-xs text-red-400">Public queries must include the active status filter.</p>
            </div>
          ) : parks.length === 0 ? (
            <div className="py-24 text-center bg-white rounded-[3rem] border border-dashed shadow-inner flex flex-col items-center">
               <Compass className="w-12 h-12 text-secondary/20 mx-auto mb-6" />
               <p className="text-muted-foreground font-serif italic text-2xl mb-4">National park registries are being updated.</p>
               <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-8 max-w-xs">
                 Import signature landmarks from the master destination registry. (Admin Login Required)
               </p>
               <Button 
                onClick={handleSync} 
                disabled={syncing}
                className="bg-primary text-white rounded-full px-8 h-12 font-bold uppercase tracking-widest text-[10px]"
               >
                 {syncing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                 Synchronize Destinations
               </Button>
            </div>
          ) : (
            <div className="space-y-20 md:space-y-28">
              {groups.map((group) => (
                <div key={group.circuit}>
                  <div className="flex items-baseline justify-between gap-6 border-b border-muted pb-4 mb-10 md:mb-14">
                    <h2 className="text-[11px] md:text-xs font-space font-bold uppercase tracking-[0.35em] text-primary">
                      {group.circuit}
                    </h2>
                    <span className="text-[9px] md:text-[10px] font-space uppercase tracking-[0.25em] text-muted-foreground">
                      {group.items.length} {group.items.length === 1 ? "park" : "parks"}
                    </span>
                  </div>

                  {(() => {
                    const n = group.items.length;
                    // Three cards per row at desktop; the lone and pair groups
                    // stay on a narrow centred measure instead of stretching
                    // to half-container monsters.
                    const cols = n === 1
                      ? "grid-cols-1 max-w-md mx-auto"
                      : n === 2
                        ? "grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto"
                        : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
                    return (
                      <div className={`grid gap-6 md:gap-8 ${cols}`}>
                        {group.items.map((park: any, i) => (
                          <ParkCard key={park.id} park={park} index={i} />
                        ))}
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="relative py-24 bg-primary text-white text-center px-6 overflow-hidden">
        <Image
          src={mediaFor("giraffes-open-grassland").src}
          alt={mediaFor("giraffes-open-grassland").alt}
          fill
          quality={60}
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-primary/85" />
        <div className="relative max-w-4xl mx-auto">
          <span className="text-secondary font-space font-bold uppercase tracking-[0.4em] text-[10px] mb-8 block">Plan With The Desk</span>
          <h2 className="text-4xl md:text-6xl font-serif italic text-white mb-12 leading-tight">"Pick the park. The route is built around it."</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Button asChild className="h-16 px-12 rounded-full bg-secondary text-white hover:bg-accent transition-all font-space font-bold uppercase tracking-widest">
              <Link href="/itineraries">Explore all safaris</Link>
            </Button>
            <Button asChild variant="outline" className="h-16 px-12 rounded-full bg-transparent border-white/20 text-white hover:bg-white hover:text-primary transition-all font-space font-bold uppercase tracking-widest">
              <Link href="/contact">Send the dates</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
