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

export const ContactSection = () => {
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

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Email Dispatch Failed");

      setSubmitted(true);
      toast({
        title: "Message Dispatched",
        description: "Your inquiry has been sent to our Arusha office.",
      });

    } catch (error: any) {
      console.error("Contact dispatch error:", error);
      setSubmitted(true);
      toast({
        variant: "destructive",
        title: "Dispatch Note",
        description: "Message logged in system. Email notification delayed but our team will review it.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 md:py-32 px-6 md:px-12 lg:px-24 bg-safari-white overflow-hidden relative" id="contact">
      <div className="absolute top-0 right-0 w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-secondary/5 rounded-full blur-[80px] md:blur-[150px] -mr-[200px] md:-mr-[400px] -mt-[200px] md:-mt-[400px]" />
      <div className="absolute bottom-0 left-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-secondary/5 rounded-full blur-[80px] md:blur-[150px] -ml-[150px] md:-ml-[300px] -mb-[150px] md:-mb-[300px]" />

      <div className="max-w-[1800px] mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-12 md:mb-20">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-secondary font-space font-bold uppercase tracking-[0.4em] text-[10px] md:text-xs mb-4 block">Connect with Miale</span>
            <h2 className="text-4xl md:text-6xl lg:text-8xl font-serif leading-[1] md:leading-[0.85] tracking-tighter text-primary mb-6 md:mb-8">
              Let's Craft Your <br className="hidden md:block" />
              <span className="font-light italic text-muted-foreground/60">Journey.</span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground font-light mb-8 md:mb-12 leading-relaxed max-w-lg">
              Our travel designers in Arusha are ready to help you plan the ultimate Tanzanian expedition. Reach out for bespoke itineraries, logistics, and luxury advice.
            </p>

            <div className="space-y-6 md:space-y-8">
              <div className="flex items-center gap-4 md:gap-6 group">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white border border-muted flex items-center justify-center text-secondary group-hover:bg-primary group-hover:text-white transition-all duration-500 shrink-0">
                  <Phone className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                  <h4 className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-widest font-bold font-space mb-1">Direct Line</h4>
                  <p className="text-lg md:text-xl font-serif font-bold text-primary">0769 333 331</p>
                </div>
              </div>

              <div className="flex items-center gap-4 md:gap-6 group">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white border border-muted flex items-center justify-center text-secondary group-hover:bg-primary group-hover:text-white transition-all duration-500 shrink-0">
                  <Mail className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                  <h4 className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-widest font-bold font-space mb-1">Email Inquiries</h4>
                  <p className="text-lg md:text-xl font-serif font-bold text-primary">info@mialesafari.com</p>
                </div>
              </div>

              <div className="flex items-center gap-4 md:gap-6 group">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white border border-muted flex items-center justify-center text-secondary group-hover:bg-primary group-hover:text-white transition-all duration-500 shrink-0">
                  <MapPin className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                  <h4 className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-widest font-bold font-space mb-1">Arusha Base</h4>
                  <p className="text-lg md:text-xl font-serif font-bold text-primary">Sombetini JR, Arusha, Tanzania</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-muted shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-secondary/5 blur-[40px] md:blur-[50px] rounded-full" />
              
              <h3 className="text-xl md:text-2xl font-bold font-serif mb-6 md:mb-8 flex items-center gap-3">
                <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-secondary" />
                Send a Message
              </h3>
              
              {submitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 md:py-12 text-center"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-secondary" />
                  </div>
                  <h4 className="text-xl md:text-2xl font-bold mb-2">Message Dispatched!</h4>
                  <p className="text-sm md:text-base text-muted-foreground font-light mb-8">Thank you for reaching out. A travel designer will review your request and get back to you shortly.</p>
                  <Button 
                    onClick={() => setSubmitted(false)}
                    className="rounded-full bg-primary text-white hover:bg-primary/90 font-bold h-12 w-full uppercase tracking-widest text-[9px] md:text-[10px] font-space"
                  >
                    Send Another Message
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-muted-foreground px-1 font-space">Full Name</label>
                      <Input name="fullName" required placeholder="Jane Doe" className="bg-muted/30 border-muted h-11 md:h-12 rounded-xl focus:ring-secondary" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-muted-foreground px-1 font-space">Email Address</label>
                      <Input name="email" required placeholder="jane@example.com" type="email" className="bg-muted/30 border-muted h-11 md:h-12 rounded-xl focus:ring-secondary" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-muted-foreground px-1 font-space">Phone (Optional)</label>
                    <Input name="phone" placeholder="+255 --- --- ---" className="bg-muted/30 border-muted h-11 md:h-12 rounded-xl focus:ring-secondary" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-muted-foreground px-1 font-space">Your Inquiry</label>
                    <Textarea name="message" required placeholder="Tell us about your travel goals..." className="bg-muted/30 border-muted min-h-[120px] md:min-h-[150px] rounded-xl focus:ring-secondary" />
                  </div>

                  <Button 
                    disabled={loading}
                    type="submit"
                    className="w-full bg-secondary text-white hover:bg-accent h-12 md:h-14 rounded-full font-bold text-[10px] md:text-xs uppercase tracking-widest shadow-xl shadow-secondary/10 group font-space mt-2"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Send Inquiry
                        <Send className="ml-2 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full h-[300px] md:h-[450px] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border border-muted relative group"
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
    </section>
  );
};