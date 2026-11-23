"use client";

import { Navbar } from "@/components/Navbar";
import { CircuitMap } from "@/components/CircuitMap";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Compass, Loader2 } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where, writeBatch, doc, serverTimestamp, getDocs } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { MASTER_DESTINATIONS } from "@/lib/master-destinations";
import { uniqueByName } from "@/lib/uniqueByName";
import { mediaFor } from "@/lib/media";
import { useLanguage } from "@/context/LanguageContext";
import { CIRCUIT_LABEL, labelFor } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * @fileOverview Shared view for /destinations and the per-circuit pages.
 * Full-bleed hero with the circuit's parks plotted on the to-scale map at
 * the right, circuit tabs routing to /destinations/circuit/[slug], and the
 * destination grid grouped the way the desk plans it.
 */

export type DestinationsCircuit =
  | "Northern Circuit"
  | "Southern Circuit"
  | "Western Frontiers"
  | "Zanzibar & Islands"
  | "The Peaks";

const CIRCUIT_SLUG: Record<DestinationsCircuit, string> = {
  "Northern Circuit": "northern-circuit",
  "Southern Circuit": "southern-circuit",
  "Western Frontiers": "western-frontiers",
  "Zanzibar & Islands": "zanzibar-islands",
  "The Peaks": "the-peaks",
};

const HERO_BY_CIRCUIT: Record<"All" | DestinationsCircuit, string> = {
  All: "serengeti-balloons-sunrise",
  "Northern Circuit": "serengeti-balloons-sunrise",
  "Southern Circuit": "hippo-pool",
  "Western Frontiers": "mahale-chimpanzee",
  "Zanzibar & Islands": "mafia-island-lagoon",
  "The Peaks": "kilimanjaro-summit-clear",
};

const HERO_ALT: Record<"All" | DestinationsCircuit, string> = {
  All: "Balloons drifting over the Serengeti plains at sunrise",
  "Northern Circuit": "Balloons drifting over the Serengeti plains at sunrise",
  "Southern Circuit": "Hippos crowded in a river pool in the southern parks",
  "Western Frontiers": "A chimpanzee in the Mahale mountain forest",
  "Zanzibar & Islands": "A turquoise lagoon ringed by coastal forest",
  "The Peaks": "The snows on the summit of Kilimanjaro",
};

export function DestinationsView({ circuit }: { circuit: "All" | DestinationsCircuit }) {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const { lang, t } = useLanguage();
  const [syncing, setSyncing] = useState(false);

  // Status check is REQUIRED by security rules to list successfully
  const destinationsQuery = useMemoFirebase(
    () => query(collection(db, "destinations"), where("status", "==", "active")),
    [db]
  );
  const { data: firestoreData, loading } = useCollection(destinationsQuery);

  // "Direct-to-App" Logic: static data as fallback for instant results
  const destinations = uniqueByName(
    firestoreData && firestoreData.length > 0
      ? firestoreData
      : MASTER_DESTINATIONS.map((d) => ({
          ...d,
          id: d.name.toLowerCase().replace(/\s+/g, "-"),
          featuredImage: mediaFor(d.imageId).src,
        }))
  );

  const scoped =
    circuit === "All"
      ? destinations
      : destinations.filter((d: any) => (d.circuit || "").trim() === circuit);

  const groups =
    circuit === "All"
      ? (Object.keys(CIRCUIT_SLUG) as DestinationsCircuit[])
          .map((c) => ({ circuit: c, items: destinations.filter((d: any) => (d.circuit || "").trim() === c) }))
          .filter((g) => g.items.length > 0)
      : [{ circuit, items: scoped }];

  const intro =
    circuit === "All"
      ? t("ds.intro")
      : t(`ds.intro.${CIRCUIT_SLUG[circuit as DestinationsCircuit]}`);

  const handleSync = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: t("ds.adminTitle"),
        description: t("ds.adminDesc"),
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
            updatedAt: serverTimestamp(),
          });
          count++;
        }
      }

      if (count > 0) {
        await batch.commit();
        toast({ title: t("ex.syncToast"), description: t("ds.syncToastDesc", { count }) });
      } else {
        toast({ title: t("ds.upToDate"), description: t("ds.upToDateDesc") });
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: t("ex.syncError"),
        description: err.message || t("ds.adminDesc"),
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <main className="min-h-screen bg-safari-white">
      <Navbar />

      {/* Full-bleed hero with the circuit map panel at the right */}
      <section className="relative w-full overflow-hidden bg-primary">
        <Image
          src={mediaFor(HERO_BY_CIRCUIT[circuit]).src}
          alt={HERO_ALT[circuit]}
          fill
          priority
          quality={75}
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(13,26,18,0.94)_0%,rgba(13,26,18,0.72)_45%,rgba(13,26,18,0.30)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(13,26,18,0.55)] via-transparent to-transparent" />

        <div className="relative z-10 px-6 md:px-12 lg:px-24 pt-32 md:pt-44 pb-14 md:pb-24">
          <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-7 text-center lg:text-left"
            >
              <span className="text-secondary font-space font-bold uppercase tracking-[0.5em] text-xs mb-4 block">
                {t("ds.eyebrow")}
              </span>
              {circuit === "All" ? (
                <h1 className="text-5xl md:text-7xl xl:text-8xl font-serif text-white leading-[0.92] tracking-tighter mb-6 md:mb-8">
                  {t("ds.title")} <br />
                  <span className="font-light italic">{t("ds.titleAccent")}</span>
                </h1>
              ) : (
                <h1 className="text-5xl md:text-7xl xl:text-8xl font-serif text-white leading-[0.95] tracking-tighter mb-6 md:mb-8">
                  {labelFor(CIRCUIT_LABEL, lang, circuit)}
                </h1>
              )}
              <p className="text-lg md:text-xl text-white/80 font-light max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {intro}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="lg:col-span-5"
            >
              <div className="bg-white rounded-[2rem] p-5 md:p-7 shadow-2xl shadow-black/30 max-w-md w-full mx-auto lg:max-w-none">
                <p className="text-secondary font-space font-bold uppercase tracking-[0.4em] text-[10px] mb-3">
                  {circuit === "All" ? t("ds.mapAll") : t("ds.mapCircuit")}
                </p>
                <CircuitMap activeNames={scoped.map((d: any) => d.name)} />
                <p className="mt-4 text-[9px] font-space uppercase tracking-[0.2em] text-muted-foreground/70">
                  {t("ds.mapFootnote")}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Circuit tabs */}
      <section className="px-6 md:px-12 lg:px-24 pt-10 md:pt-16">
        <div className="max-w-[1600px] mx-auto flex flex-wrap gap-3 justify-center lg:justify-start">
          <Link
            href="/destinations"
            className={cn(
              "px-7 py-3 rounded-full text-[10px] font-space font-bold uppercase tracking-widest transition-all duration-300 border",
              circuit === "All"
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                : "bg-white text-muted-foreground border-muted hover:border-secondary hover:text-secondary"
            )}
          >
            {labelFor(CIRCUIT_LABEL, lang, "All")}
          </Link>
          {(Object.keys(CIRCUIT_SLUG) as DestinationsCircuit[]).map((c) => (
            <Link
              key={c}
              href={`/destinations/circuit/${CIRCUIT_SLUG[c]}`}
              className={cn(
                "px-7 py-3 rounded-full text-[10px] font-space font-bold uppercase tracking-widest transition-all duration-300 border",
                circuit === c
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                  : "bg-white text-muted-foreground border-muted hover:border-secondary hover:text-secondary"
              )}
            >
              {labelFor(CIRCUIT_LABEL, lang, c)}
            </Link>
          ))}
        </div>
      </section>

      {/* Destination grid, grouped by circuit */}
      <section className="px-6 md:px-12 lg:px-24 py-12 md:py-16 pb-24">
        <div className="max-w-[1600px] mx-auto space-y-16 md:space-y-24">
          {loading && !firestoreData ? (
            <div className="py-40 flex flex-col items-center justify-center gap-4 text-muted-foreground">
              <Loader2 className="w-10 h-10 animate-spin text-secondary" />
              <p className="text-xs uppercase font-bold tracking-[0.3em]">{t("ds.loading")}</p>
            </div>
          ) : scoped.length === 0 ? (
            <div className="py-32 text-center bg-white rounded-[3rem] border border-dashed shadow-inner flex flex-col items-center">
              <Compass className="w-12 h-12 text-secondary/20 mx-auto mb-6" />
              <p className="text-muted-foreground font-serif italic text-2xl mb-6">{t("ds.empty")}</p>
              <Button asChild variant="outline" className="rounded-full px-8 h-12 font-bold uppercase tracking-widest text-[10px]">
                <Link href="/destinations">{t("ds.viewAll")}</Link>
              </Button>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.circuit}>
                <div className="flex items-baseline justify-between gap-6 border-b border-muted pb-4 mb-10 md:mb-14">
                  <h2 className="text-[11px] md:text-xs font-space font-bold uppercase tracking-[0.35em] text-primary">
                    {labelFor(CIRCUIT_LABEL, lang, group.circuit)}
                  </h2>
                  <span className="text-[9px] md:text-[10px] font-space uppercase tracking-[0.25em] text-muted-foreground">
                    {group.items.length === 1
                      ? t("ds.countOne", { n: group.items.length })
                      : t("ds.count", { n: group.items.length })}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                  {group.items.map((dest: any, i) => (
                    <DestinationCard key={dest.id} dest={dest} index={i} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Explore Itineraries CTA */}
      <section className="py-24 bg-primary text-white text-center px-6">
        <div className="max-w-4xl mx-auto">
          <span className="text-secondary font-space font-bold uppercase tracking-[0.4em] text-[10px] mb-8 block">
            {t("ds.ctaEyebrow")}
          </span>
          <h2 className="text-4xl md:text-6xl font-serif italic text-white mb-12 leading-tight">{t("ds.ctaQuote")}</h2>
          <Button
            asChild
            className="h-16 px-12 rounded-full bg-secondary text-white hover:bg-accent transition-all font-space font-bold uppercase tracking-widest"
          >
            <Link href="/itineraries">{t("ds.ctaButton")}</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

function DestinationCard({ dest, index }: { dest: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: (index % 3) * 0.06 }}
      viewport={{ once: true, margin: "-60px" }}
    >
      <Link
        href={`/destinations/${dest.id}`}
        className="group relative block overflow-hidden rounded-[2rem] bg-primary shadow-sm hover:shadow-2xl transition-shadow duration-500 accelerate"
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          <Image
            src={mediaFor(dest.featuredImage).src}
            alt={dest.name}
            fill
            quality={70}
            className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.06]"
            sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 92vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(13,26,18,0.94),rgba(13,26,18,0.42)_38%,rgba(13,26,18,0.08)_68%,transparent_86%)]" />

          <span className="absolute top-5 left-5 glass px-4 py-2 rounded-full border-white/20 text-[9px] font-bold text-white uppercase tracking-[0.2em]">
            {dest.type}
          </span>

          <span className="absolute top-5 right-5 grid h-10 w-10 place-items-center rounded-full bg-white/10 border border-white/25 text-white opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
            <ArrowRight className="w-4 h-4" />
          </span>

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-7">
            {dest.distance ? (
              <p className="text-[9px] md:text-[10px] font-space font-bold uppercase tracking-[0.3em] text-secondary mb-2">
                {dest.distance}
              </p>
            ) : null}
            <h3 className="text-3xl md:text-4xl font-serif font-medium text-white leading-[1.05] transition-colors group-hover:text-secondary">
              {dest.name}
            </h3>
            {dest.shortDescription ? (
              <p className="mt-2.5 text-sm text-white/75 font-light leading-relaxed line-clamp-2">
                {dest.shortDescription}
              </p>
            ) : null}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
