/**
 * Server-only spam protection for the contact form (no third-party captcha):
 * - a signed "form ticket" issued when the form mounts; a submission needs a valid one that is at
 *   least MIN_FILL_TIME_MS old (bots post instantly) and not expired (no harvesting and replaying);
 * - in-memory rate limits per IP and per sender address (the latter also stops the confirmation
 *   email from being used to flood someone else's inbox);
 * - content heuristics for link/markup spam.
 */

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { ContactInput } from "./contact-validation";

const MIN_FILL_TIME_MS = 3000;
const TICKET_TTL_MS = 2 * 60 * 60 * 1000;

/** Falls back to a per-process secret: tickets then just don't survive a server restart. */
const secret = process.env.CONTACT_FORM_SECRET || randomBytes(32).toString("hex");

const sign = (payload: string) => createHmac("sha256", secret).update(payload).digest("base64url");

export function issueTicket() {
  const payload = `${Date.now()}.${randomBytes(9).toString("base64url")}`;
  return `${payload}.${sign(payload)}`;
}

export type TicketCheck = "ok" | "invalid" | "too_fast" | "expired";

export function checkTicket(ticket: unknown): TicketCheck {
  if (typeof ticket !== "string" || ticket.length > 200) return "invalid";
  const [issued, nonce, signature] = ticket.split(".");
  if (!issued || !nonce || !signature) return "invalid";
  const expected = Buffer.from(sign(`${issued}.${nonce}`));
  const given = Buffer.from(signature);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return "invalid";
  const age = Date.now() - Number(issued);
  if (!Number.isFinite(age) || age < MIN_FILL_TIME_MS) return "too_fast";
  if (age > TICKET_TTL_MS) return "expired";
  return "ok";
}

/* -------------------------------------------------------------------------- */

const buckets = new Map<string, number[]>();

/** Records a hit for `key` and reports whether it is over `max` hits within `windowMs`. */
export function overLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((time) => now - time < windowMs);
  recent.push(now);
  buckets.set(key, recent);
  if (buckets.size > 10_000) buckets.clear();
  return recent.length > max;
}

/* -------------------------------------------------------------------------- */

const URL_RE = /(https?:\/\/|www\.)\S+/i;
const MARKUP_RE = /<\s*\/?\s*(a|script|iframe|img)\b|\[url[=\]]|\[link[=\]]/i;
const SPAM_WORDS_RE =
  /\b(casino|viagra|cialis|crypto\s*(investment|signals)|forex\s*signals|backlinks?|seo\s*services|porn|escort|loan\s*offer|bitcoin\s*doubl)/i;

/** True for content no genuine enquiry would contain. */
export function looksLikeSpam({ name, message }: ContactInput) {
  // A name never carries links or markup; it is also the only user text echoed in the confirmation email
  if (URL_RE.test(name) || /[<>@/\\]/.test(name)) return true;
  const links = message.match(new RegExp(URL_RE.source, "gi"))?.length ?? 0;
  if (links > 2) return true;
  if (MARKUP_RE.test(message)) return true;
  if (SPAM_WORDS_RE.test(`${name} ${message}`)) return true;
  // Keyboard mashing / padding
  if (/(.)\1{24,}/.test(message)) return true;
  return false;
}
