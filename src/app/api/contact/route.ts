import { NextResponse } from "next/server";
import { normalizeContact, validateContact } from "@/lib/contact-validation";
import { site } from "@/content/site";

/**
 * Contact form endpoint.
 *
 * Email delivery uses the Resend HTTP API (no SDK dependency). Configure in the environment:
 *   RESEND_API_KEY      – API key from https://resend.com
 *   CONTACT_FROM_EMAIL  – verified sender, e.g. "ANAMI <web@anami.rs>"
 *   CONTACT_TO_EMAIL    – recipient (defaults to office@anami.rs)
 *
 * Without RESEND_API_KEY / CONTACT_FROM_EMAIL the endpoint answers 503 "not_configured"
 * and the form shows an honest message pointing to office@anami.rs — never a fake success.
 */

export const runtime = "nodejs";

const MIN_FILL_TIME_MS = 2500;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((time) => now - time < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > RATE_MAX;
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  // Spam protection: honeypot + minimum time to fill the form. Bots get a silent 200.
  const elapsed = typeof body.elapsed === "number" ? body.elapsed : 0;
  if ((typeof body.website === "string" && body.website.trim() !== "") || elapsed < MIN_FILL_TIME_MS) {
    return NextResponse.json({ ok: true });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const input = normalizeContact(body);
  const errors = validateContact(input);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, error: "validation", fields: errors }, { status: 422 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL || site.email;
  if (!apiKey || !from) {
    console.warn("[contact] Email delivery is not configured (RESEND_API_KEY / CONTACT_FROM_EMAIL missing).");
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  const lang = body.lang === "en" ? "EN" : "SR";
  const html = `
    <h2>Novi upit sa sajta anami.rs (${lang})</h2>
    <p><strong>Ime i prezime:</strong> ${escapeHtml(input.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(input.email)}</p>
    <p><strong>Poruka:</strong></p>
    <p style="white-space:pre-wrap">${escapeHtml(input.message)}</p>`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: input.email,
        subject: `Upit sa sajta — ${input.name}`,
        html,
        text: `Ime i prezime: ${input.name}\nEmail: ${input.email}\n\n${input.message}`,
      }),
    });
    if (!response.ok) {
      console.error("[contact] Resend error", response.status, await response.text());
      return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
    }
  } catch (error) {
    console.error("[contact] Delivery failed", error);
    return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
