
import React, { useState } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  downloadActivityLogPDF,
  filterActivityLogsByDate,
  filterActivityLogsByAction
} from "@/utils/pdfGenerator";
import { ActivityLog } from "./ActivityLogTab";
import { CalendarIcon, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

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
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [actionType, setActionType] = useState<string | undefined>(undefined);
  const [reportTitle, setReportTitle] = useState("Activity Log Report");
  const { toast } = useToast();

  const handleDownload = () => {
    try {
      // Filter logs by date and action type
      let filteredLogs = [...activityLogs];
      
      filteredLogs = filterActivityLogsByDate(filteredLogs, startDate, endDate);
      filteredLogs = filterActivityLogsByAction(filteredLogs, actionType);
      
      if (filteredLogs.length === 0) {
        toast({
          title: "No data to export",
          description: "There are no activity logs matching your filter criteria.",
          variant: "destructive",
        });
        return;
      }
      
      // Generate file name with timestamp
      const dateTimeStr = format(new Date(), "yyyy-MM-dd_HH-mm-ss");
      let fileName = `activity-logs-${dateTimeStr}.pdf`;
      
      if (actionType) {
        fileName = `${actionType}-logs-${dateTimeStr}.pdf`;
      }
      
      // Download PDF
      downloadActivityLogPDF(filteredLogs, fileName, reportTitle);
      
      // Show success toast
      toast({
        title: "PDF Downloaded",
        description: `The activity log has been downloaded as ${fileName}`,
      });
      
      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error("PDF download error:", error);
      toast({
        title: "Download Failed",
        description: "An error occurred while generating the PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Download Activity Log</DialogTitle>
          <DialogDescription>
            Configure the parameters for your activity log download
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-sm font-medium col-span-4">Filter by date range:</div>
            
            <div className="col-span-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="col-span-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "End date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-sm font-medium">Filter by action:</div>
            <div className="col-span-3">
              <Select
                value={actionType}
                onValueChange={setActionType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={undefined}>All Actions</SelectItem>
                  <SelectItem value="added">Added</SelectItem>
                  <SelectItem value="edited">Edited</SelectItem>
                  <SelectItem value="deleted">Deleted</SelectItem>
                  <SelectItem value="viewed">Viewed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleDownload}>
            <Check className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityLogDownloadDialog;
