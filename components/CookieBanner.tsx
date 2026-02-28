'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getLangFromPathname, privacyPath, UI_TRANSLATIONS } from '@/lib/site';

type Consent = 'accepted' | 'refused';

export function CookieBanner() {
  const pathname = usePathname() ?? '/';
  const lang = getLangFromPathname(pathname);
  const t = UI_TRANSLATIONS[lang];

  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('rayz_cookies') as Consent | null;
      if (consent !== 'accepted' && consent !== 'refused') setHidden(false);
    } catch {
      setHidden(false);
    }
  }, []);

  function set(consent: Consent) {
    try {
      localStorage.setItem('rayz_cookies', consent);
    } catch {
      // ignore
    }
    setHidden(true);
  }

  return (
    <div aria-label="Cookie banner" className={`cookie-banner ${hidden ? 'hidden' : ''}`} role="dialog">
      <p>
        {t.cookie} <Link href={privacyPath(lang)}>{t.privacy}</Link>
      </p>
      <div className="cookie-actions">
        <button className="btn-primary" onClick={() => set('accepted')} type="button">
          {t.accept}
        </button>
        <button className="btn" onClick={() => set('refused')} type="button">
          {t.refuse}
        </button>
      </div>
    </div>
  );
}

