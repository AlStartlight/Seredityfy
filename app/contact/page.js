import { Contact } from '@/src/page/Contact';

export const metadata = {
  title: 'Contact',
  description:
    'Get in touch with the Seredityfy team. Support, feedback, partnership inquiries — we are here to help.',
  openGraph: {
    title: 'Contact | Seredityfy',
    description:
      'Get in touch with the Seredityfy team for support, feedback, or partnership inquiries.',
  },
};

export default function ContactPage() {
  return <Contact />;
}
