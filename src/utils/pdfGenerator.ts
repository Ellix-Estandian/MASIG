
import jsPDF from "jspdf";
import "jspdf-autotable";
import { ActivityLog } from "@/components/dashboard/ActivityLogTab";

// Add the jspdf-autotable types to the jsPDF instance
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const generateActivityLogPDF = (
  activityLogs: ActivityLog[],
  title: string = "Activity Log Report"
): jsPDF => {
  // Create new document
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  // Add timestamp
  doc.setFontSize(11);
  doc.setTextColor(100);
  const dateStr = new Date().toLocaleString();
  doc.text(`Generated on: ${dateStr}`, 14, 30);
  
  // Company name
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text("MASIG", 14, 40);
  
  // Format data for the table
  const tableData = activityLogs.map(log => [
    new Date(log.created_at).toLocaleString(),
    log.user_email,
    log.action_type.charAt(0).toUpperCase() + log.action_type.slice(1),
    log.product_code || "N/A",
    log.product_name || "N/A"
  ]);
  
  // Create table
  doc.autoTable({
    startY: 50,
    head: [["Timestamp", "User", "Action", "Product Code", "Product Name"]],
    body: tableData,
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [240, 240, 240] },
    margin: { top: 50 }
  });
  
  return doc;
};

export const downloadActivityLogPDF = (
  activityLogs: ActivityLog[],
  fileName: string = "activity-logs.pdf",
  title: string = "Activity Log Report"
): void => {
  const doc = generateActivityLogPDF(activityLogs, title);
  doc.save(fileName);
};

export const filterActivityLogsByDate = (
  logs: ActivityLog[],
  startDate?: Date,
  endDate?: Date
): ActivityLog[] => {
  if (!startDate && !endDate) return logs;
  
  return logs.filter(log => {
    const logDate = new Date(log.created_at);
    
    if (startDate && endDate) {
      return logDate >= startDate && logDate <= endDate;
    }
    
    if (startDate) {
      return logDate >= startDate;
    }
    
    if (endDate) {
      return logDate <= endDate;
    }
    
    return true;
  });
};

export const filterActivityLogsByAction = (
  logs: ActivityLog[],
  actionType?: string
): ActivityLog[] => {
  if (!actionType) return logs;
  return logs.filter(log => log.action_type === actionType);
};
