"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, Settings, Loader2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const SOCIAL_LINKS = [
  { Icon: Facebook, href: "#" },
  { Icon: Instagram, href: "https://instagram.com/mialesafari?utm_source=qr&igsh=dTF5ZnlzMXdkbDhn" },
  { Icon: Youtube, href: "#" },
];

export const Footer = () => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const db = useFirestore();
  const { toast } = useToast();
  const logoUrl = "https://uploads.mushazsafari.com/Miale.png";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Standalone page check
  if (pathname?.startsWith("/admin") || pathname === "/profile") {
    return null;
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "newsletter"), {
        email,
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
      setEmail("");
      toast({
        title: "Successfully Subscribed!",
        description: "You're now on the Miale update list.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Subscription Failed",
        description: "Something went wrong. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-white text-foreground pt-16 md:pt-24 pb-12 relative overflow-hidden border-t border-border">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6 text-center sm:text-left">
            <Link href="/" className="flex justify-center sm:justify-start">
              <div className="relative w-48 h-24 transition-transform hover:scale-105">
                <Image
                  src={logoUrl}
                  alt="Miale Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            <p className="text-muted-foreground font-light leading-relaxed text-sm md:text-base">
              The benchmark for luxury Tanzanian travel. Crafting unparalleled wildlife encounters and bespoke expeditions across the continent's most iconic landscapes.
            </p>
            <div className="flex gap-4 justify-center sm:justify-start">
              {SOCIAL_LINKS.map(({ Icon, href }, i) => (
                <Link
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-border bg-muted/50 flex items-center justify-center hover:bg-secondary hover:text-white transition-all"
                >
                  <Icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>

          <div className="text-center sm:text-left">
            <h4 className="font-headline text-lg md:text-xl font-bold mb-6 text-foreground">Explore</h4>
            <ul className="space-y-3 text-muted-foreground text-sm">
              <li><Link href="/#destinations" className="hover:text-secondary transition-colors">Destinations</Link></li>
              <li><Link href="/#tours" className="hover:text-secondary transition-colors">Luxury Tours</Link></li>
              <li><Link href="/#about" className="hover:text-secondary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-secondary transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div className="text-center sm:text-left">
            <h4 className="font-headline text-lg md:text-xl font-bold mb-6 text-foreground">Headquarters</h4>
            <div className="space-y-6">
              <div className="flex items-center gap-4 group justify-center sm:justify-start">
                <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center text-secondary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h4 className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold font-space">Direct Line</h4>
                  <p className="text-sm font-serif font-bold text-primary">+255 769 333 331</p>
                  <p className="text-[10px] font-bold text-secondary">+44 7769 202031</p>
                </div>
              </div>

              <div className="flex items-center gap-4 group justify-center sm:justify-start">
                <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center text-secondary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h4 className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold font-space">Email Inquiries</h4>
                  <p className="text-sm font-serif font-bold text-primary">info@mialesafari.com</p>
                </div>
              </div>

              <div className="flex items-center gap-4 group justify-center sm:justify-start">
                <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center text-secondary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h4 className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold font-space">Arusha Base</h4>
                  <p className="text-sm font-serif font-bold text-primary">Sombetini JR, Arusha, Tanzania</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center sm:text-left">
            <h4 className="font-headline text-lg md:text-xl font-bold mb-6 text-foreground">The Dispatch</h4>
            <p className="text-muted-foreground mb-4 text-xs md:text-sm font-light">Join our inner circle for exclusive seasonal insights and conservation updates.</p>

            {success ? (
              <div className="flex items-center gap-2 text-secondary font-bold text-sm bg-secondary/5 p-4 rounded-xl border border-secondary/20">
                <CheckCircle2 className="w-5 h-5" />
                Welcome to the expedition.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="flex h-10 w-full rounded-xl border border-input bg-muted/30 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <Button
                  disabled={loading}
                  size="sm"
                  type="submit"
                  className="bg-primary text-white hover:bg-primary/90 rounded-xl w-full font-bold h-10"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe Now"}
                </Button>
              </form>
            )}
          </div>
        </div>

        <div className="pt-8 border-t border-border text-center text-muted-foreground text-[10px] md:text-xs font-light flex flex-col items-center gap-2 relative">
          <p>© 2026 Miale. All Rights Reserved.</p>
          <div className="flex gap-4 items-center">
            <Link href="/privacy" className="hover:text-secondary transition-colors">Privacy Policy</Link>
            <span className="text-border">|</span>
            <div className="flex items-center gap-2 group">
              <Link href="/terms" className="hover:text-secondary transition-colors">Terms of Service</Link>
              <Link
                href="/admin"
                className="opacity-20 hover:opacity-100 transition-opacity hover:text-secondary"
                aria-label="Admin Console"
              >
                <Settings className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
          <p className="mt-2 opacity-50 uppercase tracking-widest text-[9px] font-bold">
            <a href="https://orbituniverse.co.tz/" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-all">By Orbit Universe</a>
          </p>
        </div>
      </div>
    </footer>
  );
};
