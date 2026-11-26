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

// Lazy load BookingDialog
const BookingDialog = dynamic(() => import("./BookingDialog").then(mod => mod.BookingDialog), { ssr: false });

const ALL_PARK_NAMES = MASTER_DESTINATIONS.map((d) => d.name);

// The hero speaks to the three kinds of traveller Miale builds for, not to the
// parks: most first-time visitors cannot place Mikumi or Ndutu on a map.
const THEME_SLIDES: { tagKey: string; titleKey: string; accentKey: string; subKey: string; imageId: string }[] = [
  { tagKey: "hero.tag1", titleKey: "hero.title1", accentKey: "hero.accent1", subKey: "hero.sub1", imageId: "serengeti-balloons-sunrise" },
  { tagKey: "hero.tag2", titleKey: "hero.title2", accentKey: "hero.accent2", subKey: "hero.sub2", imageId: "cheetah-close-encounter" },
  { tagKey: "hero.tag3", titleKey: "hero.title3", accentKey: "hero.accent3", subKey: "hero.sub3", imageId: "wildebeest-herd-green-plain" },
];

export const Hero = () => {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [painted, setPainted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  const y = useTransform(scrollY, [0, 1000], [0, 400]);
  const scale = useTransform(scrollY, [0, 500], [1, 1.05]);

  const slides = THEME_SLIDES;

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
  const slideImage = mediaFor(slide.imageId);
  const heldImage = mediaFor(slides[heldIndex].imageId);

  return (
    <section ref={containerRef} className="relative h-[100svh] w-full overflow-hidden bg-safari-charcoal">
      <motion.div style={{ y, scale }} className="absolute inset-0 z-0 accelerate">
        {!incomingReady && (
          <Image
            src={heldImage.src}
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
            src={slideImage.src}
            alt={slideImage.alt}
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
          className="max-w-6xl w-full lg:col-span-8 xl:col-span-7"
        >
          <motion.p
            key={`tag-${index}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="font-space text-[9px] md:text-[11px] uppercase tracking-[0.45em] text-secondary mb-5 md:mb-7"
          >
            {t(slide.tagKey)}
          </motion.p>

          <motion.h1
            key={`title-${index}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="font-serif font-medium leading-[0.95] md:leading-[0.82] text-white tracking-tighter drop-shadow-2xl mb-6 md:mb-8 text-4xl sm:text-6xl md:text-8xl"
          >
            {t(slide.titleKey)}
            <span className="block font-light italic text-white/70">{t(slide.accentKey)}</span>
          </motion.h1>

          <p key={`sub-${index}`} className="text-white/75 max-w-2xl font-light leading-relaxed mb-8 md:mb-10 text-sm sm:text-lg md:text-xl mx-auto lg:mx-0">
            {t(slide.subKey)}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-8 pt-4 lg:justify-start">
            <BookingDialog>
              <Button
                size="lg"
                className="w-full sm:w-auto h-14 md:h-16 px-10 md:px-12 rounded-full bg-secondary text-white hover:bg-accent transition-all font-space font-bold uppercase tracking-widest group shadow-2xl text-[10px]"
              >
                {t("hero.cta")}
                <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </BookingDialog>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="hidden lg:block lg:col-span-4 xl:col-span-5"
        >
          <div className="w-full ml-auto pt-2">
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
              <div key={s.tagKey} className={cn("h-1 rounded-full transition-all duration-700", i === index ? "w-8 bg-secondary" : "w-1.5 bg-white/20")} />
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
