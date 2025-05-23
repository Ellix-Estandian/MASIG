
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Edit, Trash2, Shield, ShieldOff, Mail, User } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUserRoles, UserRole, Role } from "@/hooks/useUserRoles";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast as sonnerToast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: Role[];
  permissions: string[];
}

// Interface representing the data structure returned from auth_users_view
interface AuthUserView {
  id: string;
  email: string;
  user_metadata: {
    firstName?: string;
    lastName?: string;
  } | null;
}

const permissionsList = [
  "view:products",
  "edit:products",
  "delete:products",
  "view:reports",
  "edit:reports",
];

const UserManagement = () => {
  const { toast } = useToast();
  const { isAdmin } = useUserRoles();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditingPermissions, setIsEditingPermissions] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Get all user IDs from the user_roles table
      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (userRolesError) {
        throw userRolesError;
      }
      
      if (!userRolesData || userRolesData.length === 0) {
        setUsers([]);
        setLoading(false);
        return;
      }
      
      // Create a map of user IDs to roles
      const userRoleMap = new Map<string, Role[]>();
      
      userRolesData.forEach(row => {
        if (!userRoleMap.has(row.user_id)) {
          userRoleMap.set(row.user_id, [row.role as Role]);
        } else {
          const roles = userRoleMap.get(row.user_id);
          if (roles) {
            roles.push(row.role as Role);
          }
        }
      });
      
      // Get permissions for each user
      const userPermissionMap = new Map<string, string[]>();
      
      for (const userId of userRoleMap.keys()) {
        const { data: permissionsData } = await supabase
          .from('user_permissions')
          .select('permission')
          .eq('user_id', userId);
        
        userPermissionMap.set(
          userId, 
          permissionsData?.map(p => p.permission) || []
        );
      }
      
      // Create user objects from the data
      const fetchedUsers: User[] = Array.from(userRoleMap.keys()).map(userId => {
        return {
          id: userId,
          email: `user-${userId.substring(0, 8)}`, // Default placeholder
          firstName: "",
          lastName: "",
          roles: userRoleMap.get(userId) || [],
          permissions: userPermissionMap.get(userId) || []
        };
      });
      
      try {
        // Fetch users from our newly created auth_users_view
        const { data: authUsersData, error: authUsersError } = await supabase
          .from('auth_users_view')
          .select('id, email, user_metadata');
        
        if (authUsersError) throw authUsersError;
        
        if (authUsersData && authUsersData.length > 0) {
          // Update user objects with email and name information
          fetchedUsers.forEach(user => {
            const authUserData = authUsersData.find(authUser => authUser.id === user.id) as AuthUserView | undefined;
            if (authUserData) {
              user.email = authUserData.email || user.email;
              
              // Safely access metadata properties with type checking
              if (authUserData.user_metadata && 
                  typeof authUserData.user_metadata === 'object' && 
                  authUserData.user_metadata !== null) {
                const metadata = authUserData.user_metadata as Record<string, unknown>;
                user.firstName = typeof metadata.firstName === 'string' ? metadata.firstName : '';
                user.lastName = typeof metadata.lastName === 'string' ? metadata.lastName : '';
              }
            }
          });
        }
      } catch (err) {
        console.error('Error fetching user profiles:', err);
        // Continue without profile data
        sonnerToast.error("Couldn't fetch user profile details", {
          description: "Using placeholder information instead"
        });
      }
      
      setUsers(fetchedUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        variant: "destructive",
        title: "Error fetching users",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteToAdmin = async (userId: string) => {
    try {
      // Check if role already exists
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .single();
      
      if (!existingRole) {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' });
        
        if (error) throw error;
        
        // Update local state
        setUsers(users.map(user => {
          if (user.id === userId) {
            return {
              ...user,
              roles: [...user.roles, 'admin']
            };
          }
          return user;
        }));
        
        toast({
          title: "User promoted to admin",
          description: "User has been given admin privileges.",
        });
      } else {
        toast({
          title: "User is already an admin",
          description: "No changes were made.",
        });
      }
    } catch (error: any) {
      console.error('Error promoting user:', error);
      toast({
        variant: "destructive",
        title: "Error promoting user",
        description: error.message,
      });
    }
  };

  const handleDemoteFromAdmin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'admin');
      
      if (error) throw error;
      
      // Update local state
      setUsers(users.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            roles: user.roles.filter(role => role !== 'admin')
          };
        }
        return user;
      }));
      
      toast({
        title: "User demoted from admin",
        description: "Admin privileges have been revoked.",
      });
    } catch (error: any) {
      console.error('Error demoting user:', error);
      toast({
        variant: "destructive",
        title: "Error demoting user",
        description: error.message,
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // First delete roles and permissions
      await supabase.from('user_roles').delete().eq('user_id', userId);
      await supabase.from('user_permissions').delete().eq('user_id', userId);
      
      // We can't delete from auth.users directly with client-side code
      // Instead, we'll remove them from our display
      setUsers(users.filter(user => user.id !== userId));
      
      toast({
        title: "User removed",
        description: "User has been removed from the system.",
      });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        variant: "destructive",
        title: "Error deleting user",
        description: error.message,
      });
    }
  };

  const handleEditPermissions = (user: User) => {
    setEditingUser(user);
    setIsEditingPermissions(true);
  };

  const updateUserSchema = z.object({
    permissions: z.array(z.string()),
  });

  const updateUserForm = useForm({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      permissions: editingUser?.permissions || [],
    },
  });

  // Reset form when editing user changes
  useEffect(() => {
    if (editingUser) {
      updateUserForm.reset({
        permissions: editingUser.permissions || [],
      });
    }
  }, [editingUser, updateUserForm]);

  const handleSubmitPermissions = updateUserForm.handleSubmit(async (data) => {
    if (!editingUser) return;
    
    try {
      // Delete existing permissions
      await supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', editingUser.id);
      
      // Add new permissions
      if (data.permissions.length > 0) {
        const permissionsToInsert = data.permissions.map(permission => ({
          user_id: editingUser.id,
          permission
        }));
        
        const { error } = await supabase
          .from('user_permissions')
          .insert(permissionsToInsert);
        
        if (error) throw error;
      }
      
      // Update local state
      setUsers(users.map(user => {
        if (user.id === editingUser.id) {
          return {
            ...user,
            permissions: data.permissions
          };
        }
        return user;
      }));
      
      toast({
        title: "Permissions updated",
        description: "User permissions have been updated successfully.",
      });
      
      setIsEditingPermissions(false);
    } catch (error: any) {
      console.error('Error updating permissions:', error);
      toast({
        variant: "destructive",
        title: "Error updating permissions",
        description: error.message,
      });
    }
  });

  // Helper function to get user initials for avatar
  const getUserInitials = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    } else if (user.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    } else if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  // Helper function to get avatar color based on user id
  const getAvatarColor = (userId: string) => {
    const colors = [
      "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", 
      "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-orange-500"
    ];
    
    // Simple hash function to pick a color based on user id
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">User Management</h1>
        </div>

        <Card className="overflow-hidden border-2 border-primary/10 bg-card/50 backdrop-blur-sm">
          <CardHeader className="bg-primary/5">
            <CardTitle className="text-xl font-semibold">Users</CardTitle>
            <CardDescription>Manage user accounts and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search users..."
                  className="pl-8 border-2 focus-visible:ring-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <Table>
              <TableCaption>List of all users in the system</TableCaption>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-medium">User</TableHead>
                  <TableHead className="font-medium">Email</TableHead>
                  <TableHead className="font-medium">Role</TableHead>
                  <TableHead className="font-medium">Permissions</TableHead>
                  <TableHead className="text-right font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">No users found</TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback className={getAvatarColor(user.id)}>
                              {getUserInitials(user)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {user.firstName || user.lastName ? 
                                `${user.firstName || ''} ${user.lastName || ''}`.trim() : 
                                'No name provided'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ID: {user.id.substring(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map(role => (
                            <span 
                              key={role} 
                              className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                role === 'admin' 
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              }`}
                            >
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.permissions.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {user.permissions.slice(0, 2).map((permission) => (
                              <span 
                                key={permission}
                                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                              >
                                {permission.split(':')[0]}: {permission.split(':')[1]}
                              </span>
                            ))}
                            {user.permissions.length > 2 && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                                +{user.permissions.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">None</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPermissions(user)}
                            className="border-2 hover:bg-primary/10"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {!user.roles.includes('admin') ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePromoteToAdmin(user.id)}
                              className="border-2 hover:bg-primary/10"
                            >
                              <Shield className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDemoteFromAdmin(user.id)}
                              className="border-2 hover:bg-primary/10"
                            >
                              <ShieldOff className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Edit Permissions Dialog */}
      <Dialog open={isEditingPermissions} onOpenChange={setIsEditingPermissions}>
        <DialogContent className="border-2 border-primary/20 bg-card/80 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>Edit User Permissions</DialogTitle>
            <DialogDescription>
              {editingUser && (
                <>
                  Update permissions for {editingUser.firstName || ""} {editingUser.lastName || ""} ({editingUser.email})
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...updateUserForm}>
            <form onSubmit={handleSubmitPermissions} className="space-y-6">
              <FormField
                control={updateUserForm.control}
                name="permissions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permissions</FormLabel>
                    <div className="space-y-2">
                      {permissionsList.map((permission) => (
                        <div key={permission} className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            id={permission}
                            className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                            value={permission}
                            checked={field.value.includes(permission)}
                            onChange={(e) => {
                              const updatedValue = e.target.checked
                                ? [...field.value, permission]
                                : field.value.filter(p => p !== permission);
                              field.onChange(updatedValue);
                            }}
                          />
                          <label htmlFor={permission} className="text-sm font-medium">
                            {permission.split(':')[0].charAt(0).toUpperCase() + permission.split(':')[0].slice(1)} {permission.split(':')[1]}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="border-2">Cancel</Button>
                </DialogClose>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default UserManagement;
