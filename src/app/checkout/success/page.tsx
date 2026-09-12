"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Download, Mail, Ticket } from "lucide-react";
import { loadOrder, type Order } from "@/lib/checkout";
import QRCodePlaceholder from "@/components/QRCodePlaceholder";

// E-ticket issue screen. The order was written to sessionStorage by the
// checkout page moments ago; a real build would fetch it by order id from the
// server (the webhook already issued the vouchers) so a refresh or an emailed
// link still works.

export default function CheckoutSuccessPage() {
  // Loads after mount, like the checkout page — sessionStorage doesn't exist
  // in the server render, so reading it during the first client render would
  // fail hydration. `undefined` = still loading.
  const [order, setOrder] = useState<Order | null | undefined>(undefined);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrder(loadOrder());
  }, []);

  if (order === undefined) {
    return <main className="min-h-screen bg-bg" />;
  }

  if (order === null) {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-surface-sunken flex items-center justify-center">
            <Ticket className="w-7 h-7 text-faint" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold text-fg">No recent order found</h1>
          <p className="text-[14px] text-muted mt-2">
            Completed orders appear here right after payment. Start a new booking to see your e-tickets.
          </p>
          <Link
            href="/#journey"
            className="inline-flex items-center gap-2 mt-6 bg-accent hover:bg-accent-hover text-white text-[14px] font-bold px-5 py-3 rounded-xl transition-colors"
          >
            Browse journeys
          </Link>
        </div>
      </main>
    );
  }

  const createdAt = new Date(order.createdAt);

  return (
    <main className="min-h-screen bg-bg py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Confirmation header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center"
          >
            <CheckCircle2 className="w-9 h-9 text-emerald-600" aria-hidden="true" />
          </motion.div>
          <h1 className="text-2xl sm:text-3xl font-bold text-fg tracking-tight">
            Payment confirmed
          </h1>
          <p className="text-[14px] text-muted mt-2 flex items-center justify-center gap-1.5">
            <Mail className="w-4 h-4" aria-hidden="true" />
            E-tickets sent to {order.email}
          </p>
          <p className="text-[12px] text-muted mt-1">
            Order {order.orderId} ·{" "}
            {createdAt.toLocaleDateString("en-SG", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}{" "}
            {createdAt.toLocaleTimeString("en-SG", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </motion.div>

        {/* Tickets */}
        <div className="space-y-4 mb-8">
          {order.tickets.map((ticket, i) => (
            <motion.article
              key={ticket.code}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
              className="bg-surface border border-line rounded-3xl overflow-hidden shadow-[var(--sh-2)]"
            >
              <div className="flex flex-col sm:flex-row">
                {/* QR side */}
                <div className="sm:w-44 shrink-0 bg-surface-sunken flex flex-col items-center justify-center p-5 border-b sm:border-b-0 sm:border-r border-dashed border-line-strong">
                  <div className="w-28 h-28 text-fg">
                    <QRCodePlaceholder value={ticket.code} />
                  </div>
                  <p className="mt-3 text-[13px] font-mono font-bold tracking-wider text-fg">
                    {ticket.code}
                  </p>
                  <p className="text-[10px] text-muted mt-0.5 uppercase tracking-widest">
                    Show at merchant
                  </p>
                </div>

                {/* Details side */}
                <div className="flex-1 p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[16px] font-bold text-fg leading-snug">{ticket.itemName}</p>
                      {ticket.subtitle && (
                        <p className="text-[12px] text-muted mt-0.5">{ticket.subtitle}</p>
                      )}
                    </div>
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                      Active
                    </span>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[12px]">
                    <div>
                      <dt className="text-muted">Guest</dt>
                      <dd className="font-semibold text-fg">{order.buyerName}</dd>
                    </div>
                    <div>
                      <dt className="text-muted">Value</dt>
                      <dd className="font-semibold text-fg">{ticket.price}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-muted">Valid</dt>
                      <dd className="font-semibold text-fg">
                        90 days from issue · single redemption
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Summary + actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-surface border border-line rounded-3xl p-5 sm:p-6 shadow-[var(--sh-2)]"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-[13px] text-muted">
              {order.tickets.length} {order.tickets.length === 1 ? "voucher" : "vouchers"} · charged in {order.currency}
            </p>
            <p className="text-[16px] font-bold text-fg">S$ {order.totalSGD.toFixed(2)}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 print:hidden">
            <button
              onClick={() => window.print()}
              className="flex-1 flex items-center justify-center gap-2 border border-line-strong text-fg text-[13px] font-bold py-3 rounded-xl hover:bg-surface-sunken transition-colors"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              Save as PDF
            </button>
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white text-[13px] font-bold py-3 rounded-xl transition-colors"
            >
              Back to BatamSmart
            </Link>
          </div>
          <p className="mt-4 text-[11px] text-muted leading-relaxed">
            Redemption: show the QR code at the merchant before ordering. Each voucher is
            single-use and non-refundable once scanned. Payment verified with 3-D Secure.
          </p>

          {/* Print-only footer — replaces the buttons on the paper copy. */}
          <div className="hidden print:block mt-4 pt-3 border-t border-line-soft text-[11px] text-muted">
            <p className="font-semibold text-fg">BatamSmart — E-Ticket</p>
            <p className="mt-1">
              Order {order.orderId} · batamsmart.example · support@batamsmart.example
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
