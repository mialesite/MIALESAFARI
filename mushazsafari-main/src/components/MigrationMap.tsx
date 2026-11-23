"use client";

import { useMemo } from "react";
import { PARK_SHAPES } from "@/lib/parks-geo";
import { makeProjector, type GeoPoint } from "@/lib/parks-projection";
import {
  CRATER,
  CRATER_RIM_SPAN,
  CROSSING_POINTS,
  GRUMETI_RIVER,
  LABEL_POINTS,
  MAASAI_MARA_RING,
  MARA_RIVER,
  MIGRATION_EXTENT,
  MONTH_ANCHORS,
  TZ_KE_BORDER,
} from "@/lib/migration-geo";
import { MIGRATION_MONTHS, MONTHS_SW, PHASE_COLOUR } from "@/lib/migration";
import { useLanguage } from "@/context/LanguageContext";

/**
 * @fileOverview The Serengeti and Mara ecosystem map, drawn to scale from the
 * same public boundary data as the parks map: real park rings, real river
 * courses, the real Kenya border, and each month marker on the ground the
 * herds are actually standing on.
 */

const VIEW_W = 900;
const PAD = 16;

const PLACE_NAMES: Record<"en" | "sw", Record<string, string>> = {
  en: {
    serengeti: "Serengeti",
    ngorongoro: "Ngorongoro",
    ndutu: "Ndutu plains",
    maasaiMara: "Maasai Mara",
    lakeVictoria: "Lake Victoria",
    kenya: "KENYA",
    tanzania: "TANZANIA",
    maraRiver: "Mara River",
    grumetiRiver: "Grumeti River",
  },
  sw: {
    serengeti: "Serengeti",
    ngorongoro: "Ngorongoro",
    ndutu: "Nyika za Ndutu",
    maasaiMara: "Maasai Mara",
    lakeVictoria: "Maziwa Victoria",
    kenya: "KENYA",
    tanzania: "TANZANIA",
    maraRiver: "Mto Mara",
    grumetiRiver: "Mto Grumeti",
  },
};

const LABEL_STYLE: Record<
  string,
  { size: number; fill: string; weight?: number; italic?: boolean; space?: number; anchor?: "start" | "middle" | "end" }
> = {
  serengeti: { size: 30, weight: 700, fill: "#3E3A2E" },
  ngorongoro: { size: 26, weight: 700, fill: "#3E3A2E" },
  ndutu: { size: 17, italic: true, fill: "#7A6B4A" },
  maasaiMara: { size: 25, weight: 700, fill: "#3E3A2E" },
  lakeVictoria: { size: 22, italic: true, fill: "#4C7299" },
  kenya: { size: 13, weight: 600, space: 3.5, fill: "#B7A98A" },
  tanzania: { size: 13, weight: 600, space: 3.5, fill: "#B7A98A" },
  maraRiver: { size: 17, italic: true, fill: "#5E86A8" },
  grumetiRiver: { size: 17, italic: true, fill: "#5E86A8" },
};

/** Catmull-Rom smoothed path through projected points, so the loop reads as a route. */
function curveThrough(points: GeoPoint[]): string {
  if (points.length < 2) return "";
  const f = (v: number) => v.toFixed(1);
  const parts = [`M ${f(points[0][0])} ${f(points[0][1])}`];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    parts.push(`C ${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(p2[0])} ${f(p2[1])}`);
  }
  return parts.join(" ");
}

function CrossingIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`} aria-hidden="true">
      <circle r="14" fill="#F2EAD8" stroke="#8B9284" strokeWidth="1.8" />
      <path d="M -7.3 -3.9 c 2.4 -4.2 4.9 -4.2 7.3 0 c 2.4 4.2 4.9 4.2 7.3 0" fill="none" stroke="#5E6B66" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M -7.3 4.1 c 2.4 -4.2 4.9 -4.2 7.3 0 c 2.4 4.2 4.9 4.2 7.3 0" fill="none" stroke="#5E6B66" strokeWidth="1.8" strokeLinecap="round" />
    </g>
  );
}

export function MigrationMap({
  activeIndex,
  onSelect,
}: {
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  const { lang } = useLanguage();
  const sw = lang === "sw";
  const names = sw ? PLACE_NAMES.sw : PLACE_NAMES.en;

  const geo = useMemo(() => {
    const proj = makeProjector(MIGRATION_EXTENT, VIEW_W, PAD);
    const ringsOf = (key: string) => PARK_SHAPES.find((s) => s.key === key)?.rings ?? [];
    const stops = MIGRATION_MONTHS.map(
      (m) => proj.pt(MONTH_ANCHORS[m.short][0], MONTH_ANCHORS[m.short][1])
    );
    const [craterX, craterY] = proj.pt(CRATER[0], CRATER[1]);
    return {
      VW: proj.VW,
      VH: proj.VH,
      victoria: proj.shape(ringsOf("victoria")),
      serengeti: proj.shape(ringsOf("serengeti")),
      ngorongoro: proj.shape(ringsOf("ngorongoro")),
      maraReserve: proj.ring(MAASAI_MARA_RING),
      maraRiver: proj.line(MARA_RIVER),
      grumeti: proj.line(GRUMETI_RIVER),
      border: proj.line(TZ_KE_BORDER),
      crater: { x: craterX, y: craterY, r: Math.abs(proj.pt(CRATER[0], CRATER[1] + CRATER_RIM_SPAN)[1] - craterY) },
      northbound: curveThrough(stops.slice(0, 8)),
      homeward: curveThrough([...stops.slice(7), stops[0]]),
      stops,
      crossings: Object.entries(CROSSING_POINTS).map(([key, [lon, lat]]) => {
        const [x, y] = proj.pt(lon, lat);
        return { key, x, y };
      }),
      labels: Object.entries(LABEL_POINTS).map(([key, [lon, lat]]) => {
        const [x, y] = proj.pt(lon, lat);
        return { key, x, y };
      }),
    };
  }, []);

  return (
    <svg
      viewBox={`0 0 ${geo.VW} ${geo.VH}`}
      role="img"
      aria-label={
        sw
          ? "Ramani ya Serengeti na ikolojia ya Mara, iliyochorwa kwa kipimo kutoka mipaka halisi ya hifadhi, mito na mpaka wa Kenya na Tanzania. Bofya alama ya mwezi ili kuchagua mwezi."
          : "Map of the Serengeti and Mara ecosystems, drawn to scale from real park boundaries, river courses and the Kenya border. Select a month marker to choose a month."
      }
      className="block h-auto w-full"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      <defs>
        <clipPath id="migration-frame">
          <rect width={geo.VW} height={geo.VH} rx="28" />
        </clipPath>
      </defs>

      <rect width={geo.VW} height={geo.VH} rx="28" fill="#F2EAD8" stroke="#DCCFB1" strokeWidth="1.5" />

      <g clipPath="url(#migration-frame)">
        <path d={geo.victoria} fill="#93B3D3" stroke="#6E93B8" strokeWidth="1.5" />

        <path d={geo.serengeti} fill="#CFDFBF" stroke="#6F8B6B" strokeWidth="1.8" />
        <path d={geo.ngorongoro} fill="#DBE4C8" stroke="#879F84" strokeWidth="1.8" />
        <path d={geo.maraReserve} fill="#E6D3A0" stroke="#A98F55" strokeWidth="1.8" />

        <path
          d={geo.border}
          fill="none"
          stroke="#C9B992"
          strokeWidth="1.5"
          strokeDasharray="7 5"
          strokeLinecap="round"
        />

        <g fill="none" stroke="#7FA9C4" strokeWidth="2.2" strokeLinecap="round" opacity="0.9">
          <path d={geo.maraRiver} />
          <path d={geo.grumeti} />
        </g>

        <circle
          cx={geo.crater.x}
          cy={geo.crater.y}
          r={geo.crater.r}
          fill="#D5DFC6"
          stroke="#8FA98C"
          strokeWidth="1.5"
        />
        <circle cx={geo.crater.x} cy={geo.crater.y} r={geo.crater.r * 0.4} fill="none" stroke="#8FA98C" strokeWidth="1.2" />

        <path d={geo.homeward} fill="none" stroke="#A8A190" strokeWidth="2.8" strokeDasharray="7 6" strokeLinecap="round" opacity="0.9" />
        <path d={geo.northbound} fill="none" stroke="#F6F0E1" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
        <path d={geo.northbound} fill="none" stroke="#B68D40" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />

        {geo.crossings.map((c) => (
          <CrossingIcon key={c.key} x={c.x} y={c.y} />
        ))}

        {geo.labels.map(({ key, x, y }) => {
          const style = LABEL_STYLE[key];
          if (!style) return null;
          return (
            <text
              key={key}
              x={x}
              y={y}
              textAnchor={style.anchor ?? "middle"}
              fontSize={style.size}
              fontWeight={style.weight ?? 400}
              fontStyle={style.italic ? "italic" : undefined}
              letterSpacing={style.space}
              fill={style.fill}
              stroke="#F2EAD8"
              strokeWidth={4.5}
              paintOrder="stroke"
              style={{ pointerEvents: "none" }}
            >
              {names[key]}
            </text>
          );
        })}
      </g>

      <g transform={`translate(${geo.VW - 62} ${geo.VH - 56})`} aria-hidden="true">
        <circle r="22" fill="none" stroke="#C4B389" strokeWidth="1.5" />
        <circle r="16.5" fill="none" stroke="#C4B389" strokeWidth="0.8" opacity="0.6" />
        <path d="M 0 -12 L 4 6 L 0 2.5 L -4 6 Z" fill="#B68D40" />
        <text y="-28" textAnchor="middle" fontSize="11" fontWeight="700" fill="#7A6B4A">
          N
        </text>
      </g>

      <g clipPath="url(#migration-frame)">
        {MIGRATION_MONTHS.map((month, i) => {
          const colour = PHASE_COLOUR[month.phase];
          const active = month.index === activeIndex;
          const [x, y] = geo.stops[i];
          return (
            <g
              key={month.short}
              data-month={month.short}
              onClick={() => onSelect(month.index)}
              className="cursor-pointer"
            >
              <circle cx={x} cy={y} r="24" fill="transparent" />
              {active && (
                <circle cx={x} cy={y} r="18" fill="none" stroke={colour} strokeWidth="3" opacity="0.4" />
              )}
              <circle
                cx={x}
                cy={y}
                r={active ? 11.5 : 9}
                fill={active ? colour : "#F6F0E1"}
                stroke={active ? "#57503F" : colour}
                strokeWidth={active ? 1.4 : 2.6}
              />
              <text
                x={x}
                y={y + 28}
                textAnchor="middle"
                fontSize={active ? 24 : 20}
                fontWeight={active ? 700 : 600}
                fill={active ? "#3E3A2E" : "#57503F"}
                stroke="#F2EAD8"
                strokeWidth="5"
                paintOrder="stroke"
              >
                {sw ? MONTHS_SW[month.index].short : month.short}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
