import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ActivityLog } from "./ActivityLogTab"; // Adjust the path if needed

interface ActivityLogDownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activityLogs: ActivityLog[];
}

const ActivityLogDownloadDialog: React.FC<ActivityLogDownloadDialogProps> = ({
  open,
  onOpenChange,
  activityLogs,
}) => {
  const handleDownload = () => {
    const doc = new jsPDF();

    autoTable(doc, {
      head: [["User", "Action", "Product", "Time"]],
      body: activityLogs.map((log) => [
        log.user_email,
        log.action_type,
        log.product_name || log.product_code || "N/A",
        new Date(log.created_at).toLocaleString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false, // ✅ force 24-hour format
        }),
      ]),
    });

    doc.save("activity_logs.pdf");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Download Activity Logs</DialogTitle>
        </DialogHeader>
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleDownload}>Download PDF</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityLogDownloadDialog;