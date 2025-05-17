
import React from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Settings = () => {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-4 bg-muted/60 p-1">
            <TabsTrigger value="profile" className="data-[state=active]:bg-background">
              Profile
            </TabsTrigger>
            <TabsTrigger value="appearance" className="data-[state=active]:bg-background">
              Appearance
            </TabsTrigger>
            <TabsTrigger value="application" className="data-[state=active]:bg-background">
              Application
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card className="border-2 border-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader className="bg-primary/5">
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
                <Button variant="outline" onClick={signOut} className="w-full sm:w-auto border-2">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance">
            <Card className="border-2 border-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader className="bg-primary/5">
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the application theme</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-base mb-3 block">Theme</Label>
                    <div className="flex flex-wrap gap-4">
                      <Button 
                        variant={theme === "light" ? "default" : "outline"}
                        className={`flex-1 min-w-[120px] gap-2 ${theme === "light" ? "" : "border-2"}`}
                        onClick={() => setTheme("light")}
                      >
                        <Sun className="h-5 w-5" />
                        Light
                      </Button>
                      <Button 
                        variant={theme === "dark" ? "default" : "outline"}
                        className={`flex-1 min-w-[120px] gap-2 ${theme === "dark" ? "" : "border-2"}`}
                        onClick={() => setTheme("dark")}
                      >
                        <Moon className="h-5 w-5" />
                        Dark
                      </Button>
                      <Button 
                        variant={theme === "system" ? "default" : "outline"}
                        className={`flex-1 min-w-[120px] gap-2 ${theme === "system" ? "" : "border-2"}`}
                        onClick={() => setTheme("system")}
                      >
                        <Monitor className="h-5 w-5" />
                        System
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="application">
            <Card className="border-2 border-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader className="bg-primary/5">
                <CardTitle>Application Settings</CardTitle>
                <CardDescription>Manage application preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Application settings will be available in future updates.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
