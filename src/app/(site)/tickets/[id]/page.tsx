import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getOrder } from "@/lib/store";
import { currentUserId } from "@/lib/session";
import TicketView from "@/components/TicketView";

// The web copy of the e-ticket — the destination for the QR code, the emailed
// link, and the post-payment redirect.
//
// The order id is the only credential. It is a 10-character random id, which
// is what makes it safe to hand out in an email or encode in a QR code: you
// cannot enumerate your way to someone else's tickets.

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const order = await getOrder(params.id);
  return {
    title: order ? `E-Tickets · ${order.id} · BatamSmart` : "E-Tickets · BatamSmart",
    robots: { index: false, follow: false },
  };
}

export default async function TicketPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { new?: string };
}) {
  const order = await getOrder(params.id);
  if (!order) notFound();

  // Signed in? Then the page can offer a way back to the full list.
  const viewerId = await currentUserId();

  return (
    <TicketView
      order={order}
      justPaid={searchParams.new === "1"}
      signedIn={Boolean(viewerId)}
      ownsOrder={Boolean(viewerId && order.userId === viewerId)}
    />
  );
}
