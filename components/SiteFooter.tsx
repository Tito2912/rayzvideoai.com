'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { blogIndexPath, getLangFromPathname, legalNoticePath, privacyPath, SITE, UI_TRANSLATIONS } from '@/lib/site';

export function SiteFooter() {
  const pathname = usePathname() ?? '/';
  const lang = getLangFromPathname(pathname);
  const t = UI_TRANSLATIONS[lang];

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-inner">
        <div className="footer-meta">
          <div>
            <strong>{SITE.companyName}</strong> — {SITE.companyAddress} — {SITE.companyId}
            <br />
            {t.managerLabel}: {SITE.managerName} — {t.hostLabel}: {SITE.hostName} — {t.contactLabel}:{' '}
            <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>
          </div>
          <nav aria-label="Utility links" className="footer-nav">
            <Link href={legalNoticePath(lang)}>{t.legal}</Link>
            <Link href={privacyPath(lang)}>{t.privacy}</Link>
            <Link href={blogIndexPath(lang)}>{t.blog}</Link>
          </nav>
        </div>
        <div className="footer-sub">© {new Date().getFullYear()} — {SITE.brandName}</div>
      </div>
    </footer>
  );
}
