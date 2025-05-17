
-- Create a function to fetch user profile data
CREATE OR REPLACE FUNCTION public.get_user_profile(user_id_param uuid)
RETURNS TABLE (
  user_id uuid,
  email text,
  first_name text,
  last_name text
) 
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id as user_id,
    au.email,
    (au.raw_user_meta_data->>'firstName')::text as first_name,
    (au.raw_user_meta_data->>'lastName')::text as last_name
  FROM auth.users au
  WHERE au.id = user_id_param;
END;
$$;
