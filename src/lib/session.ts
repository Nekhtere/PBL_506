// Signed session cookie.
//
// The cookie holds only a user id, signed with HMAC-SHA256 so a client cannot
// mint one for a user they are not. No session table: the signature is the
// proof, and the user row is looked up on each request. That keeps the demo
// dependency-free while still being a real signature check rather than a
// plaintext id anyone could edit in devtools.
//
// httpOnly keeps it away from scripts; SameSite=Lax means it rides along on
// top-level navigations (so an emailed ticket link lands signed in) but not on
// cross-site POSTs.

import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "bsd_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function secret(): string {
  const s = process.env.SESSION_SECRET?.trim();
  if (s && s.length >= 16) return s;
  // Dev-only fallback so `npm run dev` works before .env.local exists. On a
  // deployed host a missing secret would let anyone forge a session, so it is
  // refused there rather than silently downgraded.
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET is required in production. Set it in the host's environment variables (see .env.example).",
    );
  }
  if (!global.__bsdDevSecret) {
    global.__bsdDevSecret = randomBytes(32).toString("hex");
    console.warn(
      "[auth] SESSION_SECRET not set — using a random dev-only secret. Sessions reset on restart.",
    );
  }
  return global.__bsdDevSecret;
}

declare global {
  var __bsdDevSecret: string | undefined;
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function createSessionToken(userId: string): string {
  const payload = Buffer.from(
    JSON.stringify({ uid: userId, iat: Date.now() }),
    "utf8",
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readSessionToken(token: string | undefined): string | null {
  if (!token) return null;
  const [payload, mac] = token.split(".");
  if (!payload || !mac) return null;

  const expected = sign(payload);
  // Compare in constant time; lengths must match first or timingSafeEqual throws.
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    const uid = typeof parsed?.uid === "string" ? parsed.uid : null;
    const iat = typeof parsed?.iat === "number" ? parsed.iat : 0;
    if (!uid) return null;
    if (Date.now() - iat > MAX_AGE_SECONDS * 1000) return null;
    return uid;
  } catch {
    return null;
  }
}

/** Reads the signed-in user id from the request cookies, or null. */
export async function currentUserId(): Promise<string | null> {
  const jar = await cookies();
  return readSessionToken(jar.get(SESSION_COOKIE)?.value);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  };
}
