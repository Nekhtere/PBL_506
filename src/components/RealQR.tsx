"use client";

// A real, scannable QR code.
//
// Replaces QRCodePlaceholder, which drew a deterministic pattern from a hash —
// convincing on screen but impossible to scan. A partner pointing a phone at
// the ticket now lands on the live page, which is the strongest moment in the
// demo, and a printed PDF carries the same code.

import { useEffect, useState } from "react";

export default function RealQR({
  value,
  className,
  alt = "Ticket QR code",
}: {
  value: string;
  className?: string;
  alt?: string;
}) {
  // Rendered after mount: encoding is synchronous-ish but produces a data URL,
  // and doing it during render would make the first client paint differ from
  // the server's (which has no canvas). qrcode is imported lazily so its Buffer
  // polyfill stays out of the main client bundle — it only loads on the ticket
  // page, where a QR is actually shown.
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Display is w-28 (112px); 256 gives crisp rendering at ~2x without the
    // 4.5x waste of the old 512. Smaller data URL, same scannability.
    import("qrcode")
      .then(({ default: QRCode }) =>
        QRCode.toDataURL(value, {
          margin: 1,
          width: 256,
          errorCorrectionLevel: "M",
          color: { dark: "#0B1220", light: "#FFFFFF" },
        }),
      )
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [value]);

  if (!dataUrl) {
    // Same footprint while encoding, so nothing jumps when the code lands.
    return <div className={`${className ?? ""} animate-pulse rounded bg-line`} aria-hidden="true" />;
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={dataUrl} alt={alt} className={className} draggable={false} />;
}
