import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { 
  supabase, 
  signInWithEmail, 
  signUpWithEmail, 
  signOutUser, 
  fetchUserProfile, 
  upsertProfile,
  resetPasswordForEmail,
  isSupabaseConfigured
} from '../lib/supabase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  isSupabaseLive: boolean;
  signIn: (email: string, pass: string) => Promise<{ error: string | null }>;
  signUp: (email: string, pass: string, name: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null; message?: string }>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isSupabaseLive = isSupabaseConfigured();

  const loadProfile = async (currentUser: User) => {
    try {
      const { data } = await fetchUserProfile(currentUser.id);
      if (data) {
        setProfile(data);
      } else {
        // Generar perfil base
        const fallbackProfile: UserProfile = {
          id: currentUser.id,
          email: currentUser.email || '',
          fullName: (currentUser.user_metadata?.full_name as string) || (currentUser.email ? currentUser.email.split('@')[0] : 'Cliente HALO'),
          createdAt: currentUser.created_at,
        };
        setProfile(fallbackProfile);
      }
    } catch (err) {
      console.warn('Error al cargar perfil:', err);
    }
  };

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      setIsLoading(true);

      if (supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (mounted && session?.user) {
            setUser(session.user);
            await loadProfile(session.user);
          }
        } catch (err) {
          console.warn('Error al obtener sesión de Supabase:', err);
        }

        const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (mounted) {
            if (session?.user) {
              setUser(session.user);
              await loadProfile(session.user);
            } else {
              setUser(null);
              setProfile(null);
            }
          }
        });

        if (mounted) setIsLoading(false);

        return () => {
          authListener?.subscription.unsubscribe();
        };
      } else {
        // Fallback local storage
        try {
          const savedProfileRaw = localStorage.getItem('halo_user_profile');
          if (savedProfileRaw) {
            const parsed = JSON.parse(savedProfileRaw);
            setProfile(parsed);
            setUser({
              id: parsed.id,
              email: parsed.email,
              app_metadata: {},
              user_metadata: { full_name: parsed.fullName },
              aud: 'authenticated',
              created_at: parsed.createdAt || new Date().toISOString(),
            });
          }
        } catch {}
        if (mounted) setIsLoading(false);
      }
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (email: string, pass: string) => {
    const { data, error } = await signInWithEmail(email, pass);
    if (error) {
      return { error };
    }
    if (data?.user) {
      setUser(data.user);
      await loadProfile(data.user);
    }
    return { error: null };
  };

  const signUp = async (email: string, pass: string, name: string) => {
    const { data, error } = await signUpWithEmail(email, pass, name);
    if (error) {
      return { error };
    }
    if (data?.user) {
      setUser(data.user);
      const newProfile: UserProfile = {
        id: data.user.id,
        email,
        fullName: name,
        createdAt: new Date().toISOString(),
      };
      setProfile(newProfile);
    }
    return { error: null };
  };

  const signOut = async () => {
    await signOutUser();
    setUser(null);
    setProfile(null);
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!user && !profile) return { error: 'No hay usuario autenticado' };
    const currentId = user?.id || profile?.id || 'local-user';
    const currentEmail = user?.email || profile?.email || '';

    const merged: UserProfile = {
      id: currentId,
      email: currentEmail,
      fullName: data.fullName || profile?.fullName || '',
      phone: data.phone ?? profile?.phone,
      address: data.address ?? profile?.address,
      city: data.city ?? profile?.city,
      postalCode: data.postalCode ?? profile?.postalCode,
      avatarUrl: data.avatarUrl ?? profile?.avatarUrl,
    };

    const { error } = await upsertProfile(merged);
    if (!error) {
      setProfile(merged);
      return { error: null };
    }
    return { error };
  };

  const resetPassword = async (email: string) => {
    return await resetPasswordForEmail(email);
  };

  const refreshUserData = async () => {
    if (user) {
      await loadProfile(user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoggedIn: Boolean(user || profile),
        isLoading,
        isSupabaseLive,
        signIn,
        signUp,
        signOut,
        updateProfileData,
        resetPassword,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
