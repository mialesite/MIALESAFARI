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
                At Miale Safaris we treat your personal data with the same care as the rest of your trip. This page sets out what we collect, why we collect it and who sees it.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-serif text-primary font-bold">2. Information Collection</h2>
              <p>
                We collect the information needed to plan and run your trip: contact details, party size, dietary and
                health requirements, and passport details where park permits or visas require them.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-serif text-primary font-bold">3. Data Usage</h2>
              <p>
                Your information is used to prepare and operate your itinerary, and to meet the requirements of the
                parks, camps and insurers involved. We do not sell it to third parties.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-serif text-primary font-bold">4. Security Protocols</h2>
              <p>
                Data is held in access-controlled systems and sent over encrypted connections. No method of transmission
                over the internet is completely secure, so we cannot guarantee absolute security, but access is limited
                to the staff who need your details to run the trip.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-serif text-primary font-bold">5. Cookies & Analytics</h2>
              <p>
                This site uses cookies and local storage to remember your preferences and to understand which pages are read. That information stays with us and is not sold.
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
