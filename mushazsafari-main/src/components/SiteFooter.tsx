"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Instagram, Phone, Mail, MapPin, Settings, Loader2, CheckCircle2 } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { mediaFor } from "@/lib/media";
import { useLanguage } from "@/context/LanguageContext";

const HIDDEN_ROUTES = ["/admin", "/profile", "/shop", "/checkout", "/beekeeping"];

const EXPLORE_LINKS = [
  { labelKey: "fl.destinations", href: "/destinations" },
  { labelKey: "fl.nationalParks", href: "/parks" },
  { labelKey: "fl.migration", href: "/#migration" },
  { labelKey: "fl.expeditions", href: "/itineraries" },
];

const COMPANY_LINKS = [
  { labelKey: "fl.story", href: "/about" },
  { labelKey: "fl.contact", href: "/contact" },
];

const WhatsAppGlyph = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

export function SiteFooter() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const db = useFirestore();
  const { toast } = useToast();
  const logoUrl = mediaFor("miale-logo-on-dark");

  if (HIDDEN_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))) return null;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribing(true);
    try {
      await addDoc(collection(db, "newsletter"), {
        email,
        createdAt: serverTimestamp(),
      });
      setSubscribed(true);
      setEmail("");
    } catch {
      toast({
        variant: "destructive",
        title: t("footer.subFailed"),
        description: t("footer.subFailedDesc"),
      });
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="bg-[#192E21] text-white pt-16 md:pt-20 pb-24 md:pb-12 px-6 md:px-12">
      <div className="max-w-[1500px] mx-auto">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16 border-b border-white/10 pb-12 lg:pb-16">
          <div className="max-w-sm lg:w-80 lg:shrink-0 space-y-7">
            <Link href="/" className="block">
              <Image
                src={logoUrl.src}
                alt={logoUrl.alt}
                width={logoUrl.width}
                height={logoUrl.height}
                className="object-contain h-8 md:h-9 w-auto"
                sizes="224px"
              />
            </Link>
            <p className="text-white/55 text-sm font-light leading-relaxed">
              {t("footer.blurb")}
            </p>
            <div className="flex gap-3">
              <a href="https://www.instagram.com/mialesafari" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/60 hover:text-white hover:border-secondary hover:bg-secondary/15 transition-all" aria-label="Miale on Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://wa.me/255769333331" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/60 hover:text-white hover:border-secondary hover:bg-secondary/15 transition-all" aria-label="Message Miale on WhatsApp">
                <WhatsAppGlyph className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="grid flex-1 min-w-0 grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:gap-x-10">
            <div className="space-y-5">
              <p className="text-[10px] md:text-[11px] font-space font-bold text-secondary uppercase tracking-[0.35em]">{t("footer.explore")}</p>
              <ul className="space-y-3.5">
                {EXPLORE_LINKS.map((link) => (
                  <li key={link.labelKey}>
                    <Link href={link.href} className="text-xs md:text-[13px] text-white/55 font-light hover:text-white transition-colors">
                      {t(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-5">
              <p className="text-[10px] md:text-[11px] font-space font-bold text-secondary uppercase tracking-[0.35em]">{t("footer.company")}</p>
              <ul className="space-y-3.5">
                {COMPANY_LINKS.map((link) => (
                  <li key={link.labelKey}>
                    <Link href={link.href} className="text-xs md:text-[13px] text-white/55 font-light hover:text-white transition-colors">
                      {t(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1 space-y-5">
              <p className="text-[10px] md:text-[11px] font-space font-bold text-secondary uppercase tracking-[0.35em]">{t("footer.dispatch")}</p>
              <p className="text-xs md:text-[13px] text-white/50 font-light leading-relaxed">
                {t("footer.dispatchBlurb")}
              </p>
              {subscribed ? (
                <div className="flex items-center gap-2 text-secondary text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {t("footer.onList")}
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("footer.emailPlaceholder")}
                    aria-label="Email address for the Miale newsletter"
                    className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-white placeholder:text-white/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60"
                  />
                  <button
                    type="submit"
                    disabled={subscribing}
                    className="h-11 w-full rounded-xl bg-secondary text-white text-[10px] font-space font-bold uppercase tracking-[0.25em] hover:bg-[#C9A45C] transition-colors disabled:opacity-60 flex items-center justify-center"
                  >
                    {subscribing ? <Loader2 className="w-4 h-4 animate-spin" /> : t("footer.subscribe")}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="pt-10 lg:pt-12 pb-12 lg:pb-14 border-b border-white/10">
          <p className="text-[10px] md:text-[11px] font-space font-bold text-secondary uppercase tracking-[0.35em] mb-8">{t("footer.base")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8">
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all duration-500 shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[9px] md:text-[10px] text-white/40 uppercase tracking-widest font-bold font-space">{t("footer.directLine")}</p>
                <a href="tel:+255769333331" className="block text-sm md:text-base font-serif font-bold text-white hover:text-secondary transition-colors">+255 769 333 331</a>
                <a href="tel:+447769202031" className="text-[10px] md:text-[11px] font-bold text-secondary hover:text-white transition-colors">+44 7769 202031</a>
              </div>
            </div>

            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all duration-500 shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] md:text-[10px] text-white/40 uppercase tracking-widest font-bold font-space">{t("footer.emailInquiries")}</p>
                <a href="mailto:info@mialesafari.com" className="block text-sm md:text-base font-serif font-bold text-white hover:text-secondary transition-colors truncate">info@mialesafari.com</a>
              </div>
            </div>

            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all duration-500 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[9px] md:text-[10px] text-white/40 uppercase tracking-widest font-bold font-space">{t("footer.arushaBase")}</p>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Sombetini+JR+Arusha"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm md:text-base font-serif font-bold text-white hover:text-secondary transition-colors"
                >
                  Sombetini JR, Arusha
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-5 md:pr-24">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-center">
            <p className="text-white/25 text-[10px] font-space font-bold uppercase tracking-[0.25em]">
              {t("footer.rights")}
            </p>
            <span className="hidden md:block text-white/15">•</span>
            <p className="text-white/25 text-[10px] font-space font-bold uppercase tracking-[0.25em]">
              <a href="https://orbituniverse.co.tz/" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">
                {t("footer.byOrbit")}
              </a>
            </p>
          </div>
          <div className="flex gap-6 md:gap-8 text-white/25 text-[10px] font-space font-bold uppercase tracking-widest items-center">
            <Link href="/privacy" className="hover:text-secondary transition-colors">{t("footer.privacy")}</Link>
            <div className="flex items-center gap-2 group">
              <Link href="/terms" className="hover:text-secondary transition-colors">{t("footer.terms")}</Link>
              <Link
                href="/admin"
                className="opacity-20 group-hover:opacity-100 transition-opacity hover:text-secondary"
                aria-label="Admin Console"
              >
                <Settings className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
