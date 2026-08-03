
"use client";

import { motion } from "framer-motion";
import { Users, Droplets, MapPin, TreePine } from "lucide-react";
import { useTranslation } from "@/context/LanguageCurrencyContext";

export const ImpactTracker = () => {
  const { t } = useTranslation();

  const STATS = [
    { label: t('farmers_trained'), val: "735", icon: Users },
    { label: t('beehives_distributed'), val: "12,254", icon: MapPin },
    { label: "Sustainable Products", val: "8,725", icon: Droplets },
    { label: t('community_impact'), val: "3,137", icon: TreePine },
  ];

  return (
    <section className="py-24 px-6 relative overflow-hidden bg-background" id="impact">
      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-honey-gold/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <span className="text-honey-gold font-bold tracking-widest uppercase text-sm mb-4 block">{t('sustainable')}</span>
          <h2 className="font-headline text-4xl md:text-6xl font-bold">{t('environmental_impact')}</h2>
          <p className="text-muted-foreground mt-6 text-lg max-w-2xl mx-auto font-light">
            {t('impact_desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass p-8 rounded-3xl text-center flex flex-col items-center group hover:border-honey-gold/40 transition-all shadow-xl"
            >
              <div className="w-16 h-16 rounded-full bg-honey-gold/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <stat.icon className="w-8 h-8 text-honey-gold" />
              </div>
              <div className="text-4xl font-headline font-bold text-foreground mb-2 tracking-tight">
                {stat.val}
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-widest font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
