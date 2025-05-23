
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from '@supabase/supabase-js';

type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string, isAdmin?: boolean) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // On initial load, check if user is already logged in
  useEffect(() => {
    const setupAuth = async () => {
      setLoading(true);
      
      // Set up auth state listener FIRST
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          console.log("Auth state changed:", event, session?.user?.id);
          if (session && session.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              firstName: session.user.user_metadata?.firstName,
              lastName: session.user.user_metadata?.lastName,
            });
          } else {
            setUser(null);
          }
          setLoading(false);
        }
      );
      
      // THEN check for existing session
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Initial session check:", session?.user?.id);
      if (session && session.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          firstName: session.user.user_metadata?.firstName,
          lastName: session.user.user_metadata?.lastName,
        });
      }
      
      setLoading(false);
      
      return () => {
        subscription.unsubscribe();
      };
    };
    
    setupAuth();
  }, []);

  const signUp = async (email: string, password: string, firstName: string, lastName: string, isAdmin = false) => {
    try {
      setLoading(true);
      
      // Updated to include autoconfirm: true option
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName,
            lastName,
            isAdmin: isAdmin ? 'true' : 'false' // This will be used by our trigger
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Account created successfully!",
        description: "You can now sign in with your credentials.",
      });
      
      // Redirect to sign in page
      navigate('/signin');
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        variant: "destructive",
        title: "Error creating account",
        description: error.message || "There was a problem creating your account. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log("Attempting to sign in with:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
      
      console.log("Successfully signed in, redirecting to dashboard");
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Signin error:', error);
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: error.message || "Invalid email or password. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      // User will be set to null by the onAuthStateChange listener
      toast({
        title: "Signed out successfully",
      });
      
      // Redirect to sign in page
      navigate('/signin');
    } catch (error: any) {
      console.error('Signout error:', error);
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: error.message || "There was a problem signing out. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signOut,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
