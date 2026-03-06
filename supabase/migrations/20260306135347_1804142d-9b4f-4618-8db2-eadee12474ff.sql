CREATE POLICY "Users can view audit logs for own change orders"
ON public.audit_log
FOR SELECT
TO authenticated
USING (
  table_name = 'change_orders' AND
  record_id IN (
    SELECT id FROM public.change_orders WHERE user_id = auth.uid()
  )
);