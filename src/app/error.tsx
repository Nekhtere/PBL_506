"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-fg mb-4">Something went wrong</h1>
        <p className="text-muted mb-6">Please refresh or try again.</p>
      </div>
    </div>
  );
}