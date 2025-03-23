'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'aws-amplify/auth';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await signOut();
        // Redirect to home page after logout
        router.push('/');
      } catch (error) {
        console.error('Error signing out:', error);
        // Still redirect to home page even if there's an error
        router.push('/');
      }
    };

    performLogout();
  }, [router]);

  return (
    <div className="flex justify-center items-center h-64">
      <div className="text-center">
        <h1 className="text-xl font-medium mb-2">Signing out...</h1>
        <p className="text-gray-500">You will be redirected shortly.</p>
      </div>
    </div>
  );
}