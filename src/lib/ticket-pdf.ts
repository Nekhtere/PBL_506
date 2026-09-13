// E-ticket PDF, built server-side with pdf-lib.
//
// The previous "Save as PDF" button only called window.print(), which opens
// the browser's print dialog — not a file. This produces a real .pdf the buyer
// downloads, and the same generator backs the emailed link, so the printed and
// emailed tickets can never drift apart.
//
// Each ticket carries a real, scannable QR code pointing at its online copy —
// a partner can point a phone at the printed page and land on the live ticket.

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import type { StoredOrder } from "./store";

const TEAL = rgb(0.06, 0.46, 0.43);
const INK = rgb(0.07, 0.09, 0.15);
const MUTED = rgb(0.42, 0.45, 0.5);
const LINE = rgb(0.85, 0.87, 0.9);
const WASH = rgb(0.96, 0.96, 0.97);

/**
 * pdf-lib's standard fonts are WinAnsi-encoded, so anything outside cp1252
 * throws. Map the few typographic characters our copy uses, then drop the
 * rest rather than failing the whole download over one glyph.
 */
function safe(s: string): string {
  return s
    .replace(/[→➔]/g, "->")
    .replace(/[≈]/g, "~")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, "");
}

export async function buildTicketPdf(order: StoredOrder, origin: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const mono = await doc.embedFont(StandardFonts.CourierBold);

  const W = 595.28;
  const H = 841.89;
  const M = 48;
  let page = doc.addPage([W, H]);
  let y = H - M;

  const text = (
    s: string,
    x: number,
    yy: number,
    opts: { size?: number; f?: typeof font; color?: typeof INK } = {},
  ) => {
    page.drawText(safe(s), {
      x,
      y: yy,
      size: opts.size ?? 10,
      font: opts.f ?? font,
      color: opts.color ?? INK,
    });
  };

  const rightText = (
    s: string,
    rightEdge: number,
    yy: number,
    opts: { size?: number; f?: typeof font; color?: typeof INK } = {},
  ) => {
    const size = opts.size ?? 10;
    const f = opts.f ?? font;
    const w = f.widthOfTextAtSize(safe(s), size);
    text(s, rightEdge - w, yy, opts);
  };

  // ── Header ────────────────────────────────────────────────────────────────
  text("Batam", M, y, { size: 20, f: bold });
  const batamW = bold.widthOfTextAtSize("Batam", 20);
  text("Smart", M + batamW, y, { size: 20, f: bold, color: TEAL });
  y -= 18;
  text("Ferry and tours - one smart checkout.", M, y, { size: 9, color: MUTED });
  y -= 22;

  page.drawLine({
    start: { x: M, y },
    end: { x: W - M, y },
    thickness: 1,
    color: LINE,
  });
  y -= 26;

  // ── Order summary ─────────────────────────────────────────────────────────
  text("E-TICKETS", M, y, { size: 9, f: bold, color: MUTED });
  y -= 16;
  text(`Order ${order.id}`, M, y, { size: 14, f: bold });
  y -= 15;
  const created = new Date(order.createdAt).toLocaleString("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  text(`Issued ${created}  ·  ${order.buyerName}  ·  ${order.email}`, M, y, {
    size: 9,
    color: MUTED,
  });
  y -= 24;

  // ── One card per ticket ───────────────────────────────────────────────────
  for (const t of order.tickets) {
    const cardH = 148;
    // Paginate rather than let a card run off the bottom edge.
    if (y - cardH < M + 40) {
      page = doc.addPage([W, H]);
      y = H - M;
    }

    const cardTop = y;
    const cardBottom = cardTop - cardH;
    page.drawRectangle({
      x: M,
      y: cardBottom,
      width: W - M * 2,
      height: cardH,
      borderColor: LINE,
      borderWidth: 1,
      color: rgb(1, 1, 1),
    });

    // QR panel
    const qrSize = 104;
    const qrX = M + 16;
    const qrY = cardBottom + (cardH - qrSize) / 2;
    page.drawRectangle({
      x: M,
      y: cardBottom,
      width: qrSize + 32,
      height: cardH,
      color: WASH,
    });

    const qrPng = await QRCode.toBuffer(`${origin}/tickets/${order.id}`, {
      type: "png",
      margin: 0,
      width: 320,
      errorCorrectionLevel: "M",
    });
    const qrImage = await doc.embedPng(qrPng);
    page.drawImage(qrImage, { x: qrX, y: qrY, width: qrSize, height: qrSize });

    // Details column
    const dx = M + qrSize + 48;
    const dRight = W - M - 16;
    let dy = cardTop - 24;

    text(t.itemName, dx, dy, { size: 12, f: bold });
    dy -= 16;
    text(t.code, dx, dy, { size: 15, f: mono, color: TEAL });
    dy -= 20;

    const rows: [string, string][] = [];
    if (t.ferry) {
      rows.push(
        ["Passenger", t.ferry.passenger],
        ["Passport", t.ferry.passportNumber],
        ["Crossing", `${t.ferry.routeFrom} -> ${t.ferry.routeTo}`],
        ["Departure", `${t.ferry.travelDate} · ${t.ferry.schedule}`],
        ["Trip", t.ferry.tripType === "return" ? "Return" : "One-way"],
      );
    } else if (t.subtitle) {
      rows.push(["Details", t.subtitle]);
    }
    rows.push(["Value", t.price]);

    for (const [k, v] of rows) {
      text(k, dx, dy, { size: 9, color: MUTED });
      rightText(v, dRight, dy, { size: 9, f: bold });
      dy -= 13;
    }

    y = cardBottom - 16;
  }

  // ── Total ─────────────────────────────────────────────────────────────────
  if (y - 60 < M) {
    page = doc.addPage([W, H]);
    y = H - M;
  }
  y -= 6;
  page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 1, color: LINE });
  y -= 20;
  text("Total paid", M, y, { size: 10, color: MUTED });
  rightText(`S$ ${order.totalSgd.toFixed(2)}`, W - M, y, { size: 13, f: bold });

  y -= 26;
  text(
    "Show this QR code at the terminal or the meeting point. Each ticket is single-use.",
    M,
    y,
    { size: 8, color: MUTED },
  );
  y -= 11;
  text(`Verify online: ${origin}/tickets/${order.id}`, M, y, { size: 8, color: MUTED });
  y -= 11;
  text(
    "Demo environment - no payment was actually processed. BatamSmart · support@batamsmart.example",
    M,
    y,
    { size: 8, color: MUTED },
  );

  return doc.save();
}
