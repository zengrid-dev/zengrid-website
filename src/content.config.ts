import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    // Extend Starlight's frontmatter with version-control metadata so any doc can
    // declare when a feature landed, when it was deprecated, and which tier ships it.
    schema: docsSchema({
      extend: z.object({
        since: z.string().optional(),
        deprecated: z.string().optional(),
        tier: z.enum(['community', 'enterprise']).optional(),
      }),
    }),
  }),
};
