import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUserId } from "@/lib/session";
import { demoConfigured, demoCredentialsForDisplay } from "@/lib/demo-auth";
import { hasDatabase } from "@/lib/db";
import SignInPanel from "@/components/SignInPanel";

// Sign-in. One demo account, held in environment variables — see
// src/lib/demo-auth.ts for why. Google sign-in remains in the codebase at
// /api/auth/google for anyone who needs a real identity, but is not linked
// from this page.

export const dynamic = "force-dynamic";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string };
}) {
  // Already signed in — no reason to show the form again.
  if (await currentUserId()) {
    redirect(searchParams.next?.startsWith("/") ? searchParams.next : "/");
  }

  // Where to land after signing in. Defaults to home rather than /tickets: a
  // fresh demo account owns no tickets, so /tickets would be an empty room. A
  // page that needs the visitor signed in passes its own `next` (/tickets does
  // exactly that), and that always wins.
  const next = searchParams.next?.startsWith("/") && !searchParams.next.startsWith("//")
    ? searchParams.next
    : "/";

  return (
    <main className="min-h-screen bg-bg flex items-center justify-center px-4 sm:px-6 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="block text-center mb-8">
          <span className="text-xl font-bold tracking-tight text-fg">
            Batam<span className="text-accent-ink">Smart</span>
          </span>
        </Link>

        <SignInPanel
          next={next}
          error={searchParams.error}
          demoReady={demoConfigured()}
          dbReady={hasDatabase()}
          demo={demoCredentialsForDisplay()}
        />

        <p className="text-center text-[11px] text-muted mt-6 leading-relaxed">
          Demo environment — sign-in creates a real session, but no payment is processed.
        </p>
      </div>
    </main>
  );
}
