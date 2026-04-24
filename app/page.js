import { Welcome } from '@/src/page/Welcome';

export const metadata = {
  title: 'Home',
  description:
    'Generate stunning AI-powered images, art, and visuals with Seredityfy. Fast, high-quality, and easy to use.',
  openGraph: {
    title: 'Seredityfy - AI Image Generation Platform',
    description:
      'Generate stunning AI-powered images, art, and visuals with Seredityfy.',
  },
};

export default function HomePage() {
  return <Welcome />;
}
