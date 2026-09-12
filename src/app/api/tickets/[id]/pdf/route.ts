import { getOrder } from "@/lib/store";
import { buildTicketPdf } from "@/lib/ticket-pdf";
import { siteOrigin } from "@/lib/google-oauth";

// Downloads an order as a PDF. The order id is the only credential — it is a
// 10-character random id, so the link is unguessable, which is what makes it
// safe to put in an email.

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const order = await getOrder(params.id);
  if (!order) {
    return new Response("Ticket not found", { status: 404 });
  }

  const pdf = await buildTicketPdf(order, siteOrigin(req));

  return new Response(Buffer.from(pdf), {
    headers: {
      "content-type": "application/pdf",
      // inline so a click opens the PDF in the browser's viewer, where the
      // buyer can still choose to save it.
      "content-disposition": `inline; filename="batamsmart-${order.id}.pdf"`,
      "cache-control": "private, no-store",
    },
  });
}
