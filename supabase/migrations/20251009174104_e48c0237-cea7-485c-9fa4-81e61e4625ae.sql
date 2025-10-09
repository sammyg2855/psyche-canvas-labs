-- Allow users to insert their own roles for monitoring purposes
CREATE POLICY "Users can insert their own monitoring roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND role IN ('parent', 'guardian', 'police')
);

-- Allow users to view and manage their own non-admin roles
CREATE POLICY "Users can delete their own monitoring roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id 
  AND role IN ('parent', 'guardian', 'police')
);