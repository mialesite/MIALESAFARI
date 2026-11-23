"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Compass, 
  Calendar as CalendarIcon, 
  Users, 
  Crown, 
  Wallet, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  Loader2,
  DollarSign,
  ChevronDown,
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";
import { useLanguage } from "@/context/LanguageContext";

interface BookingDialogProps {
  children: React.ReactNode;
}

const STEPS = [
  { id: 1, icon: CalendarIcon },
  { id: 2, icon: Users },
  { id: 3, icon: Crown },
  { id: 4, icon: Sparkles },
];

const COUNTRIES = [
  { name: "Afghanistan", flag: "🇦🇫" }, { name: "Albania", flag: "🇦🇱" }, { name: "Algeria", flag: "🇩🇿" }, { name: "Andorra", flag: "🇦🇩" },
  { name: "Angola", flag: "🇦🇴" }, { name: "Antigua and Barbuda", flag: "🇦🇬" }, { name: "Australia", flag: "🇦🇺" }, { name: "Austria", flag: "🇦🇹" },
  { name: "Belgium", flag: "🇧🇪" }, { name: "Brazil", flag: "🇧🇷" }, { name: "Canada", flag: "🇨🇦" }, { name: "China", flag: "🇨🇳" },
  { name: "Denmark", flag: "🇩🇰" }, { name: "Egypt", flag: "🇪🇬" }, { name: "France", flag: "🇫🇷" }, { name: "Germany", flag: "🇩🇪" },
  { name: "India", flag: "🇮🇳" }, { name: "Italy", flag: "🇮🇹" }, { name: "Japan", flag: "🇯🇵" }, { name: "Kenya", flag: "🇰🇪" },
  { name: "Netherlands", flag: "🇳🇱" }, { name: "New Zealand", flag: "🇳🇿" }, { name: "Norway", flag: "🇳🇴" }, { name: "Portugal", flag: "🇵🇹" },
  { name: "Qatar", flag: "🇶🇦" }, { name: "Rwanda", flag: "🇷🇼" }, { name: "Saudi Arabia", flag: "🇸🇦" }, { name: "Singapore", flag: "🇸🇬" },
  { name: "South Africa", flag: "🇿🇦" }, { name: "Spain", flag: "🇪🇸" }, { name: "Sweden", flag: "🇸🇪" }, { name: "Switzerland", flag: "🇨🇭" },
  { name: "Tanzania", flag: "🇹🇿" }, { name: "United Arab Emirates", flag: "🇦🇪" }, { name: "United Kingdom", flag: "🇬🇧" }, { name: "United States", flag: "🇺🇸" }
].sort((a, b) => a.name.localeCompare(b.name));

export const BookingDialog = ({ children }: BookingDialogProps) => {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const db = useFirestore();
  const { toast } = useToast();
  const [today, setToday] = useState("");
  const [nationalitySearch, setNationalitySearch] = useState("");
  const [nationalityOpen, setNationalityOpen] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setToday(new Date().toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
        setNationalityOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    startDate: "",
    endDate: "",
    adults: "2",
    children: "0",
    nationality: "",
    tier: "luxury",
    budget: "",
    requests: ""
  });

  const isStepValid = () => {
    switch (step) {
      case 1: return formData.startDate !== "" && formData.endDate !== "" && formData.endDate >= formData.startDate;
      case 2: return formData.nationality !== "" && parseInt(formData.adults) > 0;
      case 3: return formData.budget !== "";
      case 4: return formData.fullName !== "" && formData.email !== "";
      default: return true;
    }
  };

  const nextStep = () => {
    if (isStepValid()) {
      setStep(s => s + 1);
    } else {
      toast({
        variant: "destructive",
        title: t("bk.toastInfoTitle"),
        description: t("bk.toastInfoDesc")
      });
    }
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step < 4) {
      nextStep();
      return;
    }

    if (!isStepValid()) return;
    
    setLoading(true);

    const bookingData = {
      ...formData,
      tripDays: tripDays(),
    };

    const bookingsRef = collection(db, "bookings");

    addDoc(bookingsRef, {
      ...bookingData,
      createdAt: serverTimestamp(),
    }).catch(async (error) => {
      const permissionError = new FirestorePermissionError({
        path: bookingsRef.path,
        operation: 'create',
        requestResourceData: bookingData,
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    });

    try {
      const response = await fetch("/api/booking-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) throw new Error("Email Dispatch Failed");

      setIsSubmitted(true);
      toast({
        title: t("bk.toastSentTitle"),
        description: t("bk.toastSentDesc")
      });
    } catch (error) {
      console.error("Booking email error:", error);
      setIsSubmitted(true);
      toast({
        variant: "destructive",
        title: t("bk.toastFallbackTitle"),
        description: t("bk.toastFallbackDesc")
      });
    } finally {
      setLoading(false);
    }
  };

  const tripDays = () => {
    if (!formData.startDate || !formData.endDate) return 1;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const travellerCount = () => (parseInt(formData.adults) || 0) + (parseInt(formData.children) || 0);

  const filteredCountries = COUNTRIES.filter(c => c.name.toLowerCase().includes(nationalitySearch.toLowerCase()));

  return (
    <Dialog onOpenChange={(open) => !open && (setStep(1), setIsSubmitted(false), setLoading(false))}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl w-[95vw] md:w-full max-h-[92vh] bg-safari-white border-none rounded-[2rem] overflow-hidden p-0 shadow-2xl flex flex-col">
        <div className="h-1.5 bg-secondary w-full shrink-0" />
        <div className="p-6 md:p-10 overflow-y-auto no-scrollbar flex-1 flex flex-col">
          {!isSubmitted ? (
            <>
              <DialogHeader className="mb-8 shrink-0">
                <div className="flex items-center gap-2 text-secondary mb-1">
                  <Compass className="w-4 h-4" />
                  <span className="text-[10px] font-space font-bold uppercase tracking-[0.3em]">{t("bk.eyebrow")}</span>
                </div>
                <DialogTitle className="text-3xl md:text-4xl font-serif text-primary">{t("bk.title")} <span className="italic">{t("bk.titleAccent")}</span></DialogTitle>
              </DialogHeader>

              <div className="flex justify-between items-center mb-10 relative px-4 shrink-0">
                <div className="absolute top-1/2 left-0 right-0 h-px bg-muted -z-0" />
                {STEPS.map((s) => (
                  <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
                    <div className={cn(
                      "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2",
                      step >= s.id ? "bg-primary border-primary text-white" : "bg-white border-muted text-muted-foreground"
                    )}>
                      <s.icon className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                <div className="flex-1 mb-8">
                  <AnimatePresence mode="wait">
                    <motion.div key={step} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                      {step === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{t("bk.startDate")}</Label>
                            <Input type="date" min={today} className="h-12 rounded-xl border-muted" value={formData.startDate} onChange={e => setFormData(p => ({...p, startDate: e.target.value}))} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{t("bk.departure")}</Label>
                            <Input type="date" min={formData.startDate || today} className="h-12 rounded-xl border-muted" value={formData.endDate} onChange={e => setFormData(p => ({...p, endDate: e.target.value}))} />
                          </div>
                        </div>
                      )}
                      {step === 2 && (
                        <div className="space-y-6">
                          <div className="space-y-2 relative" ref={countryRef}>
                            <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{t("bk.nationality")}</Label>
                            <div className="relative">
                              <Button 
                                type="button"
                                variant="outline" 
                                onClick={() => setNationalityOpen(!nationalityOpen)}
                                className="w-full justify-between h-12 rounded-xl border-muted bg-white/50"
                              >
                                {formData.nationality ? formData.nationality : t("bk.selectCountry")}
                                <ChevronDown className={cn("w-4 h-4 opacity-50", nationalityOpen && "rotate-180")} />
                              </Button>
                              
                              {nationalityOpen && (
                                <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-muted shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[300px]">
                                  <div className="p-3 border-b border-muted flex items-center gap-2 bg-muted/10 shrink-0">
                                    <Search className="w-4 h-4 text-muted-foreground" />
                                    <Input
                                      placeholder={t("bk.search")}
                                      value={nationalitySearch}
                                      onChange={e => setNationalitySearch(e.target.value)} 
                                      onKeyDown={e => e.stopPropagation()}
                                      className="h-8 border-none focus-visible:ring-0 text-xs p-0 bg-transparent" 
                                      autoFocus
                                    />
                                  </div>
                                  <div className="overflow-y-auto p-1 bg-white flex-1 min-h-0">
                                    <div className="max-h-[200px]">
                                      {filteredCountries.map(c => (
                                        <button 
                                          key={c.name} 
                                          type="button" 
                                          onClick={() => { setFormData(p => ({...p, nationality: c.name})); setNationalityOpen(false); }}
                                          className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors text-left"
                                        >
                                          <span>{c.flag}</span> {c.name}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{t("bk.adults")}</Label>
                              <Input type="number" min="1" className="h-12 rounded-xl border-muted" value={formData.adults} onChange={e => setFormData(p => ({...p, adults: e.target.value}))} />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{t("bk.children")}</Label>
                              <Input type="number" min="0" className="h-12 rounded-xl border-muted" value={formData.children} onChange={e => setFormData(p => ({...p, children: e.target.value}))} />
                            </div>
                          </div>
                        </div>
                      )}
                      {step === 3 && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-3 gap-3">
                            {['classic', 'luxury', 'elite'].map(tier => (
                              <button key={tier} type="button" onClick={() => setFormData(p => ({...p, tier}))} className={cn("p-4 rounded-2xl border-2 text-left transition-all", formData.tier === tier ? "border-secondary bg-secondary/5" : "border-transparent bg-muted/20")}>
                                <p className="font-serif font-bold text-primary">{t(`bk.tier${tier.charAt(0).toUpperCase()}${tier.slice(1)}`)}</p>
                              </button>
                            ))}
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{t("bk.budget")}</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input type="number" required placeholder={t("bk.budgetPlaceholder")} className="pl-10 h-12 rounded-xl" value={formData.budget} onChange={e => setFormData(p => ({...p, budget: e.target.value}))} />
                            </div>
                          </div>
                          <div className="p-4 bg-primary rounded-2xl text-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <Wallet className="w-5 h-5 text-secondary" />
                              <div>
                                <p className="text-[8px] uppercase font-space text-white/40 tracking-widest">{t("bk.theBrief")}</p>
                                <p className="text-xl font-serif text-secondary">{t("bk.briefLine", { n: travellerCount(), d: tripDays() })}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {step === 4 && (
                        <div className="space-y-5">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{t("bk.fullName")}</Label>
                              <Input required value={formData.fullName} onChange={e => setFormData(p => ({...p, fullName: e.target.value}))} placeholder={t("bk.namePlaceholder")} className="h-12 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{t("bk.email")}</Label>
                              <Input type="email" required value={formData.email} onChange={e => setFormData(p => ({...p, email: e.target.value}))} placeholder={t("bk.emailPlaceholder")} className="h-12 rounded-xl" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{t("bk.requests")}</Label>
                            <Textarea placeholder={t("bk.requestsPlaceholder")} className="min-h-[100px] rounded-xl" value={formData.requests} onChange={e => setFormData(p => ({...p, requests: e.target.value}))} />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-muted bg-safari-white mt-auto shrink-0">
                  <Button type="button" variant="ghost" onClick={prevStep} disabled={step === 1 || loading} className="text-muted-foreground font-space font-bold uppercase tracking-widest text-[10px]">
                    <ArrowLeft className="w-4 h-4 mr-2" /> {t("bk.back")}
                  </Button>
                  <Button type="submit" disabled={loading} className="rounded-full bg-primary text-white hover:bg-primary/90 px-10 h-12 font-space font-bold uppercase tracking-widest text-[10px]">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : (step === 4 ? t("bk.requestQuote") : t("bk.continue"))}
                    {step < 4 && <ArrowRight className="ml-2 w-4 h-4" />}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center py-12 flex-1 flex flex-col justify-center">
              <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 className="w-10 h-10 text-secondary" />
              </div>
              <h2 className="text-4xl font-serif text-primary mb-4">{t("bk.successTitle")}</h2>
              <p className="text-muted-foreground font-light mb-12 max-w-sm mx-auto">{t("bk.successBody")}</p>
              <DialogClose asChild><Button className="rounded-full bg-primary text-white px-12 h-14 font-space font-bold uppercase tracking-widest text-[10px] mx-auto">{t("bk.successCta")}</Button></DialogClose>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
