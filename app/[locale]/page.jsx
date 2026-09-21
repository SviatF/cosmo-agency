import { notFound } from 'next/navigation';
import CosmoPage from '../CosmoPage';
import { getCopy, locales } from '../copy';

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  if (!locales.includes(locale)) return {};
  const t = getCopy(locale);
  const title = locale === 'en'
    ? 'COSMO Agency — streaming platform opportunities'
    : locale === 'ua'
      ? 'COSMO Agency — робота на стримінгових платформах'
      : 'COSMO Agency — работа на стриминговых платформах';
  return {
    title,
    description: t.heroCopy,
    alternates: {
      canonical: `/${locale}/`,
      languages: { 'uk-UA': '/ua/', 'ru-RU': '/ru/', en: '/en/' },
    },
    openGraph: { title, description: t.heroCopy, url: `/${locale}/`, locale: locale === 'ua' ? 'uk_UA' : locale === 'ru' ? 'ru_RU' : 'en_US' },
  };
}

export default async function LocalizedHome({ params }) {
  const { locale } = await params;
  if (!locales.includes(locale)) notFound();
  return <CosmoPage locale={locale} />;
}
