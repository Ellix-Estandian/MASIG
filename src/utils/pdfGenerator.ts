
import { jsPDF } from "jspdf";
// Fix the import for jspdf-autotable - we need to import it this way to ensure it's properly loaded
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
  console.log("Generating PDF for", activityLogs.length, "logs");
  if (activityLogs.length === 0) {
    throw new Error("No data available to generate PDF");
  }
  
  // Create new document
  const doc = new jsPDF();
  
  // Make sure jspdf-autotable is properly loaded
  if (typeof doc.autoTable !== 'function') {
    console.error("jspdf-autotable is not properly loaded");
    throw new Error("PDF generation failed: Required library not loaded correctly");
  }
  
  // Add company name centered at the top
  doc.setFontSize(24);
  doc.text("MASIG", doc.internal.pageSize.width / 2, 30, { align: "center" });
  
  // Add Date and Time labels
  doc.setFontSize(12);
  doc.text("Date:", 40, 50);
  doc.text("Time:", 40, 60);
  doc.text("Product:", 40, 70);
  
  // Add current date and time
  const currentDate = new Date();
  doc.text(currentDate.toLocaleDateString(), 80, 50);
  doc.text(currentDate.toLocaleTimeString(), 80, 60);
  
  // If filtering by a specific product, show it
  if (activityLogs.length > 0 && activityLogs[0].product_name) {
    doc.text(activityLogs[0].product_name, 80, 70);
  } else {
    doc.text("All Products", 80, 70);
  }
  
  // Format data for the table - simplified to match the image format
  const tableData = activityLogs.map(log => [
    log.user_email,
    new Date(log.created_at).toLocaleString(),
    log.action_type.charAt(0).toUpperCase() + log.action_type.slice(1)
  ]);
  
  try {
    // Create table with just the three columns from image: Name, Time, Action
    doc.autoTable({
      startY: 90,
      head: [["Name", "Time", "Action"]],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [255, 255, 255], textColor: 0, lineWidth: 0.5, lineColor: [0, 0, 0] },
      bodyStyles: { lineColor: [0, 0, 0], lineWidth: 0.5 },
      tableLineColor: [0, 0, 0],
      tableLineWidth: 0.5,
      styles: { overflow: 'linebreak', cellPadding: 5 },
    });
  } catch (error) {
    console.error("Error creating table:", error);
    throw new Error("Failed to create PDF table. Technical details: " + error.message);
  }
  
  // Add "Put the date here when it was printed" at bottom
  const pageHeight = doc.internal.pageSize.height;
  doc.setTextColor(255, 0, 0);  // Red text
  doc.text("Put the date here when it was printed", doc.internal.pageSize.width / 2, pageHeight - 20, { align: "center" });
  doc.setTextColor(0);  // Reset text color
  
  console.log("PDF generated successfully");
  return doc;
};

export const downloadActivityLogPDF = (
  activityLogs: ActivityLog[],
  fileName: string = "activity-logs.pdf",
  title: string = "Activity Log Report"
): void => {
  try {
    console.log("Starting PDF download with", activityLogs.length, "logs");
    if (activityLogs.length === 0) {
      throw new Error("No activity logs to export");
    }
    
    const doc = generateActivityLogPDF(activityLogs, title);
    doc.save(fileName);
    console.log("PDF downloaded successfully as", fileName);
  } catch (error) {
    console.error("PDF download error:", error);
    throw error; // Propagate the error so we can handle it in the UI
  }
};

export const filterActivityLogsByDate = (
  logs: ActivityLog[],
  startDate?: Date,
  endDate?: Date,
  startTime?: string,
  endTime?: string
): ActivityLog[] => {
  if (!startDate && !endDate && (!startTime || startTime === "any-time") && (!endTime || endTime === "any-time")) {
    return logs;
  }
  
  return logs.filter(log => {
    const logDate = new Date(log.created_at);
    
    // Handle date filtering
    if (startDate) {
      const startDateTime = new Date(startDate);
      if (startTime && startTime !== "any-time") {
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        startDateTime.setHours(startHours, startMinutes, 0, 0);
      } else {
        startDateTime.setHours(0, 0, 0, 0);
      }
      
      if (logDate < startDateTime) return false;
    } else if (startTime && startTime !== "any-time") {
      // If only start time is provided without a date, check against current day
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const logHours = logDate.getHours();
      const logMinutes = logDate.getMinutes();
      
      if (logHours < startHours || (logHours === startHours && logMinutes < startMinutes)) {
        return false;
      }
    }
    
    if (endDate) {
      const endDateTime = new Date(endDate);
      if (endTime && endTime !== "any-time") {
        const [endHours, endMinutes] = endTime.split(':').map(Number);
        endDateTime.setHours(endHours, endMinutes, 59, 999);
      } else {
        endDateTime.setHours(23, 59, 59, 999);
      }
      
      if (logDate > endDateTime) return false;
    } else if (endTime && endTime !== "any-time") {
      // If only end time is provided without a date, check against current day
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      const logHours = logDate.getHours();
      const logMinutes = logDate.getMinutes();
      
      if (logHours > endHours || (logHours === endHours && logMinutes > endMinutes)) {
        return false;
      }
    }
    
    return true;
  });
};

export const filterActivityLogsByAction = (
  logs: ActivityLog[],
  actionType?: string
): ActivityLog[] => {
  if (!actionType || actionType === "all") return logs;
  return logs.filter(log => log.action_type === actionType);
};
