"use client";

import Image from "next/image";
import { mediaFor } from "@/lib/media";
import { cn } from "@/lib/utils";

/**
 * Supporting photograph for the cream hero band on the index pages, so the
 * right-hand column is not empty on desktop.
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
    <figure className={cn("relative aspect-[4/3] lg:aspect-[5/4] rounded-[2rem] overflow-hidden bg-muted", className)}>
      <Image
        src={asset.src}
        alt={asset.alt}
        fill
        loading="lazy"
        quality={70}
        sizes="(min-width: 1024px) 33vw, 90vw"
        className="object-cover"
      />
      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary/85 to-transparent px-5 py-4">
        <p className="text-[9px] font-space uppercase tracking-[0.2em] text-white/75">{caption}</p>
      </figcaption>
    </figure>
  );
}
