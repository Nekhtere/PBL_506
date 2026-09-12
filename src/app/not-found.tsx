import Link from "next/link";
import { Ticket } from "lucide-react";

// Global 404 — reached when a ticket id doesn't exist (a mistyped link, or a
// ticket issued on a different environment's database).

export default function NotFound() {
  return (
    <main className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-surface-sunken flex items-center justify-center">
          <Ticket className="w-7 h-7 text-faint" aria-hidden="true" />
        </div>
        <h1 className="text-xl font-bold text-fg">Ticket not found</h1>
        <p className="text-[14px] text-muted mt-2 leading-relaxed">
          This link is wrong, or the ticket was issued on a different environment.
          Check the link in your email, or sign in to see your tickets.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <Link
            href="/tickets"
            className="inline-flex items-center justify-center bg-accent hover:bg-accent-hover text-white text-[14px] font-bold px-5 py-3 rounded-xl transition-colors"
          >
            My tickets
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center border border-line-strong text-fg text-[14px] font-bold px-5 py-3 rounded-xl hover:bg-surface-sunken transition-colors"
          >
            Back home
          </Link>
        </div>
      </div>
    </main>
  );
}
