import type { LegalDoc } from "./index";

export const refund: LegalDoc = {
  slug: "refund",
  title: "Refund Policy",
  updated: "6 September 2026",
  intro:
    "We want you to be confident buying ZenGrid. This policy explains when a paid plan can be refunded.",
  sections: [
    {
      heading: "1. 14-day refund",
      paragraphs: [
        "If ZenGrid does not work for you, request a full refund within 14 days of your initial purchase and we will cancel the license and refund the payment. Just email hello@zengrid.dev from the address on your order.",
      ],
    },
    {
      heading: "2. Renewals",
      paragraphs: [
        "Annual renewals are not automatically refundable. To avoid a renewal charge, cancel before the renewal date through the Polar customer portal. If a renewal caught you by surprise, contact us within 14 days and we will review it in good faith.",
      ],
    },
    {
      heading: "3. How refunds are issued",
      paragraphs: [
        "Refunds are processed by Polar, our Merchant of Record, back to your original payment method. A refund terminates the license rights, updates, and support associated with the refunded purchase. You must stop using the refunded Software and remove its key and copies unless a separate valid license permits use or applicable law requires otherwise. ZenGrid keys work offline and cannot be remotely disabled; we do not claim that a refund technically revokes an already-issued key.",
      ],
    },
    {
      heading: "4. Enterprise",
      paragraphs: [
        "Enterprise agreements are governed by the refund and cancellation terms in your order rather than this policy.",
      ],
    },
    {
      heading: "5. Contact",
      paragraphs: [
        "Questions about a charge or refund? Email hello@zengrid.dev and we’ll help.",
      ],
    },
  ],
};
