
import React from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import ReportsTab from "@/components/dashboard/ReportsTab";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Reports = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        
        <Card>
          <CardHeader>
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
