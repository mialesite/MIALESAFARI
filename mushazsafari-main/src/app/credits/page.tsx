import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { MEDIA } from "@/lib/media";

export const metadata: Metadata = {
  title: "Photo credits",
  description:
    "Every photograph on this site, with its licence and the person who made it. Wikimedia Commons images are credited to their authors under the terms each licence requires.",
};

const commons = MEDIA.filter((a) => a.kind === "wikimedia-commons");
const operator = MEDIA.filter((a) => a.kind === "operator-photography");

function commonsUrl(file: string) {
  return `https://commons.wikimedia.org/wiki/${encodeURIComponent(file)}`;
}

export default function PhotoCreditsPage() {
  return (
    <main className="min-h-screen bg-safari-white">
      <Navbar />

      <header className="pt-40 pb-16 px-6 md:px-12 lg:px-24 border-b border-safari-sand/40">
        <div className="max-w-[1400px] mx-auto">
          <span className="text-[10px] font-space font-bold uppercase tracking-[0.4em] text-secondary mb-4 block">
            Attribution
          </span>
          <h1 className="text-5xl md:text-7xl font-serif text-primary leading-[0.95] tracking-tighter mb-6">
            Photo <span className="italic font-light">Credits</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed max-w-3xl">
            Wildlife and landscape photography carries the name of the person who waited for it. Where this
            site borrows an image made by someone else, that photographer is credited below with the licence
            the file carries, and linked back to the original page so anyone can verify it.
          </p>
        </div>
      </header>

      <section className="py-16 md:py-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif text-primary">
                Wikimedia Commons <span className="italic font-light">({commons.length})</span>
              </h2>
              <p className="text-sm text-muted-foreground font-light mt-2 max-w-2xl">
                Each file below is reused under its own free licence. Follow the link to the source page for the
                full licence text and any share-alike obligations.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {commons.map((asset) => (
              <article
                key={asset.id}
                className="group bg-white rounded-[1.75rem] border border-safari-sand/40 overflow-hidden flex flex-col"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={asset.src}
                    alt={asset.alt}
                    fill
                    loading="lazy"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-safari-green/75 border border-white/15 backdrop-blur-md text-white text-[9px] font-space font-bold uppercase tracking-widest">
                    {asset.license}
                  </span>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-xs font-light text-muted-foreground leading-relaxed mb-4">{asset.alt}</p>
                  <div className="mt-auto space-y-1.5">
                    <p className="text-[10px] font-space font-bold uppercase tracking-[0.2em] text-primary">
                      {asset.author}
                    </p>
                    <Link
                      href={commonsUrl(asset.wikimediaFile!)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] text-secondary hover:text-accent transition-colors underline underline-offset-4 decoration-secondary/40"
                    >
                      {asset.wikimediaFile}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 px-6 md:px-12 lg:px-24 bg-white border-y border-safari-sand/30">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif text-primary mb-4">
            Field photography <span className="italic font-light">({operator.length})</span>
          </h2>
          <p className="text-sm text-muted-foreground font-light leading-relaxed max-w-3xl mb-10">
            The remaining images on this site are landscape and wildlife frames held in the Miale library and
            served from our own storage. They are not separately licensed and are used here to describe the
            places and animals Miale itineraries visit.
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-2">
            {operator.map((asset) => (
              <div key={asset.id} className="relative aspect-square rounded-xl overflow-hidden bg-safari-sand/20" title={asset.alt}>
                <Image src={asset.src} alt={asset.alt} fill loading="lazy" className="object-cover" sizes="16vw" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="text-2xl font-serif text-primary mb-4">Marks and identity</h2>
          <p className="text-sm text-muted-foreground font-light leading-relaxed max-w-3xl">
            The Miale wordmark is the company&rsquo;s own artwork. Nothing on this page grants a licence to the
            Miale name, logo or trade dress. Questions about an image can go to the Arusha desk at{" "}
            <a
              href="mailto:hello@mialesafari.com"
              className="text-secondary underline underline-offset-4 decoration-secondary/40"
            >
              hello@mialesafari.com
            </a>
            .
          </p>
          <Link
            href="/"
            className="inline-block mt-10 text-[10px] font-space font-bold uppercase tracking-[0.3em] text-primary border-b border-secondary pb-1 hover:text-secondary transition-colors"
          >
            Back to the beginning
          </Link>
        </div>
      </section>
    </main>
  );
}
