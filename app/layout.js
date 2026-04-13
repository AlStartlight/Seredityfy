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

export const metadata = {
  title: 'Seredityfy',
  description: 'Seredityfy - AI Image Generation Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`dark ${plusJakarta.variable} ${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background font-body text-on-background">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
