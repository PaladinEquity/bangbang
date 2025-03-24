'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { resetPassword, confirmResetPassword, getCurrentUser } from 'aws-amplify/auth';
import '@aws-amplify/ui-react/styles.css';

function ForgotPasswordPageContent() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Get redirect URL from query parameters
  const [redirectUrl, setRedirectUrl] = useState('/account');
  const searchParams = useSearchParams();

  // Check if user is already authenticated
  useEffect(() => {
    checkAuthStatus();
  }, []);
  
  useEffect(() => {
    const redirect = searchParams.get('redirect');
    if (redirect && redirect !== '/auth/login' && redirect !== '/auth/register' && redirect !== '/auth/forgot-password') {
      // Clean up the redirect URL if it contains the current URL
      const cleanRedirect = redirect.includes('?redirect=') 
        ? redirect.split('?redirect=')[0] 
        : redirect;
      // Decode the URL if it's URL encoded
      const decodedRedirect = decodeURIComponent(cleanRedirect);
      setRedirectUrl(decodedRedirect);
      console.log('Setting redirect URL to:', decodedRedirect);
    }
  }, [searchParams]);

  const checkAuthStatus = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setIsAuthenticated(true);
        router.push(redirectUrl);
      }
    } catch (error) {
      // User is not authenticated, continue showing forgot password page
      console.log('User not authenticated');
    }
  };

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await resetPassword({
        username: email,
      });
      
      setSuccess('Verification code sent to your email');
      setShowConfirmation(true);
    } catch (error: any) {
      console.error('Error requesting password reset:', error);
      setError(error.message || 'Failed to request password reset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!confirmationCode) {
      setError('Please enter the verification code');
      return;
    }
    
    if (!newPassword) {
      setError('Please enter a new password');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await confirmResetPassword({
        username: email,
        confirmationCode,
        newPassword,
      });
      
      setSuccess('Password has been reset successfully');
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push('/auth/login?redirect=' + encodeURIComponent(redirectUrl));
      }, 2000);
    } catch (error: any) {
      console.error('Error confirming password reset:', error);
      setError(error.message || 'Failed to reset password. Please try again.');
    } finally {
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
        <h1 className="text-2xl font-bold mb-6 text-center">
          {showConfirmation ? 'Reset Your Password' : 'Forgot Password'}
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">
            {success}
          </div>
        )}

        {!showConfirmation ? (
          // Request code form
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
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

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-md text-white font-medium ${loading ? 'bg-gray-500' : 'bg-gray-800 hover:bg-gray-900'} transition-colors duration-300`}
            >
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>

            <div className="mt-4 text-center text-sm">
              <Link href="/auth/login" className="text-gray-700 hover:text-gray-900 font-medium">
                Back to Login
              </Link>
            </div>
          </form>
        ) : (
          // Confirm reset form
          <form onSubmit={handleConfirmReset} className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                Verification Code
              </label>
              <input
                id="code"
                type="text"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0"
                required
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-md text-white font-medium ${loading ? 'bg-gray-500' : 'bg-gray-800 hover:bg-gray-900'} transition-colors duration-300`}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>

            <div className="mt-4 text-center text-sm">
              <button 
                type="button" 
                onClick={() => setShowConfirmation(false)}
                className="text-purple-600 hover:text-purple-800 font-medium"
              >
                Back to Request Code
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgotPasswordPageContent />
    </Suspense>
  );
};