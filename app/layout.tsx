import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SITE } from '@/lib/site';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { CookieBanner } from '@/components/CookieBanner';
import { LangHtmlUpdater } from '@/components/LangHtmlUpdater';
import { FaqEnhancer } from '@/components/FaqEnhancer';

export const viewport: Viewport = {
  themeColor: '#050816',
};

export const metadata: Metadata = {
  title: {
    default: SITE.brandName,
    template: `%s | ${SITE.brandName}`,
  },
  description:
    'Comparatif Pictory, Akool, HeyGen et InVideo : avatars, lip-sync, brand kit, resize 9:16. Prix, avis, guides, FAQ et offres officielles.',
  metadataBase: new URL(SITE.baseUrl),
  alternates: { canonical: '/' },
  manifest: '/images/site.webmanifest',
  icons: {
    icon: [
      { url: '/images/favicon.ico' },
      { url: '/images/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/images/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/images/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    title: SITE.brandName,
    description:
      'Comparatif IA vidéo + guides : Pictory, Akool, HeyGen et InVideo.',
    url: SITE.baseUrl,
    images: [{ url: '/images/og-social.jpg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE.brandName,
    description:
      'Comparatif IA vidéo + guides : Pictory, Akool, HeyGen et InVideo.',
    images: ['/images/og-social.jpg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <LangHtmlUpdater />
        <FaqEnhancer />
        <SiteHeader />
        <main className="container">{children}</main>
        <SiteFooter />
        <CookieBanner />
      </body>
    </html>
  );
}
