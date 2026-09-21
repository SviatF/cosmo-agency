export const dynamic = 'force-static';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cosmo-agency.oleg22777.workers.dev';

export default function sitemap() {
  return [
    { url: `${siteUrl}/ru/`, changeFrequency: 'monthly', priority: 1, alternates: { languages: { 'ru-RU': `${siteUrl}/ru/`, 'uk-UA': `${siteUrl}/ua/`, en: `${siteUrl}/en/` } } },
    { url: `${siteUrl}/ua/`, changeFrequency: 'monthly', priority: 1, alternates: { languages: { 'ru-RU': `${siteUrl}/ru/`, 'uk-UA': `${siteUrl}/ua/`, en: `${siteUrl}/en/` } } },
    { url: `${siteUrl}/en/`, changeFrequency: 'monthly', priority: 1, alternates: { languages: { 'ru-RU': `${siteUrl}/ru/`, 'uk-UA': `${siteUrl}/ua/`, en: `${siteUrl}/en/` } } },
    { url: `${siteUrl}/privacy/`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${siteUrl}/terms/`, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
