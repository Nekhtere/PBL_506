// Google Sign-In — OAuth 2.0 authorization code flow.
//
// Written by hand rather than pulling in next-auth: one provider, one flow,
// and this way the whole exchange is visible in ~80 lines instead of hidden
// behind a config object. The steps are the standard ones:
//
//   1. /api/auth/google          → redirect to Google with a CSRF `state`
//   2. Google                    → redirect back with ?code&state
//   3. /api/auth/google/callback → verify state, swap code for tokens,
//                                  read the profile, upsert the user, set cookie
//
// Google credentials come from the Google Cloud Console (see .env.example).
// Both the local and deployed callback URLs must be registered as authorized
// redirect URIs or Google returns redirect_uri_mismatch.

import { randomBytes } from "node:crypto";

const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const USERINFO_ENDPOINT = "https://openidconnect.googleapis.com/v1/userinfo";

export const STATE_COOKIE = "bsd_oauth_state";

export function googleClientId(): string | null {
  return process.env.GOOGLE_CLIENT_ID?.trim() || null;
}

export function googleClientSecret(): string | null {
  return process.env.GOOGLE_CLIENT_SECRET?.trim() || null;
}

export function googleConfigured(): boolean {
  return googleClientId() !== null && googleClientSecret() !== null;
}

/** Absolute origin for building the redirect_uri. Vercel sets VERCEL_URL;
    locally we fall back to the dev server. */
export function siteOrigin(req: Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel}`;

  const url = new URL(req.url);
  return `${url.protocol}//${url.host}`;
}

export function redirectUri(req: Request): string {
  return `${siteOrigin(req)}/api/auth/google/callback`;
}

export function newState(): string {
  return randomBytes(16).toString("base64url");
}

export function authorizeUrl(req: Request, state: string): string {
  const params = new URLSearchParams({
    client_id: googleClientId()!,
    redirect_uri: redirectUri(req),
    response_type: "code",
    scope: "openid email profile",
    state,
    // Without this Google silently reuses a previous consent and skips the
    // account chooser — awkward when demoing to a partner who wants to sign in
    // as a different account.
    prompt: "select_account",
  });
  return `${AUTH_ENDPOINT}?${params.toString()}`;
}

export type GoogleProfile = {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  emailVerified: boolean;
};

export async function exchangeCodeForProfile(
  req: Request,
  code: string,
): Promise<GoogleProfile> {
  const tokenRes = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: googleClientId()!,
      client_secret: googleClientSecret()!,
      redirect_uri: redirectUri(req),
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    const detail = await tokenRes.text().catch(() => "");
    throw new Error(`Google token exchange failed (${tokenRes.status}): ${detail.slice(0, 300)}`);
  }

  const tokens = (await tokenRes.json()) as { access_token?: string };
  if (!tokens.access_token) throw new Error("Google returned no access_token");

  const infoRes = await fetch(USERINFO_ENDPOINT, {
    headers: { authorization: `Bearer ${tokens.access_token}` },
  });
  if (!infoRes.ok) {
    throw new Error(`Google userinfo failed (${infoRes.status})`);
  }

  const info = (await infoRes.json()) as {
    sub: string;
    email?: string;
    name?: string;
    picture?: string;
    email_verified?: boolean;
  };

  if (!info.email) throw new Error("Google profile has no email");
  // Google only reports email_verified for accounts it has confirmed. Treat a
  // present-and-false as a hard failure; an absent field is left as trusted,
  // which is what Google's own docs do for the openid profile scope.
  const emailVerified = info.email_verified !== false;
  if (!emailVerified) {
    throw new Error("Google account email is not verified");
  }

  return {
    sub: info.sub,
    email: info.email,
    name: info.name?.trim() || info.email.split("@")[0],
    picture: info.picture,
    emailVerified,
  };
}
