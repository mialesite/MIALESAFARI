"use client";

import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-40 pb-24 px-6 md:px-12 lg:px-24 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-[11px] font-space font-bold text-secondary uppercase tracking-[0.5em] mb-4 block">Data Protection</span>
          <h1 className="text-5xl md:text-7xl font-serif text-primary mb-12">Privacy <span className="italic">Policy</span></h1>
          
          <div className="space-y-10 text-muted-foreground font-light leading-relaxed text-lg">
            <section className="space-y-4">
              <h2 className="text-2xl font-serif text-primary font-bold">1. Our Commitment</h2>
              <p>
                At Mushaz Safari, we treat your personal data with the same discretion and care as we do your private safari. Your privacy is paramount to our standard of service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-serif text-primary font-bold">2. Information Collection</h2>
              <p>
                We collect information essential to crafting your bespoke itinerary, including dietary preferences, health requirements, and passport details for permit acquisition.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-serif text-primary font-bold">3. Data Usage</h2>
              <p>
                Your information is used exclusively to facilitate your Tanzanian expedition. We do not sell your data to third-party marketing entities; it remains within our secure elite network.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-serif text-primary font-bold">4. Security Protocols</h2>
              <p>
                We employ high-end digital encryption and internal access controls to protect your data from unauthorized intrusion, ensuring your personal history remains private.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-serif text-primary font-bold">5. Cookies & Analytics</h2>
              <p>
                Our digital platform uses subtle cookies to enhance your browsing experience and analyze our market performance, ensuring Mushaz Safari remains the benchmark of luxury.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-serif text-primary font-bold">6. Your Rights</h2>
              <p>
                You retain the right to request access to or deletion of your personal data at any time. Simply contact our Arusha headquarters to exercise your privacy prerogatives.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
