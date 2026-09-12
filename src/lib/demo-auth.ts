// Demo sign-in: one email + password pair, held in environment variables.
//
// Why env vars rather than a users table: the credentials can be changed from
// the Vercel dashboard without a deploy, and there is no password column to
// leak or migrate. That suits a demo account, which is all this is.
//
// FAILS CLOSED. With DEMO_EMAIL / DEMO_PASSWORD unset there is no demo login at
// all — the sign-in card says so instead of accepting anything. A missing
// variable must never mean "any password works".
//
// This is deliberately NOT a general auth system: exactly one account, no
// sign-up, no password reset, no per-user secrets. Google sign-in remains the
// real path in the codebase for anyone who needs a genuine identity.

import { timingSafeEqual } from "node:crypto";

export const DEMO_NAME = "Demo Client";

export function demoEmail(): string | null {
  const v = process.env.DEMO_EMAIL?.trim().toLowerCase();
  return v || null;
}

function demoPassword(): string | null {
  const v = process.env.DEMO_PASSWORD;
  return v && v.length > 0 ? v : null;
}

export function demoConfigured(): boolean {
  return demoEmail() !== null && demoPassword() !== null;
}

/** Constant-time compare, so response timing cannot reveal the password. */
function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a, "utf8");
  const y = Buffer.from(b, "utf8");
  if (x.length !== y.length) return false;
  return timingSafeEqual(x, y);
}

/**
 * True when the submitted pair matches the demo account.
 *
 * The email is compared case-insensitively (people capitalise it), the password
 * exactly. Both are compared even when the email is already wrong, so a
 * rejected email and a rejected password take the same time and an attacker
 * cannot learn which half they got right.
 */
export function verifyDemoCredentials(email: string, password: string): boolean {
  const expectedEmail = demoEmail();
  const expectedPassword = demoPassword();
  if (!expectedEmail || !expectedPassword) return false;

  const emailOk = safeEqual(email.trim().toLowerCase(), expectedEmail);
  const passwordOk = safeEqual(password, expectedPassword);
  return emailOk && passwordOk;
}
