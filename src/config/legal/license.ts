import type { LegalDoc } from "./index";

/** End-User License Agreement for the paid (Solo / Team / Enterprise) tiers.
 *  The open-source core is separately MIT-licensed; this EULA governs the
 *  commercial plugins, editors, and enterprise features unlocked by a key. */
export const license: LegalDoc = {
  slug: "license",
  title: "License Agreement (EULA)",
  updated: "6 September 2026",
  intro:
    "This End-User License Agreement (the “Agreement”) governs your use of the ZenGrid commercial features unlocked by a paid license key. The open-source ZenGrid core is licensed separately under the MIT License and is not restricted by this Agreement.",
  sections: [
    {
      heading: "1. Definitions",
      paragraphs: [
        "“Software” means the ZenGrid commercial packages (pro plugins, editors, and enterprise features) and any updates provided under a paid plan. “License Key” means the signed key issued to you on purchase. “Seat” means one individual developer authorized to build with the Software.",
      ],
    },
    {
      heading: "2. Grant of license",
      paragraphs: [
        "Subject to payment, your plan’s seat count, and this Agreement, we grant you a non-exclusive, non-transferable, worldwide license to use the Software to develop, build, and deploy your own applications. Your subscription buys updates and support for its paid period. You may continue using versions released on or before your paid updates cutoff after cancellation or non-renewal, including building and deploying applications with those versions, unless your license is terminated under this Agreement.",
      ],
    },
    {
      heading: "3. Seats and scope",
      paragraphs: [
        "The License Key does not technically lock to a machine; seat limits are contractual. You agree that no more developers than your plan’s seat count will use the Software concurrently. You may deploy applications built with the Software to unlimited servers and end users — end users are not seats.",
      ],
      bullets: [
        "Solo — 1 developer seat.",
        "Team — up to 10 developer seats.",
        "Enterprise — seat count and terms as set out in your order.",
      ],
    },
    {
      heading: "4. Restrictions",
      paragraphs: ["You may not:"],
      bullets: [
        "Redistribute, resell, sublicense, or share the Software or a License Key except as embedded in your own application.",
        "Remove or circumvent license verification, or use the Software beyond your seat count.",
        "Publish the Software as a competing component library or developer tool.",
      ],
    },
    {
      heading: "5. Ownership",
      paragraphs: [
        "The Software is licensed, not sold. We retain all right, title, and interest in the Software. Applications you build remain yours.",
      ],
    },
    {
      heading: "6. Term and renewal",
      paragraphs: [
        "Paid plans are annual subscriptions that renew until cancelled. The subscription period end is an updates cutoff, not an application shutdown date. A version released on or before that cutoff keeps working indefinitely after cancellation or non-renewal. Versions released later require a renewed entitlement. Paid renewal extends updates and support coverage. Cancellation and renewal are managed through the Polar customer portal.",
        "Solo and Team receive the same commercial feature package; their developer seat limits and support differ. The commercial packages are delivered privately and are not published to any package registry.",
        "A refund terminates the license granted by the refunded purchase and future updates and support under that purchase. You must stop using the refunded Software and remove the associated key and copies, except to the extent a separate valid license permits use or applicable law requires otherwise. Keys are verified offline and cannot be remotely disabled; termination is a contractual obligation, not a technical revocation.",
      ],
    },
    {
      heading: "7. Warranty and liability",
      paragraphs: [
        "The Software is provided “as is” without warranty of any kind. To the maximum extent permitted by law, our aggregate liability under this Agreement is limited to the fees you paid in the twelve months preceding the claim.",
      ],
    },
    {
      heading: "8. Governing law",
      paragraphs: [
        "This Agreement is governed by the laws of [Governing jurisdiction — to be completed]. Questions: hello@zengrid.dev.",
      ],
    },
  ],
};
