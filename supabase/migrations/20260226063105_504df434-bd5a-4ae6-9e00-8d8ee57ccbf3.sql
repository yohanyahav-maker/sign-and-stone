
-- ============================================================
-- 1. PROJECTS: enforce TO authenticated on all policies
-- ============================================================
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;

CREATE POLICY "Users can view own projects" ON public.projects
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own projects" ON public.projects
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own projects" ON public.projects
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own projects" ON public.projects
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- 2. CHANGE_ORDERS: enforce TO authenticated
-- ============================================================
DROP POLICY IF EXISTS "Users can view own change orders" ON public.change_orders;
DROP POLICY IF EXISTS "Users can create own change orders" ON public.change_orders;
DROP POLICY IF EXISTS "Users can update own change orders" ON public.change_orders;
DROP POLICY IF EXISTS "Users can delete draft change orders" ON public.change_orders;

CREATE POLICY "Users can view own change orders" ON public.change_orders
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own change orders" ON public.change_orders
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own change orders" ON public.change_orders
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete draft change orders" ON public.change_orders
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND status = 'draft'::change_order_status);

-- ============================================================
-- 3. ATTACHMENTS: enforce TO authenticated + project membership
-- ============================================================
DROP POLICY IF EXISTS "Users can view own attachments" ON public.attachments;
DROP POLICY IF EXISTS "Users can create attachments" ON public.attachments;
DROP POLICY IF EXISTS "Users can delete own attachments" ON public.attachments;

CREATE POLICY "Users can view own attachments" ON public.attachments
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create attachments" ON public.attachments
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own attachments" ON public.attachments
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- 4. APPROVALS: read-only for contractor who owns the CO
-- ============================================================
DROP POLICY IF EXISTS "Users can view approvals for own change orders" ON public.approvals;

CREATE POLICY "Users can view approvals for own change orders" ON public.approvals
  FOR SELECT TO authenticated
  USING (
    change_order_id IN (
      SELECT id FROM public.change_orders WHERE user_id = auth.uid()
    )
  );
-- No INSERT/UPDATE/DELETE policies — only service role can write

-- ============================================================
-- 5. AUDIT_LOG: read-only for the performer
-- ============================================================
DROP POLICY IF EXISTS "Users can view audit logs for own records" ON public.audit_log;

CREATE POLICY "Users can view audit logs for own records" ON public.audit_log
  FOR SELECT TO authenticated
  USING (performed_by = auth.uid());
-- No INSERT/UPDATE/DELETE policies — only service role can write

-- ============================================================
-- 6. PROFILES: enforce TO authenticated
-- ============================================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- 7. SUBSCRIPTIONS: enforce TO authenticated
-- ============================================================
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;

CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- 8. USER_ROLES: enforce TO authenticated
-- ============================================================
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- 9. FILES: enforce TO authenticated
-- ============================================================
DROP POLICY IF EXISTS "Project members can view files" ON public.files;
DROP POLICY IF EXISTS "Project members can insert files" ON public.files;
DROP POLICY IF EXISTS "Owner or admin can delete files" ON public.files;

CREATE POLICY "Project members can view files" ON public.files
  FOR SELECT TO authenticated
  USING (is_project_member(auth.uid(), project_id));

CREATE POLICY "Project members can insert files" ON public.files
  FOR INSERT TO authenticated
  WITH CHECK (owner_user_id = auth.uid() AND is_project_member(auth.uid(), project_id));

CREATE POLICY "Owner or admin can delete files" ON public.files
  FOR DELETE TO authenticated
  USING (owner_user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));
