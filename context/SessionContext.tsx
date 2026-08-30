'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { Family } from '@/types';
import { getCurrentFamily } from '@/lib/services/familyService';

type SessionContextType = {
  session: Session | null;
  user: User | null;
  family: Family | null;
  loading: boolean;
  refreshFamily: () => Promise<void>;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);

  const loadFamily = async (userId: string) => {
    try {
      const { family: userFamily, error } = await getCurrentFamily(userId);
      if (error) {
        console.error('Error loading family in SessionContext:', error);
        // Optionally set family to null or handle error state
        setFamily(null);
      } else {
        setFamily(userFamily);
      }
    } catch (err) {
      console.error('Unexpected error in loadFamily:', err);
      setFamily(null);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
      
      if (session?.user) {
        await loadFamily(session.user.id);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      
      if (session?.user) {
        await loadFamily(session.user.id);
      } else {
        setFamily(null);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshFamily = async () => {
    if (user) {
      await loadFamily(user.id);
    }
  };

  return (
    <SessionContext.Provider value={{ session, user, family, loading, refreshFamily }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}