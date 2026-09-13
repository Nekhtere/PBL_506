// E-ticket email via Gmail SMTP.
//
// Nodemailer with a Gmail App Password (NOT the account password — App
// Passwords require 2-Step Verification to be switched on first; see
// .env.example). Gmail is the choice here because it can send to ANY
// recipient: a domain-verified provider like Resend refuses to deliver to
// anyone but the account owner until you own a verified domain, which would
// block emailing a partner during a demo.
//
// Sending never blocks the buyer: the caller fires this without awaiting it,
// so a slow SMTP handshake can't delay the confirmation screen. Failures are
// logged and the order keeps emailedAt = null so it is visible as unsent.

import nodemailer, { type Transporter } from "nodemailer";
import type { StoredOrder } from "./store";

declare global {
  var __bsdTransport: Transporter | undefined;
}

export function mailConfigured(): boolean {
  return Boolean(process.env.GMAIL_USER?.trim() && process.env.GMAIL_APP_PASSWORD?.trim());
}

function transport(): Transporter {
  if (!global.__bsdTransport) {
    global.__bsdTransport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER!.trim(),
        // App Passwords are shown with spaces; Gmail accepts them either way.
        pass: process.env.GMAIL_APP_PASSWORD!.trim(),
      },
    });
  }
  return global.__bsdTransport;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function ticketBlock(order: StoredOrder) {
  return order.tickets
    .map((t) => {
      const ferryRows = t.ferry
        ? `
            <tr><td style="padding:2px 0;color:#6b7280">Passenger</td><td style="padding:2px 0;font-weight:600">${esc(t.ferry.passenger)}</td></tr>
            <tr><td style="padding:2px 0;color:#6b7280">Passport</td><td style="padding:2px 0;font-weight:600">${esc(t.ferry.passportNumber)}</td></tr>
            <tr><td style="padding:2px 0;color:#6b7280">Crossing</td><td style="padding:2px 0;font-weight:600">${esc(t.ferry.routeFrom)} → ${esc(t.ferry.routeTo)}</td></tr>
            <tr><td style="padding:2px 0;color:#6b7280">Departure</td><td style="padding:2px 0;font-weight:600">${esc(t.ferry.travelDate)} · ${esc(t.ferry.schedule)}</td></tr>`
        : t.subtitle
          ? `<tr><td style="padding:2px 0;color:#6b7280">Details</td><td style="padding:2px 0;font-weight:600">${esc(t.subtitle)}</td></tr>`
          : "";

      return `
      <div style="border:1px solid #e5e7eb;border-radius:16px;padding:20px;margin-bottom:16px">
        <div style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#6b7280">E-Ticket</div>
        <div style="font-size:20px;font-weight:700;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.06em;margin:4px 0 12px">${esc(t.code)}</div>
        <div style="font-size:15px;font-weight:700;margin-bottom:8px">${esc(t.itemName)}</div>
        <table style="font-size:13px;border-collapse:collapse;width:100%">${ferryRows}
          <tr><td style="padding:2px 0;color:#6b7280">Guest</td><td style="padding:2px 0;font-weight:600">${esc(order.buyerName)}</td></tr>
          <tr><td style="padding:2px 0;color:#6b7280">Value</td><td style="padding:2px 0;font-weight:600">${esc(t.price)}</td></tr>
        </table>
      </div>`;
    })
    .join("");
}

export function buildTicketEmail(order: StoredOrder, origin: string) {
  const ticketUrl = `${origin}/tickets/${order.id}`;
  const pdfUrl = `${origin}/api/tickets/${order.id}/pdf`;
  const created = new Date(order.createdAt).toLocaleString("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const html = `<!doctype html>
<html><body style="margin:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px">
    <div style="font-size:20px;font-weight:800;letter-spacing:-.02em;margin-bottom:4px">
      Batam<span style="color:#0f766e">Smart</span>
    </div>
    <p style="color:#6b7280;font-size:13px;margin:0 0 24px">Ferry and tours — one smart checkout.</p>

    <div style="background:#fff;border-radius:20px;padding:24px">
      <h1 style="font-size:20px;margin:0 0 6px">Your e-tickets are ready</h1>
      <p style="color:#6b7280;font-size:13px;margin:0 0 20px">
        Order <strong>${esc(order.id)}</strong> · ${esc(created)} · charged in ${esc(order.currency)}
      </p>

      ${ticketBlock(order)}

      <div style="display:flex;gap:8px;margin:20px 0 8px">
        <a href="${ticketUrl}" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 20px;border-radius:12px">View tickets online</a>
        <a href="${pdfUrl}" style="display:inline-block;border:1px solid #d1d5db;color:#111;text-decoration:none;font-weight:700;font-size:14px;padding:12px 20px;border-radius:12px">Download PDF</a>
      </div>
      <p style="color:#9ca3af;font-size:11px;margin:12px 0 0">
        Show the QR code at the terminal or the meeting point. Each ticket is single-use.
      </p>
    </div>

    <p style="color:#9ca3af;font-size:11px;text-align:center;margin-top:20px">
      BatamSmart · support@batamsmart.example<br>
      Demo environment — no payment was actually processed.
    </p>
  </div>
</body></html>`;

  const text = [
    "BatamSmart — your e-tickets are ready",
    `Order ${order.id} · ${created} · charged in ${order.currency}`,
    "",
    ...order.tickets.map((t) => `${t.code}  ${t.itemName}  (${t.price})`),
    "",
    `View online: ${ticketUrl}`,
    `Download PDF: ${pdfUrl}`,
    "",
    "Demo environment — no payment was actually processed.",
  ].join("\n");

  return {
    subject: `Your BatamSmart e-tickets · ${order.id}`,
    html,
    text,
  };
}

/** Sends the tickets. Throws on failure so the caller can log it. */
export async function sendTicketEmail(order: StoredOrder, origin: string): Promise<void> {
  if (!mailConfigured()) {
    // Fail with something actionable rather than a TypeError deep in the
    // transport, which reads like a bug in our code instead of missing config.
    throw new Error(
      "Gmail is not configured — set GMAIL_USER and GMAIL_APP_PASSWORD (see .env.example).",
    );
  }
  const { subject, html, text } = buildTicketEmail(order, origin);
  await transport().sendMail({
    from: `"BatamSmart" <${process.env.GMAIL_USER!.trim()}>`,
    to: order.email,
    subject,
    html,
    text,
  });
}
