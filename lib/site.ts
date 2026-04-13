export const SITE = {
  baseUrl: 'https://rayzvideoai.com',
  domain: 'rayzvideoai.com',
  brandName: 'RayzVideoAI',
  ga4Id: 'G-T5NE017KTW',
  affiliateLinks: {
    pictory: 'https://pictory.ai?ref=pictoryavis',
    akool: 'https://akool.com/?via=rayzvideoai',
    heygen: 'https://www.heygen.com/?sid=rewardful&via=rayzvideoai',
    invideo: 'https://invideo.sjv.io/3JrYry',
  },
  companyName: 'E-Com Shop',
  companyAddress: '60 rue François 1er, 75008 PARIS',
  companyId: 'SIREN 934934308',
  managerName: 'Tony CARON',
  hostName: 'Netlify',
  contactEmail: 'contact.ecomshopfrance@gmail.com',
  supportedLangs: ['fr', 'en', 'es', 'de'] as const,
};

export type Lang = (typeof SITE.supportedLangs)[number];

export const UI_TRANSLATIONS: Record<
  Lang,
  {
    home: string;
    comparison: string;
    tools: string;
    whyAi: string;
    choose: string;
    faq: string;
    blog: string;
    about: string;
    methodology: string;
    sources: string;
    contact: string;
    legal: string;
    privacy: string;
    managerLabel: string;
    hostLabel: string;
    contactLabel: string;
    cookie: string;
    accept: string;
    refuse: string;
    language: string;
  }
> = {
  fr: {
    home: 'Accueil',
    comparison: 'Comparatif',
    tools: 'Outils',
    whyAi: "Pourquoi l'IA",
    choose: 'Choisir',
    faq: 'FAQ',
    blog: 'Blog',
    about: 'À propos',
    methodology: 'Méthodologie',
    sources: 'Sources',
    contact: 'Contact',
    legal: 'Mentions légales',
    privacy: 'Politique de confidentialité',
    managerLabel: 'Dirigeant',
    hostLabel: 'Hébergeur',
    contactLabel: 'contact',
    cookie:
      'Nous utilisons des cookies analytiques (Google Analytics 4) pour améliorer le site.',
    accept: 'Accepter',
    refuse: 'Refuser',
    language: 'Langue',
  },
  en: {
    home: 'Home',
    comparison: 'Comparison',
    tools: 'Tools',
    whyAi: 'Why AI',
    choose: 'Choose',
    faq: 'FAQ',
    blog: 'Blog',
    about: 'About',
    methodology: 'Methodology',
    sources: 'Sources',
    contact: 'Contact',
    legal: 'Legal notice',
    privacy: 'Privacy policy',
    managerLabel: 'Manager',
    hostLabel: 'Host',
    contactLabel: 'contact',
    cookie: 'We use analytical cookies (Google Analytics 4) to improve the site.',
    accept: 'Accept',
    refuse: 'Refuse',
    language: 'Language',
  },
  es: {
    home: 'Inicio',
    comparison: 'Comparación',
    tools: 'Herramientas',
    whyAi: 'Por qué IA',
    choose: 'Elegir',
    faq: 'FAQ',
    blog: 'Blog',
    about: 'Acerca de',
    methodology: 'Metodología',
    sources: 'Fuentes',
    contact: 'Contacto',
    legal: 'Aviso legal',
    privacy: 'Política de privacidad',
    managerLabel: 'Manager',
    hostLabel: 'Host',
    contactLabel: 'contacto',
    cookie: 'Utilizamos cookies analíticas (Google Analytics 4) para mejorar el sitio.',
    accept: 'Aceptar',
    refuse: 'Rechazar',
    language: 'Idioma',
  },
  de: {
    home: 'Start',
    comparison: 'Vergleich',
    tools: 'Tools',
    whyAi: 'Warum KI',
    choose: 'Wählen',
    faq: 'FAQ',
    blog: 'Blog',
    about: 'Über uns',
    methodology: 'Methodik',
    sources: 'Quellen',
    contact: 'Kontakt',
    legal: 'Rechtliche Hinweise',
    privacy: 'Datenschutzbestimmungen',
    managerLabel: 'Manager',
    hostLabel: 'Gastgeber',
    contactLabel: 'Kontakt',
    cookie: 'Wir verwenden analytische Cookies (Google Analytics 4), um die Website zu verbessern.',
    accept: 'Annahme',
    refuse: 'Verweigerung',
    language: 'Sprache',
  },
};

export function normalizeLang(lang: unknown): Lang {
  const normalized = String(lang ?? '').toLowerCase();
  return (SITE.supportedLangs as readonly string[]).includes(normalized) ? (normalized as Lang) : 'fr';
}

function normalizePathname(pathname: string): string {
  let path = pathname || '/';
  if (path !== '/') path = path.replace(/\/+$/, '');
  return path.replace(/\.html$/, '');
}

export function getLangFromPathname(pathname: string): Lang {
  const path = normalizePathname(pathname);
  if (path === '/en' || path.startsWith('/en/')) return 'en';
  if (path === '/es' || path.startsWith('/es/')) return 'es';
  if (path === '/de' || path.startsWith('/de/')) return 'de';
  return 'fr';
}

export function prefixPath(lang: Lang): string {
  return lang === 'fr' ? '' : `/${lang}`;
}

export function homePath(lang: Lang): string {
  return lang === 'fr' ? '/' : `${prefixPath(lang)}/`;
}

export function blogIndexPath(lang: Lang): string {
  return lang === 'fr' ? '/blog' : `${prefixPath(lang)}/blog`;
}

export function legalNoticePath(lang: Lang): string {
  if (lang === 'fr') return '/mentions-legales';
  return `${prefixPath(lang)}/legal-notice`;
}

export function privacyPath(lang: Lang): string {
  if (lang === 'fr') return '/politique-de-confidentialite';
  return `${prefixPath(lang)}/privacy-policy`;
}

export function aboutPath(lang: Lang): string {
  const prefix = prefixPath(lang);
  return `${prefix}/about`.replace(/\/{2,}/g, '/');
}

export function methodologyPath(lang: Lang): string {
  const prefix = prefixPath(lang);
  return `${prefix}/methodology`.replace(/\/{2,}/g, '/');
}

export function sourcesPath(lang: Lang): string {
  const prefix = prefixPath(lang);
  return `${prefix}/sources`.replace(/\/{2,}/g, '/');
}

export function contactPath(lang: Lang): string {
  const prefix = prefixPath(lang);
  return `${prefix}/contact`.replace(/\/{2,}/g, '/');
}

export function localizedUrl(pathname: string, lang: Lang): string {
  const target = normalizeLang(lang);
  const path = normalizePathname(pathname);

  // Strip any existing lang prefix (en/es/de). FR has no prefix.
  const withoutPrefix =
    path === '/en' || path.startsWith('/en/')
      ? path.replace(/^\/en\b/, '') || '/'
      : path === '/es' || path.startsWith('/es/')
        ? path.replace(/^\/es\b/, '') || '/'
        : path === '/de' || path.startsWith('/de/')
          ? path.replace(/^\/de\b/, '') || '/'
          : path;

  const key = translationKeyFromPath(withoutPrefix);
  if (key) {
    const map = ROUTE_BY_KEY[key];
    if (map) return map[target];
  }

  // Fallback: keep same path after stripping prefix, just add new prefix.
  if (withoutPrefix === '/' || withoutPrefix === '') return homePath(target);
  const cleaned = withoutPrefix.startsWith('/') ? withoutPrefix : `/${withoutPrefix}`;
  return `${prefixPath(target)}${cleaned}`;
}

type TranslationKey =
  | 'home'
  | 'blog_index'
  | 'blog_pictory'
  | 'blog_akool'
  | 'blog_heygen'
  | 'blog_invideo'
  | 'legal_notice'
  | 'privacy_policy';

function translationKeyFromPath(pathname: string): TranslationKey | null {
  const p = normalizePathname(pathname);
  if (p === '/' || p === '') return 'home';
  if (p === '/blog') return 'blog_index';
  if (p === '/blog-pictory') return 'blog_pictory';
  if (p === '/blog-akool') return 'blog_akool';
  if (p === '/blog-heygen') return 'blog_heygen';
  if (p === '/blog-invideo') return 'blog_invideo';
  if (p === '/mentions-legales' || p === '/legal-notice') return 'legal_notice';
  if (p === '/politique-de-confidentialite' || p === '/privacy-policy') return 'privacy_policy';
  return null;
}

const ROUTE_BY_KEY: Record<TranslationKey, Record<Lang, string>> = {
  home: {
    fr: '/',
    en: '/en/',
    es: '/es/',
    de: '/de/',
  },
  blog_index: {
    fr: '/blog',
    en: '/en/blog',
    es: '/es/blog',
    de: '/de/blog',
  },
  blog_pictory: {
    fr: '/blog-pictory',
    en: '/en/blog-pictory',
    es: '/es/blog-pictory',
    de: '/de/blog-pictory',
  },
  blog_akool: {
    fr: '/blog-akool',
    en: '/en/blog-akool',
    es: '/es/blog-akool',
    de: '/de/blog-akool',
  },
  blog_heygen: {
    fr: '/blog-heygen',
    en: '/en/blog-heygen',
    es: '/es/blog-heygen',
    de: '/de/blog-heygen',
  },
  blog_invideo: {
    fr: '/blog-invideo',
    en: '/en/blog-invideo',
    es: '/es/blog-invideo',
    de: '/de/blog-invideo',
  },
  legal_notice: {
    fr: '/mentions-legales',
    en: '/en/legal-notice',
    es: '/es/legal-notice',
    de: '/de/legal-notice',
  },
  privacy_policy: {
    fr: '/politique-de-confidentialite',
    en: '/en/privacy-policy',
    es: '/es/privacy-policy',
    de: '/de/privacy-policy',
  },
};
