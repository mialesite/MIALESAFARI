"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Lock, Mail, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function AdminLogin() {
  const router = useRouter();
  const auth = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin");
    } catch (err: any) {
      console.error(err);
      setError("Authentication failed. Please check your credentials or ensure the account exists in the Firebase Console.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-muted/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-honey-gold/10 rounded-full blur-[100px] -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-honey-gold/10 rounded-full blur-[100px] -ml-64 -mb-64" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-none shadow-2xl overflow-hidden bg-white/80 backdrop-blur-xl">
          <div className="h-2 bg-honey-gold" />
          <CardHeader className="text-center pt-6 pb-2">
            <div className="flex justify-center mb-4">
               <div className="w-12 h-12 bg-honey-gold/10 rounded-xl flex items-center justify-center text-honey-gold">
                  < ShieldCheck className="w-6 h-6" />
               </div>
            </div>
            <CardTitle className="font-headline text-3xl font-bold">Miale Admin Console</CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Authorized access for Miale Safari management.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-10 pb-10">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs uppercase tracking-widest font-bold text-muted-foreground px-1">Administrative Identity</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="email"
                    type="email"
                    required 
                    placeholder="admin@mialesafaris.com" 
                    className="bg-white/50 border-border h-12 pl-10 rounded-xl focus:ring-honey-gold"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs uppercase tracking-widest font-bold text-muted-foreground px-1">Access Pin</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="password"
                    type="password"
                    required 
                    placeholder="••••••••" 
                    className="bg-white/50 border-border h-12 pl-10 rounded-xl focus:ring-honey-gold"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-destructive bg-destructive/10 p-3 rounded-lg text-center font-medium">
                  {error}
                </p>
              )}
              
              <Button 
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-honey-gold text-honey-dark hover:bg-honey-amber rounded-xl font-bold transition-all shadow-lg shadow-honey-gold/20 mt-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Sign In to Console"
                )}
              </Button>
            </form>
            
            <div className="mt-8 pt-6 border-t border-border/50 text-center">
               <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-4">Secured Infrastructure</p>
               <div className="flex justify-center gap-4 text-muted-foreground">
                  <Link href="/" className="text-xs hover:text-honey-gold transition-colors flex items-center gap-1">
                    Return to Explorer <ArrowRight className="w-3 h-3" />
                  </Link>
               </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
