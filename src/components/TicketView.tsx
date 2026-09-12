"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Download, Mail, Ticket, ArrowLeft, Ship } from "lucide-react";
import RealQR from "./RealQR";
import { useLocale } from "@/lib/locale-context";
import type { StoredOrder } from "@/lib/store";

// Renders an issued order. Shared by the post-payment redirect and by anyone
// arriving from a QR scan or an emailed link, so all three paths show the same
// ticket — there is no "second class" copy that can drift.

export default function TicketView({
  order,
  justPaid,
  signedIn,
  ownsOrder,
}: {
  order: StoredOrder;
  justPaid: boolean;
  signedIn: boolean;
  ownsOrder: boolean;
}) {
  const { t, locale } = useLocale();
  const createdAt = new Date(order.createdAt);

  const priceDisplay = (raw: string) => {
    if (locale !== "id") return raw;
    const num = parseFloat(raw.replace(/[^0-9.]/g, "") || "0");
    return `Rp ${Math.round(num * 11800).toLocaleString("id-ID")}`;
  };

  return (
    <main className="min-h-screen bg-bg py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-fg transition-colors mb-6 print:hidden"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          {t("tickets.backHome")}
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={justPaid ? { scale: 0.5, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center"
          >
            <CheckCircle2 className="w-9 h-9 text-emerald-600" aria-hidden="true" />
          </motion.div>
          <h1 className="text-2xl sm:text-3xl font-bold text-fg tracking-tight">
            {justPaid ? t("tickets.paid") : t("tickets.title")}
          </h1>
          <p className="text-[14px] text-muted mt-2 flex items-center justify-center gap-1.5">
            <Mail className="w-4 h-4" aria-hidden="true" />
            {t("tickets.sentTo").replace("{email}", order.email)}
          </p>
          <p className="text-[12px] text-muted mt-1">
            {t("tickets.order")} {order.id} ·{" "}
            {createdAt.toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" })}{" "}
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
                  <RealQR value={`${typeof window !== "undefined" ? window.location.origin : ""}/tickets/${order.id}`} className="w-28 h-28" />
                  <p className="mt-3 text-[13px] font-mono font-bold tracking-wider text-fg">
                    {ticket.code}
                  </p>
                  <p className="text-[10px] text-muted mt-0.5 uppercase tracking-widest text-center">
                    {t("tickets.scanHint")}
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
                      {t("tickets.active")}
                    </span>
                  </div>

                  {ticket.ferry ? (
                    <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[12px]">
                      <div>
                        <dt className="text-muted">{t("tickets.passenger")}</dt>
                        <dd className="font-semibold text-fg">{ticket.ferry.passenger}</dd>
                      </div>
                      <div>
                        <dt className="text-muted">{t("tickets.passport")}</dt>
                        <dd className="font-semibold text-fg font-mono">{ticket.ferry.passportNumber}</dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-muted">{t("tickets.crossing")}</dt>
                        <dd className="font-semibold text-fg flex items-center gap-1.5">
                          <Ship className="w-3.5 h-3.5 text-accent-ink" aria-hidden="true" />
                          {ticket.ferry.routeFrom} → {ticket.ferry.routeTo}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted">{t("tickets.departure")}</dt>
                        <dd className="font-semibold text-fg">
                          {ticket.ferry.travelDate} · {ticket.ferry.schedule}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted">{t("tickets.trip")}</dt>
                        <dd className="font-semibold text-fg">
                          {ticket.ferry.tripType === "return" ? t("ferry.modal.return") : t("ferry.modal.oneWay")}
                        </dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-muted">{t("tickets.value")}</dt>
                        <dd className="font-semibold text-fg">{priceDisplay(ticket.price)}</dd>
                      </div>
                    </dl>
                  ) : (
                    <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[12px]">
                      <div>
                        <dt className="text-muted">{t("tickets.guest")}</dt>
                        <dd className="font-semibold text-fg">{order.buyerName}</dd>
                      </div>
                      <div>
                        <dt className="text-muted">{t("tickets.value")}</dt>
                        <dd className="font-semibold text-fg">{priceDisplay(ticket.price)}</dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-muted">{t("tickets.valid")}</dt>
                        <dd className="font-semibold text-fg">{t("tickets.validValue")}</dd>
                      </div>
                    </dl>
                  )}
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
              {order.tickets.length} {order.tickets.length === 1 ? t("tickets.voucher") : t("tickets.vouchers")} · {t("tickets.chargedIn")} {order.currency}
            </p>
            <p className="text-[16px] font-bold text-fg">{priceDisplay(`S$ ${order.totalSgd.toFixed(2)}`)}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 print:hidden">
            <a
              href={`/api/tickets/${order.id}/pdf`}
              className="flex-1 flex items-center justify-center gap-2 border border-line-strong text-fg text-[13px] font-bold py-3 rounded-xl hover:bg-surface-sunken transition-colors"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              {t("tickets.downloadPdf")}
            </a>
            {signedIn ? (
              ownsOrder ? (
                <Link
                  href="/tickets"
                  className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white text-[13px] font-bold py-3 rounded-xl transition-colors"
                >
                  <Ticket className="w-4 h-4" aria-hidden="true" />
                  {t("tickets.allTickets")}
                </Link>
              ) : (
                <Link
                  href="/"
                  className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white text-[13px] font-bold py-3 rounded-xl transition-colors"
                >
                  {t("tickets.backHome")}
                </Link>
              )
            ) : (
              // Not signed in: offer the account so these tickets — and the
              // ones bought later — live in one place.
              <Link
                href={`/signin?next=/tickets/${order.id}`}
                className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white text-[13px] font-bold py-3 rounded-xl transition-colors"
              >
                {t("tickets.saveToAccount")}
              </Link>
            )}
          </div>

          <p className="mt-4 text-[11px] text-muted leading-relaxed">
            {t("tickets.redeemNote")}
          </p>

          <div className="hidden print:block mt-4 pt-3 border-t border-line-soft text-[11px] text-muted">
            <p className="font-semibold text-fg">BatamSmart — E-Ticket</p>
            <p className="mt-1">
              {t("tickets.order")} {order.id} · batamsmart.example · support@batamsmart.example
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
