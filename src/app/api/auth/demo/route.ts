import { NextResponse } from "next/server";
import { verifyDemoCredentials, demoConfigured, demoEmail, DEMO_NAME } from "@/lib/demo-auth";
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions } from "@/lib/session";
import { upsertUser, claimOrdersByEmail } from "@/lib/store";
import { hasDatabase } from "@/lib/db";
import { siteOrigin } from "@/lib/google-oauth";

// Demo sign-in: the email/password pair from DEMO_EMAIL / DEMO_PASSWORD.
//
// A plain form POST rather than a fetch: the browser follows the redirect on its
// own, so signing in works even if the client bundle fails to load — worth a
// lot when the thing is being demonstrated on someone else's machine.
//
// The account is stable across sign-ins. upsertUser keys on the email, so the
// same demo user comes back every time and their earlier tickets are still in
// /tickets rather than being orphaned to a fresh id.

export const dynamic = "force-dynamic";

// Build the redirect against the visitor's real host, not req.url.
//
// On Vercel req.url can carry the deployment's hash host (app-<hash>.vercel.app)
// rather than the production alias. Redirecting there would set the session
// cookie on the wrong host, so the browser would drop it and the visitor would
// land back on /signin looking signed out. siteOrigin() reads x-forwarded-host.
function back(req: Request, reason: string): NextResponse {
  return NextResponse.redirect(`${siteOrigin(req)}/signin?error=${reason}`);
}

export async function POST(req: Request) {
  // No database means no place to put the user, so refuse rather than hand out
  // a session that resolves to nothing on the next page load.
  if (!hasDatabase()) return back(req, "no_db");
  if (!demoConfigured()) return back(req, "demo_unconfigured");

  let email = "";
  let password = "";
  let next = "/tickets";

  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await req.json().catch(() => ({}))) as {
      email?: string;
      password?: string;
      next?: string;
    };
    email = body.email ?? "";
    password = body.password ?? "";
    if (body.next) next = body.next;
  } else {
    const form = await req.formData();
    email = String(form.get("email") ?? "");
    password = String(form.get("password") ?? "");
    const posted = form.get("next");
    if (typeof posted === "string" && posted) next = posted;
  }

  if (!verifyDemoCredentials(email, password)) {
    // One message for both halves: naming which field was wrong would confirm
    // a guessed email to anyone probing.
    return back(req, "bad_credentials");
  }

  const user = await upsertUser({
    // The stored email is the CONFIGURED one, not what was typed — so a
    // mis-cased entry still resolves to the same account.
    email: demoEmail()!,
    name: DEMO_NAME,
  });

  // Any ticket bought before signing in with this address joins the account.
  await claimOrdersByEmail(demoEmail()!, user.id);

  // Same-site paths only — an absolute URL here would be an open redirect.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/tickets";

  const res = NextResponse.redirect(`${siteOrigin(req)}${safeNext}`);
  res.cookies.set(SESSION_COOKIE, createSessionToken(user.id), sessionCookieOptions());
  return res;
}
