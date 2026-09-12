"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center p-6">
          <h1 className="text-2xl font-bold text-fg mb-4">Something went wrong</h1>
          <p className="text-muted mb-6">{error.message}</p>
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 bg-fg hover:bg-fg-hover text-white font-medium px-4 py-2 rounded-xl transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}