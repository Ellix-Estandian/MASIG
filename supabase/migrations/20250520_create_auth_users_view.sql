
-- Create a view that safely exposes user information for the admin interface
CREATE OR REPLACE VIEW public.auth_users_view AS
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data as user_metadata
FROM 
  auth.users au;

-- Allow authenticated users to select from this view
CREATE POLICY "Allow authenticated users to view user information" 
ON public.auth_users_view
FOR SELECT
TO authenticated
USING (true);
