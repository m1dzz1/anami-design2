"use client";

import { useId, useState } from "react";
import { ArrowRight } from "lucide-react";

/** "Više o nama" — reveals the remaining company description in place (content stays in the DOM for SEO). */
export default function AboutMore({
  paragraphs,
  moreLabel,
  lessLabel,
}: {
  paragraphs: string[];
  moreLabel: string;
  lessLabel: string;
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
          <div className="mt-5 space-y-5 border-l border-mint/40 pl-5">
            {paragraphs.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </div>
        </div>
      </div>
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={regionId}
        onClick={() => setExpanded((value) => !value)}
        className="btn btn-glass mt-9"
      >
        {expanded ? lessLabel : moreLabel}
        <ArrowRight
          aria-hidden="true"
          size={18}
          strokeWidth={1.5}
          className={`btn-arrow ${expanded ? "-rotate-90" : ""}`}
        />
      </button>
    </>
  );
}
