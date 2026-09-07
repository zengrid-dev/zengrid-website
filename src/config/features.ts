// Single source of truth for version-controlled features.
//
// - The Feature Matrix page renders this list.
// - The /feature-index.json endpoint serialises it for the client-side search
//   hint, which tells readers on an older version when a feature they searched
//   for only exists in a newer one.
//
// `id` is the Starlight/Pagefind version identifier: 'current' is the latest
// (unversioned) docs, and each archived version uses its slug (e.g. '1.3').

import { coreVersion, currentDocsVersionLabel } from './core-version.mjs';

export type Tier = 'community' | 'enterprise';

export interface DocVersion {
  /** Version identifier used by Starlight/Pagefind ('current' = latest). */
  id: string;
  /** Human label shown in the UI. */
  label: string;
  /** Semver this version corresponds to, used for "since" comparisons. */
  semver: string;
}

export interface Feature {
  title: string;
  /** Slug under src/content/docs/features/ (also the URL segment). */
  slug: string;
  /** Semver in which the feature was introduced. */
  since: string;
  /** Semver in which the feature was deprecated, if any. */
  deprecated?: string;
  tier: Tier;
  summary: string;
  /** Extra search terms that should also trigger the cross-version hint. */
  keywords: string[];
}

/** Newest first. `semver` is compared against a feature's `since`. */
export const versions: DocVersion[] = [
  { id: 'current', label: currentDocsVersionLabel, semver: coreVersion },
  { id: '1.3', label: 'v1.3', semver: '1.3.1' }
];

export const features: Feature[] = [
  {
    title: 'Virtual Scrolling',
    slug: 'virtual-scrolling',
    since: '1.0.0',
    tier: 'community',
    summary: 'Render only the rows in view — a million-row dataset stays a handful of DOM nodes.',
    keywords: ['virtualization', 'windowing', 'scroll', 'performance', 'rows in dom']
  },
  {
    title: 'Column Pinning',
    slug: 'columns/column-pinning',
    since: '1.2.0',
    tier: 'enterprise',
    summary: 'Freeze columns to the left or right edge so key fields stay visible while scrolling.',
    keywords: ['freeze', 'sticky columns', 'pinned', 'frozen columns']
  },
  {
    title: 'Row Spanning',
    slug: 'row-spanning',
    since: '1.4.0',
    tier: 'enterprise',
    summary: 'Merge cells vertically across rows to group repeated values into a single spanning cell.',
    keywords: ['rowspan', 'merge rows', 'span', 'grouping', 'merged cells']
  }
];
