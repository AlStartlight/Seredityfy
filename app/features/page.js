import { Features } from '@/src/page/Features';

export const metadata = {
  title: 'Features',
  description:
    'Explore Seredityfy features: text-to-image, image-to-video, style transfer, upscaling, and more AI-powered creative tools.',
  openGraph: {
    title: 'Features | Seredityfy',
    description:
      'Explore Seredityfy features: text-to-image, image-to-video, style transfer, upscaling, and more.',
  },
};

export default function FeaturesPage() {
  return <Features />;
}
