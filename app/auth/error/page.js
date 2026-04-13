'use client';
import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/src/components/Navbar';
import { Footer } from '@/src/components/Footer';

const ErrorContent = () => {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error) => {
    switch (error) {
      case 'Configuration':
        return 'Server configuration error. Please contact support.';
      case 'AccessDenied':
        return 'You do not have permission to access this resource.';
      case 'Verification':
        return 'The verification link has expired or has already been used.';
      case 'OAuthSignin':
      case 'OAuthCallback':
      case 'OAuthCreateAccount':
        return 'An error occurred with the OAuth provider. Please try again.';
      case 'CredentialsSignin':
        return 'Invalid email or password. Please try again.';
      case 'Callback':
        return 'Callback error. Please try again.';
      default:
        return 'An authentication error occurred. Please try again.';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 mx-auto">
      <div className="w-full rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 bg-gray-800 dark:border-gray-700">
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-red-400 md:text-2xl dark:text-red-400">
            Authentication Error
          </h1>
          
          <div className="p-4 mb-4 text-sm text-red-300 bg-red-900/20 rounded-lg border border-red-800">
            {getErrorMessage(error)}
          </div>
          
          <div className="flex flex-col space-y-3">
            <a 
              href="/login" 
              className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            >
              Back to Login
            </a>
            <a 
              href="/" 
              className="w-full text-gray-300 bg-gray-700 hover:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-gray-600 dark:hover:bg-gray-700"
            >
              Go to Homepage
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center px-6 py-20 mx-auto">
    <div className="w-full rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 bg-gray-800 dark:border-gray-700">
      <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-600 rounded w-3/4 mb-4"></div>
          <div className="h-24 bg-gray-700 rounded mb-4"></div>
          <div className="h-10 bg-gray-600 rounded w-full"></div>
        </div>
      </div>
    </div>
  </div>
);

const AuthError = () => {
  return (
    <div className='bg-white dark:bg-gradient-to-br bg-gradient-75 from-slate-950 via-purple-950 to-blue-950 min-h-screen'>
      <Navbar type='update'/>
      <Suspense fallback={<LoadingFallback />}>
        <ErrorContent />
      </Suspense>
      <Footer/>
    </div>
  );
};

export default AuthError;
