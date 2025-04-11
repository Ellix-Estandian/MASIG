
import React from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import ReportsTab from "@/components/dashboard/ReportsTab";

const Reports = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <ReportsTab />
      </div>
    </DashboardLayout>
  );
};

export default Reports;
