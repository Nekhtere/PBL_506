import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUserId } from "@/lib/session";
import { googleConfigured } from "@/lib/google-oauth";
import { hasDatabase } from "@/lib/db";
import SignInPanel from "@/components/SignInPanel";

// Google sign-in. Only one provider, so this is a single button rather than a
// provider list.

export const dynamic = "force-dynamic";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string };
}) {
  // Already signed in — no reason to show the form again.
  if (await currentUserId()) {
    redirect(searchParams.next?.startsWith("/") ? searchParams.next : "/tickets");
  }

  const next = searchParams.next?.startsWith("/") && !searchParams.next.startsWith("//")
    ? searchParams.next
    : "/tickets";

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
          googleReady={googleConfigured()}
          dbReady={hasDatabase()}
        />

        <p className="text-center text-[11px] text-muted mt-6 leading-relaxed">
          Demo environment — sign-in creates a real session, but no payment is processed.
        </p>
      </div>
    </main>
  );
}
