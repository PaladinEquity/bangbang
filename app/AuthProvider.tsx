'use client';

import { AuthProvider as AmplifyAuthProvider } from '../components/auth/AuthContext';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <AmplifyAuthProvider>{children}</AmplifyAuthProvider>;
}