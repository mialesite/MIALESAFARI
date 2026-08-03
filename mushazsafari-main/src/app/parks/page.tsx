"use client";

import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPin, Compass, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where, writeBatch, doc, serverTimestamp, getDocs } from "firebase/firestore";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { MASTER_DESTINATIONS } from "@/lib/master-destinations";
import { getImageById } from "@/app/lib/placeholder-images";

/**
 * @fileOverview Parks Index Page
 * Provides a high-end list view of all active destinations (Parks & Reserves).
 */
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

  const parks = results || [];

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
      
      <section className="pt-40 pb-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-20 text-center lg:text-left"
          >
            <span className="text-secondary font-space font-bold uppercase tracking-[0.5em] text-xs mb-4 block">Wildlife Sanctuaries</span>
            <h1 className="text-6xl md:text-8xl font-serif text-primary leading-tight tracking-tighter mb-8">
              Tanzania <br />
              <span className="italic text-muted-foreground/60">Parks</span>
            </h1>
            <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Explore our registry of protected ecosystems. From the great herds of the Serengeti to the hidden chimpanzee forests of Mahale, discover the benchmarks of African conservation.
            </p>
          </motion.div>

          {loading ? (
            <div className="py-40 flex flex-col items-center justify-center gap-4 text-muted-foreground">
              <Loader2 className="w-10 h-10 animate-spin text-honey-gold" />
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
            <div className="grid grid-cols-1 gap-12 lg:gap-24">
              {parks.map((park: any, i) => (
                <motion.div
                  key={park.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className="group relative overflow-hidden rounded-[3rem] bg-white border border-muted shadow-sm hover:shadow-2xl transition-all duration-700"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2">
                    <div className="relative h-64 lg:h-[500px] overflow-hidden">
                      <Image 
                        src={park.featuredImage || "https://picsum.photos/seed/park/800/600"} 
                        alt={park.name} 
                        fill 
                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-700" />
                    </div>
                    <div className="p-10 lg:p-20 flex flex-col justify-center">
                      <div className="flex items-center gap-3 text-secondary mb-6">
                        <MapPin className="w-4 h-4" />
                        <span className="text-[10px] font-space font-bold uppercase tracking-[0.3em]">{park.circuit}</span>
                      </div>
                      <h3 className="text-4xl lg:text-6xl font-serif font-bold text-primary mb-6 group-hover:text-secondary transition-colors leading-tight">
                        {park.name}
                      </h3>
                      <div className="h-px w-20 bg-muted mb-8 group-hover:w-full transition-all duration-700" />
                      <p className="text-lg text-muted-foreground font-light leading-relaxed mb-10 italic">
                        "{park.shortDescription}"
                      </p>
                      <Link href={`/destinations/${park.id}`}>
                        <Button variant="outline" className="rounded-full border-primary text-primary hover:bg-primary hover:text-white px-10 h-14 font-space font-bold uppercase tracking-widest text-[10px] gap-2 transition-all">
                          View Sanctuary Profile <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Exploration Footer */}
      <section className="py-24 bg-primary text-white text-center px-6">
        <div className="max-w-4xl mx-auto">
          <span className="text-secondary font-space font-bold uppercase tracking-[0.4em] text-[10px] mb-8 block">Bespoke Expeditions</span>
          <h2 className="text-4xl md:text-6xl font-serif italic mb-12">"Every park tells a different story of the wild."</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Button asChild className="h-16 px-12 rounded-full bg-secondary text-white hover:bg-accent transition-all font-space font-bold uppercase tracking-widest">
              <Link href="/itineraries">Explore All Safaris</Link>
            </Button>
            <Button asChild variant="outline" className="h-16 px-12 rounded-full border-white/20 text-white hover:bg-white hover:text-primary transition-all font-space font-bold uppercase tracking-widest">
              <Link href="/contact">Request Bespoke Planning</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
