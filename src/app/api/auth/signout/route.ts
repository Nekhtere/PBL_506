import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

// Sign out: clear the session cookie. GET rather than POST so a plain link
// works — there is no state to protect here, since forging this only ever
// signs the caller out.

export async function GET(req: Request) {
  const url = new URL("/", req.url);
  url.searchParams.set("signedout", "1");
  const res = NextResponse.redirect(url);
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
