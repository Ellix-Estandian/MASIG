
import { supabase } from "@/integrations/supabase/client";

// Execute the function creation SQL directly
export const setupFunctions = async () => {
  const { error: error1 } = await supabase.rpc('exec_sql', { 
    sql: `
    CREATE OR REPLACE FUNCTION public.get_user_roles(user_id_param uuid)
    RETURNS TABLE(id uuid, user_id uuid, role text, created_at timestamptz) 
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path = public
    AS $$
    BEGIN
      RETURN QUERY
      SELECT ur.id, ur.user_id, ur.role::text, ur.created_at
      FROM public.user_roles ur
      WHERE ur.user_id = user_id_param;
    END;
    $$;
    `
  });
  
  const { error: error2 } = await supabase.rpc('exec_sql', {
    sql: `
    CREATE OR REPLACE FUNCTION public.get_user_permissions(user_id_param uuid)
    RETURNS TABLE(id uuid, user_id uuid, permission text, created_at timestamptz) 
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path = public
    AS $$
    BEGIN
      RETURN QUERY
      SELECT up.id, up.user_id, up.permission, up.created_at
      FROM public.user_permissions up
      WHERE up.user_id = user_id_param;
    END;
    $$;
    `
  });
  
  if (error1 || error2) {
    console.error("Error setting up functions:", error1 || error2);
    return false;
  }
  
  return true;
};
