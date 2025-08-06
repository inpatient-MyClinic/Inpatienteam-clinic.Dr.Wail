import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any;
  loading: boolean;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signOut: async () => ({ error: null })
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    console.log('useAuth: Setting up auth listeners');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) {
          console.log('useAuth: Component unmounted, skipping auth state change');
          return;
        }
        
        console.log('useAuth: Auth state change event:', event, 'User ID:', session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Don't fetch profile here - let the localStorage auth system handle it
        setProfile(null);
        setLoading(false);
      }
    );

    // Check for existing session with timeout to prevent hanging
    const sessionTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('useAuth: Session check timed out, setting loading to false');
        setLoading(false);
      }
    }, 2000);

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      clearTimeout(sessionTimeout);
      
      if (!mounted) {
        console.log('useAuth: Component unmounted during initial session check');
        return;
      }
      
      if (error) {
        console.error('useAuth: Error getting initial session:', error);
        setLoading(false);
        return;
      }
      
      console.log('useAuth: Initial session check complete:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      setProfile(null);
      setLoading(false);
    }).catch((error) => {
      console.error('useAuth: Error in getSession promise:', error);
      if (mounted) {
        setLoading(false);
      }
    });

    return () => {
      console.log('useAuth: Cleaning up auth listeners');
      mounted = false;
      clearTimeout(sessionTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};