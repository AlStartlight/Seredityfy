import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

interface LoginOptions {
  callbackUrl?: string;
  [key: string]: unknown;
}

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';
  const isUnauthenticated = status === 'unauthenticated';

  const login = useCallback(async (provider = 'credentials', options: LoginOptions = {}) => {
    if (provider === 'credentials') {
      return signIn('credentials', { redirect: false, ...options });
    }
    return signIn(provider, { callbackUrl: options.callbackUrl || '/admin' });
  }, []);

  const logout = useCallback(async () => {
    await signOut({ redirect: false });
    router.push('/');
    router.refresh();
  }, [router]);

  return {
    session,
    user: session?.user,
    isAuthenticated,
    isLoading,
    isUnauthenticated,
    login,
    logout,
  };
}
