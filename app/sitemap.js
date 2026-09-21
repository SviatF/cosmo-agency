const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cosmo-agency.oleg22777.workers.dev';

export default function sitemap() {
  return [
    { url: `${siteUrl}/`, changeFrequency: 'monthly', priority: 1 },
    { url: `${siteUrl}/privacy/`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${siteUrl}/terms/`, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
