import { Navbar } from '@/src/components/Navbar';
import { Footer } from '@/src/components/Footer';
import Login from '@/src/container/Login';

export const metadata = {
  title: 'Login',
  description:
    'Sign in to your Seredityfy account to access AI image generation and creative tools.',
};

export default function LoginPage() {
  return (
    <div className='bg-white dark:bg-gradient-to-br bg-gradient-75 from-slate-950 via-purple-950 to-blue-950'>
      <Navbar type='update' />
      <Login />
      <Footer />
    </div>
  );
}
