"use client";

// Renders a deterministic QR-style matrix from a string seed.
// NOT a real QR code — it is a visual stand-in for the demo so partners see
// what the issued e-ticket looks like. Replace with the `qrcode` package
// (encoding the redemption URL) when vouchers go live.

function seedToBits(seed: string, count: number): boolean[] {
  const bits: boolean[] = [];
  let hash = 2166136261;
  let i = 0;
  while (bits.length < count) {
    hash ^= seed.charCodeAt(i % seed.length) + i;
    hash = Math.imul(hash, 16777619);
    // Take 8 bits per round, skip the low bit for stability of the pattern.
    for (let b = 0; b < 8 && bits.length < count; b++) {
      bits.push(((hash >>> (b * 3 + 1)) & 1) === 1);
    }
    i++;
  }
  return bits;
}

function isFinder(x: number, y: number, size: number) {
  const inTop = y < 7 && (x < 7 || x >= size - 7);
  const inBottomLeft = y >= size - 7 && x < 7;
  return inTop || inBottomLeft;
}

export default function QRCodePlaceholder({ value, size = 25 }: { value: string; size?: number }) {
  const bits = seedToBits(value, size * size);
  const cells: React.ReactNode[] = [];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let filled = bits[y * size + x];
      if (isFinder(x, y, size)) {
        // Draw the three standard finder squares.
        const lx = x < 7 ? x : x - (size - 7);
        const ly = y < 7 ? y : y - (size - 7);
        const edge = lx === 0 || lx === 6 || ly === 0 || ly === 6;
        const core = lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4;
        filled = edge || core;
      }
      if (filled) {
        cells.push(
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width={1}
            height={1}
          />,
        );
      }
    }
  }

  return (
    <svg
      viewBox={`-1 -1 ${size + 2} ${size + 2}`}
      className="w-full h-full"
      shapeRendering="crispEdges"
      role="img"
      aria-label={`Ticket QR for ${value}`}
    >
      <rect x={-1} y={-1} width={size + 2} height={size + 2} fill="white" />
      <g fill="currentColor">{cells}</g>
    </svg>
  );
}
