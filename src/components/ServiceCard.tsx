"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ArrowRight, Check, X } from "lucide-react";
import { sectionIds } from "@/content/site";

type Service = {
  title: string;
  shortLead: string;
  short: string;
  longLead: string;
  long: string;
  points: string[];
  imageAlt: string;
  cta: string;
  contactCta: string;
};

export default function ServiceCard({
  id,
  index,
  service,
  image,
  labels,
}: {
  id: string;
  index: number;
  service: Service;
  image: { src: string; blur: string };
  labels: { details: string; close: string };
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const number = `0${index + 1}`;
  const titleId = `${id}-title`;
  const dialogTitleId = `${id}-dialog-title`;

  const open = () => dialogRef.current?.showModal();
  const close = () => dialogRef.current?.close();

  // Close when the backdrop is clicked
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClick = (event: MouseEvent) => {
      if (event.target === dialog) dialog.close();
    };
    dialog.addEventListener("click", onClick);
    return () => dialog.removeEventListener("click", onClick);
  }, []);

  return (
    <article id={id} aria-labelledby={titleId} className="service-card group relative flex h-full flex-col bg-teal text-white">
      <div data-card-media className="relative aspect-[4/3] overflow-hidden bg-petrol md:max-xl:aspect-[16/10]">
        <Image
          src={image.src}
          placeholder="blur"
          blurDataURL={image.blur}
          alt={service.imageAlt}
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 768px) 50vw, 100vw"
          className="card-img object-cover"
        />
        <span aria-hidden="true" className="display absolute left-4 top-3 text-[1.75rem] font-medium text-white drop-shadow-[0_2px_8px_rgb(0_0_0/0.45)]">
          {number}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-6 pb-6 pt-5 sm:px-7">
        <h3 id={titleId} className="font-display text-[1.6rem] font-semibold uppercase leading-[1.05] tracking-[0.01em]">
          {service.title}
        </h3>
        {service.shortLead && <p className="mt-3 text-[0.9375rem] font-semibold leading-[1.5] text-white">{service.shortLead}</p>}
        <p className={`${service.shortLead ? "mt-2" : "mt-3"} text-[0.9375rem] leading-[1.6] text-white/88`}>{service.short}</p>
        <button
          type="button"
          onClick={open}
          aria-haspopup="dialog"
          className="mt-auto flex items-center justify-between gap-4 pt-6 text-left text-[0.75rem] font-bold uppercase tracking-[0.14em] text-white after:absolute after:inset-0 after:content-['']"
        >
          {service.cta}
          <span aria-hidden="true" className="circle-arrow text-white/90 group-hover:bg-white group-hover:text-teal-deep">
            <ArrowRight size={17} strokeWidth={1.5} />
          </span>
        </button>
      </div>

      <dialog ref={dialogRef} aria-labelledby={dialogTitleId} className="service-dialog on-light">
        <div className="grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="relative aspect-[16/9] md:aspect-auto md:min-h-[30rem]">
            <Image src={image.src} placeholder="blur" blurDataURL={image.blur} alt="" fill sizes="(min-width: 768px) 28rem, 100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-petrol/70 to-transparent" />
            <span aria-hidden="true" className="display absolute bottom-5 left-6 text-[4.5rem] font-medium leading-none text-teal-light">
              {number}
            </span>
          </div>
          <div className="relative p-7 sm:p-10">
            <button
              type="button"
              onClick={close}
              className="absolute right-3 top-3 grid size-11 place-items-center rounded-full text-ink transition-colors hover:bg-mist-deep"
              aria-label={labels.close}
            >
              <X aria-hidden="true" size={22} strokeWidth={1.5} />
            </button>
            <h3 id={dialogTitleId} className="display pr-10 text-[clamp(2.1rem,5vw,2.9rem)] text-ink">
              {service.title}
            </h3>
            <p className="mt-5 text-[1.0625rem] font-semibold leading-[1.5] text-ink">{service.longLead}</p>
            <p className="mt-3 text-[1rem] leading-[1.65] text-muted">{service.long}</p>
            <p className="kicker mt-8 text-teal-deep">{labels.details}</p>
            <ul className="mt-4 divide-y divide-mist-deep border-y border-mist-deep">
              {service.points.map((point) => (
                <li key={point} className="flex items-start gap-3 py-3 text-[0.9375rem] text-ink">
                  <Check aria-hidden="true" size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-teal-deep" />
                  {point}
                </li>
              ))}
            </ul>
            <a href={`#${sectionIds.contact}`} onClick={close} className="btn btn-primary mt-8">
              {service.contactCta}
              <ArrowRight aria-hidden="true" size={18} strokeWidth={1.5} className="btn-arrow" />
            </a>
          </div>
        </div>
      </dialog>
    </article>
  );
}
