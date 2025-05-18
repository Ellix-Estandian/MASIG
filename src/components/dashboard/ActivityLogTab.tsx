
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { 
  PlusCircle, 
  Pencil, 
  Trash2, 
  Clock, 
  User, 
  Package 
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Mock data for the activity log
// In a real application, you would fetch this from your API
const activityData = [
  {
    id: 1,
    employeeName: "Alex Johnson",
    employeeAvatar: "/placeholder.svg",
    employeeInitials: "AJ",
    action: "added",
    productName: "Wireless Earbuds Pro",
    productCode: "WEP-001",
    timestamp: "2025-05-18T10:30:00Z",
  },
  {
    id: 2,
    employeeName: "Sarah Miller",
    employeeAvatar: "/placeholder.svg",
    employeeInitials: "SM",
    action: "edited",
    productName: "Ergonomic Office Chair",
    productCode: "EOC-112",
    timestamp: "2025-05-17T16:45:00Z",
  },
  {
    id: 3,
    employeeName: "Michael Chen",
    employeeAvatar: "/placeholder.svg",
    employeeInitials: "MC",
    action: "deleted",
    productName: "Bluetooth Speaker Mini",
    productCode: "BSM-025",
    timestamp: "2025-05-17T09:15:00Z",
  },
  {
    id: 4,
    employeeName: "Emily Taylor",
    employeeAvatar: "/placeholder.svg",
    employeeInitials: "ET",
    action: "edited",
    productName: "Ultra HD Monitor 27\"",
    productCode: "UHM-027",
    timestamp: "2025-05-16T14:20:00Z",
  },
  {
    id: 5,
    employeeName: "James Wilson",
    employeeAvatar: "/placeholder.svg",
    employeeInitials: "JW",
    action: "added",
    productName: "Mechanical Keyboard RGB",
    productCode: "MKR-089",
    timestamp: "2025-05-16T11:05:00Z",
  }
];

const ActivityLogTab: React.FC = () => {
  const getActionIcon = (action: string) => {
    switch (action) {
      case "added":
        return <PlusCircle className="h-4 w-4 text-green-500" />;
      case "edited":
        return <Pencil className="h-4 w-4 text-blue-500" />;
      case "deleted":
        return <Trash2 className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "added":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
            Added
          </Badge>
        );
      case "edited":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">
            Edited
          </Badge>
        );
      case "deleted":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200">
            Deleted
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Card className="bg-background/60 backdrop-blur-sm border border-muted overflow-hidden">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Employee</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activityData.map((activity) => (
              <TableRow key={activity.id} className="hover:bg-muted/40 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={activity.employeeAvatar} alt={activity.employeeName} />
                      <AvatarFallback className="text-xs">{activity.employeeInitials}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{activity.employeeName}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getActionIcon(activity.action)}
                    {getActionBadge(activity.action)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{activity.productName}</span>
                    <span className="text-xs text-muted-foreground">{activity.productCode}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span className="text-sm">{formatDate(activity.timestamp)}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default ActivityLogTab;
