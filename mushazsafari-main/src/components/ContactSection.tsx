"use client";

import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Send, Loader2, CheckCircle2, MessageSquare, MessageCircle, ArrowUpRight, AlertCircle, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";
import { useLanguage } from "@/context/LanguageContext";

const WHATSAPP_HREF = "https://wa.me/255769333331";
const MAPS_DIRECTIONS_HREF = "https://www.google.com/maps/search/?api=1&query=Miale%20Safari%20Sombetini%20Arusha";

export const ContactSection = () => {
  const db = useFirestore();
  const { lang, t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [attempt, setAttempt] = useState<{ fullName: string; email: string; phone: string; travelWindow: string; partySize: string; message: string } | null>(null);
  const { toast } = useToast();

  // Travel-month options start from the visitor's current month, filled after
  // mount so the prerendered HTML and the hydrated page always agree.
  // The stored value stays English so inquiries read the same at the desk.
  const [monthOptions, setMonthOptions] = useState<{ value: string; label: string }[]>([]);
  useEffect(() => {
    const now = new Date();
    const valueFormatter = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });
    const labelFormatter = new Intl.DateTimeFormat(lang === "sw" ? "sw-KE" : "en-GB", { month: "long", year: "numeric" });
    const out: { value: string; label: string }[] = [];
    for (let i = 0; i < 18; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      out.push({ value: valueFormatter.format(date), label: labelFormatter.format(date) });
    }
    setMonthOptions(out);
  }, [lang]);

  const directMailHref = useMemo(() => {
    const subject = attempt ? `Website Inquiry from ${attempt.fullName}` : "Website Inquiry";
    const body = attempt
      ? [
          attempt.message,
          "",
          attempt.fullName,
          attempt.email,
          attempt.phone,
          attempt.travelWindow ? `Travel window: ${attempt.travelWindow}` : "",
          attempt.partySize ? `Party size: ${attempt.partySize}` : "",
        ].filter(Boolean).join("\n")
      : "";
    return `mailto:info@mialesafari.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [attempt]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      fullName: formData.get("fullName") as string,
      email: formData.get("email") as string,
      phone: (formData.get("phone") as string) || "",
      travelWindow: (formData.get("travelWindow") as string) || "",
      partySize: (formData.get("partySize") as string) || "",
      message: formData.get("message") as string,
    };
    setAttempt(data);

    // The inquiry record is what makes a message recoverable, so it is awaited
    // before anything is confirmed to the visitor.
    const messagesRef = collection(db, "messages");
    let stored = false;
    try {
      await addDoc(messagesRef, {
        ...data,
        createdAt: serverTimestamp(),
      });
      stored = true;
    } catch (error) {
      const permissionError = new FirestorePermissionError({
        path: messagesRef.path,
        operation: 'create',
        requestResourceData: data,
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    }

    // Office notification only. A mail-server fault is internal and is never
    // shown to the visitor as a failure of their inquiry.
    let notified = false;
    if (stored) {
      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const body = await response.json().catch(() => null);
        notified = Boolean(body?.emailSent);
      } catch {
        notified = false;
      }
    }

    setSaved(stored);
    setEmailSent(notified);
    setSubmitted(stored);

    if (stored) {
      toast({
        title: t("ct.toastTitle"),
        description: t("ct.toastBody"),
      });
    } else {
      toast({
        variant: "destructive",
        title: t("ct.toastFailTitle"),
        description: t("ct.toastFailBody"),
      });
    }
    setLoading(false);
  };

  return (
    <section className="bg-safari-white overflow-hidden relative" id="contact">
      <div className="py-20 md:py-24 px-6 md:px-12 lg:px-24 relative">
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
            <span className="text-secondary font-space font-bold uppercase tracking-[0.4em] text-[10px] md:text-xs mb-4 block">{t("ct.eyebrow")}</span>
            <h2 className="text-4xl md:text-6xl lg:text-8xl font-serif leading-[1] md:leading-[0.85] tracking-tighter text-primary mb-6 md:mb-8">
              {t("ct.title")} <br className="hidden md:block" />
              <span className="font-light italic text-muted-foreground/60">{t("ct.titleAccent")}</span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground font-light mb-8 md:mb-12 leading-relaxed max-w-lg">
              {t("ct.body")}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <a href="tel:+255769333331" className="group rounded-2xl bg-white border border-muted/70 p-5 flex items-start gap-4 hover:border-secondary/60 hover:shadow-lg hover:shadow-secondary/10 hover:-translate-y-0.5 transition-all duration-500">
                <div className="w-11 h-11 rounded-full bg-secondary/10 ring-1 ring-secondary/25 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white group-hover:ring-secondary transition-all duration-500 shrink-0">
                  <Phone className="w-[18px] h-[18px]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold font-space mb-1">{t("ct.directLines")}</h4>
                  <p className="text-base font-serif font-bold text-primary leading-snug">+255 769 333 331</p>
                  <p className="text-xs font-serif font-bold text-secondary leading-snug">+44 7769 202031</p>
                </div>
                <ArrowUpRight className="ml-auto w-4 h-4 text-secondary opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-500" />
              </a>

              <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" className="group rounded-2xl bg-white border border-muted/70 p-5 flex items-start gap-4 hover:border-secondary/60 hover:shadow-lg hover:shadow-secondary/10 hover:-translate-y-0.5 transition-all duration-500">
                <div className="w-11 h-11 rounded-full bg-secondary/10 ring-1 ring-secondary/25 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white group-hover:ring-secondary transition-all duration-500 shrink-0">
                  <MessageCircle className="w-[18px] h-[18px]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold font-space mb-1">{t("ct.whatsapp")}</h4>
                  <p className="text-base font-serif font-bold text-primary leading-snug">+255 769 333 331</p>
                </div>
                <ArrowUpRight className="ml-auto w-4 h-4 text-secondary opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-500" />
              </a>

              <a href="mailto:info@mialesafari.com" className="group rounded-2xl bg-white border border-muted/70 p-5 flex items-start gap-4 hover:border-secondary/60 hover:shadow-lg hover:shadow-secondary/10 hover:-translate-y-0.5 transition-all duration-500">
                <div className="w-11 h-11 rounded-full bg-secondary/10 ring-1 ring-secondary/25 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white group-hover:ring-secondary transition-all duration-500 shrink-0">
                  <Mail className="w-[18px] h-[18px]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold font-space mb-1">{t("ct.emailInquiries")}</h4>
                  <p className="text-base font-serif font-bold text-primary group-hover:text-secondary transition-colors break-all leading-snug">info@mialesafari.com</p>
                </div>
                <ArrowUpRight className="ml-auto w-4 h-4 text-secondary opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-500 shrink-0" />
              </a>

              <a href={MAPS_DIRECTIONS_HREF} target="_blank" rel="noopener noreferrer" className="group rounded-2xl bg-white border border-muted/70 p-5 flex items-start gap-4 hover:border-secondary/60 hover:shadow-lg hover:shadow-secondary/10 hover:-translate-y-0.5 transition-all duration-500">
                <div className="w-11 h-11 rounded-full bg-secondary/10 ring-1 ring-secondary/25 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white group-hover:ring-secondary transition-all duration-500 shrink-0">
                  <MapPin className="w-[18px] h-[18px]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold font-space mb-1">{t("ct.arushaBase")}</h4>
                  <p className="text-base font-serif font-bold text-primary leading-snug">Sombetini JR, Arusha</p>
                </div>
                <ArrowUpRight className="ml-auto w-4 h-4 text-secondary opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-500" />
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-muted/70 shadow-2xl shadow-primary/5 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6 md:mb-8">
                <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-secondary shrink-0" />
                <h3 className="text-xl md:text-2xl font-bold font-serif whitespace-nowrap">{t("ct.formTitle")}</h3>
                <span className="flex-1 h-px bg-gradient-to-r from-secondary/40 to-transparent ml-1" aria-hidden="true" />
              </div>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 md:py-12 text-center"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-secondary" />
                  </div>
                  <h4 className="text-xl md:text-2xl font-bold mb-2">{t("ct.successTitle")}</h4>
                  <p className="text-sm md:text-base text-muted-foreground font-light mb-6">{t("ct.successBody")}</p>

                  {!emailSent && (
                    <div className="mb-6 rounded-2xl border border-muted bg-muted/30 p-4 text-left">
                      <p className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-muted-foreground font-space mb-2">{t("ct.reachNow")}</p>
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={directMailHref}
                          className="inline-flex items-center gap-2 rounded-full bg-primary text-white px-4 h-9 text-[9px] md:text-[10px] font-space font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          {t("ct.emailDirectly")}
                        </a>
                        <a
                          href="https://wa.me/255769333331"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-primary/20 px-4 h-9 text-[9px] md:text-[10px] font-space font-bold uppercase tracking-widest hover:bg-primary/5 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {t("ct.whatsappUs")}
                        </a>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => {
                      setSubmitted(false);
                      setSaved(false);
                      setEmailSent(false);
                      setAttempt(null);
                    }}
                    className="rounded-full bg-primary text-white hover:bg-primary/90 font-bold h-12 w-full uppercase tracking-widest text-[9px] md:text-[10px] font-space"
                  >
                    {t("ct.sendAnother")}
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                  {!saved && attempt && (
                    <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
                      <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground font-light leading-relaxed">
                        {t("ct.failBannerPre")}{" "}
                        <a href={directMailHref} className="text-primary font-bold underline underline-offset-4">{t("ct.failBannerEmail")}</a>{" "}
                        {t("ct.failBannerOr")}{" "}
                        <a href="https://wa.me/255769333331" target="_blank" rel="noopener noreferrer" className="text-primary font-bold underline underline-offset-4">WhatsApp</a>{t("ct.failBannerPost")}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-muted-foreground px-1 font-space">{t("ct.fullName")}</label>
                      <Input name="fullName" required placeholder={t("ct.namePlaceholder")} className="bg-muted/40 border-muted/80 hover:border-secondary/50 h-11 md:h-12 rounded-xl focus:ring-secondary focus:border-secondary transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-muted-foreground px-1 font-space">{t("ct.emailAddress")}</label>
                      <Input name="email" required placeholder="you@example.com" type="email" className="bg-muted/40 border-muted/80 hover:border-secondary/50 h-11 md:h-12 rounded-xl focus:ring-secondary focus:border-secondary transition-colors" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-muted-foreground px-1 font-space">{t("ct.travelWindow")}</label>
                      <div className="relative">
                        <select
                          name="travelWindow"
                          className="w-full h-11 md:h-12 rounded-xl border border-muted/80 bg-muted/40 hover:border-secondary/50 pl-3 pr-10 text-sm appearance-none focus:ring-secondary focus:border-secondary focus:outline-none transition-colors"
                        >
                          <option value="">{t("ct.chooseMonth")}</option>
                          {monthOptions.map((m) => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-muted-foreground px-1 font-space">{t("ct.partySize")}</label>
                      <div className="relative">
                        <select
                          name="partySize"
                          className="w-full h-11 md:h-12 rounded-xl border border-muted/80 bg-muted/40 hover:border-secondary/50 pl-3 pr-10 text-sm appearance-none focus:ring-secondary focus:border-secondary focus:outline-none transition-colors"
                        >
                          <option value="">{t("ct.howMany")}</option>
                          <option value="1 traveller">{t("ct.party1")}</option>
                          <option value="2 travellers">{t("ct.party2")}</option>
                          <option value="3 to 4 travellers">{t("ct.party3to4")}</option>
                          <option value="5 to 6 travellers">{t("ct.party5to6")}</option>
                          <option value="7 or more travellers">{t("ct.party7plus")}</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-muted-foreground px-1 font-space">{t("ct.phone")}</label>
                    <Input name="phone" placeholder="+255 7XX XXX XXX" className="bg-muted/40 border-muted/80 hover:border-secondary/50 h-11 md:h-12 rounded-xl focus:ring-secondary focus:border-secondary transition-colors" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-muted-foreground px-1 font-space">{t("ct.inquiry")}</label>
                    <Textarea name="message" required placeholder={t("ct.inquiryPlaceholder")} className="bg-muted/40 border-muted/80 hover:border-secondary/50 min-h-[120px] md:min-h-[150px] rounded-xl focus:ring-secondary focus:border-secondary transition-colors" />
                  </div>

                  <Button
                    disabled={loading}
                    type="submit"
                    className="w-full bg-secondary text-white hover:bg-primary h-12 md:h-14 rounded-full font-bold text-[10px] md:text-xs uppercase tracking-widest shadow-xl shadow-secondary/25 group font-space mt-2 transition-colors duration-500"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        {t("ct.submit")}
                        <Send className="ml-2 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8 }}
        className="w-full h-[420px] md:h-[520px] relative group border-t border-muted"
      >
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3982.8405472365057!2d36.65972407548163!3d-3.3890876965855155!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x18371d732584d27d%3A0x6a57dbd479364848!2sMiale%20safari!5e0!3m2!1sen!2stz!4v1783705048418!5m2!1sen!2stz"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={true}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Miale Safari office, Sombetini JR, Arusha"
          className="grayscale-[40%] contrast-[1.02] group-hover:grayscale-0 transition-[filter] duration-700"
        ></iframe>
        <div className="absolute bottom-4 left-4 md:bottom-8 md:left-10 bg-white/95 backdrop-blur rounded-2xl border border-muted shadow-xl p-4 md:p-5 max-w-[240px] md:max-w-[300px]">
            <p className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-widest font-bold font-space mb-1">{t("ct.arushaBase")}</p>
            <p className="text-sm md:text-base font-serif font-bold text-primary mb-3">Sombetini JR, Arusha, Tanzania</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <a
                href={MAPS_DIRECTIONS_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[9px] md:text-[10px] font-space font-bold uppercase tracking-widest text-secondary hover:text-primary transition-colors"
              >
                {t("ct.openMaps")}
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
              <a
                href={WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[9px] md:text-[10px] font-space font-bold uppercase tracking-widest text-secondary hover:text-primary transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp
              </a>
            </div>
          </div>
      </motion.div>
    </section>
  );
};