"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { PawPrint, ArrowRight } from "lucide-react";
import { useMemo } from "react";
import { PARK_SHAPES } from "@/lib/parks-geo";
import { SHAPE_KEYS_BY_DEST } from "@/lib/destination-shapes";
import { parkFacts } from "@/lib/park-facts";
import { mediaFor } from "@/lib/media";

/**
 * @fileOverview Reference-style park card: mini boundary map, main animals,
 * desk-voice blurb, tag chips, and the link into the full destination guide.
 */

export function ParkMiniMap({ shapeKeys }: { shapeKeys: string[] }) {
  const geo = useMemo(() => {
    const shapes = shapeKeys
      .map((k) => PARK_SHAPES.find((s) => s.key === k))
      .filter((s): s is (typeof PARK_SHAPES)[number] => Boolean(s));
    if (shapes.length === 0) return null;
    let w = 999, e = -999, n = -999, s = 999;
    shapes.forEach((sh) => sh.rings.forEach((ring) =>
      ring.forEach(([lon, lat]) => {
        w = Math.min(w, lon); e = Math.max(e, lon);
        n = Math.max(n, lat); s = Math.min(s, lat);
      })
    ));
    const span = Math.max(e - w, n - s);
    const pad = span * 0.3;
    w -= pad; e += pad; n += pad; s -= pad;
    const cosMid = Math.cos(((n + s) / 2) * Math.PI / 180);
    const pw = (e - w) * cosMid;
    const ph = n - s;
    const VW = 150, VH = 150;
    const scale = Math.min(VW / pw, VH / ph);
    const ox = (VW - pw * scale) / 2;
    const oy = (VH - ph * scale) / 2;
    const map = ([lon, lat]: [number, number]): [number, number] => [
      (lon - w) * cosMid * scale + ox,
      (n - lat) * scale + oy,
    ];
    const pathOf = (sh: (typeof PARK_SHAPES)[number]) =>
      sh.rings
        .map((ring) =>
          ring
            .map((pt, i) => {
              const [x, y] = map(pt);
              return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
            })
            .join(" ") + " Z"
        )
        .join(" ");
    const country = PARK_SHAPES.find((x) => x.key === "tanzania");
    return { VW, VH, countryPath: country ? pathOf(country) : "", shapePaths: shapes.map((sh) => pathOf(sh)) };
  }, [shapeKeys]);

  if (!geo) return null;
  return (
    <svg viewBox={`0 0 ${geo.VW} ${geo.VH}`} className="w-full h-full" aria-hidden="true">
      <path d={geo.countryPath} fill="#EFE8D8" stroke="#C9B992" strokeWidth={1.4} />
      {geo.shapePaths.map((d, i) => (
        <path key={i} d={d} fill="#F6E3A6" stroke="#B68D40" strokeWidth={1.8} />
      ))}
    </svg>
  );
}

export function ParkCard({ park, index }: { park: any; index: number }) {
  const facts = parkFacts(park.name);
  const shapeKeys = SHAPE_KEYS_BY_DEST[park.name] || [];
  const hasShape = shapeKeys.length > 0 && shapeKeys.some((k) => PARK_SHAPES.some((s) => s.key === k));

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.06 }}
      viewport={{ once: true, margin: "-60px" }}
      className="group bg-white rounded-[2rem] border border-muted p-6 md:p-7 shadow-sm hover:shadow-xl transition-shadow duration-500 flex flex-col"
    >
      <div className="flex gap-5 mb-5">
        <div className="relative w-24 h-28 md:w-28 md:h-32 rounded-2xl bg-safari-white border border-muted overflow-hidden shrink-0">
          {hasShape ? (
            <ParkMiniMap shapeKeys={shapeKeys} />
          ) : (
            <Image src={mediaFor(park.featuredImage).src} alt={park.name} fill sizes="120px" quality={60} className="object-cover" />
          )}
        </div>
        <div className="min-w-0 flex flex-col justify-center">
          <p className="text-[9px] md:text-[10px] font-space font-bold uppercase tracking-[0.25em] text-secondary mb-1.5">
            {park.type || "Protected area"}
          </p>
          <h3 className="text-2xl md:text-3xl font-serif text-primary leading-tight transition-colors group-hover:text-secondary">
            {park.name}
          </h3>
          {park.distance ? (
            <p className="text-[10px] md:text-xs text-muted-foreground font-light mt-1.5">{park.distance}</p>
          ) : null}
        </div>
      </div>

      {facts && facts.animals.length > 0 && (
        <div className="mb-5">
          <p className="text-[9px] md:text-[10px] font-space font-bold uppercase tracking-[0.25em] text-muted-foreground mb-2.5">
            Main animals
          </p>
          <ul className="space-y-1.5">
            {facts.animals.map((a) => (
              <li key={a} className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                <PawPrint className="w-3.5 h-3.5 text-secondary shrink-0" />
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-sm md:text-[15px] text-muted-foreground font-light leading-relaxed mb-5">
        {facts?.blurb || park.shortDescription}
      </p>

      {facts && (
        <div className="flex flex-wrap gap-2 mb-6">
          {facts.tags.map((t) => (
            <span key={t} className="px-3.5 py-1.5 rounded-full bg-muted/60 text-[9px] font-space font-bold uppercase tracking-[0.15em] text-muted-foreground">
              {t}
            </span>
          ))}
        </div>
      )}

      <Link
        href={`/destinations/${park.id}`}
        className="mt-auto inline-flex w-fit items-center gap-2 text-[10px] font-space font-bold uppercase tracking-[0.2em] text-[#B04A2A] hover:text-primary transition-colors"
      >
        Open the guide
        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
      </Link>
    </motion.article>
  );
}
