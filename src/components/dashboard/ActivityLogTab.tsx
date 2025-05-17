
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useUserRoles } from "@/hooks/useUserRoles";

interface ActivityLog {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  action_type: string;
  action_details: string;
  created_at: string;
}

const ActivityLogTab: React.FC = () => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const { isAdmin } = useUserRoles();

  // For demo purposes, let's create some mock activities
  const mockActivities: ActivityLog[] = [
    {
      id: "1",
      user_id: "user1",
      user_email: "employee1@example.com",
      user_name: "John Smith",
      action_type: "product_update",
      action_details: "Updated product PROD-001 price from $25.99 to $29.99",
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
    },
    {
      id: "2",
      user_id: "user2",
      user_email: "employee2@example.com",
      user_name: "Jane Doe",
      action_type: "product_create",
      action_details: "Added new product PROD-023 'Wireless Headphones'",
      created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString() // 2 hours ago
    },
    {
      id: "3",
      user_id: "user3",
      user_email: "manager@example.com",
      user_name: "Robert Johnson",
      action_type: "report_access",
      action_details: "Generated Q2 sales report",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() // 3 hours ago
    },
    {
      id: "4",
      user_id: "user2",
      user_email: "employee2@example.com",
      user_name: "Jane Doe",
      action_type: "product_delete",
      action_details: "Removed product PROD-015 'Discontinued Item'",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() // 5 hours ago
    },
    {
      id: "5",
      user_id: "user1",
      user_email: "employee1@example.com",
      user_name: "John Smith",
      action_type: "user_login",
      action_details: "User logged in from IP 192.168.1.105",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString() // 8 hours ago
    },
    {
      id: "6",
      user_id: "user4",
      user_email: "alice@example.com",
      user_name: "Alice Wilson",
      action_type: "product_update",
      action_details: "Updated inventory for PROD-034, added 25 units",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
    },
    {
      id: "7",
      user_id: "user5",
      user_email: "bob@example.com",
      user_name: "Bob Anderson",
      action_type: "user_login",
      action_details: "User logged in from IP 192.168.1.220",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString() // 25 hours ago
    }
  ];

  useEffect(() => {
    // In a real app, we would fetch from the database
    // For now we use mock data
    setActivities(mockActivities);
    setLoading(false);
  }, []);

  if (!isAdmin) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        You don't have permission to view employee activities.
      </div>
    );
  }

  const filteredActivities = activities.filter(activity => 
    activity.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.action_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.action_details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Employee Activity Log</h2>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search activities..."
            className="pl-8 border-2 focus-visible:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Card className="overflow-hidden border-2 border-primary/10 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-0">
            <Table>
              <TableCaption>Recent activities by employees</TableCaption>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-medium">Employee</TableHead>
                  <TableHead className="font-medium">Action Type</TableHead>
                  <TableHead className="font-medium">Details</TableHead>
                  <TableHead className="font-medium text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      No activities found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredActivities.map((activity) => (
                    <TableRow key={activity.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <div>
                          <p className="font-medium">{activity.user_name}</p>
                          <p className="text-sm text-muted-foreground">{activity.user_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionTypeStyle(activity.action_type)}`}>
                          {formatActionType(activity.action_type)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{activity.action_details}</p>
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {formatDate(activity.created_at)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Helper function to format action type
const formatActionType = (actionType: string): string => {
  return actionType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper function to get styles based on action type
const getActionTypeStyle = (actionType: string): string => {
  switch (actionType) {
    case 'product_create':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'product_update':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'product_delete':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'user_login':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'report_access':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  }
};

export default ActivityLogTab;
