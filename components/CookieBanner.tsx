'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getLangFromPathname, privacyPath, UI_TRANSLATIONS } from '@/lib/site';

type Consent = 'accepted' | 'refused';
const COOKIE_KEY = 'rayz_cookies';
const COOKIE_MAX_AGE_DAYS = 180;

function getCookie(name: string): string | null {
  try {
    const cookies = document.cookie ? document.cookie.split(';') : [];
    for (const c of cookies) {
      const [k, ...rest] = c.trim().split('=');
      if (k === name) return decodeURIComponent(rest.join('='));
    }
  } catch {
    // ignore
  }
  return null;
}

function setCookie(name: string, value: string) {
  const maxAge = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
  const secure = typeof window !== 'undefined' && window.location?.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
}

export function CookieBanner() {
  const pathname = usePathname() ?? '/';
  const lang = getLangFromPathname(pathname);
  const t = UI_TRANSLATIONS[lang];

  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    try {
      const cookieConsent = getCookie(COOKIE_KEY) as Consent | null;
      if (cookieConsent === 'accepted' || cookieConsent === 'refused') {
        setHidden(true);
        return;
      }

      const storageConsent = localStorage.getItem(COOKIE_KEY) as Consent | null;
      if (storageConsent === 'accepted' || storageConsent === 'refused') {
        setHidden(true);
        return;
      }

      setHidden(false);
    } catch {
      setHidden(false);
    }
  }, []);

  function set(consent: Consent) {
    try {
      setCookie(COOKIE_KEY, consent);
      localStorage.setItem(COOKIE_KEY, consent);
    } catch {
      // ignore
    }
    setHidden(true);
  }

  return (
    <div aria-label="Cookie banner" aria-live="polite" className={`cookie-banner ${hidden ? 'hidden' : ''}`} role="dialog">
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
