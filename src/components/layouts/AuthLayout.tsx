
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  // Force light theme for auth pages
  React.useEffect(() => {
    // Store the original theme
    const originalTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    
    // Force light mode
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    
    return () => {
      // Restore original theme when component unmounts
      document.documentElement.classList.remove('light', 'dark');
      if (originalTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.add('light');
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {title}
          </h1>
          <p className="mt-2 text-sm text-gray-600 max-w">{subtitle}</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="border-0 shadow-lg">
          <CardContent className="px-6 py-8 sm:px-10">{children}</CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthLayout;
