import type { MetadataRoute } from 'next';
import { getAllDocMetas } from '@/lib/content';
import { SITE } from '@/lib/site';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const metas = await getAllDocMetas();

  return [
    ...metas
      .filter((m) => !m.robots?.toLowerCase().includes('noindex'))
      .map((m) => ({
        url: new URL(m.canonical ?? m.routePath, SITE.baseUrl).toString(),
        lastModified: m.lastModified,
      })),
  ];
}
