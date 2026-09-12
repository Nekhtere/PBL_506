"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CreditCard,
  Lock,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useLocale } from "@/lib/locale-context";
import RouteLoader from "@/components/RouteLoader";

// ── Demo payment flow ────────────────────────────────────────────────────────
// This page SIMULATES the Stripe Payment Element + 3D Secure challenge so the
// partner demo runs without API keys. The shape mirrors the real integration:
//   1. card form          → Payment Element
//   2. "Verify" step      → 3DS2 challenge (Stripe.js handleNextAction)
//   3. success redirect   → payment_intent.succeeded webhook → issue vouchers
// Swapping in real Stripe later only replaces the handlers marked `simulate*`.

type Step = "details" | "verify" | "processing";

const IDR_PER_SGD = 11800;

function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
}

const inputClass =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[14px] text-fg placeholder:text-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition";

export default function CheckoutPage() {
  const router = useRouter();
  const { t, locale } = useLocale();
  // The cart comes from CartProvider, which reads sessionStorage after mount.
  // `loaded` is false until that read happens — rendering the empty-cart state
  // before it would flash "your cart is empty" at someone who has a cart.
  const { items, loaded, clear } = useCart();
  const [step, setStep] = useState<Step>("details");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  // null = auth status not known yet; the sign-in gate waits for it so a
  // signed-in buyer never sees a login flash on the way to payment.
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  // Checkout requires an account: orders are tied to a user id, and an
  // anonymous order would be unclaimable from /tickets. Unknown visitors are
  // sent to sign-in with a way back here (cart survives in sessionStorage).
  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : { signedIn: false }))
      .then((data) => {
        if (cancelled) return;
        if (data?.signedIn) {
          setSignedIn(true);
        } else {
          router.replace("/signin?next=/checkout");
        }
      })
      .catch(() => {
        if (!cancelled) router.replace("/signin?next=/checkout");
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + parseFloat(item.price.replace(/[^0-9.]/g, "") || "0"),
        0,
      ),
    [items],
  );
  const totalIDR = Math.round(total * IDR_PER_SGD);

  // Currency follows the locale, but the CHARGE does not: /api/orders is always
  // called with currency: "SGD", so under `id` the rupiah is what is shown and
  // the SGD figure is what is actually billed. Both are always on screen — a
  // visitor who sees only "Rp 590.000" and then gets an SGD line on their card
  // statement has been misled, which on this screen is the worst place for it.
  const isID = locale === "id";
  const sgd = `S$ ${total.toFixed(2)}`;
  const idr = `Rp ${totalIDR.toLocaleString("id-ID")}`;
  const money = (amount: number) =>
    isID
      ? `Rp ${Math.round(amount * IDR_PER_SGD).toLocaleString("id-ID")}`
      : `S$ ${amount.toFixed(2)}`;
  const mainTotal = isID ? idr : sgd;
  // The line under the total: the other currency, plus which one is charged.
  const totalNote = `≈ ${isID ? sgd : idr} · ${t("checkout.chargedSgd")}`;
  // Cart line items are stored as SGD strings; show them in the locale's
  // currency, the same way the cart drawer does.
  const priceDisplay = (raw: string) => {
    if (!isID) return raw;
    return money(parseFloat(raw.replace(/[^0-9.]/g, "") || "0"));
  };

  const detailsValid =
    name.trim().length > 1 &&
    /.+@.+\..+/.test(email) &&
    card.replace(/\s/g, "").length === 16 &&
    expiry.replace(/\D/g, "").length === 4 &&
    cvc.length >= 3;

  // Which requirement is still unmet — shown under the button so a locked
  // button never has to be guessed at (autofill vs. state mismatch, etc.).
  const missing: string[] = [];
  if (name.trim().length <= 1) missing.push(t("checkout.need.name"));
  if (!/.+@.+\..+/.test(email)) missing.push(t("checkout.need.email"));
  if (card.replace(/\s/g, "").length !== 16) missing.push(t("checkout.need.card"));
  if (expiry.replace(/\D/g, "").length !== 4) missing.push(t("checkout.need.expiry"));
  if (cvc.length < 3) missing.push(t("checkout.need.cvc"));

  function simulatePaymentIntent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Read straight from the form, not just React state: browser autofill can
    // paint the inputs without firing onChange, which leaves state empty and
    // the Pay button locked even though every field looks filled.
    const data = new FormData(e.currentTarget);
    const f = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      card: String(data.get("card") ?? "").replace(/\s/g, ""),
      expiry: String(data.get("expiry") ?? "").replace(/\D/g, ""),
      cvc: String(data.get("cvc") ?? "").replace(/\D/g, ""),
    };
    if (
      f.name.length <= 1 ||
      !/.+@.+\..+/.test(f.email) ||
      f.card.length !== 16 ||
      f.expiry.length !== 4 ||
      f.cvc.length < 3
    ) {
      setError(t("checkout.errIncomplete"));
      return;
    }
    setName(f.name);
    setEmail(f.email);
    setError("");
    // Real version: stripe.confirmPayment(...) returns requires_action →
    // Stripe.js opens the 3DS modal. Here we render our own challenge screen.
    setStep("verify");
  }

  function simulate3DSComplete(e: React.FormEvent) {
    e.preventDefault();
    // Demo accepts any 6-digit code; the field hint tells the presenter so.
    if (otp.replace(/\D/g, "").length !== 6) {
      setError(t("checkout.errOtp"));
      return;
    }
    setError("");
    setStep("processing");
    // Real version: the payment_intent.succeeded webhook issues the vouchers
    // server-side. Here the client asks our own API to do it — which is what
    // makes the ticket survive a new tab, a QR scan, or an emailed link.
    void issueOrder();
  }

  async function issueOrder() {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items,
          buyerName: name.trim(),
          email: email.trim(),
          currency: "SGD",
        }),
      });

      if (!res.ok) {
        const detail = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(detail?.error ?? `Order failed (${res.status})`);
      }

      const { orderId } = (await res.json()) as { orderId: string };
      clear();
      // The order now lives on the server, so this URL works from anywhere —
      // the QR code, the email, or another device.
      window.setTimeout(() => router.push(`/tickets/${orderId}?new=1`), 700);
    } catch (err) {
      // A 401 means the session lapsed mid-payment (signed out in another tab,
      // cookie expired). Send them to sign in with a way back — the cart
      // survives in sessionStorage — rather than showing a cryptic order error.
      if (err instanceof Error && err.message.includes("(401)")) {
        router.replace("/signin?next=/checkout");
        return;
      }
      // Send them back to the form with a reason rather than leaving the
      // spinner turning forever. The "not charged" reassurance is part of the
      // message in both locales — a failed order must never leave the visitor
      // wondering whether the money left their card.
      setStep("details");
      setError(
        err instanceof Error
          ? t("checkout.errNotCharged").replace("{msg}", err.message)
          : t("checkout.errIssue"),
      );
    }
  }

  // Cart still loading from storage (first paint matches the server: nothing),
  // or auth status still unknown — either way show the crossing loader rather
  // than a blank page or a wrong empty-cart / login flash.
  if (!loaded || signedIn === null) {
    return (
      <main className="min-h-screen bg-bg pt-24 pb-16 flex items-center justify-center px-6">
        <RouteLoader />
      </main>
    );
  }

  if (items.length === 0 && step === "details") {
    return (
      <main className="min-h-screen bg-bg pt-24 pb-16 flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-surface-sunken flex items-center justify-center">
            <ShoppingCart className="w-7 h-7 text-faint" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold text-fg">{t("checkout.emptyTitle")}</h1>
          <p className="text-[14px] text-muted mt-2">
            {t("checkout.emptyBody")}
          </p>
          <Link
            href="/#journey"
            className="inline-flex items-center gap-2 mt-6 bg-accent hover:bg-accent-hover text-white text-[14px] font-bold px-5 py-3 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            {t("tickets.browse")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg pt-24 pb-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-[1fr_360px] gap-6 items-start">
          {/* ── Payment column ─────────────────────────────── */}
          <section className="bg-surface border border-line rounded-3xl p-6 sm:p-8 shadow-[var(--sh-2)]">
            <AnimatePresence mode="wait">
              {step === "details" && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-accent-ink" aria-hidden="true" />
                    </div>
                    <h1 className="text-2xl font-bold text-fg tracking-tight">{t("checkout.title")}</h1>
                  </div>
                  <p className="text-[13px] text-muted mb-6 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                    {t("checkout.secured")}
                  </p>

                  <form onSubmit={simulatePaymentIntent} className="space-y-4">
                    <div>
                      <label htmlFor="co-name" className="block text-[12px] font-semibold text-fg mb-1.5">
                        {t("checkout.name")}
                      </label>
                      <input
                        id="co-name"
                        name="name"
                        className={inputClass}
                        placeholder={t("checkout.namePh")}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="co-email" className="block text-[12px] font-semibold text-fg mb-1.5">
                        {t("checkout.email")}
                      </label>
                      <input
                        id="co-email"
                        name="email"
                        type="email"
                        className={inputClass}
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="co-card" className="block text-[12px] font-semibold text-fg mb-1.5">
                        {t("checkout.card")}
                      </label>
                      <input
                        id="co-card"
                        name="card"
                        inputMode="numeric"
                        className={inputClass}
                        placeholder="4242 4242 4242 4242"
                        value={card}
                        onChange={(e) => setCard(formatCardNumber(e.target.value))}
                        autoComplete="cc-number"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="co-exp" className="block text-[12px] font-semibold text-fg mb-1.5">
                          {t("checkout.expiry")}
                        </label>
                        <input
                          id="co-exp"
                          name="expiry"
                          inputMode="numeric"
                          className={inputClass}
                          placeholder="MM / YY"
                          value={expiry}
                          onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                          autoComplete="cc-exp"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="co-cvc" className="block text-[12px] font-semibold text-fg mb-1.5">
                          CVC
                        </label>
                        <input
                          id="co-cvc"
                          name="cvc"
                          inputMode="numeric"
                          className={inputClass}
                          placeholder="123"
                          value={cvc}
                          onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          autoComplete="cc-csc"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!detailsValid}
                      className="w-full mt-2 flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white text-[14px] font-bold py-3.5 rounded-xl transition-colors shadow-[var(--sh-accent)]"
                    >
                      <Lock className="w-4 h-4" aria-hidden="true" />
                      {t("checkout.pay").replace("{amount}", money(total))}
                    </button>
                    {error && step === "details" && (
                      <p className="text-[12px] text-danger text-center" role="alert">{error}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="w-full text-[13px] font-medium text-muted hover:text-fg transition-colors py-1"
                    >
                      ← {t("checkout.details.back")}
                    </button>
                    {!detailsValid && !error && (
                      <p className="text-[11px] text-muted text-center">
                        {t("checkout.stillNeeded").replace("{list}", missing.join(" · "))}
                      </p>
                    )}
                    <p className="text-[11px] text-muted text-center">
                      {t("checkout.demoNote")}
                    </p>
                  </form>
                </motion.div>
              )}

              {step === "verify" && (
                <motion.div
                  key="verify"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-accent-ink" aria-hidden="true" />
                    </div>
                    <h1 className="text-2xl font-bold text-fg tracking-tight">{t("checkout.verify.title")}</h1>
                  </div>
                  <p className="text-[13px] text-muted mb-6">
                    {t("checkout.verify.body").replace("{amount}", money(total))}
                  </p>

                  <div className="bg-surface-sunken rounded-2xl p-5 mb-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-[var(--sh-1)]">
                      <Smartphone className="w-6 h-6 text-accent-ink" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-fg">
                        {t("checkout.verify.approve")}
                      </p>
                      <p className="text-[12px] text-muted mt-0.5">
                        {t("checkout.verify.sentTo").replace("{last4}", card.replace(/\s/g, "").slice(-4))}
                      </p>
                    </div>
                  </div>

                  <form onSubmit={simulate3DSComplete} className="space-y-4">
                    <div>
                      <label htmlFor="co-otp" className="block text-[12px] font-semibold text-fg mb-1.5">
                        {t("checkout.verify.code")}
                      </label>
                      <input
                        id="co-otp"
                        inputMode="numeric"
                        className={`${inputClass} text-center text-[18px] tracking-[0.4em] font-semibold`}
                        placeholder="••••••"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        autoComplete="one-time-code"
                        required
                      />
                      {error && <p className="text-[12px] text-danger mt-1.5">{error}</p>}
                    </div>
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white text-[14px] font-bold py-3.5 rounded-xl transition-colors shadow-[var(--sh-accent)]"
                    >
                      <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                      {t("checkout.verify.submit")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep("details")}
                      className="w-full text-[13px] font-medium text-muted hover:text-fg transition-colors py-1"
                    >
                      ← {t("checkout.verify.back")}
                    </button>
                    <p className="text-[11px] text-muted text-center">
                      {t("checkout.verify.demoNote")}
                    </p>
                  </form>
                </motion.div>
              )}

              {step === "processing" && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-16 text-center"
                >
                  <div
                    className="w-12 h-12 mx-auto mb-5 rounded-full border-[3px] border-line border-t-accent animate-spin"
                    role="status"
                    aria-label={t("checkout.processing.aria")}
                  />
                  <p className="text-[15px] font-semibold text-fg">{t("checkout.processing.title")}</p>
                  <p className="text-[13px] text-muted mt-1">{t("checkout.processing.body")}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* ── Order summary column ───────────────────────── */}
          <aside className="bg-surface border border-line rounded-3xl p-6 shadow-[var(--sh-2)] md:sticky md:top-6">
            <h2 className="text-[15px] font-bold text-fg mb-4">{t("checkout.summary")}</h2>
            <ul className="space-y-3 mb-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt=""
                      className="w-11 h-11 rounded-lg object-cover shrink-0"
                      draggable={false}
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-lg bg-surface-sunken flex items-center justify-center shrink-0">
                      <span className="text-[9px] font-bold text-accent-ink uppercase">
                        {item.kind === "route" ? "Rte" : "Deal"}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-fg leading-snug truncate">{item.name}</p>
                    {item.subtitle && (
                      <p className="text-[11px] text-muted">{item.subtitle}</p>
                    )}
                  </div>
                  <p className="text-[13px] font-semibold text-fg shrink-0">{priceDisplay(item.price)}</p>
                </li>
              ))}
            </ul>
            <div className="border-t border-line-soft pt-3 space-y-1.5">
              <div className="flex justify-between text-[12px] text-muted">
                <span>{t("cart.subtotal")}</span>
                <span>{mainTotal}</span>
              </div>
              <div className="flex justify-between text-[12px] text-muted">
                <span>{t("cart.fee")}</span>
                <span className="text-emerald-700 font-medium">{t("cart.free")}</span>
              </div>
              <div className="flex justify-between items-end pt-2">
                <div>
                  <p className="text-[13px] font-semibold text-fg">{t("cart.total")}</p>
                  <p className="text-[11px] text-muted">{totalNote}</p>
                </div>
                <p className="text-lg font-bold text-fg">{mainTotal}</p>
              </div>
            </div>
            <p className="mt-4 flex items-start gap-1.5 text-[11px] text-muted">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-px text-accent-ink" aria-hidden="true" />
              {t("checkout.verifiedNote")}
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
