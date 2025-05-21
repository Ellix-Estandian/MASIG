import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { ActivityLog } from "@/components/dashboard/ActivityLogTab";

export const generateActivityLogPDF = (
  activityLogs: ActivityLog[],
  title: string = "Activity Log Report"
): jsPDF => {
  console.log("Generating PDF for", activityLogs.length, "logs");

  if (!activityLogs || activityLogs.length === 0) {
    throw new Error("No data available to generate PDF");
  }

  const doc = new jsPDF();

  // Add Header
  doc.setFontSize(24);
  doc.text("MASIG", doc.internal.pageSize.width / 2, 30, { align: "center" });

  // Add Metadata
  const currentDate = new Date();
  doc.setFontSize(12);
  doc.text("Date:", 40, 50);
  doc.text(currentDate.toLocaleDateString(), 80, 50);
  doc.text("Time:", 40, 60);
  doc.text(currentDate.toLocaleTimeString(), 80, 60);
  doc.text("Product:", 40, 70);
  doc.text(activityLogs[0]?.product_name || "All Products", 80, 70);

  // Prepare Table
  const tableData = activityLogs.map(log => [
    log.user_email,
    new Date(log.created_at).toLocaleString(),
    log.action_type.charAt(0).toUpperCase() + log.action_type.slice(1),
  ]);

  try {
    console.log("Attempting to create table with", tableData.length, "rows");

    doc.autoTable({
      startY: 90,
      head: [["Name", "Time", "Action"]],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: 0,
        lineWidth: 0.5,
        lineColor: [0, 0, 0],
      },
      bodyStyles: {
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
      },
      styles: {
        overflow: 'linebreak',
        cellPadding: 5,
      },
    });

    console.log("Table created successfully");
  } catch (error) {
    console.error("Error creating table:", error);
    throw new Error("Failed to create PDF table. Technical details: " + (error as Error).message);
  }

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setTextColor(255, 0, 0);
  doc.text(
    "Put the date here when it was printed",
    doc.internal.pageSize.width / 2,
    pageHeight - 20,
    { align: "center" }
  );
  doc.setTextColor(0);

  return doc;
};

export const downloadActivityLogPDF = (
  activityLogs: ActivityLog[],
  fileName: string = "activity-logs.pdf",
  title: string = "Activity Log Report"
): void => {
  try {
    console.log("Starting PDF download with", activityLogs.length, "logs");

    if (!activityLogs || activityLogs.length === 0) {
      throw new Error("No activity logs to export");
    }

    const doc = generateActivityLogPDF(activityLogs, title);
    doc.save(fileName);
    console.log("PDF downloaded successfully as", fileName);
  } catch (error) {
    console.error("PDF download error:", error);
    throw error;
  }
};