import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  exchangeCodeForProfile,
  googleConfigured,
  STATE_COOKIE,
} from "@/lib/google-oauth";
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions } from "@/lib/session";
import { claimOrdersByEmail, upsertUser } from "@/lib/store";

// Step 3 of the Google flow: verify the CSRF state, trade the code for the
// profile, upsert the user, then set the session cookie and return the visitor
// to wherever they were headed.

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const denied = url.searchParams.get("error");

  const fail = (reason: string) =>
    NextResponse.redirect(new URL(`/signin?error=${reason}`, req.url));

  if (denied) return fail("cancelled");
  if (!googleConfigured()) return fail("not_configured");
  if (!code || !state) return fail("invalid_response");

  const jar = await cookies();
  const expectedState = jar.get(STATE_COOKIE)?.value;
  if (!expectedState || expectedState !== state) return fail("state_mismatch");

  let userId: string;
  try {
    const profile = await exchangeCodeForProfile(req, code);
    const user = await upsertUser({
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
    });
    userId = user.id;

    // Anything bought with this email before signing in now belongs to the
    // account — otherwise the tickets a partner just watched get purchased
    // would be missing from their new dashboard.
    await claimOrdersByEmail(profile.email, user.id);
  } catch (err) {
    console.error("[auth] Google callback failed:", err);
    return fail("exchange_failed");
  }

  // Honour ?next= so a visitor sent here from a ticket link lands back on it,
  // but only for same-site paths — an absolute URL would be an open redirect.
  const next = url.searchParams.get("next");
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/tickets";

  const res = NextResponse.redirect(new URL(safeNext, req.url));
  res.cookies.set(SESSION_COOKIE, createSessionToken(userId), sessionCookieOptions());
  // The state has done its job; drop it so it can't be replayed.
  res.cookies.set(STATE_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
