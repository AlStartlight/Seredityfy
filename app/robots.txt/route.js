const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://seredityfy.com';

export function GET() {
  const body = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: ${BASE_URL}/sitemap.xml
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
