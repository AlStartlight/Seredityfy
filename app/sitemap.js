const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://seredityfy.art';

const publicRoutes = [
  { url: '/', priority: '1.0' },
  { url: '/features', priority: '0.9' },
  { url: '/price', priority: '0.8' },
  { url: '/contact', priority: '0.6' },
  { url: '/login', priority: '0.4' },
  { url: '/register', priority: '0.4' },
  { url: '/update', priority: '0.5' },
  { url: '/weeb', priority: '0.5' },
];

export default function sitemap() {
  return publicRoutes.map(({ url, priority }) => ({
    url: `${BASE_URL}${url}`,
    lastModified: new Date(),
    changeFrequency: url === '/' ? 'weekly' : 'monthly',
    priority: parseFloat(priority),
  }));
}
