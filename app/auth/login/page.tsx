'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { signIn, getCurrentUser, signInWithRedirect, fetchAuthSession } from 'aws-amplify/auth';
// import { Amplify } from 'aws-amplify';
// import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';
import '@aws-amplify/ui-react/styles.css';

function LoginPageContent() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already authenticated
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    // First check if we have a token in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Verify the token by trying to get the current user
        const user = await getCurrentUser();
        if (user) {
          setIsAuthenticated(true);
          router.push('/account');
          return;
        }
      } catch (error) {
        // If getCurrentUser fails but we have a token, try to validate the token
        try {
          const { accessToken } = (await fetchAuthSession()).tokens ?? {};
          if (accessToken) {
            // Token is valid
            setIsAuthenticated(true);
            router.push('/account');
            return;
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('token');
          }
        } catch (tokenError) {
          // Token validation failed, remove it
          localStorage.removeItem('token');
          console.log('Token validation failed:', tokenError);
        }
      }
    }
    
    // User is not authenticated, continue showing login page
    console.log('User not authenticated');
  };

  // Get redirect URL from query parameters
  const [redirectUrl, setRedirectUrl] = useState('/');
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for redirect parameter in URL using Next.js useSearchParams
    const redirect = searchParams.get('redirect');
    if (redirect && redirect !== '/auth/login' && redirect !== '/auth/register') {
      // Decode the URL if it's URL encoded
      // const decodedRedirect = decodeURIComponent(cleanRedirect);
      setRedirectUrl(redirect);
    }
  }, [searchParams]);

  // Check for redirect after authentication
  useEffect(() => {
    if(isAuthenticated && redirectUrl) {
      console.log('Redirecting to:', redirectUrl);
      // Use router.push instead of replace and add a small delay to ensure the redirect happens
      setTimeout(() => {
        router.push(redirectUrl);
      }, 100);
    }
  }, [isAuthenticated, redirectUrl, router]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { isSignedIn, nextStep } = await signIn({
        username: email,
        password,
      });
      console.log('Sign in result:', { isSignedIn, nextStep });
      if (isSignedIn) {
        setIsAuthenticated(true);
        // Get session tokens and set auth cookie
        const { accessToken } = (await fetchAuthSession()).tokens ?? {};
        
        if (accessToken) {
          localStorage.setItem('token', accessToken.toString());
          router.push(redirectUrl);
        } else {
          throw new Error('No access token found after authentication');
        }
      } else if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        // Handle new password required flow
        router.push('/auth/reset-password');
      }
    } catch (error: any) {
      console.error('Error signing in:', error);
      setError(error.message || 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: string) => {
    setLoading(true);
    setError('');

    try {
      // Configure the redirect URI for social sign-in
      const redirectSignIn = typeof window !== 'undefined' ? 
        `${window.location.origin}/account` : 
        'http://localhost:3000/account';
      
      await signInWithRedirect({
        provider: provider as 'Google' | 'Facebook',
        // options: {
        //   redirectUri: redirectSignIn
        // }
      });
      // The redirect will happen automatically by Amplify
    } catch (error: any) {
      console.error(`Error signing in with ${provider}:`, error);
      setError(error.message || `Failed to sign in with ${provider}. Please try again.`);
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return <div className="flex justify-center items-center h-64">Redirecting to your account...</div>;
  }

  return (
      <div className="max-w-md mx-auto p-6 pt-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-lg shadow-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0"
              required
            />
            <div className="mt-1 text-right">
              <Link href="/auth/forgot-password" className="text-sm text-gray-700 hover:text-gray-900" onClick={(e) => {
                e.preventDefault();
                router.push('/auth/forgot-password');
              }}>
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${loading ? 'bg-gray-500' : 'bg-gray-800 hover:bg-gray-900'} transition-colors duration-300`}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSocialSignIn('Google')}
              disabled={loading}
              className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-300 flex items-center justify-center"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                  <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                  <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                  <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                </g>
              </svg>
              Google
            </button>

            <button
              onClick={() => handleSocialSignIn('Facebook')}
              disabled={loading}
              className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-300 flex items-center justify-center"
            >
              <svg className="h-5 w-5 mr-2" fill="#1877F2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C18.34 21.21 22 17.06 22 12.06C22 6.53 17.5 2.04 12 2.04Z" />
              </svg>
              Facebook
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm">
          <p>
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-gray-700 hover:text-gray-900 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
};