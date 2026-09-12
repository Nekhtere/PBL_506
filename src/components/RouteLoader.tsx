"use client";

import { Ship } from "lucide-react";
import { useLocale } from "@/lib/locale-context";

// Full-route loader, rendered by src/app/loading.tsx while Next.js resolves the
// next route, and as the lazy-map fallback in NearMeSection. A ferry crossing
// beats a grey spinner: the wait reads as part of the trip, not a stall.
export default function RouteLoader({ compact = false }: { compact?: boolean }) {
  const { t } = useLocale();
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={t("loading.sea")}
      className={`flex flex-col items-center justify-center gap-4 text-center ${
        compact ? "h-full min-h-[16rem] bg-surface-sunken/60" : "min-h-[60dvh]"
      }`}
    >
      <div className="loader-sea" aria-hidden="true">
        <Ship className="loader-ship" strokeWidth={1.8} />
        <span className="loader-wave loader-wave--back" />
        <span className="loader-wave loader-wave--front" />
      </div>
      <p className="text-[13px] font-semibold text-muted">
        {t("loading.sea")}
        <span className="loader-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </p>
    </div>
  );
}
