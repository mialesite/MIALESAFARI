"use client";

import { motion } from "framer-motion";
import { Compass, MapPin, FileText, BadgeCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const BADGES = [
  {
    icon: Compass,
    titleKey: "badge1.title",
    descKey: "badge1.desc"
  },
  {
    icon: MapPin,
    titleKey: "badge2.title",
    descKey: "badge2.desc"
  },
  {
    icon: FileText,
    titleKey: "badge3.title",
    descKey: "badge3.desc"
  },
  {
    icon: BadgeCheck,
    titleKey: "badge4.title",
    descKey: "badge4.desc"
  },
];

export const TrustBadges = () => {
  const { t } = useLanguage();
  return (
    <section className="py-16 md:py-20 px-6 md:px-12 bg-safari-white border-y border-safari-sand/30">
      <div className="max-w-[1800px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
        {BADGES.map((badge, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center text-center group"
          >
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-secondary group-hover:bg-primary group-hover:text-white transition-all duration-500 mb-4">
              <badge.icon className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-[11px] font-space font-bold uppercase tracking-[0.2em] text-primary mb-2">{t(badge.titleKey)}</h4>
              <p className="text-[13px] leading-relaxed text-muted-foreground font-light max-w-[240px]">{t(badge.descKey)}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
