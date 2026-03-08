
-- Allow users to view projects where their email matches client_email (read-only)
CREATE POLICY "Clients can view projects by email"
ON public.projects
FOR SELECT
TO authenticated
USING (
  client_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);
