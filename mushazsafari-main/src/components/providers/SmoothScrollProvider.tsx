"use client";

import { ReactLenis } from "@studio-freight/react-lenis";
import { ReactNode, useEffect, useState } from "react";

/**
 * Lenis intercepts wheel input, which reads as lag on touch devices and
 * conflicts with reduced-motion preferences, so it only mounts on fine pointers.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(finePointer && !reduced);
  }, []);

  if (!enabled) return <>{children}</>;

  return (
    <ReactLenis root options={{ lerp: 0.14, duration: 0.8, smoothWheel: true }}>
      {/* react-lenis pins its own @types/react v18, so React 19 nodes need the cast */}
      {children as any}
    </ReactLenis>
  );
}
