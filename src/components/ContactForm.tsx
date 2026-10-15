"use client";

import { useEffect, useRef, useState, type FocusEvent, type FormEvent } from "react";
import { ArrowRight, CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import {
  LIMITS,
  normalizeContact,
  validateContact,
  type ContactErrors,
  type ContactField,
} from "@/lib/contact-validation";

type FormText = Dictionary["contact"]["form"];
type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "success" }
  | { kind: "error"; message: string };

const fields: ContactField[] = ["name", "email", "message"];

/** Matches MIN_FILL_TIME_MS in lib/contact-spam.ts, plus a little slack. */
const TICKET_MIN_AGE_MS = 3200;

export default function ContactForm({ lang, t }: { lang: Locale; t: FormText }) {
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const ticket = useRef<{ value: string; fetchedAt: number } | null>(null);
  // Synchronous lock: two clicks in the same tick both see the stale `status`, the ref does not
  const inFlight = useRef(false);

  const loadTicket = async () => {
    try {
      const response = await fetch("/api/contact", { cache: "no-store" });
      const body = (await response.json()) as { ticket?: string };
      if (body.ticket) ticket.current = { value: body.ticket, fetchedAt: Date.now() };
    } catch {
      ticket.current = null;
    }
  };

  useEffect(() => {
    loadTicket();
  }, []);

  /** A ticket old enough to be accepted: the server drops submissions made < 3 s after it was issued. */
  const readyTicket = async (forceNew = false) => {
    if (forceNew || !ticket.current) await loadTicket();
    if (!ticket.current) return "";
    const wait = TICKET_MIN_AGE_MS - (Date.now() - ticket.current.fetchedAt);
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    return ticket.current.value;
  };

  const readForm = (form: HTMLFormElement) => {
    const data = new FormData(form);
    return normalizeContact({
      name: data.get("name"),
      email: data.get("email"),
      message: data.get("message"),
    });
  };

  // Re-validate a field once the user has already seen an error for it
  const revalidate = (field: ContactField, form: HTMLFormElement | null) => {
    if (!errors[field] || !form) return;
    const next = validateContact(readForm(form));
    setErrors((prev) => ({ ...prev, [field]: next[field] }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inFlight.current) return;

    const form = event.currentTarget;
    const input = readForm(form);
    const clientErrors = validateContact(input);
    setErrors(clientErrors);
    const firstInvalid = fields.find((field) => clientErrors[field]);
    if (firstInvalid) {
      setStatus({ kind: "idle" });
      form.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    inFlight.current = true;
    setStatus({ kind: "sending" });
    const honeypot = new FormData(form).get("website");

    const send = async (forceNewTicket = false) => {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, website: honeypot, lang, ticket: await readyTicket(forceNewTicket) }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        fields?: ContactErrors;
      };
      return { response, body };
    };

    try {
      let { response, body } = await send();
      // Page left open for hours: the ticket expired, so retry once with a fresh one
      if (body.error === "expired") ({ response, body } = await send(true));

      if (response.ok && body.ok) {
        form.reset();
        setErrors({});
        setStatus({ kind: "success" });
        return;
      }
      if (body.error === "validation" && body.fields) {
        setErrors(body.fields);
        setStatus({ kind: "error", message: t.errors.summary });
        return;
      }
      const message =
        body.error === "not_configured"
          ? t.errors.notConfigured
          : body.error === "rate_limited"
            ? t.errors.rateLimited
            : body.error === "spam"
              ? t.errors.spam
              : t.errors.server;
      setStatus({ kind: "error", message });
    } catch {
      setStatus({ kind: "error", message: t.errors.server });
    } finally {
      inFlight.current = false;
    }
  };

  const fieldProps = (field: ContactField) => ({
    id: `contact-${field}`,
    name: field,
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? `contact-${field}-error` : undefined,
    onBlur: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => revalidate(field, e.currentTarget.form),
    onChange: (e: { currentTarget: HTMLInputElement | HTMLTextAreaElement }) => revalidate(field, e.currentTarget.form),
  });

  const errorText = (field: ContactField) =>
    errors[field] ? (
      <p id={`contact-${field}-error`} className="mt-2 flex items-center gap-1.5 text-[0.8125rem] font-medium text-[var(--error-dark)]">
        <CircleAlert aria-hidden="true" size={15} strokeWidth={2} />
        {t.errors[errors[field]!]}
      </p>
    ) : null;

  return (
    <form noValidate onSubmit={onSubmit} aria-describedby="contact-privacy" aria-busy={status.kind === "sending"} className="space-y-5">
      <h3 className="sr-only">{t.title}</h3>

      <div>
        <label htmlFor="contact-name" className="mb-2 block text-[0.875rem] font-medium text-white/90">
          {t.name}
        </label>
        <input
          {...fieldProps("name")}
          type="text"
          autoComplete="name"
          maxLength={LIMITS.name}
          required
          placeholder={t.namePlaceholder}
          className="field"
        />
        {errorText("name")}
      </div>

      <div>
        <label htmlFor="contact-email" className="mb-2 block text-[0.875rem] font-medium text-white/90">
          {t.email}
        </label>
        <input
          {...fieldProps("email")}
          type="email"
          inputMode="email"
          autoComplete="email"
          maxLength={LIMITS.email}
          required
          placeholder={t.emailPlaceholder}
          className="field"
        />
        {errorText("email")}
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-2 block text-[0.875rem] font-medium text-white/90">
          {t.message}
        </label>
        <textarea
          {...fieldProps("message")}
          rows={4}
          maxLength={LIMITS.messageMax}
          required
          placeholder={t.messagePlaceholder}
          className="field min-h-[7.5rem] resize-y"
        />
        {errorText("message")}
      </div>

      {/* Honeypot — hidden from people and assistive tech, attractive to bots */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="contact-website">{t.honeypot}</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button type="submit" className="btn btn-primary w-full justify-between" disabled={status.kind === "sending"}>
        {status.kind === "sending" ? t.sending : t.submit}
        {status.kind === "sending" ? (
          <LoaderCircle aria-hidden="true" size={18} strokeWidth={1.75} className="motion-safe:animate-spin" />
        ) : (
          <ArrowRight aria-hidden="true" size={18} strokeWidth={1.5} className="btn-arrow" />
        )}
      </button>

      <p id="contact-privacy" className="text-[0.8125rem] leading-[1.5] text-white/70">
        {t.privacy}
      </p>

      <div role="status" aria-live="polite" className="min-h-0">
        {status.kind === "success" && (
          <p className="flex items-start gap-2 border-l-2 border-teal-light bg-white/8 px-4 py-3 text-[0.875rem] text-white">
            <CircleCheck aria-hidden="true" size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-teal-light" />
            {t.success}
          </p>
        )}
        {status.kind === "error" && (
          <p className="flex items-start gap-2 border-l-2 border-[var(--error-dark)] bg-white/8 px-4 py-3 text-[0.875rem] text-white">
            <CircleAlert aria-hidden="true" size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-[var(--error-dark)]" />
            {status.message}
          </p>
        )}
      </div>
    </form>
  );
}
