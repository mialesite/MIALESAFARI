"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { mediaFor } from "@/lib/media";
import { useLanguage } from "@/context/LanguageContext";
import { CircuitMap } from "@/components/CircuitMap";
import { MASTER_DESTINATIONS } from "@/lib/master-destinations";
import { CIRCUIT_LABEL, labelFor } from "@/lib/i18n";

// Lazy load BookingDialog
const BookingDialog = dynamic(() => import("./BookingDialog").then(mod => mod.BookingDialog), { ssr: false });

const ALL_PARK_NAMES = MASTER_DESTINATIONS.map((d) => d.name);

// One photograph per circuit, the same heroes the destinations pages use,
// captioned with the circuit's name in the active language.
const CIRCUIT_SLIDES: { circuit: string; imageUrl: string; alt: string }[] = [
  {
    circuit: "Northern Circuit",
    imageUrl: mediaFor("serengeti-balloons-sunrise").src,
    alt: "Balloons drifting over the Serengeti plains at sunrise",
  },
  {
    circuit: "Southern Circuit",
    imageUrl: mediaFor("hippo-pool").src,
    alt: "Hippos crowded in a river pool in the southern parks",
  },
  {
    circuit: "Western Frontiers",
    imageUrl: mediaFor("mahale-chimpanzee").src,
    alt: "A chimpanzee in the Mahale mountain forest",
  },
  {
    circuit: "Zanzibar & Islands",
    imageUrl: mediaFor("mafia-island-lagoon").src,
    alt: "A turquoise lagoon ringed by coastal forest",
  },
  {
    circuit: "The Peaks",
    imageUrl: mediaFor("kilimanjaro-summit-clear").src,
    alt: "The snows on the summit of Kilimanjaro",
  },
];

export const Hero = () => {
  const { t, lang } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [painted, setPainted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  const y = useTransform(scrollY, [0, 1000], [0, 400]);
  const scale = useTransform(scrollY, [0, 500], [1, 1.05]);

  const slides = CIRCUIT_SLIDES;

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const index = currentSlide % slides.length;
  const heldIndex = painted % slides.length;
  const slide = slides[index];
  const incomingReady = index === heldIndex;

  return (
    <section ref={containerRef} className="relative h-[100svh] w-full overflow-hidden bg-safari-charcoal">
      <motion.div style={{ y, scale }} className="absolute inset-0 z-0 accelerate">
        {!incomingReady && (
          <Image
            src={slides[heldIndex].imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
        )}
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
            incomingReady ? "opacity-100" : "opacity-0"
          )}
        >
          <Image
            src={slide.imageUrl}
            alt={slide.alt}
            fill
            className="object-cover"
            quality={70}
            priority={index === 0}
            onLoad={() => setPainted(index)}
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-safari-charcoal" />
      </motion.div>

      <div className={cn(
        "relative z-10 h-full flex flex-col px-6 md:px-24",
        "items-center justify-center text-center",
        "lg:grid lg:grid-cols-12 lg:gap-14 lg:items-center lg:text-left lg:max-w-[1600px] lg:mx-auto"
      )}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-6xl w-full lg:col-span-8"
        >
          <p className="font-space text-[9px] md:text-[11px] uppercase tracking-[0.45em] text-secondary mb-6 md:mb-8">
            {t("hero.eyebrow")}
          </p>

          <h1 className="font-serif font-medium leading-[0.95] md:leading-[0.82] text-white tracking-tighter drop-shadow-2xl mb-6 md:mb-8 text-4xl sm:text-6xl md:text-8xl">
            {t("hero.title")}
            <span className="block font-light italic text-white/70">{t("hero.titleAccent")}</span>
          </h1>

          <p className="text-white/75 max-w-2xl font-light leading-relaxed mb-8 md:mb-10 text-sm sm:text-lg md:text-xl mx-auto lg:mx-0">
            {t("hero.subline")}
          </p>

          <motion.p
            key={`caption-${index}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center justify-center gap-3 mb-8 md:mb-10 lg:justify-start font-space text-[9px] md:text-[10px] uppercase tracking-[0.35em] text-white/50"
          >
            <span className="h-px w-8 bg-white/25" />
            {labelFor(CIRCUIT_LABEL, lang, slide.circuit)}
            <span className="h-px w-8 bg-white/25" />
          </motion.p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-8 pt-4 lg:justify-start">
            <BookingDialog>
              <Button
                size="lg"
                className="w-full sm:w-auto h-14 md:h-16 px-10 md:px-12 rounded-full bg-secondary text-white hover:bg-accent transition-all font-space font-bold uppercase tracking-widest group shadow-2xl text-[10px]"
              >
                {t("hero.fallbackCta")}
                <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </BookingDialog>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="hidden lg:block lg:col-span-4"
        >
          <div className="max-w-md w-full ml-auto pt-2">
            <CircuitMap activeNames={ALL_PARK_NAMES} glass />
          </div>
        </motion.div>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 md:left-12 -translate-x-1/2 md:translate-x-0 flex items-center gap-4 z-20">
          <button onClick={() => setCurrentSlide((p) => (p - 1 + slides.length) % slides.length)} className="text-white/50 hover:text-white transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex gap-2">
            {slides.map((s, i) => (
              <div key={s.circuit} className={cn("h-1 rounded-full transition-all duration-700", i === index ? "w-8 bg-secondary" : "w-1.5 bg-white/20")} />
            ))}
          </div>
          <button onClick={() => setCurrentSlide((p) => (p + 1) % slides.length)} className="text-white/50 hover:text-white transition-colors">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </section>
  );
};
