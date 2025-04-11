
import React from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";

const Settings = () => {
  const { user, signOut } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Manage your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Name</p>
                <p className="text-lg">{user?.firstName} {user?.lastName}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-lg">{user?.email}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={signOut} className="w-full sm:w-auto">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Application Settings</CardTitle>
            <CardDescription>Manage application preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Application settings will be available in future updates.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
