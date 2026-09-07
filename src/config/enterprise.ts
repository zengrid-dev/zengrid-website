import { links } from "./links";
import type { Accent } from "./site";

export const enterprise = {
  badge: "For teams that ship at scale",
  title: "ZenGrid Enterprise",
  titleAccent: "grids you can bet the business on.",
  description:
    "Everything in the paid tiers, plus the guarantees larger teams need: an SLA, a named contact, flexible licensing, and deployment options that fit your stack — including air-gapped.",
  primaryCta: { label: "Contact sales", href: links.contact },
  secondaryCta: { label: "See every feature", href: links.api },
  capabilities: [
    {
      title: "SLA-backed support",
      body: "Guaranteed response times in writing, a shared channel with our engineers, and escalation paths that don't route through a public issue tracker.",
      accent: "coral",
    },
    {
      title: "Named engineering contact",
      body: "A dedicated point of contact who knows your codebase and your rollout — not a fresh ticket every time you reach out.",
      accent: "teal",
    },
    {
      title: "Security & compliance",
      body: "Security-review support, SBOMs on request, and answers to your vendor questionnaires so procurement isn't the thing that blocks the ship date.",
      accent: "violet",
    },
    {
      title: "Custom licensing",
      body: "Unlimited developer seats, redistribution and OEM terms, and perpetual options — licensing shaped to how your product actually ships.",
      accent: "amber",
    },
    {
      title: "Flexible deployment",
      body: "Install from your private registry, run fully on-prem, or operate air-gapped. No phone-home, no runtime license check calling out.",
      accent: "teal",
    },
    {
      title: "Onboarding & migration",
      body: "Guided migration from your current grid, an architecture review of your integration, and hands-on help getting the first million rows on screen.",
      accent: "violet",
    },
  ] as { title: string; body: string; accent: Accent }[],
  included: {
    title: "Every Enterprise feature, included.",
    body: "Row grouping and aggregation, set filters, range and fill handles, rich cell editors, master row dragging, cell notes, and more — all bundled, all supported.",
    linkLabel: "Browse the full feature matrix →",
    linkHref: links.api,
  },
  contact: {
    title: "Let's talk about your rollout.",
    body: "Tell us your team size, framework, and timeline. We'll come back with licensing and a plan — usually within one business day.",
    primary: { label: "Contact sales", href: links.contact },
    secondary: { label: "Read the docs", href: links.docs },
  },
};
