export interface SidebarItem {
  title: string;
  slug: string;
}

export interface SidebarSection {
  slug: string;
  title: string;
  description: string;
  items: SidebarItem[];
}

export const sidebar: SidebarSection[] = [
  {
    slug: 'getting-started',
    title: 'Getting Started',
    description: 'Install ZenGrid and create your first high-performance grid.',
    items: [
      { title: 'Installation', slug: 'getting-started/installation' },
      { title: 'Quick Start', slug: 'getting-started/quick-start' },
      { title: 'Your First Grid', slug: 'getting-started/your-first-grid' },
      { title: 'TypeScript Setup', slug: 'getting-started/typescript-setup' },
    ],
  },
  {
    slug: 'user-guide',
    title: 'User Guide',
    description: 'Learn how to load data, configure virtual scrolling, and optimize performance.',
    items: [
      { title: 'Core Grid System', slug: 'user-guide/grid-basics' },
      { title: 'Loading Data', slug: 'user-guide/loading-data' },
      { title: 'Virtual Scrolling', slug: 'user-guide/virtual-scrolling' },
      { title: 'Performance', slug: 'user-guide/performance' },
    ],
  },
  {
    slug: 'features',
    title: 'Features',
    description: 'Selection, sorting, filtering, editing, pagination, and more.',
    items: [
      { title: 'Selection', slug: 'features/selection' },
      { title: 'Sorting', slug: 'features/sorting' },
      { title: 'Filtering', slug: 'features/filtering' },
      { title: 'Editing', slug: 'features/editing' },
      { title: 'Pagination', slug: 'features/pagination' },
      { title: 'Export', slug: 'features/export' },
      { title: 'Columns', slug: 'features/columns' },
      { title: 'Infinite Scroll', slug: 'features/infinite-scroll' },
    ],
  },
  {
    slug: 'api',
    title: 'API Reference',
    description: 'Complete API documentation for the Grid class, options, events, and types.',
    items: [
      { title: 'Grid Class', slug: 'api/grid-class' },
      { title: 'Grid Options', slug: 'api/grid-options' },
      { title: 'Events', slug: 'api/events' },
      { title: 'Types', slug: 'api/types' },
    ],
  },
  {
    slug: 'plugins',
    title: 'Plugins',
    description: 'Extend ZenGrid with built-in and custom plugins.',
    items: [
      { title: 'Overview', slug: 'plugins/overview' },
      { title: 'Core Plugin', slug: 'plugins/core' },
      { title: 'Sort Plugin', slug: 'plugins/sort' },
      { title: 'Filter Plugin', slug: 'plugins/filter' },
      { title: 'Selection Plugin', slug: 'plugins/selection' },
      { title: 'Editing Plugin', slug: 'plugins/editing' },
      { title: 'Undo/Redo Plugin', slug: 'plugins/undo-redo' },
      { title: 'Creating Plugins', slug: 'plugins/creating-plugins' },
    ],
  },
  {
    slug: 'rendering',
    title: 'Rendering',
    description: 'Customize cell and header rendering with built-in and custom renderers.',
    items: [
      { title: 'Cell Renderers', slug: 'rendering/cell-renderers' },
      { title: 'Header Renderers', slug: 'rendering/header-renderers' },
      { title: 'Custom Renderers', slug: 'rendering/custom-renderers' },
    ],
  },
  {
    slug: 'editors',
    title: 'Cell Editors',
    description: 'Built-in editors for text, numbers, dates, dropdowns, and more.',
    items: [
      { title: 'Overview', slug: 'editors/overview' },
      { title: 'Text Editor', slug: 'editors/text' },
      { title: 'Number Editor', slug: 'editors/number' },
      { title: 'Checkbox Editor', slug: 'editors/checkbox' },
      { title: 'Date Editor', slug: 'editors/date' },
      { title: 'Time Editor', slug: 'editors/time' },
      { title: 'DateTime Editor', slug: 'editors/datetime' },
      { title: 'DateRange Editor', slug: 'editors/date-range' },
      { title: 'Select Editor', slug: 'editors/select' },
      { title: 'Dropdown Editor', slug: 'editors/dropdown' },
      { title: 'Custom Editors', slug: 'editors/custom' },
    ],
  },
  {
    slug: 'examples',
    title: 'Examples',
    description: 'Interactive examples showing ZenGrid in action.',
    items: [
      { title: 'Basic Grid', slug: 'examples/basic' },
      { title: 'Sortable Grid', slug: 'examples/sortable' },
      { title: 'Filterable Grid', slug: 'examples/filterable' },
      { title: 'Editable Grid', slug: 'examples/editable' },
      { title: 'Million Rows', slug: 'examples/million-rows' },
    ],
  },
  {
    slug: 'advanced',
    title: 'Advanced',
    description: 'Deep dives into the reactive system, plugin architecture, and accessibility.',
    items: [
      { title: 'Reactive System', slug: 'advanced/reactive-system' },
      { title: 'Plugin Architecture', slug: 'advanced/plugin-architecture' },
      { title: 'Accessibility', slug: 'advanced/accessibility' },
    ],
  },
];

/** Get all slugs as a flat list */
function getAllSlugs(): string[] {
  return sidebar.flatMap((section) => section.items.map((item) => item.slug));
}

export function getSectionPath(sectionSlug: string) {
  return `/docs/${sectionSlug}`;
}

export function getSectionBySlug(sectionSlug: string) {
  return sidebar.find((section) => section.slug === sectionSlug) ?? null;
}

/** Get previous and next pages for navigation */
export function getPrevNext(currentSlug: string): {
  prev: SidebarItem | null;
  next: SidebarItem | null;
} {
  const allItems = sidebar.flatMap((section) => section.items);
  const index = allItems.findIndex((item) => item.slug === currentSlug);
  return {
    prev: index > 0 ? allItems[index - 1] : null,
    next: index < allItems.length - 1 ? allItems[index + 1] : null,
  };
}

/** Get breadcrumb trail for a slug */
export function getBreadcrumbs(
  currentSlug: string
): { title: string; slug?: string }[] {
  for (const section of sidebar) {
    const item = section.items.find((i) => i.slug === currentSlug);
    if (item) {
      return [
        { title: 'Docs', slug: '/docs' },
        { title: section.title, slug: getSectionPath(section.slug) },
        { title: item.title },
      ];
    }
  }
  return [{ title: 'Docs', slug: '/docs' }];
}
