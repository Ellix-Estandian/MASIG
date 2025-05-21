import React, { useState, useEffect } from "react";
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
  Search,
  Eye,
  Download
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import ActivityLogDownloadDialog from "./ActivityLogDownloadDialog";

export interface ActivityLog {
  id: string;
  user_id: string;
  user_email: string;
  action_type: string;
  product_code: string | null;
  product_name: string | null;
  details: any | null;
  created_at: string;
}

const ActivityLogTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch activity logs from the database
  useEffect(() => {
    const fetchActivityLogs = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("activity_logs")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setActivityLogs(data || []);
      } catch (error: any) {
        console.error("Error fetching activity logs:", error);
        toast({
          variant: "destructive",
          title: "Error loading activity logs",
          description: error.message || "Failed to load activity logs",
        });
        setActivityLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivityLogs();

    // Set up realtime subscription for new logs
    const channel = supabase
      .channel("activity_logs_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "activity_logs",
        },
        (payload) => {
          setActivityLogs((prev) => [payload.new as ActivityLog, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  // Filter activity logs based on search term
  const filteredActivityLogs = activityLogs.filter((activity) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      activity.user_email.toLowerCase().includes(searchLower) ||
      (activity.product_name?.toLowerCase().includes(searchLower) || false) ||
      (activity.product_code?.toLowerCase().includes(searchLower) || false) ||
      activity.action_type.toLowerCase().includes(searchLower)
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
      case "viewed":
        return <Eye className="h-4 w-4 text-amber-500" />;
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
      case "viewed":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200">
            Viewed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-500/10 text-gray-600 border-gray-200">
            {action}
          </Badge>
        );
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

  const getInitials = (email: string) => {
    // Extract first letter of each word in email before @
    const name = email.split('@')[0];
    return name.split('.').map(part => part[0]?.toUpperCase() || '').join('');
  };

  return (
    <Card className="bg-background/60 backdrop-blur-sm border border-muted overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search activity logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4"
            />
          </div>
          <Button 
            variant="outline" 
            className="ml-2 flex items-center"
            onClick={() => setDownloadDialogOpen(true)}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
        
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : filteredActivityLogs.length === 0 ? (
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
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivityLogs.map((activity) => (
                  <TableRow key={activity.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="" alt={activity.user_email} />
                          <AvatarFallback className="text-xs">{getInitials(activity.user_email)}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{activity.user_email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(activity.action_type)}
                        {getActionBadge(activity.action_type)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {activity.product_name || activity.product_code ? (
                        <div className="flex flex-col">
                          <span className="font-medium">{activity.product_name || "Unknown Product"}</span>
                          <span className="text-xs text-muted-foreground">{activity.product_code || ""}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span className="text-sm">{formatDate(activity.created_at)}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      
      <ActivityLogDownloadDialog 
        open={downloadDialogOpen}
        onOpenChange={setDownloadDialogOpen}
        activityLogs={filteredActivityLogs}
      />
    </Card>
  );
};

export default ActivityLogTab;
