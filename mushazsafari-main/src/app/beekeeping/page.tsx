"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sprout, ShieldCheck, MapPin, ArrowRight, TrendingUp, Handshake, Users } from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { useTranslation } from "@/context/LanguageCurrencyContext";

export default function BeekeepingPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen pt-32 pb-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        {/* Hero Section */}
        <div className="relative h-[400px] md:h-[600px] rounded-[3rem] overflow-hidden mb-24">
          <Image
            src="https://orbituniverse.co.tz/images/farm-honeycomb-pile.jpg"
            alt="Beekeeping Alvena"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-honey-gold font-bold tracking-widest uppercase text-sm mb-4 block">{t('premium_apiculture')}</span>
              <h1 className="font-headline text-5xl md:text-8xl font-bold text-white mb-6">Empowering <span className="text-gradient">{t('community')}</span></h1>
              <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
                {t('hero_description')}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Investment Program Highlights */}
        <section className="mb-32">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <span className="text-honey-gold font-bold tracking-widest uppercase text-sm block">Programu ya Uwekezaji</span>
              <h2 className="font-headline text-4xl md:text-6xl font-bold">Beekeeping Investment Program</h2>
              <p className="text-lg text-muted-foreground font-light leading-relaxed max-w-3xl">
                We actively promote investment opportunities in modern beekeeping and collaborate with respected institutions and organizations, including <strong>Tanzania Military Academy (TMA), Monduli, Arusha</strong>, <strong>Adorer Missionary</strong>, and government employees from various regions of Tanzania.
              </p>
              <div className="flex flex-wrap gap-4">
                 <div className="px-6 py-4 bg-honey-gold/5 rounded-2xl border border-honey-gold/10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-honey-gold flex items-center justify-center text-honey-dark font-bold text-xl">400+</div>
                    <div>
                       <p className="font-bold text-sm">Active Investors</p>
                       <p className="text-xs text-muted-foreground">Across the Republic</p>
                    </div>
                 </div>
                 <div className="px-6 py-4 bg-honey-gold/5 rounded-2xl border border-honey-gold/10 flex items-center gap-4">
                    <Handshake className="w-8 h-8 text-honey-gold" />
                    <div>
                       <p className="font-bold text-sm">Strategic Partners</p>
                       <p className="text-xs text-muted-foreground">Institutional Support</p>
                    </div>
                 </div>
              </div>
            </div>
            <div className="bg-honey-dark rounded-[3rem] p-10 text-white flex flex-col justify-center">
              <h4 className="font-headline text-2xl font-bold mb-6 text-honey-gold">Join the Future</h4>
              <p className="text-sm text-white/60 mb-8 leading-relaxed">Through these partnerships, we support sustainable agriculture, environmental conservation, economic empowerment, and long-term growth.</p>
              <Button asChild className="bg-honey-gold text-honey-dark hover:bg-honey-amber rounded-xl font-bold w-full h-12">
                <Link href="/contact">Inquire About Investing</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Core Services */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-honey-gold font-bold tracking-widest uppercase text-sm mb-4 block">Sustainable Apiculture</span>
            <h2 className="font-headline text-4xl md:text-6xl font-bold mb-8">Professional Solutions</h2>
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed font-light">
              <p>
                Alvena Bees Investment provides a comprehensive ecosystem for both novice and commercial beekeepers. Based in Arusha, we focus on modernizing traditional practices through technology and sustainable education.
              </p>
              <div className="space-y-4">
                {[
                  "Supply of high-grade stainless steel extractors",
                  "Distribution of protective gear (Full Bee Suits)",
                  "Custom hive management consultations",
                  "Organic honey harvesting workshops"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-honey-gold shrink-0" />
                    <span className="text-base text-foreground font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <Button asChild className="mt-12 bg-honey-gold text-honey-dark hover:bg-honey-amber rounded-xl px-10 h-14 font-bold shadow-xl shadow-honey-gold/20">
              <Link href="/shop">
                {t('explore_products')} <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-6"
          >
             <GlassCard className="p-8 border-honey-gold/10">
                <Sprout className="w-10 h-10 text-honey-gold mb-6" />
                <h4 className="font-headline text-xl font-bold mb-2">{t('sustainable')}</h4>
                <p className="text-sm text-muted-foreground font-light">Eco-friendly harvesting techniques that protect the colony.</p>
             </GlassCard>
             <GlassCard className="p-8 border-honey-gold/10">
                <ShieldCheck className="w-10 h-10 text-honey-gold mb-6" />
                <h4 className="font-headline text-xl font-bold mb-2">{t('quality')}</h4>
                <p className="text-sm text-muted-foreground font-light">Meeting the highest standards of safety and purity.</p>
             </GlassCard>
             <div className="col-span-2 relative h-80 rounded-3xl overflow-hidden mt-6">
                <Image
                  src="https://orbituniverse.co.tz/images/alvena/bee%20suit.png"
                  alt="Training"
                  fill
                  className="object-contain bg-muted/20"
                />
             </div>
          </motion.div>
        </div>

        {/* Regional Impact */}
        <section className="bg-honey-gold/5 rounded-[3rem] p-12 md:p-24 text-center">
          <div className="max-w-3xl mx-auto">
             <MapPin className="w-12 h-12 text-honey-gold mx-auto mb-8" />
             <h2 className="font-headline text-4xl md:text-6xl font-bold mb-8">Serving Arusha & Beyond</h2>
             <p className="text-lg text-muted-foreground font-light mb-12">
               Operating from our regional hub in <strong>Sombetini JR, Arusha</strong>, we serve the northern safari circuit and Singida's pristine honey regions.
             </p>
             <div className="flex flex-col sm:flex-row justify-center gap-8">
                <div className="p-6 bg-white rounded-2xl shadow-sm border border-honey-gold/10">
                   <div className="text-3xl font-headline font-bold text-honey-gold">12K+</div>
                   <div className="text-xs uppercase tracking-widest font-bold text-muted-foreground">{t('beehives_distributed')}</div>
                </div>
                <div className="p-6 bg-white rounded-2xl shadow-sm border border-honey-gold/10">
                   <div className="text-3xl font-headline font-bold text-honey-gold">735+</div>
                   <div className="text-xs uppercase tracking-widest font-bold text-muted-foreground">{t('farmers_trained')}</div>
                </div>
             </div>
          </div>
        </section>
      </div>
    </div>
  );
}
