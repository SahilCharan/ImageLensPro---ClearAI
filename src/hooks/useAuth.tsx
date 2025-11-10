import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/db/supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types/types';
import { profileApi, sessionApi } from '@/db/api';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const refreshProfile = async () => {
    try {
      const profileData = await profileApi.getCurrentProfile();
      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const createUserSession = async (userId: string) => {
    try {
      const newSessionId = await sessionApi.createSession(userId);
      setSessionId(newSessionId);
      console.log('Session created:', newSessionId);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const updateActivity = async () => {
    const storedSessionId = localStorage.getItem('session_id');
    if (storedSessionId) {
      try {
        await sessionApi.updateSessionActivity(storedSessionId);
      } catch (error) {
        console.error('Error updating session activity:', error);
      }
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        refreshProfile();
        createUserSession(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        refreshProfile();
        createUserSession(session.user.id);
      } else {
        setProfile(null);
        const storedSessionId = localStorage.getItem('session_id');
        if (storedSessionId) {
          sessionApi.deleteSession(storedSessionId).catch(console.error);
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Update session activity every 5 minutes
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      updateActivity();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [user]);

  // Update activity on user interaction
  useEffect(() => {
    if (!user) return;

    const handleActivity = () => {
      updateActivity();
    };

    window.addEventListener('click', handleActivity);
    window.addEventListener('keypress', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [user]);

  const signOut = async () => {
    const storedSessionId = localStorage.getItem('session_id');
    if (storedSessionId) {
      try {
        await sessionApi.deleteSession(storedSessionId);
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    }
    
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSessionId(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
