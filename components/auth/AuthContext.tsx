'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser, signOut, fetchAuthSession } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

type AuthUser = {
  username: string;
  userId: string;
  email?: string;
  name?: string;
  attributes?: Record<string, any>;
};

type AuthContextType = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  logout: async () => {},
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      
      try {
        // Try to get the current user from Amplify
        const currentUser = await getCurrentUser();
        // Format user data
        const userData: AuthUser = {
          username: currentUser.username,
          userId: currentUser.userId,
        };

        // Try to get additional user attributes if available
        try {
          const attributes = currentUser.signInDetails?.loginId ? {
            email: currentUser.signInDetails.loginId,
          } : {};

          userData.attributes = attributes;
          userData.email = attributes.email;
        } catch (error) {
          console.log('Could not get user attributes', error);
        }

        setUser(userData);
      } catch (error) {
        // If getCurrentUser fails but we have a token, try to validate the token
        try {
          const { accessToken } = (await fetchAuthSession()).tokens ?? {};
          console.log('Token validation result:', accessToken);
          if (accessToken) {
            // Token is valid, create a minimal user object
            setUser({
              username: 'user', // Placeholder
              userId: 'user-id', // Placeholder
            });
          } else {
            // Token is invalid
            localStorage.removeItem('token');
            setUser(null);
          }
        } catch (tokenError) {
          // Token validation failed
          localStorage.removeItem('token');
          setUser(null);
        }
      }
    } catch (error) {
      console.log('No authenticated user', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut();
      // Clear the token from localStorage
      localStorage.removeItem('token');
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      // Still clear the token and user state even if Amplify signOut fails
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  useEffect(() => {
    // Initial check for authenticated user
    fetchUserData();

    // Listen for auth events
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
          console.log('User signed in');
          fetchUserData();
          break;
        case 'signedOut':
          console.log('User signed out');
          localStorage.removeItem('token');
          setUser(null);
          break;
        case 'tokenRefresh':
          console.log('Token refreshed');
          fetchUserData();
          break;
        case 'tokenRefresh_failure':
          console.log('Token refresh failed');
          // Handle token refresh failure
          localStorage.removeItem('token');
          setUser(null);
          break;
      }
    });
    
    // Add a storage event listener to sync auth state across tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'token') {
        if (!event.newValue) {
          // Token was removed in another tab
          setUser(null);
        } else if (!user) {
          // Token was added in another tab
          fetchUserData();
        }
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
    }

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        logout,
        refreshUser: fetchUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};