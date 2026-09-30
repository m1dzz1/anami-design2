import { NextResponse } from "next/server";
import { normalizeContact, validateContact, type ContactInput } from "@/lib/contact-validation";
import { checkTicket, issueTicket, looksLikeSpam, overLimit } from "@/lib/contact-spam";
import { site } from "@/content/site";

/**
 * Contact form endpoint.
 *
 * Email delivery uses the Resend HTTP API (no SDK dependency). Configure in the environment:
 *   RESEND_API_KEY      – API key from https://resend.com
 *   CONTACT_FROM_EMAIL  – verified sender, e.g. "ANAMI <web@anami.rs>"
 *   CONTACT_TO_EMAIL    – recipient of new enquiries (defaults to office@anami.rs)
 *   CONTACT_FORM_SECRET – signs the anti-spam form ticket (see lib/contact-spam.ts)
 *
 * Each enquiry sends two emails: the enquiry to CONTACT_TO_EMAIL, then a thank-you to the sender in
 * their language. The thank-you is best effort — if it fails the enquiry still counts as delivered.
 * With the Resend test sender (onboarding@resend.dev) the thank-you is redirected to CONTACT_TO_EMAIL.
 *
 * Without RESEND_API_KEY / CONTACT_FROM_EMAIL the endpoint answers 503 "not_configured"
 * and the form shows an honest message pointing to office@anami.rs — never a fake success.
 */

export const runtime = "nodejs";

const MAX_BODY_BYTES = 16 * 1024;

type Lang = "sr" | "en";

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);

/** Requests must come from this site's own pages (browsers always send Origin on a cross-site POST/fetch). */
function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return request.headers.get("sec-fetch-site") !== "cross-site";
  try {
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

const clientIp = (request: Request) =>
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";

/** Form ticket, fetched by the form when it mounts. */
export async function GET(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ ok: false }, { status: 403 });
  return NextResponse.json({ ticket: issueTicket() }, { headers: { "Cache-Control": "no-store" } });
}

async function sendEmail(apiKey: string, email: Record<string, unknown>) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(email),
  });
  if (!response.ok) throw new Error(`Resend ${response.status}: ${await response.text()}`);
}

function enquiryEmail(input: ContactInput, lang: Lang) {
  const html = `
    <h2>Novi upit sa sajta anami.rs (${lang.toUpperCase()})</h2>
    <p><strong>Ime i prezime:</strong> ${escapeHtml(input.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(input.email)}</p>
    <p><strong>Poruka:</strong></p>
    <p style="white-space:pre-wrap">${escapeHtml(input.message)}</p>`;
  return {
    subject: `Upit sa sajta — ${input.name}`,
    html,
    text: `Ime i prezime: ${input.name}\nEmail: ${input.email}\n\n${input.message}`,
  };
}

const thankYouCopy = {
  sr: {
    subject: "Hvala Vam na upitu — ANAMI",
    greeting: (name: string) => `Poštovani/a ${name},`,
    body: [
      "hvala Vam što ste kontaktirali kompaniju ANAMI.",
      "Primili smo Vaš upit i javićemo Vam se u najkraćem mogućem roku.",
    ],
    signoff: ["Srdačan pozdrav,", "tim ANAMI"],
    note: "Ovo je automatska potvrda prijema — nije potrebno da odgovarate na nju.",
  },
  en: {
    subject: "Thank you for your enquiry — ANAMI",
    greeting: (name: string) => `Dear ${name},`,
    body: ["thank you for contacting ANAMI.", "We have received your enquiry and will get back to you as soon as possible."],
    signoff: ["Kind regards,", "The ANAMI team"],
    note: "This is an automatic confirmation of receipt — there is no need to reply to it.",
  },
} as const;

/** Echoes only the (spam-checked) name — never the message — so it can't be used to relay content. */
function thankYouEmail(input: ContactInput, lang: Lang) {
  const copy = thankYouCopy[lang];
  const name = escapeHtml(input.name);
  const address = site.address;
  const html = `
<div style="background:#edf3ec;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#102a24">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;padding:36px 32px">
    <p style="margin:0 0 28px;font-size:20px;letter-spacing:6px;color:#102a24">ANAMI</p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6">${copy.greeting(name)}</p>
    ${copy.body.map((line) => `<p style="margin:0 0 12px;font-size:16px;line-height:1.6">${line}</p>`).join("")}
    <p style="margin:28px 0 0;font-size:16px;line-height:1.6">${copy.signoff.join("<br>")}</p>
    <hr style="border:0;border-top:1px solid #dfe8de;margin:32px 0 20px">
    <p style="margin:0;font-size:13px;line-height:1.6;color:#5b6b66">
      ${escapeHtml(address.street)}, ${escapeHtml(address.postalCode)} ${escapeHtml(address.city)}<br>
      <a href="mailto:${site.email}" style="color:#35785c">${site.email}</a> · <a href="${site.url}" style="color:#35785c">anami.rs</a>
    </p>
    <p style="margin:16px 0 0;font-size:12px;line-height:1.5;color:#8a9893">${copy.note}</p>
  </div>
</div>`;
  const text = [
    copy.greeting(input.name),
    "",
    ...copy.body,
    "",
    ...copy.signoff,
    "",
    `${address.street}, ${address.postalCode} ${address.city}`,
    `${site.email} · ${site.url}`,
    "",
    copy.note,
  ].join("\n");
  return { subject: copy.subject, html, text };
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 415 });
  }
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) throw new Error("too large");
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const ip = clientIp(request);
  if (overLimit(`ip:${ip}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  // Bots: filled honeypot, or no valid ticket / posted faster than a person could type. Silent 200.
  const ticket = checkTicket(body.ticket);
  if ((typeof body.website === "string" && body.website.trim() !== "") || ticket === "invalid" || ticket === "too_fast") {
    return NextResponse.json({ ok: true });
  }
  // A person who left the page open for hours: ask them to resend (the form fetches a fresh ticket)
  if (ticket === "expired") {
    return NextResponse.json({ ok: false, error: "expired" }, { status: 409 });
  }

  const input = normalizeContact(body);
  const errors = validateContact(input);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, error: "validation", fields: errors }, { status: 422 });
  }
  if (looksLikeSpam(input)) {
    return NextResponse.json({ ok: false, error: "spam" }, { status: 422 });
  }
  // Per sender address too, so the thank-you email can't be aimed at someone else's inbox repeatedly
  if (overLimit(`email:${input.email.toLowerCase()}`, 3, 24 * 60 * 60 * 1000)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL || site.email;
  if (!apiKey || !from) {
    console.warn("[contact] Email delivery is not configured (RESEND_API_KEY / CONTACT_FROM_EMAIL missing).");
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  const lang: Lang = body.lang === "en" ? "en" : "sr";

  try {
    await sendEmail(apiKey, { from, to: [to], reply_to: input.email, ...enquiryEmail(input, lang) });
  } catch (error) {
    console.error("[contact] Delivery failed", error);
    return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
  }

  // Resend's shared test sender (@resend.dev) can only mail the account owner, so until a domain is
  // verified the thank-you goes to CONTACT_TO_EMAIL instead of the visitor, marked with who it was for.
  const testMode = from.toLowerCase().includes("@resend.dev");
  const thankYou = thankYouEmail(input, lang);
  try {
    await sendEmail(apiKey, {
      from,
      to: [testMode ? to : input.email],
      reply_to: site.email,
      ...thankYou,
      subject: testMode ? `[TEST → ${input.email}] ${thankYou.subject}` : thankYou.subject,
    });
  } catch (error) {
    // The enquiry itself arrived; the visitor still sees success on the page
    console.error("[contact] Thank-you email failed", error);
  }

  return NextResponse.json({ ok: true });
}
