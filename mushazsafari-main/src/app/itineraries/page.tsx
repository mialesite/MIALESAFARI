
"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Compass, Clock, MapPin, Loader2, Heart, ArrowRight, RefreshCw } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where, writeBatch, doc, serverTimestamp, getDocs } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/context/wishlist-context";
import { useToast } from "@/hooks/use-toast";
import { TOURS } from "@/lib/tours";

export default function SafariCollectionPage() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const { addToWishlist, isInWishlist } = useWishlist();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [syncing, setSyncing] = useState(false);

  // Status check is REQUIRED by security rules to list successfully
  const itinerariesQuery = useMemoFirebase(() => 
    query(collection(db, "itineraries"), where("status", "==", "active")), 
  [db]);
  const { data: firestoreData, loading, error } = useCollection(itinerariesQuery);

  // "Direct-to-App" Logic: Use static data as fallback for instant results
  const itineraries = firestoreData && firestoreData.length > 0 
    ? firestoreData 
    : TOURS.map((t, i) => ({ ...t, id: t.slug || `local-${i}` }));

  const filtered = itineraries?.filter(i => {
    const matchesCategory = activeCategory === "All" || i.category === activeCategory;
    const matchesSearch = i.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSync = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Admin Access Required",
        description: "Please log in to the Admin Console to restore signatures.",
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
        toast({ title: "Registry Up to Date", description: "All signature experiences are already in your registry." });
      }
    } catch (err: any) {
      toast({ 
        variant: "destructive", 
        title: "Sync Error", 
        description: err.message || "Authorization required for master updates." 
      });
    } finally {
      setSyncing(false);
    }
  };

  const categories = ["All", "Migration", "Luxury", "Bespoke", "Family", "Zanzibar"];

  return (
    <main className="min-h-screen bg-safari-white">
      <Navbar />
      
      <section className="pt-40 pb-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex flex-col lg:flex-row items-end justify-between mb-20 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <span className="text-secondary font-space font-bold uppercase tracking-[0.5em] text-[10px] mb-4 block">Signature Expeditions</span>
              <h1 className="text-6xl md:text-8xl font-serif text-primary leading-tight tracking-tighter mb-8 uppercase">
                Explore <br />
                <span className="italic font-light lowercase">Journeys</span>
              </h1>
              <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-2xl">
                Discover our curated expeditions. Every itinerary is engineered for exclusive wilderness access and refined logistics across Tanzania's legendary landscapes.
              </p>
            </motion.div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 mb-16 items-center justify-between border-y border-muted py-8">
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-8 py-2.5 rounded-full text-[10px] font-space font-bold uppercase tracking-widest transition-all border",
                    activeCategory === cat 
                      ? "bg-primary text-white border-primary shadow-lg" 
                      : "bg-white text-muted-foreground border-muted hover:border-secondary hover:text-secondary"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text"
                placeholder="Search expeditions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 h-12 rounded-full border border-muted bg-white focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all text-sm font-light"
              />
            </div>
          </div>

          {loading && !firestoreData ? (
            <div className="py-40 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-honey-gold" />
              <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-muted-foreground">Accessing Registry...</p>
            </div>
          ) : !filtered || filtered.length === 0 ? (
            <div className="py-32 text-center bg-white rounded-[3rem] border border-dashed border-muted/50 flex flex-col items-center">
               <Compass className="w-12 h-12 text-secondary/20 mx-auto mb-6" />
               <p className="text-muted-foreground font-serif italic text-2xl mb-4">No expeditions found matching filters.</p>
               <Button 
                variant="outline"
                onClick={() => { setActiveCategory("All"); setSearchQuery(""); }}
                className="rounded-full px-8 h-12 font-bold uppercase tracking-widest text-[10px]"
               >
                 Clear Filters
               </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {filtered?.map((tour, index) => (
                <motion.div
                  key={tour.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  <Link href={`/tours/${tour.slug || tour.id}`} className="block relative aspect-[4/5] rounded-[2.5rem] overflow-hidden mb-8 shadow-2xl">
                    <Image 
                      src={tour.featuredImage || "https://picsum.photos/seed/miale/1200/1500"} 
                      alt={tour.title} 
                      fill 
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/20 to-transparent" />
                    
                    <div className="absolute top-6 left-6">
                      <span className="glass px-4 py-1.5 rounded-full text-white text-[9px] font-space font-bold uppercase tracking-[0.2em]">
                        {tour.category}
                      </span>
                    </div>

                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        addToWishlist({ id: tour.id, name: tour.title, image: tour.featuredImage, price: `$${tour.priceFrom}` });
                      }}
                      className={cn(
                        "absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center transition-all backdrop-blur-md border border-white/20",
                        isInWishlist(tour.id) ? "bg-secondary text-white" : "bg-white/10 text-white hover:bg-white hover:text-primary"
                      )}
                    >
                      <Heart className={cn("w-4 h-4", isInWishlist(tour.id) && "fill-current")} />
                    </button>

                    <div className="absolute bottom-10 left-10 right-10 text-white">
                      <div className="flex items-center gap-6 text-[9px] font-space font-bold uppercase tracking-widest text-secondary/80 mb-4">
                        <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {tour.duration}</div>
                        <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {tour.destinations?.length || 1} Stops</div>
                      </div>
                      <h3 className="text-3xl font-serif font-medium leading-tight group-hover:text-secondary transition-colors duration-500 mb-6 uppercase">
                        {tour.title}
                      </h3>
                      <div className="flex items-center justify-between pt-6 border-t border-white/10">
                        <div>
                          <p className="text-[8px] uppercase tracking-widest text-white/40 mb-1">Pricing From</p>
                          <p className="text-2xl font-serif font-bold text-white">${tour.priceFrom?.toLocaleString()}</p>
                        </div>
                        <Button variant="outline" className="rounded-full border-white/20 bg-white/10 hover:bg-white hover:text-primary transition-all font-bold text-[9px] uppercase tracking-widest h-11 px-6">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-32 bg-primary text-white text-center px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-[100px]" />
        <div className="max-w-4xl mx-auto relative z-10">
          <span className="text-secondary font-space font-bold uppercase tracking-[0.5em] text-[10px] mb-10 block">Expert Consultation</span>
          <h2 className="text-4xl md:text-7xl font-serif italic mb-16 leading-tight">"We don't just book safaris; <br /> we engineer lifelong memories."</h2>
          <Button asChild className="h-16 px-12 rounded-full bg-secondary text-white hover:bg-accent transition-all font-space font-bold uppercase tracking-widest shadow-2xl">
            <Link href="/contact">Request Bespoke Planning</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
