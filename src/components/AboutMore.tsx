"use client";

import { useId, useState, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";

/**
 * "Više o nama" — reveals the remaining company description in place (content stays in the DOM for SEO).
 * `children` are always visible, between the hidden paragraphs and the button.
 */
export default function AboutMore({
  paragraphs,
  moreLabel,
  lessLabel,
  children,
}: {
  paragraphs: string[];
  moreLabel: string;
  lessLabel: string;
  children?: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const regionId = useId();

  return (
    <>
      <div
        id={regionId}
        inert={!expanded}
        className={`grid transition-[grid-template-rows,opacity] duration-700 ease-out-expo ${
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="mt-5 space-y-5 border-l border-teal-light/50 pl-5 text-[1.0313rem] leading-[1.65] text-white/88">
            {paragraphs.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </div>
        </div>
      </div>
      {children}
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={regionId}
        onClick={() => setExpanded((value) => !value)}
        className="group mt-8 inline-flex min-h-11 items-center gap-5 text-[0.8125rem] font-bold uppercase tracking-[0.14em] text-white"
      >
        <span className="link-line">{expanded ? lessLabel : moreLabel}</span>
        <span aria-hidden="true" className="circle-arrow text-white/80 group-hover:bg-white group-hover:text-teal-surface">
          <ArrowRight size={17} strokeWidth={1.5} className={`transition-transform duration-500 ${expanded ? "-rotate-90" : "rotate-90"}`} />
        </span>
      </button>
    </>
  );
}
