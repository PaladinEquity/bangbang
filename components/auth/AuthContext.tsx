'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
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
      // return userData;
    } catch (error) {
      console.log('No authenticated user', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
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
          setUser(null);
          break;
        case 'tokenRefresh':
          console.log('Token refreshed');
          fetchUserData();
          break;
        case 'tokenRefresh_failure':
          console.log('Token refresh failed');
          // Handle token refresh failure
          break;
      }
    });

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