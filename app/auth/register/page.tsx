'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { signUp, confirmSignUp, autoSignIn, getCurrentUser, signInWithRedirect, fetchAuthSession } from 'aws-amplify/auth';
import '@aws-amplify/ui-react/styles.css';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already authenticated
  useEffect(() => {
    checkAuthStatus();
  }, []);


  const checkAuthStatus = async () => {
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
        }
      } catch (tokenError) {
        console.log('Token validation failed:', tokenError);
      }
    }

  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.firstName) {
      setError('All fields are required');
      return false;
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError('');
    console.log('Form data:', formData);
    try {
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username: formData.email,
        password: formData.password,
        options: {
          userAttributes: {
            email: formData.email,
            given_name: formData.firstName,
            family_name: formData.lastName || '',
            address: '',
            phone_number: '',
            picture: '',
            zoneinfo: '',
            updated_at: new Date().toISOString() // Example for lastUpdateTime
          },
          autoSignIn: true
        }
      });
      console.log("isSignUpComplete-------", isSignUpComplete);
      if (isSignUpComplete) {
        // If sign-up is complete without confirmation
        try {
          await autoSignIn();
          router.push('/');
        } catch (error) {
          console.log('Error during auto sign-in:', error);
          router.push('/auth/login');
        }
      } else if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        // User needs to confirm sign-up with a code
        setShowConfirmation(true);
      }
    } catch (error: any) {
      console.error('Error signing up:', error);
      setError(error.message || 'Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!confirmationCode) {
      setError('Please enter the confirmation code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { isSignUpComplete, nextStep } = await confirmSignUp({
        username: formData.email,
        confirmationCode
      });
      console.log("isSignUpComplete---------------", isSignUpComplete, nextStep);
      if (isSignUpComplete) {
        // Try auto sign-in after confirmation
        try {
          router.push('/account');
        } catch (error) {
          console.log('Error during auto sign-in:', error);
          router.push('/auth/login?verified=true');
        }
      }
    } catch (error: any) {
      console.error('Error confirming sign up:', error);
      setError(error.message || 'Failed to confirm sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignUp = async (provider: string) => {
    setLoading(true);
    setError('');

    try {
      // Configure the redirect URI for social sign-up
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
      console.error(`Error signing up with ${provider}:`, error);
      setError(error.message || `Failed to sign up with ${provider}. Please try again.`);
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
        {!showConfirmation ? (
          // Registration Form
          <>
            <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSignUp}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Password must be at least 8 characters long</p>
              </div>

              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-800 hover:bg-gray-900 text-white py-2 px-4 rounded-md transition-colors duration-200 flex justify-center items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </>
                ) : 'Create Account'}
              </button>

              <div className="mt-4 text-center text-sm">
                <p>
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-gray-700 hover:text-gray-900 transition-colors duration-200">
                    Sign In
                  </Link>
                </p>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or sign up with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleSocialSignUp('Google')}
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
                  onClick={() => handleSocialSignUp('Facebook')}
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
          </>
        ) : (
          // Confirmation Code Form
          <>
            <h1 className="text-2xl font-bold mb-6 text-center">Verify Your Email</h1>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}

            <p className="mb-4 text-gray-600 text-sm">
              We've sent a verification code to <span className="font-medium">{formData.email}</span>.
              Please enter the code below to verify your account.
            </p>

            <form onSubmit={handleConfirmSignUp}>
              <div className="mb-6">
                <label htmlFor="confirmationCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Code
                </label>
                <input
                  type="text"
                  id="confirmationCode"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-800 hover:bg-gray-900 text-white py-2 px-4 rounded-md transition-colors duration-200 flex justify-center items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : 'Verify Account'}
              </button>

              <div className="mt-4 text-center text-sm">
                <p>
                  Didn't receive a code?{' '}
                  <button
                    type="button"
                    onClick={handleSignUp}
                    className="text-gray-700 hover:text-gray-900 transition-colors duration-200"
                  >
                    Resend Code
                  </button>
                </p>
              </div>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}