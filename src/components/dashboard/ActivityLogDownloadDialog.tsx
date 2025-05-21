import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ActivityLog } from "./ActivityLogTab";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activityLogs: ActivityLog[];
}

const ActivityLogDownloadDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  activityLogs,
}) => {
  const { toast } = useToast();

  const handleDownload = () => {
    try {
      const doc = new jsPDF();

      // Define table headers and body
      const headers = [["User", "Action", "Product", "Code", "Time"]];
      const body = activityLogs.map((log) => [
        log.user_email,
        log.action_type,
        log.product_name || "N/A",
        log.product_code || "N/A",
        new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false, // ✅ Use 24-hour format
        }).format(new Date(log.created_at)),
      ]);

      // Add table to PDF
      autoTable(doc, {
        head: headers,
        body: body,
        styles: {
          fontSize: 10,
        },
      });

      doc.save("activity-logs.pdf");
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Download Failed",
        description:
          "Failed to generate PDF: " +
          (error.message || "Unknown error occurred."),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col gap-4 text-center">
          <h2 className="text-lg font-semibold">Download Activity Logs</h2>
          <p className="text-sm text-muted-foreground">
            This will export the filtered activity logs as a PDF file.
          </p>
          <Button onClick={handleDownload}>Download PDF</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityLogDownloadDialog;