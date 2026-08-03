"use client";

import { motion } from "framer-motion";
import { Compass, Zap, Users, Crown } from "lucide-react";

const BADGES = [
  { 
    icon: Compass, 
    title: "Bespoke Journeys", 
    desc: "Tailored to your specific wildlife and adventure goals" 
  },
  { 
    icon: Zap, 
    title: "Private Logistics", 
    desc: "Exclusive 4x4 fleet and seamless bush flight transfers" 
  },
  { 
    icon: Users, 
    title: "Expert Guiding", 
    desc: "Elite naturalists born and raised in the heart of Tanzania" 
  },
  { 
    icon: Crown, 
    title: "Signature Stays", 
    desc: "Hand-picked luxury lodges and elite safari camps" 
  },
];

export const TrustBadges = () => {
  return (
    <section className="py-24 px-6 md:px-12 bg-safari-white border-y border-safari-sand/30">
      <div className="max-w-[1800px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-12">
        {BADGES.map((badge, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center text-center gap-4 group"
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-secondary group-hover:bg-primary group-hover:text-white transition-all duration-500 mb-2">
              <badge.icon className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xs font-space font-bold uppercase tracking-widest text-primary mb-1">{badge.title}</h4>
              <p className="text-[10px] text-muted-foreground font-light uppercase tracking-tighter max-w-[200px]">{badge.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
