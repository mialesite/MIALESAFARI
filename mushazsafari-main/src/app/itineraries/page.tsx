
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import Image from "next/image";
import { mediaFor } from "@/lib/media";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Compass, Clock, MapPin, Loader2, ArrowRight } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where, writeBatch, doc, serverTimestamp, getDocs } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { TOURS, priceLabel } from "@/lib/tours";
import { useLanguage } from "@/context/LanguageContext";
import { CATEGORY_LABEL, labelFor } from "@/lib/i18n";

const CATEGORIES = ["All", "Migration", "Luxury", "Classic", "Mountain", "Zanzibar", "Family", "Bespoke"];

const CATEGORY_HERO: Record<string, { assetRef: string }> = {
  All: { assetRef: "wildebeest-river-crossing" },
  Mountain: { assetRef: "kilimanjaro-summit-clear" },
  Migration: { assetRef: "wildebeest-river-crossing" },
  Luxury: { assetRef: "tent-deck-bathtub-view" },
  Classic: { assetRef: "acacia-and-safari-vehicle" },
  Zanzibar: { assetRef: "mafia-island-lagoon" },
  Family: { assetRef: "elephant-family-crossing" },
  Bespoke: { assetRef: "gombe-chimpanzee" },
};

export default function SafariCollectionPage() {
  return (
    <Suspense>
      <SafariCollection />
    </Suspense>
  );
}

function SafariCollection() {
  const db = useFirestore();
  const { user } = useUser();
  const { lang, t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedCategory = searchParams.get("category");
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (requestedCategory && CATEGORIES.includes(requestedCategory)) {
      setActiveCategory(requestedCategory);
    }
  }, [requestedCategory]);

  const setCategory = (cat: string) => {
    setActiveCategory(cat);
    router.replace(cat === "All" ? "/itineraries" : `/itineraries?category=${cat}`, { scroll: false });
  };

  // Status check is REQUIRED by security rules to list successfully
  const itinerariesQuery = useMemoFirebase(() => 
    query(collection(db, "itineraries"), where("status", "==", "active")), 
  [db]);
  const { data: firestoreData, loading, error } = useCollection(itinerariesQuery);

  // "Direct-to-App" Logic: Use static data as fallback for instant results
  const raw = firestoreData && firestoreData.length > 0
    ? firestoreData
    : TOURS.map((t, i) => ({ ...t, id: t.slug || `local-${i}` }));
  // Live rows can carry duplicate slugs while cleanup is pending; show each route once.
  const seen = new Set<string>();
  const itineraries = raw.filter((t: any) => {
    const key = t.slug || t.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const filtered = itineraries?.filter(i => {
    const matchesCategory = activeCategory === "All" || i.category === activeCategory;
    const matchesSearch = i.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSync = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: t("it.adminTitle"),
        description: t("it.adminDesc"),
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
        toast({ title: t("it.syncToast"), description: t("it.syncToastDesc", { count }) });
      } else {
        toast({ title: t("it.upToDate"), description: t("it.upToDateDesc") });
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: t("it.syncError"),
        description: err.message || t("it.authRequired"),
      });
    } finally {
      setSyncing(false);
    }
  };

  const categoryCopy = t(`cat.${activeCategory}.copy`);
  const hero = CATEGORY_HERO[activeCategory] || CATEGORY_HERO.All;
  const heroImage = mediaFor(hero.assetRef);
  const ctaImage = mediaFor("acacia-and-safari-vehicle");

  return (
    <main className="min-h-screen bg-safari-white">
      <Navbar />

      <section className="relative w-full overflow-hidden bg-primary">
        <Image
          key={hero.assetRef}
          src={heroImage.src}
          alt={heroImage.alt}
          fill
          priority
          quality={75}
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(13,26,18,0.94)_0%,rgba(13,26,18,0.72)_45%,rgba(13,26,18,0.30)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0D1A12] to-transparent" />

        <div className="relative z-10 max-w-[1800px] mx-auto px-6 md:px-12 lg:px-24 pt-32 md:pt-44 pb-14 md:pb-20">
          <span className="text-secondary font-space font-bold uppercase tracking-[0.5em] text-[10px] mb-4 block">{t("it.eyebrow")}</span>
          <h1 className="text-6xl md:text-8xl font-serif text-white leading-tight tracking-tighter mb-6">
            {activeCategory === "All" ? t("it.titleAll") : labelFor(CATEGORY_LABEL, lang, activeCategory)} <br />
            <span className="italic font-light text-white/80">{activeCategory === "All" ? t("it.titleAllAccent") : t("it.titleAccent")}</span>
          </h1>
          <p className="text-lg md:text-xl text-white/70 font-light leading-relaxed max-w-2xl">
            {categoryCopy}
          </p>
        </div>
      </section>

      <section className="pt-14 pb-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex flex-col md:flex-row md:flex-wrap gap-6 md:gap-y-5 items-center justify-between border-y border-muted py-8 mb-10">
            <div className="flex flex-wrap gap-2.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "px-6 py-2.5 rounded-full text-[10px] font-space font-bold uppercase tracking-widest transition-all border",
                    activeCategory === cat
                      ? "bg-primary text-white border-primary shadow-lg"
                      : "bg-white text-muted-foreground border-muted hover:border-secondary hover:text-secondary"
                  )}
                >
                  {labelFor(CATEGORY_LABEL, lang, cat)}
                </button>
              ))}
            </div>

            <div className="relative w-full max-w-md md:ml-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("it.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 h-12 rounded-full border border-muted bg-white focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all text-sm font-light"
              />
            </div>
          </div>

          <p className="mb-8 text-[10px] font-space font-bold uppercase tracking-[0.25em] text-muted-foreground">
            {filtered.length === 1 ? t("it.showingOne") : t("it.showing", { n: filtered.length })}
          </p>

          {loading && !firestoreData ? (
            <div className="py-40 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-secondary" />
              <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-muted-foreground">{t("it.loading")}</p>
            </div>
          ) : !filtered || filtered.length === 0 ? (
            <div className="py-32 text-center bg-white rounded-[3rem] border border-dashed border-muted/50 flex flex-col items-center">
               <Compass className="w-12 h-12 text-secondary/20 mx-auto mb-6" />
               <p className="text-muted-foreground font-serif italic text-2xl mb-4">{t("it.empty")}</p>
               <Button
                variant="outline"
                onClick={() => { setSearchQuery(""); setCategory("All"); }}
                className="rounded-full px-8 h-12 font-bold uppercase tracking-widest text-[10px]"
               >
                 {t("it.clear")}
               </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filtered?.map((tour, index) => (
                <motion.div
                  key={tour.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: (index % 3) * 0.08 }}
                  className="group"
                >
                  <Link href={`/tours/${tour.slug || tour.id}`} className="block relative aspect-[4/5] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-xl shadow-primary/10">
                    <Image
                      src={mediaFor(tour.featuredImage).src}
                      alt={tour.title}
                      fill quality={70}
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                      sizes="(min-width: 1024px) 32vw, (min-width: 768px) 48vw, 70vw"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(13,26,18,0.94),rgba(13,26,18,0.42)_38%,rgba(13,26,18,0.08)_68%,transparent_86%)]" />

                    <div className="absolute top-5 left-5">
                      <span className="px-4 py-1.5 rounded-full bg-safari-green/70 border border-white/15 backdrop-blur-md text-white text-[9px] font-space font-bold uppercase tracking-[0.2em]">
                        {labelFor(CATEGORY_LABEL, lang, tour.category)}
                      </span>
                    </div>

                    <div className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-white opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                      <ArrowRight className="w-4 h-4" />
                    </div>

                    <div className="absolute bottom-7 left-7 right-7 text-white">
                      <div className="flex items-center gap-5 text-[9px] font-space font-bold uppercase tracking-widest text-secondary/90 mb-4">
                        <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {tour.duration}</div>
                        <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {tour.destinations?.length || 1} {(tour.destinations?.length || 1) === 1 ? t("it.stopOne") : t("it.stopMany")}</div>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-serif font-medium leading-[1.15] text-white group-hover:text-secondary transition-colors duration-500 mb-5">
                        {tour.title}
                      </h3>
                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div>
                          <p className="text-[9px] uppercase tracking-widest text-white/40 mb-0.5">{t("it.price")}</p>
                          <p className="text-xl font-serif font-bold text-secondary">{priceLabel(tour)}</p>
                        </div>
                        <span className="flex items-center gap-1.5 text-[9px] font-space font-bold uppercase tracking-widest text-secondary">
                          {t("it.viewDetails")}
                          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-28 md:py-36 px-6 relative overflow-hidden bg-primary text-white text-center">
        <Image
          src={ctaImage.src}
          alt={ctaImage.alt}
          fill
          quality={60}
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-primary/85" />
        <div className="max-w-4xl mx-auto relative z-10">
          <span className="text-secondary font-space font-bold uppercase tracking-[0.5em] text-[10px] mb-10 block">{t("it.ctaEyebrow")}</span>
          <h2 className="text-4xl md:text-7xl font-serif italic text-white mb-16 leading-tight">{t("it.ctaQuote1")} <br /> {t("it.ctaQuote2")}</h2>
          <Button asChild className="h-16 px-12 rounded-full bg-secondary text-white hover:bg-accent transition-all font-space font-bold uppercase tracking-widest shadow-2xl">
            <Link href="/contact">{t("it.ctaButton")}</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
