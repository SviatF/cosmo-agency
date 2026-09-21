import './globals.css';
import './tuning.css';
import './seo.css';
import './interactions.css';
import './language.css';
import './cosmic-stars.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cosmo-agency.oleg22777.workers.dev';
const title = 'COSMO Agency — работа на стриминговых платформах';
const description = 'COSMO Agency — команда, которая помогает зарабатывать на стриминговых платформах, развиваться и чувствовать поддержку на каждом этапе.';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: {
    canonical: '/ru/',
    languages: { 'uk-UA': '/ua/', 'ru-RU': '/ru/', en: '/en/' },
  },
  robots: { index: true, follow: true },
  icons: {
    icon: '/img/cosmo-fav.png',
    shortcut: '/img/cosmo-fav.png',
    apple: '/img/cosmo-fav.png',
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: '/ru/',
    siteName: 'COSMO Agency',
    title,
    description,
    images: [{ url: '/img/hero.webp', width: 1600, height: 900, alt: 'COSMO Agency' }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/img/hero.webp'],
  },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'COSMO Agency',
      url: siteUrl,
      logo: `${siteUrl}/img/main-logo%20(1).webp`,
      email: 'hello@cosmo.agency',
      description,
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'COSMO Agency',
      inLanguage: ['ru', 'uk', 'en'],
      publisher: { '@id': `${siteUrl}/#organization` },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      </body>
    </html>
  );
}
