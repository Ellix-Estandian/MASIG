
import React from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import ReportsTab from "@/components/dashboard/ReportsTab";
import ActivityLogTab from "@/components/dashboard/ActivityLogTab";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Reports = () => {
  const { isAdmin } = useUserRoles();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        
        <Tabs defaultValue="product-reports" className="w-full">
          <TabsList className="mb-4 bg-muted/60 p-1">
            <TabsTrigger value="product-reports" className="data-[state=active]:bg-background">
              Product Reports
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="activity-log" className="data-[state=active]:bg-background">
                Employee Activity
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="product-reports">
            <Card className="border-2 border-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader className="bg-primary/5">
                <CardTitle>Product Reports</CardTitle>
                <CardDescription>
                  View product performance reports and analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReportsTab />
              </CardContent>
            </Card>
          </TabsContent>
          
          {isAdmin && (
            <TabsContent value="activity-log">
              <Card className="border-2 border-primary/10 bg-card/50 backdrop-blur-sm">
                <CardHeader className="bg-primary/5">
                  <CardTitle>Employee Activity Log</CardTitle>
                  <CardDescription>
                    Monitor recent actions performed by employees
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ActivityLogTab />
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
