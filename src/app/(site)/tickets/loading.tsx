import RouteLoader from "@/components/RouteLoader";

// Shown while the server component at tickets/page.tsx runs currentUserId() and
// listOrdersForUser() — both are force-dynamic, so the first visit (cold API /
// cold DB on a fresh instance) has no cached HTML and the browser would otherwise
// stare at a blank page. Next.js swaps this in automatically during the wait.

export default function TicketsLoading() {
  return (
    <main className="min-h-screen bg-bg pt-24 pb-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <RouteLoader />
      </div>
    </main>
  );
}
