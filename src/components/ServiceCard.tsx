"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ArrowRight, Check, X } from "lucide-react";
import { sectionIds } from "@/content/site";

type Service = {
  title: string;
  short: string;
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
    <article id={id} aria-labelledby={titleId} className="service-card group relative flex h-full flex-col bg-white on-light sm:max-lg:flex-row">
      <div data-card-media className="relative aspect-[16/8.4] overflow-hidden bg-ink sm:max-lg:aspect-auto sm:max-lg:min-h-[17rem] sm:max-lg:w-[46%] sm:max-lg:shrink-0">
        <Image
          src={image.src}
          placeholder="blur"
          blurDataURL={image.blur}
          alt={service.imageAlt}
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-[1.4s] ease-out-expo group-hover:scale-[1.06]"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-l from-ink/45 via-transparent to-transparent" />
        <span
          aria-hidden="true"
          className="display absolute right-5 top-4 text-[2rem] font-medium text-white/90 transition-colors duration-500 group-hover:text-mint"
        >
          {number}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-6 pb-7 pt-6 sm:px-7 lg:px-8">
        <h3 id={titleId} className="font-display text-[1.75rem] font-semibold leading-[1.05] text-ink">
          {service.title}
        </h3>
        <p className="mt-4 text-[0.9375rem] leading-[1.6] text-muted">{service.short}</p>
        <button
          type="button"
          onClick={open}
          aria-haspopup="dialog"
          className="group/btn mt-auto inline-flex items-center gap-4 self-start pt-7 text-[0.75rem] font-bold uppercase tracking-[0.14em] text-green transition-colors duration-300 hover:text-ink after:absolute after:inset-0 after:content-['']"
        >
          {service.cta}
          <ArrowRight aria-hidden="true" size={18} strokeWidth={1.5} className="btn-arrow" />
        </button>
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-green transition-transform duration-700 ease-out-expo group-hover:scale-x-100"
        />
      </div>

      <dialog ref={dialogRef} aria-labelledby={dialogTitleId} className="service-dialog on-light">
        <div className="grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="relative aspect-[16/9] md:aspect-auto md:min-h-[30rem]">
            <Image src={image.src} placeholder="blur" blurDataURL={image.blur} alt="" fill sizes="(min-width: 768px) 28rem, 100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
            <span aria-hidden="true" className="display absolute bottom-5 left-6 text-[4.5rem] font-medium leading-none text-mint">
              {number}
            </span>
          </div>
          <div className="relative p-7 sm:p-10">
            <button
              type="button"
              onClick={close}
              className="absolute right-3 top-3 grid size-11 place-items-center rounded-full text-ink transition-colors hover:bg-mist"
              aria-label={labels.close}
            >
              <X aria-hidden="true" size={22} strokeWidth={1.5} />
            </button>
            <h3 id={dialogTitleId} className="display pr-10 text-[clamp(2.2rem,5vw,3rem)] leading-[0.95] text-ink">
              {service.title}
            </h3>
            <p className="mt-5 text-[1rem] leading-[1.65] text-muted">{service.long}</p>
            <p className="kicker mt-8 text-green">{labels.details}</p>
            <ul className="mt-4 divide-y divide-mist-deep border-y border-mist-deep">
              {service.points.map((point) => (
                <li key={point} className="flex items-start gap-3 py-3 text-[0.9375rem] text-ink">
                  <Check aria-hidden="true" size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-green" />
                  {point}
                </li>
              ))}
            </ul>
            <a href={`#${sectionIds.contact}`} onClick={close} className="btn btn-solid mt-8">
              {service.contactCta}
              <ArrowRight aria-hidden="true" size={18} strokeWidth={1.5} className="btn-arrow" />
            </a>
          </div>
        </div>
      </dialog>
    </article>
  );
}
