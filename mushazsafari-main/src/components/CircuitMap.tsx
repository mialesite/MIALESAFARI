"use client";

import { useMemo } from "react";
import { buildParksProjection } from "@/lib/parks-projection";
import { PARK_SHAPES, REF_POINTS } from "@/lib/parks-geo";
import { SHAPE_KEYS_BY_DEST, SHAPE_LABEL } from "@/lib/destination-shapes";

/**
 * @fileOverview Compact to-scale Tanzania map for destination heroes. Focused
 * views drop every fill: the places render as outlines on the card background,
 * with faint country and region borders, gold strokes marking the selection.
 * Boundaries come from public OSM/Natural Earth data, same as the parks map.
 */

const DEST_NAMES = Object.keys(SHAPE_KEYS_BY_DEST);

export function CircuitMap({
  activeNames,
  activeKeys: rawKeys,
}: {
  activeNames?: string[];
  activeKeys?: string[];
}) {
  const proj = useMemo(() => buildParksProjection(560, 16), []);
  const active = useMemo(() => new Set(activeNames || []), [activeNames]);

  const activeKeys = useMemo(
    () =>
      new Set(
        rawKeys
          ? rawKeys
          : DEST_NAMES.filter((name) => active.has(name)).flatMap(
              (name) => SHAPE_KEYS_BY_DEST[name] || []
            )
      ),
    [active, rawKeys]
  );

  const destKeys = useMemo(
    () => Array.from(new Set(Object.values(SHAPE_KEYS_BY_DEST).flat())),
    []
  );

  // A single place (or circuit) gets its own perspective: the viewBox crops to
  // the active shapes' bounding box so a small park fills the frame instead of
  // being a sliver on the country map. The crop is rectangular so multi-park
  // circuits frame tightly instead of collapsing back to the country view.
  const focus = useMemo(() => {
    if (activeKeys.size === 0) return null;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    PARK_SHAPES.forEach((shape) => {
      if (!activeKeys.has(shape.key)) return;
      shape.rings.forEach((ring) =>
        ring.forEach(([lon, lat]) => {
          const [x, y] = proj.pointAt(lon, lat);
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        })
      );
    });
    if (!Number.isFinite(minX)) return null;
    const spanX = maxX - minX;
    const spanY = maxY - minY;
    const pad = Math.max(Math.max(spanX, spanY) * 0.42, 14);
    let w = Math.min(Math.max(spanX + pad * 2, 130), proj.VW);
    const h = Math.min(Math.max(spanY + pad * 2, 130), proj.VH);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    let x = Math.min(Math.max(cx - w / 2, 0), proj.VW - w);
    const y = Math.min(Math.max(cy - h / 2, 0), proj.VH - h);

    // Keep the Arusha reference marker and its italic label inside tight crops
    // when it sits near the selected places; distant parks keep their own framing.
    const ar = proj.pointAt(REF_POINTS.arusha.lon, REF_POINTS.arusha.lat);
    if (
      Math.abs(ar[0] - cx) < spanX / 2 + 110 &&
      Math.abs(ar[1] - cy) < spanY / 2 + 110
    ) {
      for (let i = 0; i < 4; i++) {
        const rightNeed = ar[0] + 110 * (w / proj.VW) + 8;
        if (rightNeed <= x + w) break;
        const grow = rightNeed - (x + w) + 6;
        if (grow <= 0 || w >= proj.VW) break;
        w = Math.min(w + grow, proj.VW);
        x = Math.max(0, Math.min(cx - w / 2, proj.VW - w));
      }
    }
    return { x, y, w, h };
  }, [activeKeys, proj]);

  // Inside a tight crop every SVG unit renders larger, so line weights and
  // label metrics are scaled to keep the drawn weight constant.
  const unit = focus ? focus.w / proj.VW : 1;
  const zoomed = unit < 0.92;
  const textScale = zoomed ? unit * 2.4 : 1;

  const countryPath = proj.pathFor("tanzania");
  const arusha = proj.pointAt(REF_POINTS.arusha.lon, REF_POINTS.arusha.lat);

  return (
    <svg
      viewBox={
        focus && zoomed
          ? `${focus.x.toFixed(1)} ${focus.y.toFixed(1)} ${focus.w.toFixed(1)} ${focus.h.toFixed(1)}`
          : `0 0 ${proj.VW} ${proj.VH}`
      }
      className="w-full h-auto"
      role="img"
      aria-label="Tanzania parks drawn to scale"
    >
      <defs>
        <clipPath id="circuit-map-clip">
          <path d={countryPath} />
        </clipPath>
      </defs>

      {/* Focused views keep only faint borders: transparent background, the
          country edge and region outlines traced rather than filled. */}
      <path
        d={countryPath}
        fill={zoomed ? "none" : "#EFE8D8"}
        stroke={zoomed ? "#D3C8AC" : "#C9B992"}
        strokeWidth={(zoomed ? 1.2 : 1.5) * unit}
      />

      <g clipPath="url(#circuit-map-clip)">
        <path
          d={proj.pathFor("victoria")}
          fill={zoomed ? "none" : "#D7E3E8"}
          stroke={zoomed ? "#C6D6DD" : "#B9CBD4"}
          strokeWidth={1 * unit}
        />
      </g>

      {PARK_SHAPES.filter((s) => s.kind === "context").map((s) => {
        const isActive = activeKeys.has(s.key);
        return (
          <path
            key={s.key}
            d={proj.pathFor(s.key)}
            fill={zoomed ? "none" : isActive ? "#F6E3A6" : "#E4DCC9"}
            stroke={zoomed ? (isActive ? "#B68D40" : "#D6CBB0") : isActive ? "#B68D40" : "#CFC4A9"}
            strokeWidth={(isActive ? 2 : 1.2) * unit}
            className="transition-all duration-300"
          />
        );
      })}

      {destKeys.map((key) => {
        const d = proj.pathFor(key);
        if (!d) return null;
        const isActive = activeKeys.has(key);
        return (
          <path
            key={key}
            d={d}
            fill={zoomed ? "none" : isActive ? "#F6E3A6" : "#E9E1CF"}
            stroke={isActive ? "#B68D40" : "#D6CBB0"}
            strokeWidth={(isActive ? 2 : 1.2) * unit}
            className="transition-all duration-300"
          />
        );
      })}

      {Array.from(activeKeys).map((key) => {
        const label = SHAPE_LABEL[key];
        if (!label) return null;
        const [cx, cy] = proj.centroidFor(key);
        return (
          <text
            key={key}
            x={cx + (label.dx || 0) * unit}
            y={cy + (label.dy || 0) * unit}
            textAnchor="middle"
            fontSize={13 * textScale}
            fontWeight={700}
            fill="#3D3223"
            stroke="#FFF9EE"
            strokeWidth={3.5 * textScale}
            paintOrder="stroke"
            style={{ pointerEvents: "none" }}
          >
            {label.text}
          </text>
        );
      })}

      <circle cx={arusha[0]} cy={arusha[1]} r={4 * textScale} fill="#B04A2A" />
      <text
        x={arusha[0] + 10 * unit}
        y={arusha[1] + 4 * unit}
        fontSize={12.5 * textScale}
        fontWeight={600}
        fontStyle="italic"
        fill="#B04A2A"
        stroke="#FFF9EE"
        strokeWidth={3.5 * textScale}
        paintOrder="stroke"
        style={{ pointerEvents: "none" }}
      >
        Arusha
      </text>
    </svg>
  );
}
