
import React from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import ActivityLogTab from "@/components/dashboard/ActivityLogTab";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserRoles } from "@/hooks/useUserRoles";

const Reports = () => {
  const { isAdmin } = useUserRoles();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        
        {isAdmin ? (
          <Card className="border-2 border-primary/10 bg-card/50 backdrop-blur-sm">
            <CardHeader className="bg-primary/5">
              <CardTitle>Employee Task Schedule</CardTitle>
              <CardDescription>
                View upcoming tasks scheduled for employees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityLogTab />
            </CardContent>
          </Card>
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
