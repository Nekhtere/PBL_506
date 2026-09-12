import RouteLoader from "@/components/RouteLoader";

// Shown by the App Router while the next route resolves — the "sometimes slow"
// page switch now reads as a ferry crossing instead of a dead tap.
export default function Loading() {
  return (
    <main className="min-h-screen bg-bg flex items-center justify-center px-6">
      <RouteLoader />
    </main>
  );
}
