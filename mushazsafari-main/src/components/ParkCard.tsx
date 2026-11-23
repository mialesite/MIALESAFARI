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
import { MASTER_DESTINATIONS } from "@/lib/master-destinations";

/**
 * @fileOverview Full-bleed park card in the house listing style: the photo is
 * the link, a gradient scrim carries the title, and the blurb, animals and
 * tags reveal on hover on desktop while staying open on touch screens. A
 * frosted mini boundary map keeps the to-scale identity on every card, drawn
 * glass so the photograph reads through it.
 */

const IMAGE_BY_NAME: Record<string, string> = Object.fromEntries(
  MASTER_DESTINATIONS.map((d) => [d.name, d.imageId])
);

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
    <svg
      viewBox={`0 0 ${geo.VW} ${geo.VH}`}
      className="w-full h-full"
      style={{ filter: "drop-shadow(0 1px 2px rgba(13, 26, 18, 0.55))" }}
      aria-hidden="true"
    >
      <path d={geo.countryPath} fill="none" stroke="#DFCFA6" strokeWidth={2} />
      {geo.shapePaths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#E5C37D" strokeWidth={2.6} />
      ))}
    </svg>
  );
}

export function ParkCard({ park, index, badge }: { park: any; index: number; badge?: string }) {
  const facts = parkFacts(park.name);
  const shapeKeys = SHAPE_KEYS_BY_DEST[park.name] || [];
  const hasShape = shapeKeys.length > 0 && shapeKeys.some((k) => PARK_SHAPES.some((s) => s.key === k));
  const asset = mediaFor(park.featuredImage || IMAGE_BY_NAME[park.name]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.06 }}
      viewport={{ once: true, margin: "-60px" }}
      className="group relative overflow-hidden rounded-[2.5rem] aspect-[4/5] shadow-sm hover:shadow-2xl transition-shadow duration-500 bg-muted"
    >
      <Image
        src={asset.src}
        alt={asset.alt || park.name}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        className="object-cover transition-transform duration-[4000ms] ease-out group-hover:scale-[1.06]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/5 pointer-events-none" />

      {badge && (
        <div className="absolute top-5 left-5 pointer-events-none">
          <span className="glass border border-white/20 px-4 py-2 rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
            {badge}
          </span>
        </div>
      )}

      {hasShape && (
        <div className="absolute top-5 right-5 w-16 h-16 md:w-20 md:h-20 pointer-events-none">
          <ParkMiniMap shapeKeys={shapeKeys} />
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 p-6 md:p-7 text-white pointer-events-none">
        <p className="text-[9px] md:text-[10px] font-space font-bold uppercase tracking-[0.25em] text-[#E5C37D] mb-2">
          {park.type || "Protected area"}
        </p>
        <h3 className="text-3xl md:text-4xl font-serif leading-tight text-white drop-shadow-sm">
          {park.name}
        </h3>
        {park.distance ? (
          <p className="text-xs md:text-sm text-white/75 font-light italic mt-1.5">{park.distance}</p>
        ) : null}

        <div className="max-h-[26rem] opacity-100 overflow-hidden transition-all duration-500 ease-out lg:max-h-0 lg:opacity-0 lg:group-hover:max-h-[26rem] lg:group-hover:opacity-100">
          <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-4 md:p-5 mt-4">
            <p className="text-sm text-white/85 font-light leading-relaxed">
              {facts?.blurb || park.shortDescription}
            </p>

            {facts && facts.animals.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3.5">
                {facts.animals.map((a) => (
                  <span key={a} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 text-[10px] font-space font-bold tracking-wide text-white">
                    <PawPrint className="w-3 h-3 text-[#E5C37D] shrink-0" />
                    {a}
                  </span>
                ))}
              </div>
            )}

            {facts && facts.tags.length > 0 && (
              <p className="text-[9px] font-space font-bold uppercase tracking-[0.18em] text-white/55 mt-3.5">
                {facts.tags.join(" · ")}
              </p>
            )}

            <span className="inline-flex items-center gap-2 text-[10px] font-space font-bold uppercase tracking-[0.2em] text-white mt-4">
              Open the guide
              <ArrowRight className="w-3.5 h-3.5 text-[#E5C37D] transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </div>

      <Link href={`/destinations/${park.id}`} className="absolute inset-0" aria-label={park.name}>
        <span className="sr-only">{park.name}</span>
      </Link>
    </motion.article>
  );
}
