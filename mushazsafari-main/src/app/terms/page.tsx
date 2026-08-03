"use client";

import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-40 pb-24 px-6 md:px-12 lg:px-24 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-[11px] font-space font-bold text-secondary uppercase tracking-[0.5em] mb-4 block">Legal Framework</span>
          <h1 className="text-5xl md:text-7xl font-serif text-primary mb-12">Terms of <span className="italic">Service</span></h1>
          
          <div className="space-y-10 text-muted-foreground font-light leading-relaxed text-lg">
            <section className="space-y-4">
              <h2 className="text-2xl font-serif text-primary font-bold">1. Introduction</h2>
              <p>
                Welcome to Mushaz Safari. These Terms of Service govern your use of our website and our professional safari services. By engaging with our brand, you agree to comply with these refined standards of luxury and conduct.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-serif text-primary font-bold">2. Bespoke Bookings</h2>
              <p>
                All itineraries crafted by Mushaz Safari are custom-engineered. A booking is confirmed only upon receipt of the specified luxury deposit and our formal issuance of an expedition voucher.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-serif text-primary font-bold">3. Financial Commitments</h2>
              <p>
                Payment for signature experiences must be settled according to the schedule provided in your bespoke quotation. We accept premium wire transfers and major international credit facilities.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-serif text-primary font-bold">4. Cancellations & Refunds</h2>
              <p>
                As our journeys often involve non-refundable commitments to elite lodges and remote camps, cancellations are subject to our tiered refund policy as detailed in your specific expedition contract.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-serif text-primary font-bold">5. Liability & Insurance</h2>
              <p>
                While Mushaz Safari maintains the highest safety protocols, travel in the African wilderness carries inherent risks. Comprehensive travel and medical insurance are mandatory requirements for all guests.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-serif text-primary font-bold">6. Governing Law</h2>
              <p>
                These terms are governed by the laws of the United Republic of Tanzania. Any disputes shall be settled with the refined professionalism expected of Arusha's premier travel house.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
