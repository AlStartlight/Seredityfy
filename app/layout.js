import '../src/index.css';
import '../src/components/Loader/index.css';
import { Plus_Jakarta_Sans, Inter, Space_Grotesk } from 'next/font/google';
import AuthProvider from '@/src/components/Providers';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-headline',
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-label',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://seredityfy.com';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: '%s | Seredityfy',
    default: 'Seredityfy - AI Image Generation Platform',
  },
  description:
    'Seredityfy is an advanced AI-powered image generation platform. Create stunning visuals, edit photos, and generate art with cutting-edge AI models.',
  openGraph: {
    title: 'Seredityfy - AI Image Generation Platform',
    description:
      'Create stunning AI-generated images with cutting-edge AI models.',
    url: '/',
    siteName: 'Seredityfy',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Seredityfy - AI Image Generation Platform',
    description:
      'Create stunning AI-generated images with cutting-edge AI models.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`dark ${plusJakarta.variable} ${inter.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background font-body text-on-background" suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
