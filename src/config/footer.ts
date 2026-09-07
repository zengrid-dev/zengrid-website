import { links } from "./links";

export const footer = {
  tagline: "Performance-first virtual grid for the web.",
  columns: [
    {
      title: "Product",
      links: [
        { label: "Features", href: links.features },
        { label: "Examples", href: links.demo },
        { label: "Pricing", href: links.pricing },
        { label: "Enterprise", href: links.enterprise },
        { label: "Performance", href: links.performance },
      ],
    },
    {
      title: "Developers",
      links: [
        { label: "Documentation", href: links.docs },
        { label: "API Reference", href: links.api },
        { label: "Getting Started", href: links.getStarted },
        { label: "GitHub", href: links.github },
      ],
    },
    {
      title: "Community",
      links: [
        { label: "About", href: links.about },
        { label: "X / Twitter", href: links.twitter },
        { label: "Contact", href: links.contact },
        { label: "Manage billing", href: links.billing },
      ],
    },
  ],
  copyright: "© 2026 ZenGrid. Open source under MIT.",
  legal: [
    { label: "License (EULA)", href: links.license },
    { label: "Terms", href: links.terms },
    { label: "Privacy", href: links.privacy },
    { label: "Refunds", href: links.refund },
    { label: "MIT (core)", href: links.github },
  ],
};
