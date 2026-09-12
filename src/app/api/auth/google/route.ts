import { NextResponse } from "next/server";
import {
  authorizeUrl,
  googleConfigured,
  newState,
  STATE_COOKIE,
} from "@/lib/google-oauth";

// Step 1 of the Google flow: mint a CSRF state, stash it in a short-lived
// cookie, and hand the browser to Google.

export async function GET(req: Request) {
  if (!googleConfigured()) {
    // Send the visitor somewhere that explains what's missing rather than
    // showing a raw 500 — a partner demo should never dead-end on a stack trace.
    return NextResponse.redirect(new URL("/signin?error=not_configured", req.url));
  }

  const state = newState();
  const res = NextResponse.redirect(authorizeUrl(req, state));
  res.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600, // 10 minutes is ample for a consent screen
  });
  return res;
}
