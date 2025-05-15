
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type Role = 'admin' | 'employee';

export interface UserPermission {
  id: string;
  user_id: string;
  permission: string;
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: Role;
  created_at: string;
}

export const useUserRoles = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!user) {
        setRoles([]);
        setPermissions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch user roles using rpc to avoid TypeScript errors with the table name
        const { data: rolesData, error: rolesError } = await supabase
          .rpc('get_user_roles', { user_id_param: user.id });

        if (rolesError) throw rolesError;

        // Fetch user permissions using rpc to avoid TypeScript errors with the table name
        const { data: permissionsData, error: permissionsError } = await supabase
          .rpc('get_user_permissions', { user_id_param: user.id });

        if (permissionsError) throw permissionsError;

        setRoles(rolesData?.map(r => r.role as Role) || []);
        setPermissions(permissionsData?.map(p => p.permission) || []);
      } catch (error) {
        console.error('Error fetching user roles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoles();
  }, [user]);

  const isAdmin = roles.includes('admin');
  
  const hasPermission = (permission: string): boolean => {
    return isAdmin || permissions.includes(permission);
  };

  const hasRole = (role: Role): boolean => {
    return roles.includes(role);
  };

  return {
    roles,
    permissions,
    isAdmin,
    hasRole,
    hasPermission,
    loading
  };
};
