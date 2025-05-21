// pdf/activityLogPdf.ts -----------------------------------------------------
import jsPDF from "jspdf";          // ✅ default import, no curly braces
import autoTable from "jspdf-autotable";
import { ActivityLog } from "@/components/dashboard/ActivityLogTab";

/**
 * Build the PDF and return the jsPDF instance
 */
export function generateActivityLogPDF(
  logs: ActivityLog[],
  title = "Activity Log Report"
): jsPDF {
  if (!logs || logs.length === 0) {
    throw new Error("No data available to generate PDF");
  }

  const doc = new jsPDF();

  /* ---------- header ---------- */
  doc.setFontSize(24);
  doc.text("MASIG", doc.internal.pageSize.width / 2, 30, { align: "center" });

  doc.setFontSize(12);
  const now = new Date();
  doc.text("Date:", 40, 50);
  doc.text(now.toLocaleDateString(), 80, 50);
  doc.text("Time:", 40, 60);
  doc.text(now.toLocaleTimeString(), 80, 60);
  doc.text("Product:", 40, 70);
  doc.text(logs[0]?.product_name ?? "All Products", 80, 70);

  /* ---------- table ---------- */
  const rows = logs.map((l) => [
    l.user_email,
    new Date(l.created_at).toLocaleString(),
    l.action_type[0].toUpperCase() + l.action_type.slice(1),
  ]);

  // <--  the critical line: call the *function*, pass `doc` first  ---------
  autoTable(doc, {
    startY: 90,
    head: [["Name", "Time", "Action"]],
    body: rows,
    theme: "grid",
    headStyles: { fillColor: [255, 255, 255], textColor: 0 },
    bodyStyles: { lineColor: [0, 0, 0], lineWidth: 0.5 },
    styles: { overflow: "linebreak", cellPadding: 5 },
  });

  /* ---------- footer ---------- */
  doc.setTextColor(255, 0, 0);
  doc.text(
    "Put the date here when it was printed",
    doc.internal.pageSize.width / 2,
    doc.internal.pageSize.height - 20,
    { align: "center" }
  );
  doc.setTextColor(0);

  return doc;
}

/**
 * Trigger the browser download
 */
export function downloadActivityLogPDF(
  logs: ActivityLog[],
  fileName = "activity-logs.pdf"
): void {
  // guard-rail
  if (!logs || logs.length === 0) {
    throw new Error("No activity logs to export");
  }

  // Make sure we’re in the browser, not during SSR
  if (typeof window === "undefined") return;

  const pdf = generateActivityLogPDF(logs);
  pdf.save(fileName);
}