
import React from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import ActivityLogTab from "@/components/dashboard/ActivityLogTab";
import ReportsTab from "@/components/dashboard/ReportsTab";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Reports = () => {
  const { isAdmin } = useUserRoles();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        
        {isAdmin ? (
          <Tabs defaultValue="employee-activity" className="w-full">
            <TabsList className="mb-4 bg-muted/60 p-1 border rounded-lg">
              <TabsTrigger value="employee-activity" className="data-[state=active]:bg-background">
                Employee Activity
              </TabsTrigger>
              <TabsTrigger value="price-reports" className="data-[state=active]:bg-background">
                Price Reports
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="employee-activity">
              <Card className="border-2 border-primary/10 bg-card/50 backdrop-blur-sm">
                <CardHeader className="bg-primary/5">
                  <CardTitle>Employee Activity Log</CardTitle>
                  <CardDescription>
                    View recent product modifications by employees
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ActivityLogTab />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="price-reports">
              <ReportsTab />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">You don't have permission to view reports.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Reports;
