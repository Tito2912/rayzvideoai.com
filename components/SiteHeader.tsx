'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LanguageSelect } from '@/components/LanguageSelect';
import { blogIndexPath, getLangFromPathname, homePath, privacyPath, legalNoticePath, UI_TRANSLATIONS, SITE } from '@/lib/site';

export function SiteHeader() {
  const pathname = usePathname() ?? '/';
  const lang = getLangFromPathname(pathname);
  const t = UI_TRANSLATIONS[lang];

  const home = homePath(lang);
  const blog = blogIndexPath(lang);
  const legal = legalNoticePath(lang);
  const privacy = privacyPath(lang);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="header">
      <div className="header-inner">
        <Link aria-label={SITE.brandName} className="brand" href={home}>
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-text">{SITE.brandName}</span>
        </Link>

        <div className="header-right">
          <button
            aria-controls="site-nav"
            aria-expanded={open}
            aria-label="Menu"
            className="burger"
            onClick={() => setOpen((v) => !v)}
            type="button"
          >
            <span />
            <span />
            <span />
          </button>

          <nav aria-label="Primary" className={`nav ${open ? 'open' : ''}`} id="site-nav">
            <Link href={`${home}#comparatif`}>{t.comparison}</Link>
            <Link href={`${home}#outils`}>{t.tools}</Link>
            <Link href={`${home}#pourquoi`}>{t.whyAi}</Link>
            <Link href={`${home}#guide`}>{t.choose}</Link>
            <Link href={`${home}#faq`}>{t.faq}</Link>
            <Link href={blog}>{t.blog}</Link>
            <Link href={`${home}#contact`}>{t.contact}</Link>
            <Link className="nav-muted" href={privacy}>{t.privacy}</Link>
            <Link className="nav-muted" href={legal}>{t.legal}</Link>
          </nav>

          <LanguageSelect />
        </div>
      </div>
    </header>
  );
}
