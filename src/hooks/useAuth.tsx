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
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer Supabase calls with setTimeout to prevent deadlock
          setTimeout(async () => {
            if (!mounted) return;
            
            try {
              console.log('Fetching profile for user:', session.user.id);
              
              // Retry mechanism for profile fetch
              let retries = 3;
              let profile = null;
              let error = null;
              
              while (retries > 0 && !profile) {
                const result = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', session.user.id)
                  .maybeSingle();
                
                if (result.error) {
                  console.error(`Profile fetch attempt ${4 - retries} failed:`, result.error);
                  error = result.error;
                  retries--;
                  if (retries > 0) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
                  }
                } else {
                  profile = result.data;
                  break;
                }
              }
              
              if (mounted) {
                if (profile) {
                  console.log('Profile fetched successfully:', profile);
                  setProfile(profile);
                } else {
                  console.error('Failed to fetch profile after retries:', error);
                  setProfile(null);
                }
                setLoading(false);
              }
            } catch (error) {
              console.error('Error fetching profile:', error);
              if (mounted) {
                setProfile(null);
                setLoading(false);
              }
            }
          }, 100);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      console.log('Initial session check:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(async () => {
          if (!mounted) return;
          
          try {
            console.log('Initial profile fetch for user:', session.user.id);
            
            // Retry mechanism for initial profile fetch
            let retries = 3;
            let profile = null;
            let error = null;
            
            while (retries > 0 && !profile) {
              const result = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();
              
              if (result.error) {
                console.error(`Initial profile fetch attempt ${4 - retries} failed:`, result.error);
                error = result.error;
                retries--;
                if (retries > 0) {
                  await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
                }
              } else {
                profile = result.data;
                break;
              }
            }
            
            if (mounted) {
              if (profile) {
                console.log('Initial profile fetched successfully:', profile);
                setProfile(profile);
              } else {
                console.error('Failed to fetch initial profile after retries:', error);
                setProfile(null);
              }
              setLoading(false);
            }
          } catch (error) {
            console.error('Error in initial profile fetch:', error);
            if (mounted) {
              setProfile(null);
              setLoading(false);
            }
          }
        }, 100);
      } else {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
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