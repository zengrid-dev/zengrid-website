import { getCollection } from 'astro:content';
import { getSectionBySlug, type SidebarItem } from '../config/sidebar';

export interface SectionDocLink extends SidebarItem {
  description: string;
}

export async function getSectionLinks(sectionSlug: string) {
  const section = getSectionBySlug(sectionSlug);

  if (!section) {
    return null;
  }

  const docs = await getCollection('docs', ({ data }) => !data.draft);
  const docsBySlug = new Map(
    docs.map((entry) => [entry.id.replace(/\.\w+$/, ''), entry.data.description]),
  );

  const items = section.items.map((item) => ({
    ...item,
    description: docsBySlug.get(item.slug) ?? '',
  }));

  return {
    ...section,
    items,
  };
}
