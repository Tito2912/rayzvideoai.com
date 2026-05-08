import type { Post, PostType } from '@/lib/types';
import { SITE, UI_TRANSLATIONS, normalizeLang } from '@/lib/site';

const BASE_URL = SITE.baseUrl;

function jsonLdType(type?: PostType): string {
  if (type === 'article') return 'BlogPosting';
  if (type === 'blogIndex') return 'CollectionPage';
  if (type === 'legal') return 'WebPage';
  return 'WebPage';
}

export function buildArticleJsonLd(post: Post) {
  const url = new URL(post.canonical ?? `/${post.slug}`, BASE_URL).toString();
  const published = post.date ?? post.updatedAt ?? new Date().toISOString();
  const modified = post.updatedAt ?? published;
  const schemaType = jsonLdType(post.type);

  const base: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    headline: post.title,
    description: post.description,
    mainEntityOfPage: url,
    author: [{ '@type': 'Organization', name: SITE.brandName }],
    publisher: { '@type': 'Organization', name: SITE.brandName },
  };

  if (schemaType === 'BlogPosting' || schemaType === 'WebPage') {
    base.datePublished = published;
    base.dateModified = modified;
  }

  return base;
}

export function buildBreadcrumbJsonLd(post: Post) {
  const url = new URL(post.canonical ?? `/${post.slug}`, BASE_URL).toString();
  const t = UI_TRANSLATIONS[normalizeLang(post.lang)];
  const homeLang = post.lang && post.lang !== 'fr' ? `${BASE_URL}/${post.lang}/` : BASE_URL;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: t.home,
        item: homeLang,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: post.title,
        item: url,
      },
    ],
  };
}
