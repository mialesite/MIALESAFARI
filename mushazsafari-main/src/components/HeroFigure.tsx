"use client";

import Image from "next/image";
import { mediaFor } from "@/lib/media";
import { cn } from "@/lib/utils";

/**
 * Hero photograph that covers its slot end to end: full-bleed on phones with
 * a soft bottom edge, and on desktop a right-hand plate that runs the whole
 * height of the band, rounded only where it meets the text column.
 */
export function HeroFigure({
  assetRef,
  caption,
  className,
}: {
  assetRef: string;
  caption: string;
  className?: string;
}) {
  const asset = mediaFor(assetRef);

  return (
    <figure
      className={cn(
        "absolute inset-0 overflow-hidden bg-muted rounded-b-[2.5rem] lg:rounded-b-none lg:rounded-l-[3.5rem]",
        className
      )}
    >
      <Image
        src={asset.src}
        alt={asset.alt}
        fill
        loading="lazy"
        quality={70}
        sizes="(min-width: 1024px) 42vw, 100vw"
        className="object-cover"
      />
      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary/85 to-transparent px-6 md:px-10 py-4">
        <p className="text-[9px] font-space uppercase tracking-[0.2em] text-white/75">{caption}</p>
      </figcaption>
    </figure>
  );
}
