"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { mediaFor } from "@/lib/media";
import { useLanguage } from "@/context/LanguageContext";

// Lazy load BookingDialog
const BookingDialog = dynamic(() => import("./BookingDialog").then(mod => mod.BookingDialog), { ssr: false });

const FALLBACK_SLIDE = mediaFor("safari-hero");

export const Hero = () => {
  const db = useFirestore();
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [painted, setPainted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  
  const y = useTransform(scrollY, [0, 1000], [0, 400]);
  const scale = useTransform(scrollY, [0, 500], [1, 1.05]);

  const slidesQuery = useMemoFirebase(() => query(
    collection(db, "hero_slides"), 
    where("status", "==", "active")
  ), [db]);

  const { data: slides, loading } = useCollection(slidesQuery);
  const sortedSlides = slides ? [...slides].sort((a: any, b: any) => (a.priority || 0) - (b.priority || 0)) : null;

  useEffect(() => {
    if (!sortedSlides || sortedSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sortedSlides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [sortedSlides]);

  const activeSlides = sortedSlides && sortedSlides.length > 0 ? sortedSlides : [{
    title: t("hero.fallbackTitle"),
    subtitle: t("hero.fallbackSubtitle"),
    imageUrl: FALLBACK_SLIDE.src,
    buttonText: t("hero.fallbackCta"),
    buttonLink: "#",
    opacity: 0.6,
    contentPosition: "center"
  }];

  const index = currentSlide % activeSlides.length;
  const heldIndex = painted % activeSlides.length;
  const slide = activeSlides[index];
  const incomingReady = index === heldIndex;

  return (
    <section ref={containerRef} className="relative h-[100svh] w-full overflow-hidden bg-safari-charcoal">
      <motion.div style={{ y, scale }} className="absolute inset-0 z-0 accelerate">
        {!incomingReady && (
          <Image
            src={mediaFor(activeSlides[heldIndex].imageUrl).src}
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
            src={mediaFor(slide.imageUrl).src}
            alt={slide.title}
            fill
            className={cn("transition-all duration-1000", slide.imageFit || "object-cover")}
            style={{
              // The CMS `opacity` field historically mapped to a hard brightness()
              // crush; keep a hint of it but never darken the photograph below 85%.
              filter: `brightness(${Math.min(1, Math.max(0.85, 1 - (slide.opacity || 0.4) * 0.25))})`,
              objectPosition: slide.imagePosition || "center"
            }}
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
        slide.contentPosition === "top-left" && "md:items-start md:justify-start md:text-left md:pt-32",
        slide.contentPosition === "top-right" && "md:items-end md:justify-start md:text-right md:pt-32",
        slide.contentPosition === "bottom-left" && "md:items-start md:justify-end md:text-left md:pb-32",
        slide.contentPosition === "bottom-right" && "md:items-end md:justify-end md:text-right md:pb-32"
      )}>
        <motion.div
          key={`content-${index}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-6xl w-full"
        >
          <p className="font-space text-[9px] md:text-[11px] uppercase tracking-[0.45em] text-secondary mb-6 md:mb-8">
            {t("hero.eyebrow")}
          </p>

          <h1 className="font-serif font-medium leading-[0.95] md:leading-[0.82] text-white tracking-tighter drop-shadow-2xl mb-6 md:mb-8 text-4xl sm:text-6xl md:text-8xl lg:text-9xl">
            {t("hero.title")}
            <span className="block font-light italic text-white/70">{t("hero.titleAccent")}</span>
          </h1>

          <p className={cn(
            "text-white/75 max-w-2xl font-light leading-relaxed mb-8 md:mb-10 text-sm sm:text-lg md:text-xl",
            (!slide.contentPosition || slide.contentPosition === "center") && "mx-auto"
          )}>
            {t("hero.subline")}
          </p>

          <div className={cn(
            "flex items-center justify-center gap-3 mb-8 md:mb-10",
            slide.contentPosition && slide.contentPosition !== "center" && "hidden"
          )}>
            <span className="h-px w-8 bg-white/25" />
            <span className="font-space text-[9px] md:text-[10px] uppercase tracking-[0.35em] text-white/50">
              {slide.title}
            </span>
            <span className="h-px w-8 bg-white/25" />
          </div>

          <div className={cn(
            "flex flex-col sm:flex-row items-center gap-6 md:gap-8 pt-4",
            (!slide.contentPosition || slide.contentPosition === "center") ? "justify-center" : 
            (slide.contentPosition.includes("right") ? "justify-end" : "justify-start")
          )}>
            <BookingDialog>
              <Button 
                size="lg" 
                className="w-full sm:w-auto h-14 md:h-16 px-10 md:px-12 rounded-full bg-secondary text-white hover:bg-accent transition-all font-space font-bold uppercase tracking-widest group shadow-2xl text-[10px]"
              >
                {slide.buttonText || t("hero.fallbackCta")}
                <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </BookingDialog>
          </div>
        </motion.div>
      </div>

      {activeSlides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 md:left-12 -translate-x-1/2 md:translate-x-0 flex items-center gap-4 z-20">
          <button onClick={() => setCurrentSlide((p) => (p - 1 + activeSlides.length) % activeSlides.length)} className="text-white/50 hover:text-white transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex gap-2">
            {activeSlides.map((_, i) => (
              <div key={i} className={cn("h-1 rounded-full transition-all duration-700", i === index ? "w-8 bg-secondary" : "w-1.5 bg-white/20")} />
            ))}
          </div>
          <button onClick={() => setCurrentSlide((p) => (p + 1) % activeSlides.length)} className="text-white/50 hover:text-white transition-colors">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </section>
  );
};