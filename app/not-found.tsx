'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SITE, UI_TRANSLATIONS, getLangFromPathname, prefixPath } from '@/lib/site';

export default function NotFoundPage() {
  const pathname = usePathname() ?? '/';
  const lang = getLangFromPathname(pathname);
  const t = UI_TRANSLATIONS[lang];
  const homeHref = lang === 'fr' ? '/' : `${prefixPath(lang)}/`;

  return (
    <div className="stack">
      <section className="card">
        <h1>{t.notFound}</h1>
        <p className="muted">{t.notFoundText}</p>
        <Link className="btn-primary" href={homeHref}>
          {t.backTo} {SITE.brandName}
        </Link>
      </section>
    </div>
  );
}

