"use client";

import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { ContactSection } from "@/components/ContactSection";
import { useLanguage } from "@/context/LanguageContext";
import { mediaFor } from "@/lib/media";

export default function ContactPage() {
  const { t } = useLanguage();
  const cityImage = mediaFor("afcon-arusha-city");
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="relative w-full overflow-hidden bg-primary">
        <Image
          src={cityImage.src}
          alt={cityImage.alt}
          fill
          priority
          quality={75}
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(13,26,18,0.94)_0%,rgba(13,26,18,0.72)_45%,rgba(13,26,18,0.30)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0D1A12] to-transparent" />

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24 pt-32 md:pt-44 pb-14 md:pb-20">
          <p className="text-[10px] md:text-xs font-space font-bold uppercase tracking-[0.4em] text-secondary mb-4">
            {t("cp.eyebrow")}
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-light text-white leading-[1.05] tracking-tight max-w-3xl">
            {t("cp.title")}
          </h1>
          <p className="text-sm md:text-base text-white/70 font-light mt-5 md:mt-6 max-w-xl leading-relaxed">
            {t("cp.body")}
          </p>
          <p className="mt-4 text-[10px] font-space font-bold uppercase tracking-[0.3em] text-white/40">
            {t("cp.caption")}
          </p>
        </div>
      </section>

      <ContactSection />
    </main>
  );
}
