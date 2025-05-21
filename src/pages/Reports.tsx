
import React from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import ActivityLogTab from "@/components/dashboard/ActivityLogTab";
import ReportsTab from "@/components/dashboard/ReportsTab";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";

const Reports = () => {
  const { isAdmin } = useUserRoles();

  return (
    <DashboardLayout>
      <div className="flex flex-col min-h-[calc(100vh-4rem)]">
        <div className="flex-grow space-y-6 pb-8">
          <h1 className="text-2xl font-bold">Reports</h1>
          
          {isAdmin ? (
            <Tabs defaultValue="activity" className="space-y-6">
              <TabsList>
                <TabsTrigger value="activity">Activity Logs</TabsTrigger>
                <TabsTrigger value="price">Price Reports</TabsTrigger>
              </TabsList>
              
              <TabsContent value="activity" className="space-y-6">
                <Card className="border-2 border-primary/10 bg-card/50 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="bg-primary/5">
                    <CardTitle>User Actions Log</CardTitle>
                    <CardDescription>
                      Monitor product modifications made by users
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ActivityLogTab />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="price" className="space-y-6">
                <ReportsTab />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">You don't have permission to view reports.</p>
            </div>
          )}
        </div>
      </div>
      <Toaster />
    </DashboardLayout>
  );
};

export default Reports;
