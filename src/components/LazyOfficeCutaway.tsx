"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const OfficeCutaway = dynamic(() => import("./OfficeCutaway"), { ssr: false });

/**
 * The contact office sketch is ~2,400 SVG nodes. Rendered on the server it weighed ~190 KB of HTML plus
 * the same again in the React payload, all hydrated on load. Its generator is a few KB of code, so it is
 * drawn on the client instead, once the contact section approaches the viewport.
 */
export default function LazyOfficeCutaway() {
  const ref = useRef<SVGGElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const section = ref.current?.closest("section");
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        setShow(true);
      },
      { rootMargin: "800px 0px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return <g ref={ref}>{show && <OfficeCutaway shade="#e3ebe8" />}</g>;
}
