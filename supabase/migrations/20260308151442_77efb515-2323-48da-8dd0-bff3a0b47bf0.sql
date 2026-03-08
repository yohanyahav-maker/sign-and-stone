
-- Allow clients to view change orders for projects where their email matches client_email
CREATE POLICY "Clients can view change orders by email"
ON public.change_orders
FOR SELECT
TO authenticated
USING (
  project_id IN (
    SELECT id FROM public.projects
    WHERE client_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);
