"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Instagram, Mail, Phone, ChevronDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { mediaFor } from "@/lib/media";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { NAV_TRANSLATIONS } from "@/lib/i18n";

// Lazy load BookingDialog to save RAM during initial landing
const BookingDialog = dynamic(() => import("./BookingDialog").then(mod => mod.BookingDialog), {
  ssr: false,
  loading: () => <Button className="rounded-full px-8 text-[10px] font-space font-bold uppercase tracking-widest h-12 opacity-50">Loading...</Button>
});

// Pages that open with a dark hero picture or the deep green header band.
// Everywhere else the band behind the bar is cream, so the bar must start dark-on-light.
const DARK_TOP_BANDS = [
  /^\/$/,
  /^\/about$/,
  /^\/contact$/,
  /^\/itineraries$/,
  /^\/destinations$/,
  /^\/destinations\/[^/]+$/,
  /^\/destinations\/circuit\/[^/]+$/,
  /^\/tours\/[^/]+$/,
];

type NavItem = { label: string; pathname: string; query?: Record<string, string>; hash?: string; note?: string };

type NavGroup = {
  name: string;
  href: NavItem;
  image: string;
  columns: { title: string; items: NavItem[] }[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    name: "Destinations",
    href: { label: "All destinations", pathname: "/destinations" },
    image: "serengeti-balloons-sunrise",
    columns: [
      {
        title: "By circuit",
        items: [
          { label: "Northern Circuit", pathname: "/destinations/circuit/northern-circuit", note: "Serengeti · Ngorongoro" },
          { label: "Southern Circuit", pathname: "/destinations/circuit/southern-circuit", note: "Nyerere · Ruaha" },
          { label: "Western Frontiers", pathname: "/destinations/circuit/western-frontiers", note: "Mahale · Gombe" },
          { label: "Zanzibar & Islands", pathname: "/destinations/circuit/zanzibar-islands", note: "Coast · Mafia" },
          { label: "The Peaks", pathname: "/destinations/circuit/the-peaks", note: "Kilimanjaro · Meru" },
        ],
      },
      {
        title: "Also worth knowing",
        items: [
          { label: "National parks", pathname: "/parks", note: "Park by park" },
          { label: "The parks map", pathname: "/parks", hash: "map", note: "Ground, to scale" },
          { label: "Send the dates", pathname: "/contact", note: "Start a route" },
        ],
      },
    ],
  },
  {
    name: "Expeditions",
    href: { label: "All expeditions", pathname: "/itineraries" },
    image: "wildebeest-river-crossing",
    columns: [
      {
        title: "By style",
        items: [
          { label: "Great Migration", pathname: "/itineraries", query: { category: "Migration" }, note: "Herds and crossings" },
          { label: "Luxury", pathname: "/itineraries", query: { category: "Luxury" }, note: "Camp to camp" },
          { label: "Kilimanjaro", pathname: "/itineraries", query: { category: "Mountain" }, note: "The climb" },
          { label: "Zanzibar", pathname: "/itineraries", query: { category: "Zanzibar" }, note: "Beach at the end" },
          { label: "Built from scratch", pathname: "/itineraries", query: { category: "Bespoke" }, note: "Your dates, your route" },
        ],
      },
      {
        title: "Good to know",
        items: [
          { label: "Migration months", pathname: "/", hash: "migration", note: "When the herds move" },
          { label: "The parks map", pathname: "/parks", hash: "map", note: "Ground, to scale" },
          { label: "Send the dates", pathname: "/contact", note: "Start a route" },
        ],
      },
    ],
  },
];

const NAV_LINKS: { label: string; href: string }[] = [
  { label: "Parks", href: "/parks" },
  { label: "The Base", href: "/about" },
  { label: "Contact", href: "/contact" },
];

function hrefOf(item: NavItem) {
  if (item.query || item.hash) {
    return { pathname: item.pathname, query: item.query, hash: item.hash };
  }
  return item.pathname;
}

export const Navbar = () => {
  const pathname = usePathname();
  const { lang, t } = useLanguage();
  // Route and query values stay English; only the rendered text translates.
  const nav = (text: string) => (lang === "sw" ? NAV_TRANSLATIONS[text] ?? text : text);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobileGroup, setMobileGroup] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const suppressOpen = useRef(false);
  const noHover = useRef(false);

  useEffect(() => {
    noHover.current = window.matchMedia("(hover: none)").matches;
  }, []);

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Memory efficient check: only update state if crossed the threshold
      const isScrolled = window.scrollY > 50;
      setScrolled(prev => prev !== isScrolled ? isScrolled : prev);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setOpenGroup(null);
    setMobileGroup(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!openGroup) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenGroup(null);
        suppressOpen.current = true;
        triggerRefs.current[openGroup]?.focus();
        requestAnimationFrame(() => { suppressOpen.current = false; });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openGroup]);

  const solid = scrolled || !DARK_TOP_BANDS.some((re) => re.test(pathname || "/"));

  const activeGroup = (() => {
    const p = pathname || "/";
    if (p.startsWith("/destinations")) return "Destinations";
    if (p.startsWith("/parks")) return "Parks";
    if (p.startsWith("/itineraries")) return "Expeditions";
    if (p.startsWith("/about") || p.startsWith("/privacy") || p.startsWith("/terms")) return "The Base";
    if (p.startsWith("/contact")) return "Contact";
    return null;
  })();

  const logo = mediaFor(solid ? "miale-logo" : "miale-logo-on-dark");
  const solidLogo = mediaFor("miale-logo-on-dark");

  const triggerClass = cn(
    "relative flex items-center gap-1.5 whitespace-nowrap text-[10px] uppercase tracking-[0.4em] font-space font-bold transition-all duration-500 hover:text-secondary focus-visible:outline-none",
    "after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-secondary after:transition-transform after:duration-300 hover:after:scale-x-100 focus-visible:after:scale-x-100",
    solid ? "text-primary" : "text-white/80"
  );

  return (
    <>
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-700 px-4 md:px-12 [-webkit-tap-highlight-color:transparent]",
        solid ? "py-3 md:py-4 bg-white/95 backdrop-blur-2xl shadow-sm border-b" : "py-6 md:py-8 bg-transparent"
      )}
    >
      <div className="max-w-[1800px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6 lg:gap-12">
          <Link href="/" className="group flex items-center shrink-0">
            <div className="relative w-32 h-8 md:w-56 md:h-14 transition-transform duration-500 group-hover:scale-105">
              <Image
                src={logo.src}
                alt="Miale"
                width={logo.width}
                height={logo.height}
                className="h-8 w-auto md:h-11 object-contain"
                sizes="(max-width: 768px) 128px, 224px"
                priority
              />
            </div>
          </Link>

          <div className="hidden lg:items-center xl:gap-10 gap-8 lg:flex">
            {NAV_GROUPS.map((group) => {
              const open = openGroup === group.name;
              const isActive = activeGroup === group.name;
              return (
                <div
                  key={group.name}
                  className="relative"
                  onMouseEnter={() => {
                    if (noHover.current) return;
                    if (closeTimer.current) clearTimeout(closeTimer.current);
                    setOpenGroup(group.name);
                  }}
                  onMouseLeave={() => {
                    if (closeTimer.current) clearTimeout(closeTimer.current);
                    closeTimer.current = setTimeout(() => setOpenGroup((c) => (c === group.name ? null : c)), 180);
                  }}
                  onFocusCapture={() => {
                    if (suppressOpen.current) return;
                    if (closeTimer.current) clearTimeout(closeTimer.current);
                    setOpenGroup(group.name);
                  }}
                  onBlurCapture={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                      setOpenGroup((c) => (c === group.name ? null : c));
                    }
                  }}
                >
                  <Link
                    ref={(el) => { triggerRefs.current[group.name] = el; }}
                    href={hrefOf(group.href)}
                    onClick={(event) => {
                      if (noHover.current && openGroup !== group.name) {
                        event.preventDefault();
                        if (closeTimer.current) clearTimeout(closeTimer.current);
                        setOpenGroup(group.name);
                      }
                    }}
                    className={cn(triggerClass, isActive && "text-secondary")}
                    aria-expanded={open}
                    aria-haspopup="true"
                  >
                    {nav(group.name)}
                    <ChevronDown className={cn("w-3 h-3 transition-transform duration-300", open && "rotate-180")} />
                  </Link>

                  <AnimatePresence>
                    {open && (
                      <div className="absolute left-1/2 top-full -translate-x-1/2 pt-5">
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        >
                        <div data-panel className="w-[660px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[1.5rem] border border-muted/70 bg-white shadow-2xl shadow-primary/15">
                          <div className="h-[2px] bg-gradient-to-r from-secondary via-secondary/50 to-transparent" />
                          <div className="grid grid-cols-[1fr_1fr_190px] divide-x divide-muted/50">
                            {group.columns.map((column) => (
                              <div key={column.title} className="p-5">
                                <p className="px-3 pb-3 text-[9px] font-space font-bold uppercase tracking-[0.3em] text-secondary">
                                  {nav(column.title)}
                                </p>
                                <div className="space-y-1">
                                  {column.items.map((item) => (
                                    <Link
                                      key={`${item.pathname}${item.query?.circuit || item.query?.category || ""}${item.label}`}
                                      href={hrefOf(item)}
                                      className="group/item relative flex items-start rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/60"
                                    >
                                      <span className="absolute left-[7px] top-[18px] h-1 w-1 rounded-full bg-secondary opacity-0 transition-opacity duration-300 group-hover/item:opacity-100" />
                                      <span className="block min-w-0">
                                        <span className="block font-serif text-[15px] leading-snug text-primary transition-colors group-hover/item:text-secondary">
                                          {nav(item.label)}
                                        </span>
                                        {item.note && (
                                          <span className="mt-1 block text-[9px] font-space uppercase tracking-[0.18em] text-muted-foreground">
                                            {nav(item.note)}
                                          </span>
                                        )}
                                      </span>
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            ))}

                            <Link href={hrefOf(group.href)} className="group/image relative block overflow-hidden bg-muted">
                              <Image
                                src={mediaFor(group.image).src}
                                alt={mediaFor(group.image).alt}
                                fill
                                quality={60}
                                sizes="190px"
                                className="object-cover transition-transform duration-700 group-hover/image:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent" />
                              <span className="absolute bottom-4 left-4 right-4 flex items-center gap-2 text-[9px] font-space font-bold uppercase tracking-[0.2em] text-white">
                                {nav(group.href.label)}
                                <ArrowRight className="w-3 h-3 transition-transform group-hover/image:translate-x-1" />
                              </span>
                            </Link>
                          </div>
                        </div>
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {NAV_LINKS.map((link) => {
              const p = pathname || "/";
              const isActive = p === link.href || p.startsWith(`${link.href}/`);
              return (
                <Link key={link.label} href={link.href} className={cn(triggerClass, isActive && "text-secondary")}>
                  {nav(link.label)}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:flex items-center gap-3">
            <LanguageSwitcher tone={solid ? "light" : "dark"} />
            <BookingDialog>
              <Button
                className={cn(
                  "rounded-full px-6 md:px-8 text-[9px] md:text-[10px] font-space font-bold uppercase tracking-widest h-10 md:h-12 transition-all duration-500 shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2",
                  solid
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "bg-white text-primary hover:bg-secondary hover:text-white"
                )}
              >
                {t("nav.plan")}
              </Button>
            </BookingDialog>
          </div>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className={cn(
              "p-2 rounded-full lg:hidden transition-colors",
              solid ? "text-primary hover:bg-muted" : "text-white hover:bg-white/10"
            )}
            aria-label="Open Menu"
          >
            <Menu className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </div>
      </nav>

      <AnimatePresence>
        {openGroup && (
          <motion.div
            key="nav-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-primary/15"
            onClick={() => setOpenGroup(null)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
            className="fixed inset-0 z-[60] overflow-y-auto bg-primary flex flex-col p-8 md:p-12 [-webkit-tap-highlight-color:transparent]"
          >
            <div className="flex justify-between items-center mb-10 md:mb-16">
              <div className="relative w-36 h-8 md:w-48 md:h-12">
                <Image
                  src={solidLogo.src}
                  alt="Miale"
                  width={solidLogo.width}
                  height={solidLogo.height}
                  className="h-8 w-auto md:h-10 object-contain"
                  sizes="(max-width: 768px) 144px, 192px"
                />
              </div>
              <div className="flex items-center gap-3">
                <LanguageSwitcher tone="dark" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white p-2 hover:bg-white/10 rounded-full transition-colors"
                  aria-label="Close Menu"
                >
                  <X className="w-6 h-6 md:w-8 md:h-8" />
                </button>
              </div>
            </div>

            <div className="space-y-1">
              {NAV_GROUPS.map((group) => {
                const expanded = mobileGroup === group.name;
                return (
                  <div key={group.name} className="border-b border-white/10">
                    <div className="flex items-center justify-between gap-4">
                      <Link
                        href={hrefOf(group.href)}
                        className="py-4 text-2xl md:text-4xl font-serif text-white hover:text-secondary transition-colors"
                      >
                        {nav(group.name)}
                      </Link>
                      <button
                        onClick={() => setMobileGroup(expanded ? null : group.name)}
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-secondary hover:text-secondary"
                        aria-expanded={expanded}
                        aria-label={`${expanded ? "Hide" : "Show"} ${group.name} links`}
                      >
                        <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", expanded && "rotate-180")} />
                      </button>
                    </div>

                    <AnimatePresence initial={false}>
                      {expanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="pb-5 space-y-4">
                            {group.columns.map((column) => (
                              <div key={column.title}>
                                <p className="mb-2 text-[9px] font-space font-bold uppercase tracking-[0.3em] text-white/35">
                                  {nav(column.title)}
                                </p>
                                <div className="space-y-1.5">
                                  {column.items.map((item) => (
                                    <Link
                                      key={`${item.pathname}${item.query?.circuit || item.query?.category || ""}${item.label}`}
                                      href={hrefOf(item)}
                                      className="block"
                                    >
                                      <span className="block font-serif text-lg text-white/75 hover:text-secondary transition-colors">
                                        {nav(item.label)}
                                      </span>
                                      {item.note && (
                                        <span className="mt-0.5 block text-[9px] font-space uppercase tracking-[0.22em] text-white/35">
                                          {nav(item.note)}
                                        </span>
                                      )}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {NAV_LINKS.map((link) => (
                <div key={link.label} className="border-b border-white/10">
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-4 text-2xl md:text-4xl font-serif text-white hover:text-secondary transition-colors"
                  >
                    {nav(link.label)}
                  </Link>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-10 border-t border-white/10 space-y-8">
              <div className="grid gap-3 text-[10px] md:text-[11px] font-space font-bold uppercase tracking-[0.25em] text-white/55">
                <a href="tel:+255769333331" className="flex items-center gap-3 hover:text-secondary transition-colors">
                  <Phone className="w-4 h-4 shrink-0" /> +255 769 333 331
                </a>
                <a href="mailto:info@mialesafari.com" className="flex items-center gap-3 hover:text-secondary transition-colors">
                  <Mail className="w-4 h-4 shrink-0" /> info@mialesafari.com
                </a>
                <a href="https://www.instagram.com/mialesafari" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-secondary transition-colors">
                  <Instagram className="w-4 h-4 shrink-0" /> @mialesafari
                </a>
              </div>
              <BookingDialog>
                <Button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full rounded-full h-14 bg-secondary text-white text-[11px] font-space font-bold uppercase tracking-[0.3em] hover:bg-white hover:text-primary transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
                >
                  {t("nav.plan")}
                </Button>
              </BookingDialog>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
