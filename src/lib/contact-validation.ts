/** Validation shared by the contact form (client) and the /api/contact route (server). */

export type ContactInput = { name: string; email: string; message: string };
export type ContactField = keyof ContactInput;
export type ContactErrorCode =
  | "nameRequired"
  | "nameTooLong"
  | "emailRequired"
  | "emailInvalid"
  | "messageRequired"
  | "messageTooShort"
  | "messageTooLong";

export type ContactErrors = Partial<Record<ContactField, ContactErrorCode>>;

export const LIMITS = { name: 120, email: 254, messageMin: 10, messageMax: 5000 } as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeContact(raw: Partial<Record<ContactField, unknown>>): ContactInput {
  const str = (value: unknown) => (typeof value === "string" ? value.trim() : "");
  return { name: str(raw.name), email: str(raw.email), message: str(raw.message) };
}

export function validateContact(input: ContactInput): ContactErrors {
  const errors: ContactErrors = {};

  if (!input.name) errors.name = "nameRequired";
  else if (input.name.length > LIMITS.name) errors.name = "nameTooLong";

  if (!input.email) errors.email = "emailRequired";
  else if (input.email.length > LIMITS.email || !EMAIL_RE.test(input.email)) errors.email = "emailInvalid";

  if (!input.message) errors.message = "messageRequired";
  else if (input.message.length < LIMITS.messageMin) errors.message = "messageTooShort";
  else if (input.message.length > LIMITS.messageMax) errors.message = "messageTooLong";

  return errors;
}
