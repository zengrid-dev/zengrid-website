import type { APIRoute } from 'astro';
import { features, versions } from '../config/features';

// Static JSON consumed by /public/docs-feature-hint.js. Kept tiny: just what the
// client needs to decide whether a searched feature exists only in a newer
// version than the one currently being viewed.
export const GET: APIRoute = () => {
  const payload = {
    versions,
    features: features.map((f) => ({
      title: f.title,
      slug: f.slug,
      since: f.since,
      tier: f.tier,
      keywords: f.keywords,
      url: `/features/${f.slug}/`
    }))
  };

  return new Response(JSON.stringify(payload), {
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });
};
