"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Waves, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingDialog } from "@/components/BookingDialog";
import { MigrationMap } from "@/components/MigrationMap";
import { cn } from "@/lib/utils";
import {
  MIGRATION_MONTHS,
  PHASE_COLOUR,
  PHASE_LABEL,
  CROSSING_LABEL,
  PHASE_LABEL_SW,
  CROSSING_LABEL_SW,
  MONTHS_SW,
  type MigrationPhase,
} from "@/lib/migration";
import { useLanguage } from "@/context/LanguageContext";

const PHASES = Object.keys(PHASE_LABEL) as MigrationPhase[];
const TOUR_INTERVAL = 5000;

export function MigrationTracker() {
  const { lang, t } = useLanguage();
  const sw = lang === "sw";
  const phaseLabels = sw ? PHASE_LABEL_SW : PHASE_LABEL;
  const crossingLabels = sw ? CROSSING_LABEL_SW : CROSSING_LABEL;
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() => new Date().getMonth());
  const [playing, setPlaying] = useState(true);

  // The tour only advances while the section is actually on screen.
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { rootMargin: "500px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || !inView) return;
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % MIGRATION_MONTHS.length);
    }, TOUR_INTERVAL);
    return () => clearInterval(timer);
  }, [playing, inView]);

  const month = MIGRATION_MONTHS[activeIndex];
  const swMonth = MONTHS_SW[activeIndex];
  const monthName = sw ? swMonth.name : month.name;
  const monthTitle = sw ? swMonth.title : month.title;
  const monthLocation = sw ? swMonth.location : month.location;
  const monthBlurb = sw ? swMonth.blurb : month.blurb;
  const monthSignals = sw ? swMonth.signals : month.signals;

  const selectMonth = (index: number) => {
    setActiveIndex(index);
    setPlaying(false);
  };

  return (
    <section ref={sectionRef} id="migration" className="py-14 md:py-16 lg:py-6 px-6 md:px-12 lg:px-24 bg-primary text-white overflow-hidden">
      <div className="max-w-[1500px] mx-auto">
        <div>
          <span className="text-[10px] md:text-[11px] font-space font-bold text-secondary uppercase tracking-[0.45em] mb-3 block">
            {t("tr.eyebrow")}
          </span>
          <h2 className="text-4xl md:text-5xl font-serif leading-[0.98] tracking-tighter text-white mb-4">
            {t("tr.title")} <span className="italic font-light text-white/60">{t("tr.titleAccent")}</span>
          </h2>
          <p className="text-[15px] text-white/65 font-light leading-relaxed max-w-3xl">
            {t("tr.body")}
          </p>
        </div>

        <div className="mt-8 lg:mt-5 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8 lg:gap-12 items-center">
          <div>
            <div className="relative w-full overflow-hidden rounded-[2rem] md:rounded-[2.5rem] shadow-2xl ring-1 ring-white/10">
              <MigrationMap activeIndex={activeIndex} onSelect={selectMonth} />
            </div>

            <p className="mt-2 text-[9px] md:text-[10px] font-space uppercase tracking-[0.18em] text-white/35 leading-relaxed">
              {t("tr.mapNote")}
            </p>

            <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1.5">
              {PHASES.map((phase) => (
                <span key={phase} className="inline-flex items-center gap-1.5 text-[9px] font-space uppercase tracking-[0.16em] text-white/50">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PHASE_COLOUR[phase] }} />
                  {phaseLabels[phase]}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[9px] font-space font-bold uppercase tracking-[0.35em] text-white/40 mb-2">{t("tr.choose")}</p>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-2">
              {MIGRATION_MONTHS.map((entry) => {
                const active = entry.index === activeIndex;
                return (
                  <button
                    key={entry.short}
                    type="button"
                    onClick={() => selectMonth(entry.index)}
                    aria-pressed={active}
                    className={cn(
                      "h-9 rounded-full text-[10px] font-space font-bold uppercase tracking-[0.18em] transition-all duration-300 border",
                      active
                        ? "bg-secondary text-white border-secondary shadow-lg"
                        : "text-white/55 border-white/15 hover:border-secondary hover:text-secondary"
                    )}
                  >
                    {sw ? MONTHS_SW[entry.index].short : entry.short}
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${month.short}-${lang}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex items-start gap-4 mb-2">
                  <span
                    className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${PHASE_COLOUR[month.phase]}22`, border: `1px solid ${PHASE_COLOUR[month.phase]}` }}
                  >
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PHASE_COLOUR[month.phase] }} />
                  </span>
                  <div>
                    <p className="text-[9px] font-space font-bold uppercase tracking-[0.3em] text-white/45 mb-1.5">
                      {monthName} &middot; {phaseLabels[month.phase]}
                    </p>
                    <h3 className="text-2xl md:text-[1.7rem] font-serif leading-tight text-white">{monthTitle}</h3>
                  </div>
                </div>

                <p className="text-[10px] font-space uppercase tracking-[0.22em] text-secondary mb-1.5">{monthLocation}</p>
                <p className="text-[15px] text-white/70 font-light leading-relaxed mb-3">{monthBlurb}</p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
                  {monthSignals.map((signal) => (
                    <span key={signal} className="inline-flex items-center gap-2 text-[13px] text-white/80 font-light">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                      {signal}
                    </span>
                  ))}
                  {month.crossings.map((key) => (
                    <span
                      key={key}
                      className="inline-flex items-center gap-2 rounded-full border border-[#4E7C74] bg-[#4E7C74]/20 px-3.5 py-1 text-[9px] font-space font-bold uppercase tracking-[0.16em] text-white"
                    >
                      <Waves className="h-3 w-3" />
                      {crossingLabels[key]}
                    </span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-3">
              <button
                type="button"
                onClick={() => setPlaying((current) => !current)}
                aria-pressed={playing}
                className="text-[9px] font-space uppercase tracking-[0.2em] text-white/55 hover:text-secondary transition-colors"
              >
                {playing ? t("tr.pause") : t("tr.play")}
              </button>
              <BookingDialog>
                <Button className="h-10 rounded-full bg-secondary text-white text-[9px] md:text-[10px] font-space font-bold uppercase tracking-[0.2em] px-6 hover:bg-white hover:text-primary transition-all duration-500">
                  {t("tr.planCta")}
                </Button>
              </BookingDialog>
              <Link
                href={{ pathname: "/itineraries", query: { category: "Migration" } }}
                className="ml-auto inline-flex items-center gap-2 text-[9px] md:text-[10px] font-space font-bold uppercase tracking-[0.2em] text-white/70 hover:text-secondary transition-colors"
              >
                {t("tr.linkItineraries")}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
