"use client";

import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Send, Loader2, CheckCircle2, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export default function ContactPage() {
  const db = useFirestore();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      fullName: formData.get("fullName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      message: formData.get("message") as string,
    };

    try {
      const messagesRef = collection(db, "messages");

      // No-await Firestore mutation following performance guidelines
      addDoc(messagesRef, {
        ...data,
        createdAt: serverTimestamp(),
      }).catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: messagesRef.path,
          operation: 'create',
          requestResourceData: data,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });

      // Trigger Email Notification Relay
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("SMTP Relay Failed");
      }

      setSubmitted(true);
      toast({
        title: "Inquiry Received!",
        description: "Your message has been sent to info@mialesafari.com.",
      });

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: "Could not dispatch email. However, your message was logged in our system.",
      });
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 bg-background overflow-hidden relative">
      <Navbar />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-honey-gold/5 rounded-full blur-[150px] -mr-[400px] -mt-[400px]" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-honey-gold/5 rounded-full blur-[150px] -ml-[300px] -mb-[300px]" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-20">

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-honey-gold font-bold tracking-widest uppercase text-sm mb-4 block">Connect with Miale</span>
            <h1 className="font-headline text-5xl md:text-7xl font-bold mb-8">Let's Craft Your <span className="text-gradient">Journey</span></h1>
            <p className="text-lg text-muted-foreground font-light mb-12 leading-relaxed">
              Our travel designers in Arusha are ready to help you plan the ultimate Tanzanian expedition. Reach out for bespoke itineraries, logistics, and luxury advice.
            </p>

            <div className="space-y-8">
              <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center text-honey-gold group-hover:bg-honey-gold group-hover:text-honey-dark transition-all">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm text-muted-foreground uppercase tracking-widest font-medium mb-1">Direct Lines</h4>
                  <p className="text-xl font-bold">+255 769 333 331</p>
                  <p className="text-sm font-bold text-honey-gold">+44 7769 202031</p>
                </div>
              </div>

              <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center text-honey-gold group-hover:bg-honey-gold group-hover:text-honey-dark transition-all">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm text-muted-foreground uppercase tracking-widest font-medium mb-1">Email Inquiries</h4>
                  <p className="text-xl font-bold">info@mialesafari.com</p>
                </div>
              </div>

              <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center text-honey-gold group-hover:bg-honey-gold group-hover:text-honey-dark transition-all">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm text-muted-foreground uppercase tracking-widest font-medium mb-1">Arusha Base</h4>
                  <p className="text-xl font-bold">Sombetini JR, Arusha, Tanzania</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="glass p-10 rounded-[3rem] border-border/50 shadow-2xl relative overflow-hidden bg-white/40 backdrop-blur-3xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-honey-gold/10 blur-[50px] rounded-full" />

              <h3 className="text-2xl font-bold font-headline mb-8 flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-honey-gold" />
                Send a Message
              </h3>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center"
                >
                  <div className="w-20 h-20 bg-honey-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-honey-gold" />
                  </div>
                  <h4 className="text-2xl font-bold mb-2">Message Sent!</h4>
                  <p className="text-muted-foreground font-light mb-8">Thank you for reaching out. A consultant will review your request and get back to you shortly.</p>
                  <Button asChild className="rounded-xl bg-honey-gold text-honey-dark hover:bg-honey-amber font-bold h-12 w-full">
                    <Link href="/">Return to Home</Link>
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground px-1">Full Name</label>
                      <Input name="fullName" required placeholder="Jane Doe" className="bg-white/50 border-border h-12 rounded-xl focus:ring-honey-gold" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground px-1">Email Address</label>
                      <Input name="email" required placeholder="jane@example.com" type="email" className="bg-white/50 border-border h-12 rounded-xl focus:ring-honey-gold" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground px-1">Phone (Optional)</label>
                    <Input name="phone" placeholder="+255 --- --- ---" className="bg-white/50 border-border h-12 rounded-xl focus:ring-honey-gold" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground px-1">Your Inquiry</label>
                    <Textarea name="message" required placeholder="Tell us about your travel goals..." className="bg-white/50 border-border min-h-[150px] rounded-xl focus:ring-honey-gold" />
                  </div>

                  <Button
                    disabled={loading}
                    type="submit"
                    className="w-full bg-honey-gold text-honey-dark hover:bg-honey-amber h-14 rounded-xl font-bold text-lg shadow-xl shadow-honey-gold/20 group"
                  >
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        Send Inquiry
                        <Send className="ml-2 w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </div>

        {/* Map Integration */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full h-[450px] rounded-[3rem] overflow-hidden shadow-2xl border border-border/50 relative group"
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3982.8405472365057!2d36.65972407548163!3d-3.3890876965855155!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x18371d732584d27d%3A0x6a57dbd479364848!2sMushaz%20safari!5e0!3m2!1sen!2stz!4v1783705048418!5m2!1sen!2stz"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Miale Office"
          ></iframe>
        </motion.div>
      </div>
    </div>
  );
}
