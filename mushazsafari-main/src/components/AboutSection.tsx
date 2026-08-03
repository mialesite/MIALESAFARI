"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Sprout, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/context/LanguageCurrencyContext";

export const AboutSection = () => {
  const { t } = useTranslation();
  const aboutImage = PlaceHolderImages.find(img => img.id === 'about-arusha');

  return (
    <section className="py-24 px-6 bg-background relative" id="about">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: Visuals */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="relative h-[600px] w-full rounded-3xl overflow-hidden shadow-2xl">
            <Image
              src={aboutImage?.imageUrl || ""}
              alt="Arusha Landscape"
              fill
              className="object-cover"
            />
          </div>
          {/* Floating Experience Card */}
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 5 }}
            className="absolute -bottom-8 -right-8 glass p-8 rounded-3xl hidden md:block max-w-[260px]"
          >
            <div className="text-4xl font-headline font-bold text-honey-gold mb-2">9</div>
            <p className="text-sm font-medium leading-relaxed">Years of expertise in sustainable Tanzanian beekeeping.</p>
          </motion.div>
        </motion.div>

        {/* Right: Content */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-honey-gold font-bold tracking-widest uppercase text-sm mb-4 block">{t('our_legacy')}</span>
          <h2 className="font-headline text-4xl md:text-6xl font-bold mb-8">{t('about_alvena')}</h2>
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed font-light">
            <p>
              <strong>Natural Honey from Singida, United Republic of Tanzania.</strong> We produce and supply premium-quality natural honey sourced from Singida, Tanzania.
            </p>
            <p>
              Every batch reflects our commitment to quality, authenticity, and excellence, harvested using sustainable practices that empower local beekeepers and preserve the environment.
            </p>
            <p>
              Founded in Sombetini JR, Arusha, Tanzania, our mission is to provide the highest quality honey and bee products while protecting the environment and empowering local communities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-honey-gold/10 flex items-center justify-center text-honey-gold shrink-0">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">{t('sustainable')}</h4>
                <p className="text-sm text-muted-foreground">Eco-conscious harvesting methods.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-honey-gold/10 flex items-center justify-center text-honey-gold shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">{t('pure_quality')}</h4>
                <p className="text-sm text-muted-foreground">100% natural, no additives.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
