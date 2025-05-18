
import React from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Sun, Moon, Monitor, ArrowRight } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const Settings = () => {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
        
        {/* Theme selector card - moved from header to settings */}
        <Card className="border-2 border-primary/10 bg-card/50 backdrop-blur-sm overflow-hidden">
          <CardHeader className="bg-primary/5">
            <CardTitle>Theme Preferences</CardTitle>
            <CardDescription>Choose your preferred visual theme</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <ToggleGroup type="single" value={theme} onValueChange={(value) => handleThemeChange(value as "light" | "dark" | "system")} className="flex justify-center p-1 bg-muted/30 rounded-lg border border-muted w-fit">
                <ToggleGroupItem value="light" aria-label="Light mode" className="data-[state=on]:bg-white data-[state=on]:text-black px-4 flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  <span>Light</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="dark" aria-label="Dark mode" className="data-[state=on]:bg-slate-900 data-[state=on]:text-white px-4 flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  <span>Dark</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="system" aria-label="System preference" className="data-[state=on]:bg-muted data-[state=on]:text-foreground px-4 flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  <span>System</span>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-4 bg-muted/60 p-1 border rounded-lg">
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
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 rounded-lg border-2 border-primary/20 bg-background/50">
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-muted-foreground">Full Name</h3>
                      <p className="text-lg font-medium">{user?.firstName} {user?.lastName}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="mt-2 md:mt-0">
                      <span>Edit</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 rounded-lg border-2 border-primary/20 bg-background/50">
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-muted-foreground">Email Address</h3>
                      <p className="text-lg font-medium">{user?.email}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="mt-2 md:mt-0">
                      <span>Edit</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/5 flex flex-col sm:flex-row items-center gap-2">
                <Button variant="outline" onClick={signOut} className="w-full sm:w-auto border-2">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
                <p className="text-xs text-muted-foreground text-center sm:ml-auto">
                  Last login: Today at 10:45 AM
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance">
            <Card className="border-2 border-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader className="bg-primary/5">
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize your interface preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 rounded-lg border-2 border-primary/20 bg-background/50 transition-all">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Sun className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-base font-medium">Animations</h3>
                          <p className="text-sm text-muted-foreground">Enable UI animations and transitions</p>
                        </div>
                      </div>
                      <Switch checked={true} />
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 rounded-lg border-2 border-primary/20 bg-background/50 transition-all">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Moon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-base font-medium">Reduced Motion</h3>
                          <p className="text-sm text-muted-foreground">Minimize non-essential animations</p>
                        </div>
                      </div>
                      <Switch checked={false} />
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
                <div className="flex items-center justify-center p-6 text-center">
                  <div className="max-w-md space-y-4">
                    <p className="text-muted-foreground">Application settings will be available in future updates.</p>
                    <Button variant="outline" className="border-dashed">
                      Request Feature
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
