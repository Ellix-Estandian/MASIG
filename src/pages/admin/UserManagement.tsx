
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Edit, Trash2, Shield, ShieldOff } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserRoles, UserRole, Role } from "@/hooks/useUserRoles";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: Role[];
  permissions: string[];
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
      const { data: usersData, error } = await supabase.auth.admin.listUsers();
      
      if (error) throw error;
      
      // Map Supabase users to our format
      const fetchedUsers: User[] = [];
      
      for (const userRecord of usersData.users) {
        // Get roles for each user
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userRecord.id);
        
        // Get permissions for each user
        const { data: permissions } = await supabase
          .from('user_permissions')
          .select('permission')
          .eq('user_id', userRecord.id);
        
        fetchedUsers.push({
          id: userRecord.id,
          email: userRecord.email || '',
          firstName: userRecord.user_metadata?.firstName,
          lastName: userRecord.user_metadata?.lastName,
          roles: roles?.map(r => r.role as Role) || [],
          permissions: permissions?.map(p => p.permission) || []
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
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) throw error;
      
      // Update local state
      setUsers(users.filter(user => user.id !== userId));
      
      toast({
        title: "User deleted",
        description: "User has been permanently deleted.",
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

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage user accounts and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search users..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <Table>
              <TableCaption>List of all users in the system</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">No users found</TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.roles.includes('admin') ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Employee
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.permissions.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {user.permissions.slice(0, 2).map((permission) => (
                              <span 
                                key={permission}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                              >
                                {permission.split(':')[1]}
                              </span>
                            ))}
                            {user.permissions.length > 2 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
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
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {!user.roles.includes('admin') ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePromoteToAdmin(user.id)}
                            >
                              <Shield className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDemoteFromAdmin(user.id)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Permissions</DialogTitle>
            <DialogDescription>
              {editingUser && (
                <>
                  Update permissions for {editingUser.firstName} {editingUser.lastName} ({editingUser.email})
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
                  <Button type="button" variant="outline">Cancel</Button>
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
