import { redirect } from "next/navigation";
import { currentUserId } from "@/lib/session";
import { listOrdersForUser } from "@/lib/store";
import TicketsList from "@/components/TicketsList";

// "My tickets" — every order placed under the signed-in account. Reached from
// the navbar, and the landing spot after a successful sign-in.

export const dynamic = "force-dynamic";

export default async function TicketsPage() {
  const userId = await currentUserId();
  // Not signed in: send them to sign-in, and come straight back here after.
  if (!userId) redirect("/signin?next=/tickets");

  const orders = await listOrdersForUser(userId);

  return <TicketsList orders={orders} />;
}
