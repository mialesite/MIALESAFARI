
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { aiProductRecommender, AiProductRecommenderOutput } from "@/ai/flows/ai-product-recommender";
import { Button } from "@/components/ui/button";
import { GlassCard } from "./ui/glass-card";
import { Sparkles, Loader2, CheckCircle2, ChevronRight, MapPin, User, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { useTranslation } from "@/context/LanguageCurrencyContext";

export const AIConsultantForm = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiProductRecommenderOutput | null>(null);
  const db = useFirestore();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    healthGoals: [] as string[],
    flavorPreferences: [] as string[],
    dietaryNeeds: [] as string[],
    name: "",
    email: "",
    location: "",
  });

  const options = {
    healthGoals: ["immune support", "energy boost", "digestive health", "skin vitality", "anti-aging"],
    flavorPreferences: ["sweet", "floral", "earthy", "citrus", "woody"],
    dietaryNeeds: ["gluten-free", "vegan", "low-sugar", "raw", "organic"],
  };

  const toggleOption = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: (prev[key] as string[]).includes(value)
        ? (prev[key] as string[]).filter((v) => v !== value)
        : [...(prev[key] as string[]), value],
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.location) {
      toast({
        variant: "destructive",
        title: "Information Required",
        description: "Please fill in your details to receive recommendations.",
      });
      return;
    }
    
    setLoading(true);
    try {
      const res = await aiProductRecommender({
        healthGoals: formData.healthGoals,
        flavorPreferences: formData.flavorPreferences,
        dietaryNeeds: formData.dietaryNeeds
      });
      setResult(res);

      const consultationsRef = collection(db, "consultations");
      const submissionData = {
        name: formData.name,
        email: formData.email,
        location: formData.location,
        healthGoals: formData.healthGoals,
        flavorPreferences: formData.flavorPreferences,
        dietaryNeeds: formData.dietaryNeeds,
        recommendations: res.recommendations,
        createdAt: serverTimestamp(),
      };

      addDoc(consultationsRef, submissionData).catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: consultationsRef.path,
          operation: 'create',
          requestResourceData: submissionData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });

      try {
        await fetch("/api/consultation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            location: formData.location,
            selections: {
              healthGoals: formData.healthGoals,
              flavorPreferences: formData.flavorPreferences,
              dietaryNeeds: formData.dietaryNeeds
            },
            recommendations: res.recommendations
          }),
        });
      } catch (emailError) {
        console.warn("Consultation email notification failed to trigger.");
      }

      setStep(4);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Recommendation Error",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 md:py-16 px-4 md:px-6">
      <div className="text-center mb-8 md:mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass mb-4 border-honey-gold/20">
          <Sparkles className="w-4 h-4 text-honey-gold" />
          <span className="text-[10px] md:text-sm font-medium">Bespoke Wellness Consultant</span>
        </div>
        <h2 className="font-headline text-3xl md:text-5xl font-bold px-2">{t('find_perfect_blend')}</h2>
        <p className="text-muted-foreground mt-4 text-sm md:text-lg max-w-xl mx-auto px-4 font-light">
          {t('ai_consultant_desc')}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {step < 4 && (
          <motion.div
            key={`step${step}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6 md:space-y-8"
          >
            {step < 3 ? (
              <>
                <h3 className="text-lg md:text-2xl font-bold text-center px-4">
                  {step === 0 && "What are your primary health goals?"}
                  {step === 1 && "Any flavor preferences?"}
                  {step === 2 && "Specific dietary needs?"}
                </h3>
                
                <div className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-2xl mx-auto">
                  {(step === 0 ? options.healthGoals : step === 1 ? options.flavorPreferences : options.dietaryNeeds).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => toggleOption(step === 0 ? "healthGoals" : step === 1 ? "flavorPreferences" : "dietaryNeeds", opt)}
                      className={cn(
                        "px-4 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl transition-all border-2 text-sm md:text-base",
                        (step === 0 ? formData.healthGoals : step === 1 ? formData.flavorPreferences : formData.dietaryNeeds).includes(opt)
                          ? "bg-honey-gold border-honey-gold text-honey-dark font-bold shadow-lg"
                          : "bg-white/50 border-transparent hover:border-honey-gold/30"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="max-w-md mx-auto space-y-6">
                 <h3 className="text-xl md:text-2xl font-bold text-center">Tell us about yourself</h3>
                 <p className="text-center text-muted-foreground text-sm font-light">Fill this in to receive your personalized AI honey consultation.</p>
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <Label htmlFor="name" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground flex items-center gap-2">
                          <User className="w-3 h-3" /> {t('full_name')}
                       </Label>
                       <Input 
                          id="name" 
                          value={formData.name} 
                          onChange={(e) => setFormData(p => ({...p, name: e.target.value}))} 
                          placeholder="Jane Doe" 
                          className="h-12 rounded-xl focus:ring-honey-gold" 
                       />
                    </div>
                    <div className="space-y-2">
                       <Label htmlFor="email" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground flex items-center gap-2">
                          <Mail className="w-3 h-3" /> {t('email_address')}
                       </Label>
                       <Input 
                          id="email" 
                          type="email"
                          value={formData.email} 
                          onChange={(e) => setFormData(p => ({...p, email: e.target.value}))} 
                          placeholder="jane@example.com" 
                          className="h-12 rounded-xl focus:ring-honey-gold" 
                       />
                    </div>
                    <div className="space-y-2">
                       <Label htmlFor="location" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground flex items-center gap-2">
                          <MapPin className="w-3 h-3" /> {t('location_label')}
                       </Label>
                       <Input 
                          id="location" 
                          value={formData.location} 
                          onChange={(e) => setFormData(p => ({...p, location: e.target.value}))} 
                          placeholder="Arusha, Tanzania" 
                          className="h-12 rounded-xl focus:ring-honey-gold" 
                       />
                    </div>
                 </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-8">
              {step > 0 && (
                <Button variant="ghost" onClick={() => setStep(step - 1)} className="w-full sm:w-auto h-12">
                  Back
                </Button>
              )}
              <Button
                size="lg"
                disabled={(step === 0 && formData.healthGoals.length === 0) || (step === 3 && (!formData.name || !formData.email || !formData.location))}
                onClick={step === 3 ? handleSubmit : () => setStep(step + 1)}
                className="w-full sm:w-auto rounded-full px-12 h-12 md:h-14 bg-honey-gold text-honey-dark hover:bg-honey-amber font-bold"
              >
                {loading ? <Loader2 className="animate-spin" /> : step === 3 ? t('get_recommendations') : "Next Step"}
              </Button>
            </div>
          </motion.div>
        )}

        {step === 4 && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
          >
            {result.recommendations.map((rec, i) => (
              <GlassCard key={i} className="flex flex-col h-full border-honey-gold/20 bg-white/60">
                <Badge className="w-fit mb-4 bg-honey-gold text-honey-dark font-bold text-[10px]">
                  {rec.productType}
                </Badge>
                <h4 className="font-headline text-xl md:text-2xl font-bold mb-3">{rec.productName}</h4>
                <p className="text-xs md:text-sm text-muted-foreground mb-4 leading-relaxed italic">
                  "{rec.reason}"
                </p>
                <div className="space-y-2 mb-6 flex-1">
                  {rec.benefits.map((benefit, j) => (
                    <div key={j} className="flex items-center gap-2 text-[11px] md:text-sm">
                      <CheckCircle2 className="w-3 md:w-4 h-3 md:h-4 text-honey-gold shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
                <Button className="w-full bg-honey-dark text-white hover:bg-honey-gold hover:text-honey-dark transition-all rounded-xl group h-12">
                  Add to Cart
                  <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </GlassCard>
            ))}
            <div className="md:col-span-2 flex justify-center mt-6">
              <Button variant="link" onClick={() => { setStep(0); setFormData({ healthGoals: [], flavorPreferences: [], dietaryNeeds: [], name: "", email: "", location: "" }); setResult(null); }} className="text-honey-gold">
                Start Over
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
