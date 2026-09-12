import { redirect } from "next/navigation";

// The old success page read the order out of sessionStorage, which is exactly
// the limitation this work removes — an emailed link or a second tab found
// nothing there. Checkout now redirects straight to /tickets/[id], so this
// route only exists to keep any old link or bookmark from dead-ending.

export default function CheckoutSuccessPage() {
  redirect("/tickets");
}
