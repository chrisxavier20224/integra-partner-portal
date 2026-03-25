/**
 * Auth Context — manages logged-in state and agent profile
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Agent } from '@/types';
import {
  signIn as supabaseSignIn,
  signOut as supabaseSignOut,
  getCurrentUser,
  getAgentProfile,
  onAuthStateChange,
  type AuthUser,
} from '@/services/supabaseClient';

interface AuthContextValue {
  user: AuthUser | null;
  agent: Agent | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAgent: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Demo agent for when Supabase isn't configured
const DEMO_AGENT: Agent = {
  id: 'demo-001',
  full_name: 'Danny (Elevate Demo)',
  email: 'danny@elevate.co.uk',
  phone: '07700 900000',
  company: 'Elevate',
  is_active: true,
  created_at: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isDemoMode = !import.meta.env.VITE_SUPABASE_URL;

  const loadAgentProfile = useCallback(async (userId: string) => {
    try {
      const profile = await getAgentProfile(userId);
      setAgent(profile);
    } catch (err) {
      console.warn('Failed to load agent profile:', err);
    }
  }, []);

  // Initialise auth state
  useEffect(() => {
    if (isDemoMode) {
      setIsLoading(false);
      return;
    }

    const init = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          await loadAgentProfile(currentUser.id);
        }
      } catch (err) {
        console.warn('Auth init error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    init();

    const unsubscribe = onAuthStateChange(async (authUser) => {
      setUser(authUser);
      if (authUser) {
        await loadAgentProfile(authUser.id);
      } else {
        setAgent(null);
      }
    });

    return () => unsubscribe?.();
  }, [isDemoMode, loadAgentProfile]);

  const login = async (email: string, password: string) => {
    if (isDemoMode) {
      // Demo mode — accept any credentials
      setUser({ id: 'demo-001', email: 'danny@elevate.co.uk' });
      setAgent(DEMO_AGENT);
      return;
    }

    const authUser = await supabaseSignIn(email, password);
    setUser(authUser);
    await loadAgentProfile(authUser.id);
  };

  const logout = async () => {
    if (!isDemoMode) {
      await supabaseSignOut();
    }
    setUser(null);
    setAgent(null);
  };

  const refreshAgent = async () => {
    if (user) {
      await loadAgentProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        agent,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshAgent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
