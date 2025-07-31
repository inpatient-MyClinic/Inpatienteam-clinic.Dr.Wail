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
    let profileFetched = false;
    
    console.log('useAuth: Setting up auth listeners');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) {
          console.log('useAuth: Component unmounted, skipping auth state change');
          return;
        }
        
        console.log('useAuth: Auth state change event:', event, 'User ID:', session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && !profileFetched) {
          profileFetched = true;
          console.log('useAuth: User authenticated, fetching profile...');
          
          // Defer Supabase calls with setTimeout to prevent deadlock
          setTimeout(async () => {
            if (!mounted) {
              console.log('useAuth: Component unmounted during profile fetch');
              return;
            }
            
            try {
              console.log('useAuth: Starting profile fetch for user:', session.user.id);
              
              const result = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();
              
              if (!mounted) {
                console.log('useAuth: Component unmounted after profile fetch');
                return;
              }
              
              if (result.error) {
                console.error('useAuth: Profile fetch error:', result.error);
                // For specific error codes, handle differently
                if (result.error.code === 'PGRST116') {
                  console.log('useAuth: No profile found for user, this is expected for new users');
                }
                setProfile(null);
              } else {
                console.log('useAuth: Profile fetched successfully:', result.data);
                setProfile(result.data);
              }
              
              setLoading(false);
              console.log('useAuth: Auth state update complete');
            } catch (error) {
              console.error('useAuth: Unexpected error during profile fetch:', error);
              if (mounted) {
                setProfile(null);
                setLoading(false);
              }
            }
          }, 50);
        } else if (!session?.user) {
          console.log('useAuth: No user session, clearing profile');
          profileFetched = false;
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session with timeout to prevent hanging
    const sessionTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('useAuth: Session check timed out, setting loading to false');
        setLoading(false);
      }
    }, 5000);

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
      
      if (session?.user && !profileFetched) {
        profileFetched = true;
        console.log('useAuth: Initial session has user, fetching profile...');
        
        setTimeout(async () => {
          if (!mounted) {
            console.log('useAuth: Component unmounted during initial profile fetch');
            return;
          }
          
          try {
            console.log('useAuth: Starting initial profile fetch for user:', session.user.id);
            
            const result = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();
            
            if (!mounted) {
              console.log('useAuth: Component unmounted after initial profile fetch');
              return;
            }
            
            if (result.error) {
              console.error('useAuth: Initial profile fetch error:', result.error);
              if (result.error.code === 'PGRST116') {
                console.log('useAuth: No profile found for user in initial fetch');
              }
              setProfile(null);
            } else {
              console.log('useAuth: Initial profile fetched successfully:', result.data);
              setProfile(result.data);
            }
            
            setLoading(false);
            console.log('useAuth: Initial auth setup complete');
          } catch (error) {
            console.error('useAuth: Unexpected error in initial profile fetch:', error);
            if (mounted) {
              setProfile(null);
              setLoading(false);
            }
          }
        }, 50);
      } else {
        console.log('useAuth: No user in initial session or profile already fetched');
        setLoading(false);
      }
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