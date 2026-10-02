import Script from 'next/script';
import './globals.css';
import './tuning.css';
import './seo.css';
import './interactions.css';
import './language.css';
import './cosmic-stars.css';
import './onboarding.css';
import './onboarding-extra.css';
import './testimonials.css';
import './work-details.css';
import './admin-crm.css';
import './document-verification.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cosmo-agency.oleg22777.workers.dev';
const META_PIXEL_ID = '1967380560597910';
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
        <Script id="meta-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
          (window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init','1967380560597910');
          fbq('track','PageView');
        `}</Script>
        <noscript><img height="1" width="1" style={{ display: "none" }} src="https://www.facebook.com/tr?id=1967380560597910&ev=PageView&noscript=1" alt="" /></noscript>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      </body>
    </html>
  );
}
