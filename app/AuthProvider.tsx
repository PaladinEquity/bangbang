'use client';

import { AuthProvider as AmplifyAuthProvider } from '../components/auth/AuthContext';
import { Toaster } from 'react-hot-toast';
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <AmplifyAuthProvider>{children}<Toaster /></AmplifyAuthProvider>;
}