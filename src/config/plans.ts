import { links } from "./links.ts";
import type { Accent } from "./site";

export type BuyPlan = {
  key: "solo" | "team";
  name: string;
  accent: Accent;
  amountUsd: number;
  seats: number;
  summary: string;
  includes: string[];
};

// Display data only. Polar's product configuration determines the charge.
export const paidPlans: BuyPlan[] = [
  {
    key: "solo", name: "Solo", accent: "coral", amountUsd: 120, seats: 1,
    summary: "For a single developer shipping with ZenGrid in production.",
    includes: ["1 developer seat", "All pro plugins & editors", "Email support", "One year of updates"],
  },
  {
    key: "team", name: "Team", accent: "violet", amountUsd: 999, seats: 10,
    summary: "For a team standardising on ZenGrid across products.",
    includes: ["10 developer seats", "All pro plugins & editors", "Priority support queue", "One year of updates"],
  },
];

export const priceLabel = (plan: BuyPlan) => `$${plan.amountUsd.toLocaleString("en-US")}`;
export const seatLabel = (plan: BuyPlan) =>
  `${plan.seats} developer ${plan.seats === 1 ? "seat" : "seats"} · per year`;

export type Plan = {
  name: string;
  accent: Accent;
  price: string;
  note: string;
  features: string[];
  cta: { label: string; href: string; variant: "primary" | "secondary" };
  featured?: boolean;
  badge?: string;
};

export const pricing = {
  title: "Simple pricing for your team.",
  subtitle: "Solo includes one developer seat. Team includes ten.",
  footnote: "Prices in USD, before applicable tax. Paid plans renew annually until cancelled.",
  plans: [
    {
      name: "Community", accent: "teal", price: "$0", note: "open source · forever",
      features: ["Full core grid, MIT licensed", "Virtual scrolling & sorting", "Community support"],
      cta: { label: "Star on GitHub", href: links.github, variant: "secondary" },
    },
    ...paidPlans.map((plan): Plan => ({
      name: plan.name, accent: plan.accent, price: priceLabel(plan), note: seatLabel(plan),
      features: plan.includes.slice(0, 3),
      featured: plan.key === "team",
      badge: plan.key === "team" ? "MOST POPULAR" : undefined,
      cta: { label: `View ${plan.name}`, href: `${links.buy}#${plan.key}`, variant: "primary" },
    })),
    {
      name: "Enterprise", accent: "violet", price: "Custom", note: "unlimited seats · SLA",
      features: ["Unlimited developer seats", "SLA & dedicated support", "Custom licensing terms"],
      cta: { label: "Explore Enterprise", href: links.enterprise, variant: "secondary" },
    },
  ] satisfies Plan[],
};

export const buy = {
  title: "Buy ZenGrid",
  titleAccent: "choose your plan.",
  description: "Choose a license for yourself or your team. Pay securely on Polar, with no ZenGrid account required.",
  plans: paidPlans,
  seatNote: "Developer seats cover the people building with ZenGrid. End users are not seats. Need a different count, unlimited seats, or an SLA?",
  enterpriseLinkLabel: "See Enterprise →",
  trustNote: "Payment details are entered only on Polar. 14-day refund policy.",
};
