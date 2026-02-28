'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LanguageSelect } from '@/components/LanguageSelect';
import { blogIndexPath, getLangFromPathname, homePath, UI_TRANSLATIONS, SITE } from '@/lib/site';

export function SiteHeader() {
  const pathname = usePathname() ?? '/';
  const lang = getLangFromPathname(pathname);
  const t = UI_TRANSLATIONS[lang];

  const home = homePath(lang);
  const blog = blogIndexPath(lang);

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
            <Link href={blog}>{t.blog}</Link>
            <span aria-hidden="true" className="nav-sep" />
            <a className="aff-link" href={SITE.affiliateLinks.pictory} rel="sponsored noopener noreferrer" target="_blank">
              Pictory
            </a>
            <a className="aff-link" href={SITE.affiliateLinks.akool} rel="sponsored noopener noreferrer" target="_blank">
              Akool
            </a>
            <a className="aff-link" href={SITE.affiliateLinks.heygen} rel="sponsored noopener noreferrer" target="_blank">
              HeyGen
            </a>
            <a className="aff-link" href={SITE.affiliateLinks.invideo} rel="sponsored noopener noreferrer" target="_blank">
              InVideo
            </a>
          </nav>

          <LanguageSelect />
        </div>
      </div>
    </header>
  );
}
