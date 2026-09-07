import type { LegalDoc } from "./index";
import { licenseDelivery } from "../checkout";

export const terms: LegalDoc = {
  slug: "terms",
  title: "Terms of Service",
  updated: "5 September 2026",
  intro:
    "These Terms of Service govern your access to the ZenGrid website, documentation, and paid plans. By purchasing or using a paid plan you agree to these Terms and to the License Agreement.",
  sections: [
    {
      heading: "1. Accounts and orders",
      paragraphs: [
        "Purchases are processed by Polar, our Merchant of Record, who is the seller of record for your transaction and issues your invoice. You are responsible for the accuracy of the information you provide at checkout, including your billing details and email address for license delivery.",
      ],
    },
    {
      heading: "2. Billing and taxes",
      paragraphs: [
        "Paid plans are billed as annual subscriptions in the currency shown at checkout. Applicable sales tax or VAT is calculated and collected by Polar. Subscriptions renew automatically each year until cancelled through the Polar customer portal.",
      ],
    },
    {
      heading: "3. License delivery",
      paragraphs: [
        licenseDelivery,
      ],
    },
    {
      heading: "4. Acceptable use",
      paragraphs: [
        "You agree to use the website and Software lawfully and not to attempt to disrupt, reverse-engineer license verification, or gain unauthorized access. Use of the Software is further governed by the License Agreement.",
      ],
    },
    {
      heading: "5. Support",
      paragraphs: [
        "Support is provided at the level of your plan (community, email, or priority). Enterprise support terms, including any SLA, are set out in your enterprise order.",
      ],
    },
    {
      heading: "6. Changes",
      paragraphs: [
        "We may update these Terms; material changes will be reflected by the “last updated” date above. Continued use after a change constitutes acceptance.",
      ],
    },
    {
      heading: "7. Contact and governing law",
      paragraphs: [
        "These Terms are governed by the laws of [Governing jurisdiction — to be completed]. For any questions, contact hello@zengrid.dev.",
      ],
    },
  ],
};
