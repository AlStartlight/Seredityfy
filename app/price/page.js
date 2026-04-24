import { Price } from '@/src/page/Price';

export const metadata = {
  title: 'Pricing',
  description:
    'Choose the perfect Seredityfy plan for your creative needs. Free tier available, premium plans for power users.',
  openGraph: {
    title: 'Pricing | Seredityfy',
    description:
      'Choose the perfect Seredityfy plan for your creative needs.',
  },
};

export default function PricePage() {
  return <Price />;
}
