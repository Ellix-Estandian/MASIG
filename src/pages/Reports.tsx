
import React from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
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
      </div>
    </DashboardLayout>
  );
};

export default Reports;
