import { NextResponse } from "next/server";
import type { CartItem } from "@/lib/cart";
import { currentUserId } from "@/lib/session";
import { hasDatabase } from "@/lib/db";
import { newId, newTicketCode, createOrder, markOrderEmailed, checkIdempotency, markIdempotency, type OrderTicket } from "@/lib/store";
import { sendTicketEmail, mailConfigured } from "@/lib/email";
import { siteOrigin } from "@/lib/google-oauth";

// Issues an order after the (simulated) payment succeeds.
//
// The client used to build the order itself and stash it in sessionStorage,
// which meant the tickets existed only in that one tab — an emailed link or a
// different device found nothing. The order is now created here, in the
// database, and identified by an unguessable id that is the only key to
// /tickets/[id].

type Body = {
  items?: CartItem[];
  buyerName?: string;
  email?: string;
  currency?: "SGD" | "IDR";
  // Client-generated idempotency key (one per checkout attempt). Lets a retry or
  // a double-click reuse the original order instead of minting a second one.
  idempotencyKey?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Generous enough for a real SMTP handshake, short enough that a stuck Gmail
// cannot hold the confirmation screen. On expiry the order still succeeds.
const EMAIL_TIMEOUT_MS = 15_000;

function withTimeout<T>(work: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms);
    work.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const items = Array.isArray(body.items) ? body.items : [];
  const buyerName = (body.buyerName ?? "").trim();
  const email = (body.email ?? "").trim();
  const currency: "SGD" | "IDR" = body.currency === "IDR" ? "IDR" : "SGD";

  if (items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }
  if (!buyerName) {
    return NextResponse.json({ error: "Buyer name is required" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }

  const tickets: OrderTicket[] = items.map((item) => ({
    code: newTicketCode(),
    itemName: item.name,
    subtitle: item.subtitle,
    price: item.price,
    image: item.image,
    ferry: item.ferry,
  }));

  // Checkout is sign-in gated, so an order must carry its owner. Without this a
  // tampered client (or a session that lapsed mid-payment) could still mint
  // orders that appear in nobody's /tickets.
  const userId = await currentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Sign-in required" }, { status: 401 });
  }

  // Idempotency: a retried request (double-click, tab closed mid-flight, flaky
  // network) reuses the order it already created instead of minting a twin. The
  // key is minted per checkout attempt on the client, so two genuinely separate
  // attempts get distinct keys and distinct orders.
  const idemKey = body.idempotencyKey;
  if (idemKey) {
    const existing = checkIdempotency(idemKey);
    if (existing) {
      return NextResponse.json({ orderId: existing, emailed: false, retried: true });
    }
  }

  const totalSgd = items.reduce(
    (sum, item) => sum + parseFloat(item.price.replace(/[^0-9.]/g, "") || "0"),
    0,
  );

  const order = await createOrder({
    id: newId("ORD"),
    userId,
    buyerName,
    email,
    currency,
    totalSgd: Math.round(totalSgd * 100) / 100,
    createdAt: new Date().toISOString(),
    tickets,
    emailedAt: null,
  });

  // Stamp the key only after the row is written, so a concurrent retry that
  // loses the race still sees no recorded key and proceeds to create once.
  if (idemKey) markIdempotency(idemKey, order.id);

  const origin = siteOrigin(req);
  const willEmail = mailConfigured();

  // The in-memory store lives in ONE function instance. The buyer sees their
  // ticket, but an emailed link or a second device can land on another
  // instance and find nothing — so on a deployed host this is a real defect,
  // not a fallback. Say so loudly instead of discovering it during a demo.
  if (!hasDatabase()) {
    console.warn(
      `[db] order ${order.id} stored IN MEMORY — set DATABASE_URL or it will vanish on the next deploy/restart.`,
    );
  }

  // Send the tickets BEFORE responding.
  //
  // This used to be fire-and-forget, which is a trap on serverless: the
  // platform freezes the function the moment the response goes out, so an
  // un-awaited send simply never finishes. The symptom is silent — no error
  // logged, emailed_at left null, and a buyer who never receives anything.
  //
  // The cost is that the buyer waits for the SMTP handshake. A timeout keeps
  // that bounded: if Gmail is slow the order still succeeds and is visibly
  // unsent, rather than holding the confirmation screen hostage.
  let emailed = false;
  let emailError: string | null = null;

  if (willEmail) {
    try {
      await withTimeout(sendTicketEmail(order, origin), EMAIL_TIMEOUT_MS);
      await markOrderEmailed(order.id);
      emailed = true;
    } catch (err) {
      // emailed_at stays null, so the order is visibly unsent and can be retried.
      emailError = err instanceof Error ? err.message : String(err);
      console.error(`[email] failed for order ${order.id}:`, err);
    }
  } else {
    console.warn(
      `[email] skipped for order ${order.id} — Gmail not configured. Ticket page: ${origin}/tickets/${order.id}`,
    );
  }

  // `emailed` now means the message actually left — not merely that a send was
  // configured. The old version returned true whenever Gmail was set up, even
  // when delivery failed, which is the kind of false success that wastes an
  // afternoon of debugging.
  return NextResponse.json({
    orderId: order.id,
    emailed,
    ...(emailError ? { emailError } : {}),
  });
}
