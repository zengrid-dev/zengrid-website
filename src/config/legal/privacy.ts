import type { LegalDoc } from "./index";

export const privacy: LegalDoc = {
  slug: "privacy",
  title: "Privacy Policy",
  updated: "7 September 2026",
  intro:
    "This Privacy Policy explains what personal data we process when you visit the ZenGrid website or purchase a paid plan, and your rights over that data.",
  sections: [
    {
      heading: "1. Data we process",
      paragraphs: ["Depending on how you interact with us, this may include:"],
      bullets: [
        "Order data — your name, email, billing address, and country, collected at checkout to issue and deliver your license.",
        "Payment data — handled entirely by Polar; we do not receive or store your card details.",
        "Support data — the contents of emails you send us.",
      ],
    },
    {
      heading: "2. How we use it",
      paragraphs: [
        "We use your data to process orders, generate and deliver license keys, provide support, send service and renewal notices, and meet legal and tax obligations. We do not sell your personal data.",
      ],
    },
    {
      heading: "3. Processors",
      paragraphs: [
        "We rely on Polar (Merchant of Record — payments, tax, invoicing, and the customer portal), Google Cloud (service hosting and order-fulfillment records), and an email provider to deliver license keys and notices. Each processes data only to provide their service to us.",
      ],
    },
    {
      heading: "4. Retention",
      paragraphs: [
        "We keep order and invoice records for as long as required for tax and accounting purposes, and support correspondence for as long as needed to help you. Polar retains transaction records under its own policy.",
      ],
    },
    {
      heading: "5. Your rights",
      paragraphs: [
        "Subject to your jurisdiction, you may request access to, correction of, or deletion of your personal data, and object to certain processing. To exercise these rights, email hello@zengrid.dev.",
      ],
    },
    {
      heading: "6. Contact",
      paragraphs: [
        "For any privacy question or request, contact hello@zengrid.dev. Data controller: [Legal entity — to be completed].",
      ],
    },
  ],
};
