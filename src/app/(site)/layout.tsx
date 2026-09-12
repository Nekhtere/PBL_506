import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import MobileCartBar from "@/components/MobileCartBar";
import { CartProvider } from "@/lib/cart-context";

// The site shell: everything that makes a page feel like it belongs to
// BatamSmart rather than being a page on its own.
//
// Before this existed the navbar and footer were mounted inside the home page
// component, so /tickets, /checkout and /legal rendered with no logo, no nav,
// no account menu and no way back — which read as a different website. A route
// group puts them around every route that belongs to the site without changing
// any URL: (site)/tickets/page.tsx still serves /tickets.
//
// /signin is deliberately OUTSIDE this group. It has its own centred card with
// a logo, and a login screen stripped of navigation is the conventional shape.
//
// No padding is applied here: the bar floats over the page (fixed), and how
// much clearance that needs is a per-page decision. The home page's hero is
// full-bleed and runs underneath it on purpose; the inner pages clear it
// themselves with .site-page.

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Navbar />
      {children}
      <Footer />
      <CartDrawer />
      <MobileCartBar />
    </CartProvider>
  );
}
