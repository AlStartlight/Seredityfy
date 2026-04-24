export const metadata = {
  title: 'Changelog',
  description:
    'Stay up to date with the latest Seredityfy releases, feature updates, improvements, and bug fixes.',
  robots: {
    index: true,
    follow: true,
  },
};

import { Update } from '@/src/page/Update';

export default function UpdatePage() {
  return <Update />;
}
