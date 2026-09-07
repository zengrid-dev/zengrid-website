/**
 * Configuration + data generator for the live ZenGrid demo under
 * "Kick the tires." Kept framework-agnostic so it can run in the client
 * bundle. The row count is intentionally far larger than anything that could
 * fit in the DOM — that's the whole point of the virtualized grid.
 */
import type { ZenGridTheme } from "@zengrid/enterprise";

export const DEMO_ROW_COUNT = 100_000;

export const demoRowHeight = 46;
export const demoHeaderHeight = 44;
export const demoViewportHeight = 440;

/** Column order matches the positional columns of each generated row. */
export const demoColumns = [
  { field: "name", header: "Name", type: "text" },
  { field: "role", header: "Role", type: "text" },
  { field: "region", header: "Region", type: "text" },
  { field: "revenue", header: "Revenue", type: "currency" },
  { field: "mrr", header: "MRR", type: "currency" },
  { field: "status", header: "Status", type: "status" },
] as const;

export const demoColWidths = [280, 220, 170, 170, 150, 150];

export const demoRowCountLabel = DEMO_ROW_COUNT.toLocaleString("en-US");

/**
 * Maps the site's design tokens onto a ZenGridTheme. Palette values are CSS
 * `var(--token)` references, so the grid re-colours live off the same tokens
 * the rest of the page uses; only the scrollbar — which the grid inlines as a
 * literal — is resolved per mode. Fed to the Grid constructor and to
 * `grid.setTheme()` when the site theme toggle flips.
 */
export function zenGridTheme(mode: "light" | "dark"): ZenGridTheme {
  const scrollbar =
    mode === "dark"
      ? { thumb: "rgba(246, 241, 231, 0.20)", thumbHover: "rgba(246, 241, 231, 0.34)" }
      : { thumb: "rgba(33, 29, 26, 0.22)", thumbHover: "rgba(33, 29, 26, 0.38)" };

  return {
    name: mode === "dark" ? "ZenGrid Dark" : "ZenGrid Light",
    id: mode === "dark" ? "zengrid-dark" : "zengrid-light",
    mode,
    colors: {
      background: {
        primary: "var(--surface)",
        secondary: "var(--surface-2)",
        hover: "var(--border-soft)",
        selected: "rgba(242, 118, 78, 0.12)",
        active: "var(--surface)",
        editing: "var(--surface)",
        disabled: "var(--surface-2)",
      },
      border: {
        default: "var(--border-soft)",
        active: "var(--coral)",
        selected: "var(--coral)",
        editing: "var(--teal)",
        focus: "var(--coral)",
      },
      text: {
        primary: "var(--ink)",
        secondary: "var(--muted)",
        disabled: "var(--faint)",
        negative: "var(--coral-sh)",
        link: "var(--coral)",
      },
      state: {
        success: "var(--pill-active-ink)",
        warning: "var(--pill-trial-ink)",
        error: "var(--pill-churned-ink)",
        info: "var(--teal-ink)",
      },
      scrollbar,
    },
    typography: {
      fontFamily:
        '"Instrument Sans Variable", "Instrument Sans", ui-sans-serif, system-ui, sans-serif',
      fontSize: "14px",
      lineHeight: 1.5,
      fontWeight: { normal: 400, medium: 500, semibold: 600, bold: 700 },
    },
    spacing: {
      cellPaddingX: "18px",
      cellPaddingY: "0",
      headerPadding: "18px",
    },
    borders: { width: "1px", radius: "0px" },
    shadows: {
      sm: "0 1px 2px rgba(33, 32, 28, 0.06)",
      md: "0 4px 12px -4px rgba(33, 32, 28, 0.14)",
      lg: "0 14px 40px -18px rgba(33, 32, 28, 0.30)",
    },
    transitions: { fast: "0.1s ease", normal: "0.2s ease", slow: "0.3s ease" },
  };
}

const firstNames = [
  "Aria", "Kenji", "Lucia", "Otto", "Priya", "Marcus", "Sofia", "Idris",
  "Mei", "Noor", "Diego", "Ingrid", "Tomas", "Yuki", "Amara", "Felix",
];
const lastNames = [
  "Vaskov", "Tanaka", "Moreno", "Bergman", "Nair", "Webb", "Rossi", "Okafor",
  "Chen", "Haddad", "Silva", "Larsson", "Novak", "Sato", "Diallo", "Braun",
];
const roles = [
  "Data Engineer", "Product Lead", "Analyst", "Platform Eng", "Staff SWE",
  "Designer", "Eng Manager", "Researcher", "SRE", "Solutions Eng",
];
const regions = [
  "EU-West", "APAC", "LATAM", "EU-North", "US-East", "EU-South", "US-West", "MEA",
];
// Weighted toward Active, matching the design's status mix.
const statuses = ["Active", "Active", "Active", "Trial", "Churned"];

/** Deterministic, allocation-light generator: string pools are reused, only
 *  the revenue number and composed name are per-row. */
export function generateRows(n: number = DEMO_ROW_COUNT): unknown[][] {
  const rows: unknown[][] = new Array(n);
  for (let i = 0; i < n; i++) {
    const first = firstNames[i % firstNames.length];
    const last = lastNames[(i * 7) % lastNames.length];
    const role = roles[(i * 3) % roles.length];
    const region = regions[(i * 5) % regions.length];
    const revenue = 18_000 + ((i * 2_654_435_761) % 244_000);
    const mrr = 400 + ((i * 1_103_515_245) % 20_000);
    const status = statuses[(i + (revenue % 5)) % statuses.length];
    rows[i] = [`${first} ${last}`, role, region, revenue, mrr, status];
  }
  return rows;
}
