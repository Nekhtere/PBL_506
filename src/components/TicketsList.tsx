"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Ticket, ArrowLeft, ArrowRight, Download, Ship, CalendarDays, ShoppingCart } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import type { StoredOrder } from "@/lib/store";

export default function TicketsList({ orders }: { orders: StoredOrder[] }) {
  const { t, locale } = useLocale();

  const priceDisplay = (raw: string) => {
    if (locale !== "id") return raw;
    const num = parseFloat(raw.replace(/[^0-9.]/g, "") || "0");
    return `Rp ${Math.round(num * 11800).toLocaleString("id-ID")}`;
  };

  return (
    <main className="min-h-screen bg-bg pt-24 pb-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* The navbar's logo is the primary way home now that this page has
            chrome, but a back link here matches the ticket detail page and
            costs nothing — it is the first thing a thumb reaches for. */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-fg transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          {t("tickets.backHome")}
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-fg tracking-tight">
            {t("tickets.mine")}
          </h1>
          <p className="text-[14px] text-muted mt-2">
            {orders.length === 0
              ? t("tickets.mineEmpty")
              : t("tickets.mineCount").replace("{n}", String(orders.length))}
          </p>
        </motion.div>

        {orders.length === 0 ? (
          <div className="bg-surface border border-line rounded-3xl p-10 text-center shadow-[var(--sh-1)]">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-surface-sunken flex items-center justify-center">
              <Ticket className="w-7 h-7 text-faint" aria-hidden="true" />
            </div>
            <p className="text-[14px] text-muted mb-6 max-w-sm mx-auto leading-relaxed">
              {t("tickets.mineEmptyBody")}
            </p>
            <Link
              href="/#journey"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-[14px] font-bold px-5 py-3 rounded-xl transition-colors"
            >
              <ShoppingCart className="w-4 h-4" aria-hidden="true" />
              {t("tickets.browse")}
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {orders.map((o, i) => {
              const created = new Date(o.createdAt);
              const ferryCount = o.tickets.filter((x) => x.ferry).length;
              return (
                <motion.li
                  key={o.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                >
                  <Link
                    href={`/tickets/${o.id}`}
                    className="group block bg-surface border border-line rounded-3xl p-5 shadow-[var(--sh-1)] hover:shadow-[var(--sh-2)] hover:-translate-y-0.5 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-mono text-[13px] font-bold text-fg">{o.id}</p>
                        <p className="text-[11px] text-muted mt-1 flex items-center gap-1.5">
                          <CalendarDays className="w-3 h-3" aria-hidden="true" />
                          {created.toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" })}
                          {ferryCount > 0 && (
                            <>
                              <span className="text-faint">·</span>
                              <Ship className="w-3 h-3" aria-hidden="true" />
                              {t("tickets.ferryLegs").replace("{n}", String(ferryCount))}
                            </>
                          )}
                        </p>
                        <p className="text-[12px] text-muted mt-2 truncate">
                          {o.tickets.map((x) => x.itemName).join(" · ")}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[15px] font-bold text-fg">
                          {priceDisplay(`S$ ${o.totalSgd.toFixed(2)}`)}
                        </p>
                        <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-accent-ink">
                          {t("tickets.view")}
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-line-soft flex flex-wrap gap-1.5">
                      {o.tickets.map((x) => (
                        <span
                          key={x.code}
                          className="text-[10px] font-mono font-semibold text-muted bg-surface-sunken px-2 py-0.5 rounded"
                        >
                          {x.code}
                        </span>
                      ))}
                    </div>
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        )}

        {orders.length > 0 && (
          <p className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-muted">
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            {t("tickets.pdfHint")}
          </p>
        )}
      </div>
    </main>
  );
}
