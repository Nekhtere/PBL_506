import { NextResponse } from "next/server";
import type { CartItem } from "@/components/Navbar";
import { currentUserId } from "@/lib/session";
import { newId, newTicketCode, createOrder, markOrderEmailed, type OrderTicket } from "@/lib/store";
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
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const totalSgd = items.reduce(
    (sum, item) => sum + parseFloat(item.price.replace(/[^0-9.]/g, "") || "0"),
    0,
  );

  const order = await createOrder({
    id: newId("ORD"),
    userId: await currentUserId(),
    buyerName,
    email,
    currency,
    totalSgd: Math.round(totalSgd * 100) / 100,
    createdAt: new Date().toISOString(),
    tickets,
    emailedAt: null,
  });

  const origin = siteOrigin(req);
  const willEmail = mailConfigured();

  // Fire-and-forget: the buyer gets their tickets on screen immediately, and a
  // slow or failing SMTP handshake cannot hold up or break the confirmation.
  // `emailed` reports whether a send was ATTEMPTED and configured — the actual
  // result lands in the logs and in the order's emailedAt.
  if (willEmail) {
    void sendTicketEmail(order, origin)
      .then(() => markOrderEmailed(order.id))
      .catch((err) => {
        // emailedAt stays null, so the order is visibly unsent and can be retried.
        console.error(`[email] failed for order ${order.id}:`, err);
      });
  } else {
    console.warn(
      `[email] skipped for order ${order.id} — Gmail not configured. Ticket page: ${origin}/tickets/${order.id}`,
    );
  }

  return NextResponse.json({ orderId: order.id, emailed: willEmail });
}
