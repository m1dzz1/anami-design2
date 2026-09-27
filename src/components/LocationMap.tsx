"use client";

import { useState } from "react";
import Image from "next/image";
import { MapPin, MousePointerClick } from "lucide-react";
import { images, mapsEmbedUrl } from "@/content/site";

/**
 * Map facade: a light static map (instant, no third-party requests) that swaps to the
 * interactive Google embed on demand. The embed alone takes several seconds and keeps the
 * browser's loading indicator spinning, so it is never loaded before the visitor asks for it.
 */
export default function LocationMap({ title, imageAlt, activateLabel }: { title: string; imageAlt: string; activateLabel: string }) {
  const [active, setActive] = useState(false);

  // Warm up the connection as soon as the visitor shows intent
  const preconnect = () => {
    if (document.querySelector('link[data-maps-preconnect]')) return;
    for (const href of ["https://www.google.com", "https://maps.gstatic.com", "https://maps.googleapis.com"]) {
      const link = document.createElement("link");
      link.rel = "preconnect";
      link.href = href;
      link.crossOrigin = "";
      link.dataset.mapsPreconnect = "";
      document.head.appendChild(link);
    }
  };

  if (active) {
    return (
      <iframe
        src={mapsEmbedUrl}
        title={title}
        referrerPolicy="no-referrer-when-downgrade"
        className="absolute inset-0 size-full border-0 [filter:grayscale(0.4)_saturate(0.85)_contrast(0.97)]"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActive(true)}
      onPointerEnter={preconnect}
      onFocus={preconnect}
      onTouchStart={preconnect}
      aria-label={activateLabel}
      className="group absolute inset-0 block size-full cursor-pointer"
    >
      <Image
        src={images.map.src}
        alt={imageAlt}
        fill
        placeholder="blur"
        blurDataURL={images.map.blur}
        sizes="(min-width: 1280px) 34vw, (min-width: 768px) 90vw, 100vw"
        className="object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:scale-[1.03]"
      />
      {/* Location pin — the static map is centred on the address */}
      <span aria-hidden="true" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full drop-shadow-[0_6px_8px_rgb(16_42_36/0.35)]">
        <MapPin size={42} strokeWidth={1.25} fill="var(--anami-green)" className="text-white" />
      </span>
      <span className="absolute left-1/2 top-[calc(50%+1rem)] inline-flex -translate-x-1/2 items-center gap-2 whitespace-nowrap bg-white/92 px-3.5 py-2 text-[0.75rem] font-semibold text-ink opacity-0 shadow-md transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
        <MousePointerClick aria-hidden="true" size={15} strokeWidth={1.75} />
        {activateLabel}
      </span>
      <span className="absolute bottom-0 left-0 bg-white/80 px-1.5 py-0.5 text-[0.625rem] text-ink/70">© OpenStreetMap</span>
    </button>
  );
}
