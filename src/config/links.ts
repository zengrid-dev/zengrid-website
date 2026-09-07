/** Canonical, valid destinations. In-page sections use fragments; product
 *  pages point at the (placeholder) docs/repo until those routes exist. */
export const links = {
  github: "https://github.com/zengrid-dev/zengrid",
  npm: "https://www.npmjs.com/package/@zengrid/core",
  docs: "/getting-started/",
  api: "/feature-matrix/",
  getStarted: "/getting-started/",
  enterprise: "/enterprise/",
  buy: "/buy/",
  billing: "/billing/",
  terms: "/legal/terms/",
  privacy: "/legal/privacy/",
  refund: "/legal/refund/",
  license: "/legal/license/",
  contact: "mailto:hello@zengrid.dev",
  twitter: "https://twitter.com/zengrid",
  about: "https://docs.zengrid.dev/about",
  performance: "https://docs.zengrid.dev/performance",
  // in-page anchors
  features: "#features",
  demo: "#demo",
  pricing: "#pricing",
} as const;
