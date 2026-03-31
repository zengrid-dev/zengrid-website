import { getCollection } from 'astro:content';
import { sidebar } from '../config/sidebar';
import { STATIC_SITEMAP_PATHS, toAbsoluteUrl } from '../lib/seo';

export async function GET() {
  const docs = await getCollection('docs', ({ data }) => !data.draft);
  const urls = [
    ...STATIC_SITEMAP_PATHS.map((pathname) => toAbsoluteUrl(pathname)),
    ...sidebar.map((section) => toAbsoluteUrl(`/docs/${section.slug}`)),
    ...docs.map((entry) => toAbsoluteUrl(`/docs/${entry.id.replace(/\.\w+$/, '')}`)),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}
</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
