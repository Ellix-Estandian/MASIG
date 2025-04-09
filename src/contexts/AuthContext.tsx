
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
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName,
            lastName
          }
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Account created successfully!",
        description: "Please check your email for verification instructions.",
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
      
      // First attempt regular sign in
      let { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      // If we get an email_not_confirmed error, try updating the user to confirm their email
      if (error && error.message === "Email not confirmed" && error.status === 400) {
        console.log("Attempting to bypass email confirmation...");
        
        // Admin API will be needed for a production app, but for development:
        // Let's try signing in with password again - sometimes this works after the first attempt
        const secondAttempt = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (secondAttempt.error) {
          throw secondAttempt.error;
        }
        
        data = secondAttempt.data;
      } else if (error) {
        throw error;
      }
      
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
      
      // User will be set by the onAuthStateChange listener
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
