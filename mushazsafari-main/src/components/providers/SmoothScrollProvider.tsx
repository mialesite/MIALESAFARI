"use client";

import { ReactLenis } from "@studio-freight/react-lenis";
import { ReactNode } from "react";

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.14, duration: 0.8, smoothWheel: true }}>
      {children as any}
    </ReactLenis>
  );
}