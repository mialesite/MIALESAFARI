"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Clock,
  Compass,
  Eye,
  Instagram,
  Mail,
  MapPin,
  Phone,
  ScrollText,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { mediaFor } from "@/lib/media";

/**
 * @fileOverview About — the company page.
 * Facts here are limited to what is already verifiable (base, contact lines, coverage, the
 * enquiry-led flow this site actually implements). Credentials the operator has not supplied —
 * founding year, licences, fleet, guides, camp partners, reviews — are deliberately absent and
 * tracked in docs/PENDING_FACTS.md.
 */

const Reveal = ({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.7, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

const heroImage = mediaFor("ngorongoro-crater-rim");
const gorgeImage = mediaFor("olduvai-gorge-rim");
const processImage = mediaFor("elephant-family-crossing");

const FACTS = [
  { value: "Sombetini JR", label: "The office, Arusha" },
  { value: "Tanzania", label: "The only country we plan" },
  { value: "+255 · +44", label: "Two lines, one desk" },
  { value: "Enquiry first", label: "Nothing ships from a shelf" },
];

const CHECKLIST = [
  "Designed and quoted from an office at Sombetini JR, Arusha.",
  "One country: the northern parks, the south, the peaks and the coast.",
  "Every itinerary is written for the party and the dates, then confirmed before anything is booked.",
];

const VALUES = [
  {
    icon: Compass,
    title: "One country, known properly",
    body: "We keep to Tanzania because Tanzania is a lot. The northern circuit, the great southern parks, the chimpanzee mountains along Tanganyika, the peaks and the Indian Ocean shore: a map small enough to have an opinion about.",
  },
  {
    icon: Clock,
    title: "The season, not the shelf",
    body: "Where the herds are in your week decides the route. The expeditions listed here are starting points; what you travel is sized around your dates, your party and how many days a circuit needs before it stops feeling like a transfer.",
  },
  {
    icon: Eye,
    title: "No sighting is promised",
    body: "Wildlife is wildlife, not a schedule. We will tell you which ground holds the best odds in your window, which months are thin, and what we do on the day an animal does not show up.",
  },
  {
    icon: ScrollText,
    title: "In writing before you book",
    body: "The day-by-day plan, what is included, what is not, and the rate for your party, agreed on paper before you commit. Nothing about a Miale itinerary is vague because it was assembled late.",
  },
];

const CIRCUITS = [
  {
    name: "Northern Circuit",
    places: "Serengeti, Ngorongoro, Tarangire and Lake Manyara.",
    image: mediaFor("wildebeest-river-crossing"),
    href: "/parks",
  },
  {
    name: "South & West",
    places: "Nyerere, Ruaha, Mikumi, Gombe and Mahale.",
    image: mediaFor("ruaha-open-savanna"),
    href: "/parks",
  },
  {
    name: "The Peaks",
    places: "Kilimanjaro, Mount Meru and the Crater Highlands.",
    image: mediaFor("kilimanjaro-summit-clear"),
    href: "/destinations",
  },
  {
    name: "Zanzibar & Islands",
    places: "Zanzibar, Mafia and the coast that sits a short hop inland.",
    image: mediaFor("mafia-island-lagoon"),
    href: "/destinations",
  },
];

const STEPS = [
  {
    n: "01",
    title: "You write to Arusha",
    body: "The enquiry form, the +255 line on WhatsApp, or info@mialesafari.com. Dates, party, and the one thing you most want to see.",
  },
  {
    n: "02",
    title: "The route takes shape",
    body: "Circuit, nights per camp and whether the window is worth flying into at all. We will say so if your dates are the wrong dates.",
  },
  {
    n: "03",
    title: "The plan comes back on paper",
    body: "Day by day, with what is included, what is not, and the rate for your group. It is the same document you approve.",
  },
  {
    n: "04",
    title: "Then the ground work",
    body: "Transfers, the meeting point at Kilimanjaro International, the schedule as it will actually run, and the numbers to call while you are in country.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero band */}
      <section className="relative min-h-[68vh] md:min-h-[78vh] flex items-end overflow-hidden">
        <Image
          src={heroImage.src}
          alt={heroImage.alt}
          fill
          priority
          quality={70}
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(13,26,18,0.92)_0%,rgba(13,26,18,0.66)_45%,rgba(13,26,18,0.28)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent" />

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24 pb-16 md:pb-24 pt-40 w-full">
          <span className="text-secondary font-space font-bold uppercase tracking-[0.4em] text-[10px] md:text-xs block mb-5">
            Explore · Discover · Experience
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-8xl font-serif leading-[0.9] tracking-tighter text-white max-w-4xl">
            Based in Arusha.
            <br />
            <span className="font-light italic text-white/70">Planning Tanzania.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-white/75 font-light text-base md:text-lg leading-relaxed">
            Miale Safaris is a travel design office at Sombetini JR in Arusha. What leaves it is a
            Tanzanian itinerary: the northern parks, the southern wilderness, the mountains, the
            islands, written for the party and the season rather than picked off a departure board.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Button asChild className="h-12 rounded-full px-8 bg-secondary text-white font-space font-bold uppercase tracking-widest text-[10px] hover:bg-secondary/90">
              <Link href="/contact">
                Talk to the desk <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-full px-8 bg-transparent border-white/40 text-white font-space font-bold uppercase tracking-widest text-[10px] hover:bg-white hover:text-primary">
              <Link href="/itineraries">See the expeditions</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Facts band — only verifiable items, no invented numbers */}
      <section className="bg-primary border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24 py-10 md:py-12 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8 lg:gap-x-0 lg:divide-x lg:divide-white/10">
          {FACTS.map((fact) => (
            <div key={fact.label} className="lg:px-8 lg:first:pl-0 lg:last:pr-0">
              <p className="text-accent font-space font-bold uppercase tracking-[0.3em] text-[9px] md:text-[10px] mb-3">
                {fact.label}
              </p>
              <p className="text-xl md:text-3xl font-serif font-bold text-white leading-none tracking-tight">
                {fact.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section id="story" className="py-20 md:py-28 px-6 md:px-12 lg:px-24 bg-safari-white scroll-mt-24">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-stretch">
          <Reveal>
            <span className="text-[10px] md:text-[11px] font-space font-bold text-secondary uppercase tracking-[0.4em] md:tracking-[0.5em] block mb-5">
              Who we are
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold leading-[0.95] tracking-tighter text-primary mb-8">
              The desk,
              <br />
              <span className="font-light italic text-muted-foreground/60">and the country it plans.</span>
            </h2>
            <div className="space-y-6 text-base md:text-lg text-muted-foreground font-light leading-relaxed">
              <p>
                A Miale journey starts as a conversation in Arusha and ends as a document: which
                park on which day, how long the drive is, where the vehicle stops for the
                afternoon, and what the whole thing costs your party. That document is the product.
                Everything else, from the camp and the guide to the transfer at Kilimanjaro
                International, exists to make it happen the way it was written.
              </p>
              <p className="font-serif text-2xl md:text-[1.7rem] font-bold leading-snug tracking-tight text-primary">
                We work in one country.{" "}
                <span className="font-light italic text-muted-foreground/60">It is a deliberate limitation.</span>
              </p>
              <p>
                Tanzania holds a migration, a crater, four circuits of very different traffic, the
                tallest mountain on the continent and a coastline that finishes the trip. There is
                enough here to spend a career understanding, and enough variation between the parks
                that the right answer to &quot;what should we do in October?&quot; is rarely the
                obvious one.
              </p>
              <p>
                You get a name and a number before you fly. The person who plans the route is the
                person who answers when the weather changes, and the honest answer about a thin
                month is worth more to you than a confident one.
              </p>
            </div>
            <ul className="mt-9 grid gap-3">
              {CHECKLIST.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm md:text-base text-primary">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                  <span className="font-light leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.15} className="h-full flex flex-col gap-5">
            <Link
              href="/destinations"
              className="group flex-1 rounded-[2rem] bg-white border border-muted p-8 md:p-10 space-y-4 flex flex-col justify-center transition-all duration-500 hover:border-secondary/60 hover:shadow-lg hover:shadow-secondary/10 hover:-translate-y-0.5"
            >
              <span className="w-11 h-11 rounded-full bg-secondary/10 ring-1 ring-secondary/25 flex items-center justify-center text-secondary transition-colors duration-500 group-hover:bg-secondary group-hover:text-white">
                <Compass className="w-5 h-5" />
              </span>
              <div className="space-y-3">
                <p className="text-[9px] font-space font-bold uppercase tracking-[0.3em] text-secondary">Focus</p>
                <p className="font-serif text-2xl md:text-3xl font-bold text-primary tracking-tight">One country</p>
                <p className="text-sm md:text-base text-muted-foreground font-light leading-relaxed">
                  North, south, peaks and coast. Tanzania only.
                </p>
              </div>
              <span className="flex items-center gap-1.5 text-[9px] font-space font-bold uppercase tracking-[0.3em] text-secondary">
                Explore <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>
            <a
              href="mailto:info@mialesafari.com"
              className="group flex-1 rounded-[2rem] bg-primary p-8 md:p-10 text-white space-y-4 flex flex-col justify-center transition-all duration-500 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5"
            >
              <span className="w-11 h-11 rounded-full bg-white/10 ring-1 ring-secondary/30 flex items-center justify-center text-secondary transition-colors duration-500 group-hover:bg-secondary group-hover:text-white">
                <Mail className="w-5 h-5" />
              </span>
              <div className="space-y-3">
                <p className="text-[9px] font-space font-bold uppercase tracking-[0.3em] text-secondary">Reach</p>
                <p className="font-serif text-2xl md:text-3xl font-bold tracking-tight">Email the desk</p>
                <p className="text-sm md:text-base text-white/60 font-light leading-relaxed">
                  <span className="underline underline-offset-4 transition-colors group-hover:text-secondary">info@mialesafari.com</span>
                  , answered from Arusha.
                </p>
              </div>
            </a>
          </Reveal>
        </div>

        <Reveal className="mt-16 md:mt-24 max-w-[1400px]">
          <figure className="relative rounded-[2rem] md:rounded-[2.5rem] overflow-hidden">
            <div className="relative aspect-[16/9] sm:aspect-[16/7] w-full">
              <Image
                src={gorgeImage.src}
                alt={gorgeImage.alt}
                fill
                quality={70}
                sizes="(min-width: 768px) 100vw, 90vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/25 to-transparent" />
            </div>
            <figcaption className="absolute inset-x-0 bottom-0 p-6 md:p-10">
              <p className="font-serif text-xl md:text-3xl text-white tracking-tight">Olduvai Gorge</p>
              <p className="mt-2 max-w-2xl text-[13px] md:text-sm text-white/75 font-light leading-relaxed">
                Eroded beds inside the Ngorongoro Conservation Area, on the road north to the
                Serengeti gate. It is a stop, not a drive-past, on most northern itineraries.
              </p>
            </figcaption>
          </figure>
        </Reveal>
      </section>

      {/* Values */}
      <section className="py-20 md:py-28 px-6 md:px-12 lg:px-24 bg-primary">
        <div className="max-w-[1400px] mx-auto">
          <div className="max-w-3xl mb-12 md:mb-16">
            <span className="text-[10px] md:text-[11px] font-space font-bold text-secondary uppercase tracking-[0.4em] md:tracking-[0.5em] block mb-5">
              What we hold to
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold leading-[0.95] tracking-tighter text-white">
              Four positions
              <span className="font-light italic text-white/50"> we do not soften.</span>
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value, i) => (
              <Reveal key={value.title} delay={i * 0.08} className="h-full group">
                <div className="h-full rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 md:p-7 flex flex-col transition-all duration-500 hover:bg-white/[0.07] hover:border-secondary/30">
                  <span className="w-11 h-11 rounded-full border border-secondary/40 flex items-center justify-center text-secondary shrink-0 transition-colors duration-500 group-hover:bg-secondary group-hover:border-secondary group-hover:text-white">
                    <value.icon className="w-5 h-5" />
                  </span>
                  <h3 className="mt-5 font-serif text-lg md:text-xl text-white leading-snug">{value.title}</h3>
                  <p className="mt-3 text-sm text-white/60 font-light leading-relaxed">{value.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage */}
      <section className="py-20 md:py-28 px-6 md:px-12 lg:px-24 bg-safari-white">
        <div className="max-w-[1400px] mx-auto">
          <div className="max-w-3xl mb-10 md:mb-14">
            <span className="text-[10px] md:text-[11px] font-space font-bold text-secondary uppercase tracking-[0.4em] md:tracking-[0.5em] block mb-5">
              Where we go
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold leading-[0.95] tracking-tighter text-primary">
              Four corners
              <span className="font-light italic text-muted-foreground/60"> and the roads between.</span>
            </h2>
            <p className="mt-5 text-base md:text-lg text-muted-foreground font-light leading-relaxed">
              Most first visits run the north and fly home. The other three are quieter, and
              combining them is usually a matter of days rather than logistics.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CIRCUITS.map((circuit, i) => (
              <Reveal key={circuit.name} delay={i * 0.08} className="h-full">
                <Link
                  href={circuit.href}
                  className="group relative block h-full aspect-[3/4] rounded-[1.75rem] overflow-hidden"
                >
                  <Image
                    src={circuit.image.src}
                    alt={circuit.image.alt}
                    fill
                    quality={60}
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 88vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(36,66,46,0.96),rgba(36,66,46,0.78)_30%,rgba(36,66,46,0.15)_62%,transparent_80%)]" />
                  <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                    <h3 className="font-serif text-lg md:text-xl text-white leading-snug">{circuit.name}</h3>
                    <p className="mt-2 text-[12.5px] text-white/75 font-light leading-relaxed">{circuit.places}</p>
                    <p className="mt-3 flex items-center gap-1.5 text-[9px] font-space font-bold uppercase tracking-[0.3em] text-secondary">
                      Explore <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 md:py-28 px-6 md:px-12 lg:px-24 bg-white border-t border-muted">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          <Reveal className="lg:col-span-5">
            <span className="text-[10px] md:text-[11px] font-space font-bold text-secondary uppercase tracking-[0.4em] md:tracking-[0.5em] block mb-5">
              How it happens
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold leading-[0.95] tracking-tighter text-primary mb-7">
              From the first message
              <span className="font-light italic text-muted-foreground/60"> to the meeting point.</span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground font-light leading-relaxed mb-9">
              No two Miale plans start in the same place, but they all move through the same four
              steps. Nothing is charged and nothing is confirmed until the plan has been agreed.
            </p>
            <div className="relative aspect-[16/10] rounded-[1.75rem] overflow-hidden">
              <Image
                src={processImage.src}
                alt={processImage.alt}
                fill
                quality={70}
                sizes="(max-width: 1023px) 100vw, 42vw"
                className="object-cover"
              />
            </div>
          </Reveal>

          <div className="lg:col-span-7 space-y-4">
            {STEPS.map((step, i) => (
              <Reveal key={step.n} delay={i * 0.07}>
                <div className="flex gap-6 md:gap-8 items-start border-b border-muted pb-5">
                  <span className="font-serif text-3xl md:text-4xl font-light text-secondary/60 leading-none shrink-0 w-12">
                    {step.n}
                  </span>
                  <div>
                    <h3 className="font-serif text-xl md:text-2xl text-primary leading-snug">{step.title}</h3>
                    <p className="mt-2 text-sm md:text-base text-muted-foreground font-light leading-relaxed">{step.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
            <Reveal delay={0.32}>
              <Button asChild className="mt-8 h-14 rounded-full px-10 bg-primary text-white font-space font-bold uppercase tracking-widest text-[10px] hover:bg-primary/90">
                <Link href="/contact">
                  Start your enquiry <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Pull quote */}
      <section className="py-16 md:py-24 px-6 md:px-12 lg:px-24 bg-safari-white">
        <Reveal className="max-w-3xl mx-auto text-center">
          <p className="font-serif text-3xl md:text-5xl font-bold italic leading-[1.1] tracking-tighter text-primary">
            &ldquo;Explore. Discover. Experience.&rdquo;
          </p>
          <p className="mt-5 text-[10px] font-space font-bold uppercase tracking-[0.4em] text-muted-foreground/60">
            The three words on the logo, and the test every plan is held to
          </p>
        </Reveal>
      </section>

      {/* Closing CTA */}
      <section className="py-20 md:py-28 px-6 md:px-12 lg:px-24 bg-primary text-white">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <span className="text-secondary font-space font-bold uppercase tracking-[0.4em] text-[10px] md:text-xs block mb-5">
              Next step
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold leading-[0.95] tracking-tighter text-white">
              Tell us the dates
              <span className="font-light italic text-white/50"> and the party.</span>
            </h2>
            <p className="mt-6 max-w-xl text-white/60 font-light text-base md:text-lg leading-relaxed">
              We will tell you what the season is doing in that window, which circuit fits it, and
              what the plan looks like on paper. Then you decide.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Button asChild className="h-12 rounded-full px-8 bg-secondary text-white font-space font-bold uppercase tracking-widest text-[10px] hover:bg-secondary/90">
                <Link href="/contact">
                  Send an enquiry <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-12 rounded-full px-8 bg-transparent border-white/30 text-white font-space font-bold uppercase tracking-widest text-[10px] hover:bg-white hover:text-primary">
                <Link href="/destinations">Browse the parks</Link>
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-5">
            <a href="tel:+255769333331" className="flex items-center gap-4 group">
              <span className="w-11 h-11 rounded-full border border-white/15 flex items-center justify-center text-secondary shrink-0 group-hover:bg-secondary group-hover:text-white transition-colors">
                <Phone className="w-4 h-4" />
              </span>
              <span>
                <span className="block text-[9px] font-space font-bold uppercase tracking-[0.3em] text-white/40">Tanzania</span>
                <span className="block font-serif text-lg">+255 769 333 331</span>
              </span>
            </a>
            <a href="tel:+447769202031" className="flex items-center gap-4 group">
              <span className="w-11 h-11 rounded-full border border-white/15 flex items-center justify-center text-secondary shrink-0 group-hover:bg-secondary group-hover:text-white transition-colors">
                <Phone className="w-4 h-4" />
              </span>
              <span>
                <span className="block text-[9px] font-space font-bold uppercase tracking-[0.3em] text-white/40">United Kingdom</span>
                <span className="block font-serif text-lg">+44 7769 202031</span>
              </span>
            </a>
            <a href="mailto:info@mialesafari.com" className="flex items-center gap-4 group">
              <span className="w-11 h-11 rounded-full border border-white/15 flex items-center justify-center text-secondary shrink-0 group-hover:bg-secondary group-hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
              </span>
              <span>
                <span className="block text-[9px] font-space font-bold uppercase tracking-[0.3em] text-white/40">Email</span>
                <span className="block font-serif text-lg">info@mialesafari.com</span>
              </span>
            </a>
            <div className="flex items-center gap-4">
              <span className="w-11 h-11 rounded-full border border-white/15 flex items-center justify-center text-secondary shrink-0">
                <MapPin className="w-4 h-4" />
              </span>
              <span>
                <span className="block text-[9px] font-space font-bold uppercase tracking-[0.3em] text-white/40">The base</span>
                <span className="block font-serif text-lg">Sombetini JR, Arusha</span>
              </span>
            </div>
            <a
              href="https://instagram.com/mialesafari"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 group"
            >
              <span className="w-11 h-11 rounded-full border border-white/15 flex items-center justify-center text-secondary shrink-0 group-hover:bg-secondary group-hover:text-white transition-colors">
                <Instagram className="w-4 h-4" />
              </span>
              <span>
                <span className="block text-[9px] font-space font-bold uppercase tracking-[0.3em] text-white/40">Instagram</span>
                <span className="block font-serif text-lg">@mialesafari</span>
              </span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
