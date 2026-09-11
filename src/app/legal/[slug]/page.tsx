import Link from "next/link";
import { notFound } from "next/navigation";

// ponytail: static placeholder copy — replace with real counsel-reviewed text before launch.
const docs = {
  privacy: {
    title: "Privacy Policy",
    body: [
      "We collect only what is needed to fulfil your voucher: name, contact details, and payment confirmation. We do not sell your data.",
      "Payment is processed by our payment provider. We never store full card numbers.",
      "Vouchers redeemed at a merchant share the redemption record with that merchant only.",
    ],
  },
  terms: {
    title: "Terms of Service",
    body: [
      "Vouchers are issued for the merchant and offer stated at purchase. Present the QR code at the merchant to redeem.",
      "A voucher may be redeemed once. Duplicate redemption attempts will be declined.",
      "We may suspend an account for fraudulent voucher use.",
    ],
  },
  cookies: {
    title: "Cookie Policy",
    body: [
      "We use strictly necessary cookies to keep your cart and session working.",
      "Analytics cookies are optional and only set with your consent.",
    ],
  },
  refunds: {
    title: "Refund Policy",
    body: [
      "Unredeemed vouchers are refundable within 7 days of purchase, to the original payment method.",
      "Redeemed vouchers are non-refundable. If a merchant cannot honour the offer, contact support and we will refund the voucher in full.",
      "Refunds are processed within 5 to 10 business days.",
    ],
  },
} as const;

export function generateStaticParams() {
  return Object.keys(docs).map((slug) => ({ slug }));
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = docs[slug as keyof typeof docs];
  if (!doc) notFound();

  return (
    <main className="min-h-screen bg-bg px-6 py-24">
      <article className="max-w-2xl mx-auto">
        <Link href="/" className="text-[13px] font-semibold text-accent-ink hover:underline">
          ← BatamSmart
        </Link>
        <h1 className="text-4xl font-bold text-fg tracking-tight mt-4 mb-6">
          {doc.title}
        </h1>
        <div className="space-y-4">
          {doc.body.map((p) => (
            <p key={p} className="text-[15px] text-muted leading-relaxed">{p}</p>
          ))}
        </div>
        <p className="text-[12px] text-muted mt-10 pt-6 border-t border-line-soft">
          Questions? Email support@batamsmart.example.
        </p>
      </article>
    </main>
  );
}