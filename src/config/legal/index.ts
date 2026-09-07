import { license } from "./license";
import { terms } from "./terms";
import { privacy } from "./privacy";
import { refund } from "./refund";

export type LegalSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type LegalDoc = {
  slug: string;
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
};

/** Registry keyed by URL slug (/legal/<slug>/). Order drives any listing. */
export const legalDocs: LegalDoc[] = [license, terms, privacy, refund];

export const legalBySlug: Record<string, LegalDoc> = Object.fromEntries(
  legalDocs.map((d) => [d.slug, d]),
);
