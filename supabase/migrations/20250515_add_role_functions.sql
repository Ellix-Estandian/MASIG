
-- Create functions to get user roles and permissions
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
