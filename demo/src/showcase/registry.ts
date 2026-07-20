export type Tag = 'available' | 'dev' | 'roadmap';
export type PageCleanup = void | (() => void);
export type PageBuild = (host: HTMLElement) => PageCleanup;

export interface PageDef {
  id: string;
  title: string;
  tag: Tag;
  desc: string;
  /** lazy-loaded page module; absent pages render a placeholder */
  load?: () => Promise<{ build: PageBuild }>;
}

export interface NavCategory {
  label: string;
  pages: PageDef[];
}

import { NAV } from './nav-data';
export { NAV };

export function allPages(): PageDef[] {
  return NAV.flatMap((c) => c.pages);
}

export function findPage(id: string): { page: PageDef; category: NavCategory } | undefined {
  for (const category of NAV) {
    const page = category.pages.find((p) => p.id === id);
    if (page) return { page, category };
  }
  return undefined;
}

export function firstPage(): PageDef {
  return NAV[0].pages[0];
}
