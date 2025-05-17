
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
import { Search, CalendarClock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useUserRoles } from "@/hooks/useUserRoles";

interface UpcomingActivity {
  id: string;
  employee_id: string;
  employee_name: string;
  email: string;
  task_type: string;
  description: string;
  scheduled_date: string;
  status: string;
}

const ActivityLogTab: React.FC = () => {
  const [activities, setActivities] = useState<UpcomingActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const { isAdmin } = useUserRoles();

  // For demo purposes, let's create some mock upcoming activities
  const mockUpcomingActivities: UpcomingActivity[] = [
    {
      id: "1",
      employee_id: "user1",
      employee_name: "John Smith",
      email: "employee1@example.com",
      task_type: "inventory_check",
      description: "Complete quarterly inventory audit for warehouse B",
      scheduled_date: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // Tomorrow
      status: "scheduled"
    },
    {
      id: "2",
      employee_id: "user2",
      employee_name: "Jane Doe",
      email: "employee2@example.com",
      task_type: "product_update",
      description: "Update product specifications for summer collection",
      scheduled_date: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(), // 2 days from now
      status: "pending"
    },
    {
      id: "3",
      employee_id: "user3",
      employee_name: "Robert Johnson",
      email: "manager@example.com",
      task_type: "client_meeting",
      description: "Meet with XYZ Corp about their product requirements",
      scheduled_date: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(), // 3 days from now
      status: "confirmed"
    },
    {
      id: "4",
      employee_id: "user2",
      employee_name: "Jane Doe",
      email: "employee2@example.com",
      task_type: "training",
      description: "Attend new inventory system training",
      scheduled_date: new Date(Date.now() + 1000 * 60 * 60 * 96).toISOString(), // 4 days from now
      status: "scheduled"
    },
    {
      id: "5",
      employee_id: "user4",
      employee_name: "Alice Wilson",
      email: "alice@example.com",
      task_type: "product_launch",
      description: "Prepare marketing materials for new product line",
      scheduled_date: new Date(Date.now() + 1000 * 60 * 60 * 120).toISOString(), // 5 days from now
      status: "in_preparation"
    },
    {
      id: "6",
      employee_id: "user5",
      employee_name: "Bob Anderson",
      email: "bob@example.com",
      task_type: "supplier_negotiation",
      description: "Negotiate new terms with suppliers for Q3",
      scheduled_date: new Date(Date.now() + 1000 * 60 * 60 * 144).toISOString(), // 6 days from now
      status: "pending"
    }
  ];

  useEffect(() => {
    // In a real app, we would fetch upcoming activities from the database
    // For now we use mock data
    setActivities(mockUpcomingActivities);
    setLoading(false);
  }, []);

  if (!isAdmin) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        You don't have permission to view employee schedules.
      </div>
    );
  }

  const filteredActivities = activities.filter(activity => 
    activity.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.task_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };

  const getStatusStyle = (status: string): string => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'in_preparation':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Upcoming Employee Tasks</h2>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search tasks..."
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
              <TableCaption>Upcoming tasks scheduled for employees</TableCaption>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-medium">Employee</TableHead>
                  <TableHead className="font-medium">Task Type</TableHead>
                  <TableHead className="font-medium">Description</TableHead>
                  <TableHead className="font-medium text-right">Scheduled</TableHead>
                  <TableHead className="font-medium text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No upcoming tasks found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredActivities.map((activity) => (
                    <TableRow key={activity.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <div>
                          <p className="font-medium">{activity.employee_name}</p>
                          <p className="text-sm text-muted-foreground">{activity.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTaskTypeStyle(activity.task_type)}`}>
                          {formatTaskType(activity.task_type)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{activity.description}</p>
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        <div className="flex items-center justify-end gap-1">
                          <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
                          {formatDate(activity.scheduled_date)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(activity.status)}`}>
                          {formatStatus(activity.status)}
                        </span>
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

// Helper function to format task type
const formatTaskType = (taskType: string): string => {
  return taskType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper function to format status
const formatStatus = (status: string): string => {
  switch (status) {
    case 'scheduled':
      return 'Scheduled';
    case 'confirmed':
      return 'Confirmed';
    case 'pending':
      return 'Pending';
    case 'in_preparation':
      return 'In Preparation';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  }
};

// Helper function to get styles based on task type
const getTaskTypeStyle = (taskType: string): string => {
  switch (taskType) {
    case 'inventory_check':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'product_update':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'client_meeting':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
    case 'training':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'product_launch':
      return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
    case 'supplier_negotiation':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  }
};

export default ActivityLogTab;
