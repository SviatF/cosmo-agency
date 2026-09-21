import { notFound } from 'next/navigation';
import AccountPortal from '../../AccountPortal';
import { locales } from '../../copy';

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }) {
  if (!locales.includes(params.locale)) return {};
  const titles = { ru: 'Личный кабинет — COSMO Agency', ua: 'Особистий кабінет — COSMO Agency', en: 'Personal account — COSMO Agency' };
  return { title: titles[params.locale], robots: { index: false, follow: false } };
}

export default function AccountPage({ params }) {
  const locale = params.locale;
  if (!locales.includes(locale)) notFound();
  return <AccountPortal locale={locale} />;
}
