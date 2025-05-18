
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
  AlertCircle
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// In a real application, this would be fetched from the database
const activityData = [];

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
      {activityData.length === 0 ? (
        <div className="p-6">
          <Alert className="bg-muted/50 border border-muted">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No activity logs yet</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              Activity logs will be generated automatically when users perform actions like adding, editing, or deleting products.
            </AlertDescription>
          </Alert>
        </div>
      ) : (
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
              {activityData.map((activity: any) => (
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
      )}
    </Card>
  );
};

export default ActivityLogTab;
