"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { buildParksProjection } from "@/lib/parks-projection";
import { PARK_SHAPES, REF_POINTS } from "@/lib/parks-geo";
import { REGION_SHAPES } from "@/lib/regions-geo";
import { SHAPE_LABEL } from "@/lib/destination-shapes";

/**
 * @fileOverview To-scale Tanzania parks map for the /parks page, drawn in the
 * same quiet outline language as the circuit maps: transparent plate, faint
 * country and region borders, gold outlines marking the places the desk plans.
 * Boundaries come from public OSM/Natural Earth data.
 */

const LINK_ORDER: { key: string; name: string }[] = [
  { key: "serengeti", name: "Serengeti National Park" },
  { key: "ngorongoro", name: "Ngorongoro Crater" },
  { key: "tarangire", name: "Tarangire National Park" },
  { key: "manyara", name: "Lake Manyara" },
  { key: "kilimanjaro", name: "Mount Kilimanjaro" },
  { key: "unguja", name: "Zanzibar Archipelago" },
  { key: "nyerere", name: "Nyerere National Park" },
  { key: "mahale", name: "Mahale Mountains" },
];

export function TanzaniaParksMap({ destinations }: { destinations: { id: string; name: string }[] }) {
  const proj = useMemo(() => buildParksProjection(760, 20), []);
  const [hovered, setHovered] = useState<string | null>(null);

  const countryPath = proj.pathFor("tanzania");
  const arusha = proj.pointAt(REF_POINTS.arusha.lon, REF_POINTS.arusha.lat);

  const linkFor = (name: string) => destinations.find((d) => d.name === name);

  return (
    <section id="map" className="pb-4 md:pb-8">
      <div className="w-full bg-white">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 p-6 md:p-10 lg:p-14">
        <div>
          <svg viewBox={`0 0 ${proj.VW} ${proj.VH}`} className="w-full h-auto" role="img" aria-label="Tanzania parks drawn to scale">
            <defs>
              <clipPath id="tz-clip">
                <path d={countryPath} />
              </clipPath>
            </defs>

            <path d={countryPath} fill="none" stroke="#C9B992" strokeWidth={1.5} />

            <g clipPath="url(#tz-clip)">
              <path d={proj.pathFor("victoria")} fill="none" stroke="#C6D6DD" strokeWidth={1} />
            </g>

            {REGION_SHAPES.map((r) => (
              <path
                key={r.key}
                d={proj.pathFor(r.key)}
                fill="none"
                stroke="#D8CCB2"
                strokeWidth={1}
                strokeDasharray="3.2 2.4"
              />
            ))}

            {PARK_SHAPES.filter((s) => s.kind === "context").map((s) => (
              <path
                key={s.key}
                d={proj.pathFor(s.key)}
                fill="none"
                stroke="#D6CBB0"
                strokeWidth={1.2}
              />
            ))}

            {LINK_ORDER.map((l) => {
              const d = proj.pathFor(l.key);
              if (!d) return null;
              const active = hovered === l.key || hovered === l.name;
              return (
                <path
                  key={l.key}
                  d={d}
                  fill="transparent"
                  stroke="#B68D40"
                  strokeWidth={active ? 2.6 : 2}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHovered(l.key)}
                  onMouseLeave={() => setHovered(null)}
                />
              );
            })}

            {LINK_ORDER.filter((l) => SHAPE_LABEL[l.key]).map((l) => {
              const label = SHAPE_LABEL[l.key];
              const [cx, cy] = proj.centroidFor(l.key);
              return (
                <text
                  key={l.key}
                  x={cx + (label.dx || 0)}
                  y={cy + (label.dy || 0)}
                  textAnchor="middle"
                  fontSize={13}
                  fontWeight={700}
                  fill="#3D3223"
                  stroke="#FFF9EE"
                  strokeWidth={3.5}
                  paintOrder="stroke"
                  style={{ pointerEvents: "none" }}
                >
                  {label.text}
                </text>
              );
            })}

            <circle cx={arusha[0]} cy={arusha[1]} r={4} fill="#B04A2A" />
            <text
              x={arusha[0] + 10}
              y={arusha[1] + 4}
              fontSize={12.5}
              fontWeight={600}
              fontStyle="italic"
              fill="#B04A2A"
              stroke="#FFF9EE"
              strokeWidth={3.5}
              paintOrder="stroke"
              style={{ pointerEvents: "none" }}
            >
              Arusha
            </text>
          </svg>
        </div>

        <div className="flex flex-col justify-center">
          <span className="text-secondary font-space font-bold uppercase tracking-[0.4em] text-[10px] mb-4 block">
            The Shape of the Route
          </span>
          <h2 className="text-4xl md:text-5xl font-serif text-primary leading-[1.05] tracking-tight mb-6">
            Ground, to scale
          </h2>
          <p className="text-base md:text-lg text-muted-foreground font-light leading-relaxed mb-8">
            The gold outlines are the places the desk plans, traced from public boundary data and drawn at
            their real size against the rest of the country. The pale outlines are parks left for another
            trip, and they show how close everything really is. The gaps between the gold ones are the
            transfer days, which is why a route is built around where the animals are standing rather than
            around distance.
          </p>

          <div className="h-px bg-muted mb-8" />

          <ul className="flex flex-wrap gap-x-8 gap-y-3.5">
            {LINK_ORDER.map((l) => {
              const dest = linkFor(l.name);
              const content = (
                <>
                  <MapPin className="w-3.5 h-3.5" />
                  {l.name}
                </>
              );
              const cls = "inline-flex items-center gap-2 text-[10px] font-space font-bold uppercase tracking-widest text-[#B04A2A] transition-colors";
              if (!dest) return <li key={l.key}><span className={cls + " opacity-60"}>{content}</span></li>;
              return (
                <li key={l.key}>
                  <Link
                    href={`/destinations/${dest.id}`}
                    onMouseEnter={() => setHovered(l.key)}
                    onMouseLeave={() => setHovered(null)}
                    className={cls + " hover:text-primary"}
                  >
                    {content}
                  </Link>
                </li>
              );
            })}
          </ul>

          <p className="mt-10 text-[9px] font-space uppercase tracking-[0.2em] text-muted-foreground/70">
            Boundaries traced from OpenStreetMap and Natural Earth public data
          </p>
        </div>
        </div>
      </div>
    </section>
  );
}
