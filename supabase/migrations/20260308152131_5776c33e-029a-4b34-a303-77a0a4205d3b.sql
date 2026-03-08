
-- Drop broken policies that reference auth.users table
DROP POLICY IF EXISTS "Clients can view projects by email" ON public.projects;
DROP POLICY IF EXISTS "Clients can view change orders by email" ON public.change_orders;

-- Recreate using auth.email() which doesn't require table access
CREATE POLICY "Clients can view projects by email"
ON public.projects
FOR SELECT
TO authenticated
USING (client_email = auth.email());

CREATE POLICY "Clients can view change orders by email"
ON public.change_orders
FOR SELECT
TO authenticated
USING (
  project_id IN (
    SELECT id FROM public.projects
    WHERE client_email = auth.email()
  )
);
