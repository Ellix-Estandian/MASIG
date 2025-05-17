
import React from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Toggle } from "@/components/ui/toggle";

const Settings = () => {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Settings</h1>
          <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-lg border border-muted">
            <Toggle
              pressed={theme === "light"}
              onPressedChange={() => handleThemeChange("light")}
              aria-label="Light mode"
              className="data-[state=on]:bg-white data-[state=on]:text-dark"
            >
              <Sun className="h-4 w-4" />
            </Toggle>
            <Toggle
              pressed={theme === "dark"}
              onPressedChange={() => handleThemeChange("dark")}
              aria-label="Dark mode"
              className="data-[state=on]:bg-slate-900 data-[state=on]:text-white"
            >
              <Moon className="h-4 w-4" />
            </Toggle>
            <Toggle
              pressed={theme === "system"}
              onPressedChange={() => handleThemeChange("system")}
              aria-label="System preference"
              className="data-[state=on]:bg-muted data-[state=on]:text-foreground"
            >
              <Monitor className="h-4 w-4" />
            </Toggle>
          </div>
        </div>
        
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
                <div className="space-y-6">
                  <div>
                    <Label className="text-base mb-3 block">Theme</Label>
                    <div className="grid gap-6">
                      <div className="flex items-center justify-between p-4 rounded-lg border-2 border-primary/20 bg-background/50 transition-all">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 rounded-full bg-primary/10">
                            <Sun className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-base font-medium">Light Mode</h3>
                            <p className="text-sm text-muted-foreground">Bright and clear interface</p>
                          </div>
                        </div>
                        <Switch 
                          checked={theme === "light"}
                          onCheckedChange={() => handleThemeChange("light")}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 rounded-lg border-2 border-primary/20 bg-background/50 transition-all">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 rounded-full bg-primary/10">
                            <Moon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-base font-medium">Dark Mode</h3>
                            <p className="text-sm text-muted-foreground">Easy on the eyes in low light</p>
                          </div>
                        </div>
                        <Switch 
                          checked={theme === "dark"}
                          onCheckedChange={() => handleThemeChange("dark")}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 rounded-lg border-2 border-primary/20 bg-background/50 transition-all">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 rounded-full bg-primary/10">
                            <Monitor className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-base font-medium">System Preference</h3>
                            <p className="text-sm text-muted-foreground">Follow your system settings</p>
                          </div>
                        </div>
                        <Switch 
                          checked={theme === "system"}
                          onCheckedChange={() => handleThemeChange("system")}
                        />
                      </div>
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
