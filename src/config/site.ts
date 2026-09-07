import { links } from "./links";
import { coreVersionLabel } from "./core-version.mjs";
export { links } from "./links";
export { pricing, buy, type Plan, type BuyPlan } from "./plans";
export { enterprise } from "./enterprise";
export { footer } from "./footer";

export type Accent = "coral" | "teal" | "violet" | "amber";

export const seo = {
  name: "ZenGrid",
  title: "ZenGrid — Performance-first virtual grid for the web",
  description:
    "ZenGrid renders only the rows you can see — a million-row dataset stays a handful of DOM nodes. TypeScript-first, plugin-ready, zero jank.",
  ogImage: "/og.svg",
  twitterHandle: "@zengrid",
  locale: "en_US",
};

export const nav = [
  { label: "Features", href: links.features },
  { label: "Examples", href: links.demo },
  { label: "Pricing", href: links.pricing },
  { label: "Docs", href: links.docs },
  { label: "API", href: links.api },
];

export const hero = {
  version: `${coreVersionLabel} · fresh on npm`,
  titleLead: "Your data is huge.",
  titleAccent: "Your DOM isn't.",
  description:
    "ZenGrid renders only the rows you can see — a million-row dataset stays a handful of DOM nodes. TypeScript-first, plugin-ready, zero jank.",
  primaryCta: { label: "Start coding →", href: links.getStarted },
  secondaryCta: { label: "View examples", href: links.demo },
  install: "$ npm i @zengrid/core",
  rowsAbove: "612,304",
  rowsBelow: "387,689",
};

export const stats: { value: string; label: string; accent: Accent }[] = [
  { value: "1M", label: "rows in the dataset", accent: "coral" },
  { value: "~30", label: "row nodes in the DOM", accent: "teal" },
  { value: "60", label: "fps while you scroll it", accent: "violet" },
];

export const liveGrid = {
  heading: "Kick the tires.",
  caption: "↓ this one's real — click a column header",
  filename: "customers.grid — 1,000,000 rows · virtualized",
  timing: "58ms",
};

export const codePanel = {
  filename: "grid.ts",
  code: `import { ZenGrid } from '@zengrid/core'

const grid = new ZenGrid(el, {
  data: rows,
  columns,
  virtual: true,
  sortable: true,
  editable: true,
})`,
};

export const features: { title: string; body: string; accent: Accent }[] = [
  {
    title: "Typed end to end",
    body: "Columns, editors, events, and plugins are all typed APIs — your IDE knows your grid.",
    accent: "coral",
  },
  {
    title: "Spreadsheet muscle",
    body: "Selection, clipboard, keyboard nav, inline editing, multi-sort, and deep filtering built in.",
    accent: "teal",
  },
  {
    title: "Backend-ready",
    body: "Load rows on demand with backend hooks — infinite scroll without holding it all in memory.",
    accent: "violet",
  },
];

export const frameworks = ["React", "Vue", "Angular", "Svelte", "Vanilla TS"];

export const cta = {
  title: "Ready to build faster?",
  body: "Open source core. Production-readiness checklist included. Your DOM will thank you.",
  primary: { label: "Get started →", href: links.getStarted },
  secondary: { label: "View on GitHub", href: links.github },
};
