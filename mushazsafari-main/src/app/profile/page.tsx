"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Instagram, 
  Youtube, 
  Globe, 
  ArrowRight,
  ShieldCheck,
  Award,
  Zap,
  Sprout,
  User,
  TrendingUp,
  Handshake,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { mediaFor } from "@/lib/media";

export default function CompanyProfile() {
  const logoUrl = mediaFor("miale-logo").src;
  
  const getImage = (id: string) => mediaFor(id).src;

  return (
    <div className="min-h-screen bg-[#FFF8E7] font-body text-[#111111] overflow-x-hidden selection:bg-honey-gold selection:text-honey-dark">
      
      {/* 1. HEADER / HERO SECTION */}
      <section className="relative min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="absolute inset-0 z-0">
          <Image 
            src={getImage('about-arusha')} 
            alt="Miale Professional" 
            fill 
            className="object-cover"
            priority 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-[#FFF8E7]" />
        </div>

        <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-10" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill-rule='evenodd' stroke='%23F4B400' fill='none'/%3E%3C/svg%3E")`, backgroundSize: '80px' }} 
        />

        <div className="relative z-20 max-w-5xl mx-auto flex flex-col items-center">
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="p-4 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 mb-12"
          >
            <Image src={logoUrl} alt="Miale Logo" width={180} height={90} className="object-contain" />
          </motion.div>

          <motion.h1 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-headline text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none mb-6 drop-shadow-2xl"
          >
            MIALE <br /> <span className="text-honey-gold">INVESTMENT</span>
          </motion.h1>

          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-white/80 text-lg md:text-2xl font-light tracking-[0.2em] uppercase mb-12"
          >
            Elite Travel Design and Modern Apiculture Solutions
          </motion.p>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <Button asChild className="rounded-full bg-honey-gold text-honey-dark hover:bg-honey-amber h-16 px-16 text-xl font-bold shadow-2xl shadow-honey-gold/30 group">
              <Link href="/contact" className="flex items-center gap-3">
                CONNECT WITH US <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* 2. ABOUT SECTION */}
      <section className="py-32 px-6 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }} 
            className="space-y-8"
          >
            <span className="text-honey-gold font-bold tracking-[0.4em] uppercase text-xs">Kuhusu Sisi</span>
            <h2 className="font-headline text-5xl md:text-7xl font-bold leading-tight uppercase">
              KARIBU <br /><span className="text-gradient">MIALE</span>
            </h2>
            <div className="space-y-6">
              <p className="text-xl md:text-2xl font-light text-muted-foreground leading-relaxed italic border-l-4 border-honey-gold/30 pl-8">
                "MIALE ni kampuni inayojishughulisha na uzalishaji na uuzaji wa mazao yote ya nyuki yenye ubora wa hali ya juu, pamoja na kutoa huduma za safari za kifahari nchini Tanzania."
              </p>
              <div className="bg-honey-gold/5 p-8 rounded-3xl border border-honey-gold/10">
                <h4 className="font-bold text-honey-gold uppercase tracking-widest text-sm mb-3">The Miale Promise</h4>
                <p className="text-lg font-light leading-relaxed">
                  <strong>Purity and Elegance from the heart of Arusha.</strong><br />
                  Whether sourcing premium organic honey from Singida or designing a bespoke expedition across the Serengeti, Miale stands for quality, authenticity, and unparalleled service.
                </p>
              </div>
            </div>
          </motion.div>
          <div className="relative">
            <div className="relative h-[650px] w-full rounded-[4rem] overflow-hidden shadow-2xl border-[12px] border-[#FFF8E7]">
              <Image src={getImage('pure-honey')} alt="Miale Standard" fill className="object-cover" />
            </div>
            <div className="absolute -bottom-10 -left-10 bg-honey-gold p-10 rounded-[3rem] shadow-2xl max-w-[280px] rotate-[-5deg]">
              <ShieldCheck className="w-14 h-14 text-honey-dark mb-4" />
              <p className="text-sm font-bold text-honey-dark uppercase tracking-widest leading-relaxed">
                Guaranteed Quality Standards from Arusha, Tanzania.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PARTNERSHIP SECTION */}
      <section className="py-32 px-6 bg-[#111111] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-honey-gold/10 rounded-full blur-[150px] -mr-[400px] -mt-[400px]" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row gap-20 items-center">
            <div className="flex-1 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-honey-gold/10 border border-honey-gold/20 text-honey-gold text-xs font-bold uppercase tracking-[0.2em]">
                <TrendingUp className="w-4 h-4" /> Impact
              </div>
              <h2 className="font-headline text-5xl md:text-7xl font-bold leading-tight">
                MIALE <br /> <span className="text-honey-gold">COMMUNITY NETWORK</span>
              </h2>
              <p className="text-xl text-white/70 font-light leading-relaxed">
                Through our beekeeping investment program and local safari guiding, we actively empower Tanzanian communities and support sustainable environmental conservation.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 hover:bg-honey-gold/10 transition-colors">
                  <div className="text-5xl font-black text-honey-gold mb-2">500+</div>
                  <div className="text-xs uppercase font-bold tracking-widest text-white/50">Stakeholders</div>
                  <p className="mt-4 text-sm text-white/60 font-light">Join our growing ecosystem of investors and local partners participating in our regional growth initiatives.</p>
                </div>
                <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10">
                  <div className="flex -space-x-4 mb-6">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-12 h-12 rounded-full border-2 border-[#111] bg-honey-gold/20 flex items-center justify-center">
                        <User className="w-6 h-6 text-honey-gold" />
                      </div>
                    ))}
                  </div>
                  <p className="text-sm font-bold text-honey-gold uppercase tracking-widest">Network Impact</p>
                  <p className="text-xs text-white/40 mt-1 uppercase">Fostering biodiversity & growth</p>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-[450px] space-y-6">
              <div className="bg-honey-gold p-12 rounded-[3.5rem] text-honey-dark">
                <h4 className="font-headline text-3xl font-bold mb-8 flex items-center gap-3">
                  <Handshake className="w-8 h-8" />
                  Key Partners
                </h4>
                <div className="space-y-6">
                  {[
                    { name: "Tanzania Military Academy (TMA)", loc: "Monduli, Arusha" },
                    { name: "Adorer Missionary", loc: "Tanzania" },
                    { name: "Government Employees", loc: "Various Regions" }
                  ].map((p, i) => (
                    <div key={i} className="border-b border-honey-dark/10 pb-4">
                      <p className="font-black text-lg leading-tight">{p.name}</p>
                      <p className="text-xs font-bold uppercase tracking-widest opacity-60">{p.loc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER SECTION */}
      <footer className="bg-[#111111] py-24 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="p-4 bg-white rounded-3xl">
               <Image src={logoUrl} alt="Miale Logo" width={120} height={60} className="object-contain" />
            </div>
            <div className="text-center md:text-left">
               <p className="text-honey-gold font-headline italic text-3xl mb-2">
                 “Excellence in every journey, purity in every harvest.”
               </p>
               <p className="text-white/40 text-xs font-bold uppercase tracking-[0.4em]">
                  MIALE © 2026 ALL RIGHTS RESERVED
               </p>
            </div>
          </div>

          <div className="flex gap-6">
             {[
               { Icon: Instagram, href: "https://instagram.com/mialesafari?utm_source=qr&igsh=dTF5ZnlzMXdkbDhn" },
               { Icon: Youtube, href: "#" }
             ].map((social, i) => (
                <a 
                  key={i} 
                  href={social.href} 
                  className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-honey-gold hover:text-honey-dark transition-all"
                >
                  <social.Icon className="w-6 h-6" />
                </a>
             ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
