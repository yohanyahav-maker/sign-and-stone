
DROP POLICY "Project members can view files" ON public.files;
CREATE POLICY "Project members can view files" ON public.files
  FOR SELECT TO authenticated
  USING (is_project_member(auth.uid(), project_id));

DROP POLICY "Project members can insert files" ON public.files;
CREATE POLICY "Project members can insert files" ON public.files
  FOR INSERT TO authenticated
  WITH CHECK ((owner_user_id = auth.uid()) AND is_project_member(auth.uid(), project_id));

DROP POLICY "Owner or admin can delete files" ON public.files;
CREATE POLICY "Owner or admin can delete files" ON public.files
  FOR DELETE TO authenticated
  USING ((owner_user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));
