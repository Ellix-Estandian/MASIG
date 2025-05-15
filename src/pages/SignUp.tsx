
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import AuthLayout from "@/components/layouts/AuthLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";

const signUpSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  isAdmin: z.boolean().default(false),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

const SignUp = () => {
  const { signUp, loading } = useAuth();
  const { isAdmin: currentUserIsAdmin } = useUserRoles();
  const [showAdminOption, setShowAdminOption] = useState(false);

  // Check if we should show admin option (for first user or if current user is admin)
  React.useEffect(() => {
    const checkIfFirstUser = async () => {
      try {
        // This is a simple way to check if this is potentially the first user
        const { count, error } = await supabase
          .from('user_roles')
          .select('*', { count: 'exact', head: true });
          
        if (error) {
          console.error("Error checking user count:", error);
          return;
        }
        
        // If no users yet or current user is admin, show the admin option
        setShowAdminOption(count === 0 || currentUserIsAdmin);
      } catch (error) {
        console.error("Error checking if first user:", error);
      }
    };
    
    checkIfFirstUser();
  }, [currentUserIsAdmin]);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      isAdmin: false,
    },
  });

  const onSubmit = async (values: SignUpFormValues) => {
    await signUp(values.email, values.password, values.firstName, values.lastName, values.isAdmin);
  };

  return (
    <AuthLayout 
      title="Create your account" 
      subtitle="Start managing your inventory and pricing"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {showAdminOption && (
            <FormField
              control={form.control}
              name="isAdmin"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Admin Account</FormLabel>
                    <p className="text-sm text-gray-500">
                      This account will have full administrative privileges
                    </p>
                  </div>
                </FormItem>
              )}
            />
          )}
          
          <Button 
            type="submit" 
            className="w-full bg-brand-600 hover:bg-brand-700" 
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </Form>
      
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Already have an account?
            </span>
          </div>
        </div>
        
        <div className="mt-6">
          <Link to="/signin">
            <Button 
              variant="outline" 
              className="w-full"
              type="button"
            >
              Sign in
            </Button>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default SignUp;
