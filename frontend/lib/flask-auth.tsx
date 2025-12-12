"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login as apiLogin, signup as apiSignup, logout as apiLogout, getCurrentUser, isAuthenticated } from './api';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const FlaskAuthContext = createContext<AuthContextType | undefined>(undefined);

export function FlaskAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for existing session on mount (client-side only)
    if (typeof window !== 'undefined') {
      const checkAuth = () => {
        if (isAuthenticated()) {
          const currentUser = getCurrentUser();
          setUser(currentUser);
        }
        setIsLoading(false);
      };

      checkAuth();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    setUser(data.user);
  };

  const signup = async (email: string, password: string, name: string) => {
    const data = await apiSignup(email, password, name);
    setUser(data.user);
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    router.push('/');
  };

  return (
    <FlaskAuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </FlaskAuthContext.Provider>
  );
}

export function useFlaskAuth() {
  const context = useContext(FlaskAuthContext);
  if (context === undefined) {
    throw new Error('useFlaskAuth must be used within a FlaskAuthProvider');
  }
  return context;
}
