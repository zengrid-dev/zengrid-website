export type StructuredData = Record<string, unknown>;
export interface BreadcrumbItem {
  title: string;
  path: string;
}

export const SITE = {
  url: 'https://www.zengrid.dev',
  name: 'ZenGrid',
  twitter: '@zengrid',
  github: 'https://github.com/zengrid-dev/zengrid',
  npm: 'https://www.npmjs.com/package/@zengrid/core',
};

export const DEFAULT_TITLE = 'ZenGrid | Performance-First TypeScript Data Grid for the Web';
export const DEFAULT_DESCRIPTION =
  'ZenGrid is a zero-dependency TypeScript data grid with virtual scrolling, sorting, filtering, editing, and plugin APIs for high-volume web apps.';
export const DEFAULT_KEYWORDS = [
  'TypeScript data grid',
  'JavaScript data grid',
  'virtual grid',
  'virtual scrolling',
  'web data grid',
  'high performance grid',
];
export const STATIC_SITEMAP_PATHS = ['/', '/docs', '/features', '/examples', '/api', '/plugins', '/performance'];

function normalizePathname(pathname = '/') {
  if (!pathname || pathname === '/') {
    return '/';
  }

  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  if (normalizedPath.includes('.')) {
    return normalizedPath;
  }

  return normalizedPath.endsWith('/') ? normalizedPath : `${normalizedPath}/`;
}

export function toAbsoluteUrl(pathname = '/') {
  return new URL(normalizePathname(pathname), SITE.url).toString();
}

export function createHomeStructuredData(): StructuredData[] {
  const organizationId = `${SITE.url}/#organization`;
  const websiteId = `${SITE.url}/#website`;

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': organizationId,
      name: SITE.name,
      url: SITE.url,
      logo: toAbsoluteUrl('/zengrid-final-icon.svg'),
      sameAs: [SITE.github, `https://x.com/${SITE.twitter.replace('@', '')}`, SITE.npm],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': websiteId,
      name: SITE.name,
      alternateName: 'ZenGrid Data Grid',
      url: SITE.url,
      description: DEFAULT_DESCRIPTION,
      publisher: { '@id': organizationId },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareSourceCode',
      name: SITE.name,
      url: SITE.url,
      description: DEFAULT_DESCRIPTION,
      codeRepository: SITE.github,
      license: 'https://opensource.org/license/mit/',
      programmingLanguage: ['TypeScript', 'JavaScript'],
      runtimePlatform: 'Web Browser',
      keywords: DEFAULT_KEYWORDS.join(', '),
      publisher: { '@id': organizationId },
    },
  ];
}

export function createDocsStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${SITE.name} Documentation`,
    description: 'ZenGrid documentation, examples, and API references for building high-performance data grids.',
    url: toAbsoluteUrl('/docs'),
    isPartOf: {
      '@type': 'WebSite',
      name: SITE.name,
      url: SITE.url,
    },
  };
}

export function createCollectionPageStructuredData({
  title,
  description,
  pathname,
}: {
  title: string;
  description: string;
  pathname: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url: toAbsoluteUrl(pathname),
    isPartOf: {
      '@type': 'WebSite',
      name: SITE.name,
      url: SITE.url,
    },
  };
}

export function createDocStructuredData({
  title,
  description,
  pathname,
  keywords = [],
}: {
  title: string;
  description: string;
  pathname: string;
  keywords?: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: title,
    description,
    url: toAbsoluteUrl(pathname),
    author: {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.url,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.url,
    },
    keywords: keywords.length > 0 ? keywords.join(', ') : undefined,
    about: keywords.length > 0 ? keywords : undefined,
  };
}

export function createBreadcrumbStructuredData(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.title,
      item: toAbsoluteUrl(item.path),
    })),
  };
}
