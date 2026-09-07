export type Status = "Active" | "Trial" | "Churned";

export interface Row {
  name: string;
  role: string;
  region: string;
  revenue: number;
  mrr: number;
  status: Status;
}

export type ColKey = keyof Row;

export const rows: Row[] = [
  { name: "Aria Vaskov", role: "Data Engineer", region: "EU-West", revenue: 184200, mrr: 15400, status: "Active" },
  { name: "Kenji Tanaka", role: "Product Lead", region: "APAC", revenue: 92750, mrr: 7700, status: "Trial" },
  { name: "Lucia Moreno", role: "Analyst", region: "LATAM", revenue: 231400, mrr: 19300, status: "Active" },
  { name: "Otto Bergman", role: "Platform Eng", region: "EU-North", revenue: 57300, mrr: 4780, status: "Churned" },
  { name: "Priya Nair", role: "Staff SWE", region: "APAC", revenue: 168900, mrr: 14100, status: "Active" },
  { name: "Marcus Webb", role: "Designer", region: "US-East", revenue: 43600, mrr: 3640, status: "Trial" },
  { name: "Sofia Rossi", role: "Eng Manager", region: "EU-South", revenue: 205100, mrr: 17100, status: "Active" },
];

export const columns: { key: ColKey; label: string; align: "left" | "right" }[] = [
  { key: "name", label: "Name", align: "left" },
  { key: "role", label: "Role", align: "left" },
  { key: "region", label: "Region", align: "left" },
  { key: "revenue", label: "Revenue", align: "right" },
  { key: "mrr", label: "MRR", align: "right" },
  { key: "status", label: "Status", align: "left" },
];

/** grid-template-columns for the live demo, matching the source proportions. */
export const gridTemplate = "1.4fr 1.2fr 1fr 0.9fr 0.9fr 0.9fr";

export const defaultSort: { key: ColKey; dir: "asc" | "desc" } = {
  key: "revenue",
  dir: "desc",
};

/** Dot colours for the decorative "viewport" band in the hero visual. */
export const bandDots = ["#f2764e", "#57b6a6", "#e9b949", "#9b7ed6", "#f2764e"];

const collator = new Intl.Collator("en");

export function sortRows(data: Row[], key: ColKey, dir: "asc" | "desc"): Row[] {
  const sign = dir === "asc" ? 1 : -1;
  return [...data].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    const r =
      typeof av === "number" && typeof bv === "number"
        ? av - bv
        : collator.compare(String(av), String(bv));
    return r * sign;
  });
}

export const formatRevenue = (n: number): string =>
  "$" + n.toLocaleString("en-US");
