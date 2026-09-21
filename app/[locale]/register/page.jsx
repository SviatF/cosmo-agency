import { notFound } from 'next/navigation';
import RegistrationWizard from '../../RegistrationWizard';
import { locales } from '../../copy';

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }) {
  if (!locales.includes(params.locale)) return {};
  const titles = {
    ru: 'Регистрация — COSMO Agency',
    ua: 'Реєстрація — COSMO Agency',
    en: 'Registration — COSMO Agency',
  };
  return { title: titles[params.locale], robots: { index: false, follow: false } };
}

export default function RegisterPage({ params }) {
  const locale = params.locale;
  if (!locales.includes(locale)) notFound();
  return <RegistrationWizard locale={locale} />;
}
