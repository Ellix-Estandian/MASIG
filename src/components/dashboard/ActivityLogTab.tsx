
import React, { useState } from "react";
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
  AlertCircle,
  Search
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";

// Mock data for demonstration purposes - in a real app, this would come from the database
const activityData = [
  {
    id: "1",
    employeeName: "John Smith",
    employeeInitials: "JS",
    employeeAvatar: "",
    action: "added",
    productName: "Office Chair Model X",
    productCode: "CHAIR-001",
    timestamp: "2024-05-18T10:30:00Z"
  },
  {
    id: "2",
    employeeName: "Jane Doe",
    employeeInitials: "JD",
    employeeAvatar: "",
    action: "edited",
    productName: "Desk Lamp Premium",
    productCode: "LAMP-243",
    timestamp: "2024-05-17T14:25:00Z"
  },
  {
    id: "3",
    employeeName: "Admin User",
    employeeInitials: "AU",
    employeeAvatar: "",
    action: "deleted",
    productName: "Discontinued Keyboard",
    productCode: "KB-112",
    timestamp: "2024-05-16T09:15:00Z"
  },
  {
    id: "4",
    employeeName: "Mike Johnson",
    employeeInitials: "MJ",
    employeeAvatar: "",
    action: "edited",
    productName: "Ergonomic Mouse",
    productCode: "MOUSE-87",
    timestamp: "2024-05-15T16:40:00Z"
  },
  {
    id: "5",
    employeeName: "Admin User",
    employeeInitials: "AU",
    employeeAvatar: "",
    action: "added",
    productName: "Standing Desk Converter",
    productCode: "DESK-321",
    timestamp: "2024-05-14T11:20:00Z"
  }
];

const ActivityLogTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter activity data based on search term
  const filteredActivityData = activityData.filter((activity) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      activity.employeeName.toLowerCase().includes(searchLower) ||
      activity.productName.toLowerCase().includes(searchLower) ||
      activity.productCode.toLowerCase().includes(searchLower) ||
      activity.action.toLowerCase().includes(searchLower)
    );
  });

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
      <div className="p-4">
        <div className="relative w-full max-w-md mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search activity logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4"
          />
        </div>
        
        {filteredActivityData.length === 0 ? (
          <Alert className="bg-muted/50 border border-muted">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No matching activity logs found</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              {searchTerm 
                ? "Try adjusting your search criteria." 
                : "Activity logs will be generated automatically when users perform actions like adding, editing, or deleting products."}
            </AlertDescription>
          </Alert>
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
                {filteredActivityData.map((activity) => (
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
      </div>
    </Card>
  );
};

export default ActivityLogTab;
