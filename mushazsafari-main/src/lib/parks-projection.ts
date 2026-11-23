/**
 * @fileOverview Projects the embedded geographic datasets into SVG space.
 * Equirectangular projection scaled by cos(mid-latitude), so shapes stay
 * to scale relative to each other. Shared by the parks map, the card
 * mini-maps and the migration map.
 */

import { PARK_SHAPES, type ParkShape } from "./parks-geo";
import { REGION_SHAPES } from "./regions-geo";

const ALL_SHAPES: ParkShape[] = [...PARK_SHAPES, ...REGION_SHAPES];

export type GeoPoint = [number, number];

/** Longitude/latitude window the projection is fitted to. */
export interface Extent {
  w: number;
  e: number;
  n: number;
  s: number;
}

export interface Projector {
  VW: number;
  VH: number;
  pt(lon: number, lat: number): GeoPoint;
  /** Open polyline, for rivers and borders. */
  line(points: GeoPoint[]): string;
  /** Closed outline, for a single boundary ring. */
  ring(points: GeoPoint[]): string;
  /** Every ring of a shape, in one path. */
  shape(rings: GeoPoint[][]): string;
  centroid(points: GeoPoint[]): GeoPoint;
}

export function extentOf(rings: GeoPoint[][]): Extent {
  let w = 999, e = -999, n = -999, s = 999;
  rings.forEach((ring) =>
    ring.forEach(([lon, lat]) => {
      w = Math.min(w, lon);
      e = Math.max(e, lon);
      n = Math.max(n, lat);
      s = Math.min(s, lat);
    })
  );
  return { w, e, n, s };
}

export function makeProjector(extent: Extent, viewW = 760, pad = 18): Projector {
  const { w, e, n, s } = extent;
  const cosMid = Math.cos(((n + s) / 2) * Math.PI / 180);
  const pw = (e - w) * cosMid;
  const ph = n - s;
  const VH = Math.round((viewW * ph) / pw);
  const scale = (viewW - pad * 2) / pw;

  const pt = (lon: number, lat: number): GeoPoint => [
    (lon - w) * cosMid * scale + pad,
    (n - lat) * scale + pad,
  ];
  const walk = (points: GeoPoint[]): string =>
    points
      .map(([lon, lat], i) => {
        const [x, y] = pt(lon, lat);
        return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");

  return {
    VW: viewW,
    VH,
    pt,
    line: (points) => walk(points),
    ring: (points) => walk(points) + " Z",
    shape: (rings) => rings.map((ring) => walk(ring) + " Z").join(" "),
    centroid: (points) => {
      if (points.length === 0) return [0, 0];
      let x = 0, y = 0;
      points.forEach(([lon, lat]) => {
        const p = pt(lon, lat);
        x += p[0];
        y += p[1];
      });
      return [x / points.length, y / points.length];
    },
  };
}

export interface ParksProjection {
  VW: number;
  VH: number;
  shape(key: string): ParkShape | undefined;
  pathFor(key: string): string;
  centroidFor(key: string): [number, number];
  pointAt(lon: number, lat: number): [number, number];
}

export function buildParksProjection(viewW = 760, pad = 18): ParksProjection {
  const country = PARK_SHAPES.find((s) => s.key === "tanzania");
  if (!country) throw new Error("Tanzania outline missing from parks-geo");

  const proj = makeProjector(extentOf(country.rings), viewW, pad);
  const pathCache = new Map<string, string>();

  return {
    VW: proj.VW,
    VH: proj.VH,
    shape(key) {
      return ALL_SHAPES.find((x) => x.key === key);
    },
    pathFor(key) {
      const cached = pathCache.get(key);
      if (cached) return cached;
      const sh = ALL_SHAPES.find((x) => x.key === key);
      const d = sh ? proj.shape(sh.rings) : "";
      pathCache.set(key, d);
      return d;
    },
    centroidFor(key) {
      const sh = ALL_SHAPES.find((x) => x.key === key);
      if (!sh || sh.rings.length === 0) return [0, 0];
      return proj.centroid(sh.rings[0]);
    },
    pointAt(lon, lat) {
      return proj.pt(lon, lat);
    },
  };
}
