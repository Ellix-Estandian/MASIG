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
import { CalendarIcon, Check, Clock } from "lucide-react";
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
  const [startTime, setStartTime] = useState<string>("any-time");
  const [endTime, setEndTime] = useState<string>("any-time");
  const [actionType, setActionType] = useState<string>("all");
  const [reportTitle, setReportTitle] = useState("Activity Log Report");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Generate a list of time options every 30 minutes
  const getTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute of [0, 30]) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        const time = `${formattedHour}:${formattedMinute}`;
        options.push({ value: time, label: time });
      }
    }
    return options;
  };

  const timeOptions = getTimeOptions();

  const handleDownload = async () => {
    setLoading(true);
    try {
      console.log("Starting download with filters:", { 
        startDate, endDate, startTime, endTime, actionType 
      });
      
      // Filter logs by date, time and action type
      let filteredLogs = [...activityLogs];
      
      filteredLogs = filterActivityLogsByDate(
        filteredLogs, 
        startDate, 
        endDate, 
        startTime, 
        endTime
      );
      
      // Only filter by action if it's not "all"
      if (actionType && actionType !== "all") {
        filteredLogs = filterActivityLogsByAction(filteredLogs, actionType);
      }
      
      console.log("Filtered logs count:", filteredLogs.length);
      
      if (filteredLogs.length === 0) {
        toast({
          title: "No data to export",
          description: "There are no activity logs matching your filter criteria.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      // Generate file name with timestamp
      const dateTimeStr = format(new Date(), "yyyy-MM-dd_HH-mm-ss");
      let fileName = `activity-logs-${dateTimeStr}.pdf`;
      
      if (actionType && actionType !== "all") {
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
    } catch (error: any) {
      console.error("PDF download failed:", error);
      toast({
        title: "Download Failed",
        description: error.message || "An error occurred while generating the PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
            <div className="text-sm font-medium col-span-4">Filter by time range:</div>
            
            <div className="col-span-2">
              <Select
                value={startTime}
                onValueChange={setStartTime}
              >
                <SelectTrigger className="w-full">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Start time" />
                  </div>
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="any-time">Any time</SelectItem>
                  {timeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="col-span-2">
              <Select
                value={endTime}
                onValueChange={setEndTime}
              >
                <SelectTrigger className="w-full">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="End time" />
                  </div>
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="any-time">Any time</SelectItem>
                  {timeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  <SelectItem value="all">All Actions</SelectItem>
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleDownload} disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                Generating...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" /> Download PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityLogDownloadDialog;
