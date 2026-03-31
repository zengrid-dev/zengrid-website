import { SITE, toAbsoluteUrl } from '../lib/seo';

export function GET() {
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /test',
    'Disallow: /404',
    `Host: ${SITE.url.replace('https://', '')}`,
    `Sitemap: ${toAbsoluteUrl('/sitemap-index.xml')}`,
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
