
-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'contractor', 'viewer');

CREATE TYPE public.subscription_status AS ENUM ('trial', 'active', 'past_due', 'canceled', 'expired');

CREATE TYPE public.subscription_plan AS ENUM ('basic', 'pro');

CREATE TYPE public.project_type AS ENUM (
  'residential', 'commercial', 'renovation', 'infrastructure', 'other'
);

CREATE TYPE public.change_order_status AS ENUM (
  'draft', 'priced', 'sent', 'approved', 'rejected', 'canceled'
);

CREATE TYPE public.change_order_category AS ENUM (
  'structural', 'electrical', 'plumbing', 'finishing', 'hvac',
  'flooring', 'painting', 'landscaping', 'safety', 'other'
);

CREATE TYPE public.attachment_type AS ENUM ('image', 'video', 'pdf', 'other');

-- ============================================================
-- PROFILES TABLE (linked to auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- USER ROLES TABLE (separate from profiles per security requirement)
-- ============================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'contractor',
  UNIQUE (user_id, role)
);

-- ============================================================
-- SUBSCRIPTIONS TABLE
-- ============================================================
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan subscription_plan NOT NULL DEFAULT 'basic',
  status subscription_status NOT NULL DEFAULT 'trial',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  project_limit INT NOT NULL DEFAULT 3,
  monthly_change_limit INT NOT NULL DEFAULT 20,
  trial_ends_at TIMESTAMPTZ DEFAULT (now() + interval '14 days'),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- PROJECTS TABLE
-- ============================================================
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  project_type project_type NOT NULL DEFAULT 'residential',
  client_portal_enabled BOOLEAN NOT NULL DEFAULT false,
  client_name TEXT,
  client_phone TEXT,
  client_email TEXT,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- CHANGE ORDERS TABLE
-- ============================================================
CREATE TABLE public.change_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category change_order_category NOT NULL DEFAULT 'other',
  description TEXT,
  status change_order_status NOT NULL DEFAULT 'draft',
  price_amount NUMERIC(12,2),
  include_vat BOOLEAN NOT NULL DEFAULT true,
  vat_rate NUMERIC(4,2) NOT NULL DEFAULT 17.00,
  impact_days INT DEFAULT 0,
  portal_token_hash TEXT,
  portal_token_expires_at TIMESTAMPTZ,
  portal_token_used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ATTACHMENTS TABLE
-- ============================================================
CREATE TABLE public.attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  change_order_id UUID NOT NULL REFERENCES public.change_orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type attachment_type NOT NULL DEFAULT 'image',
  file_size_bytes BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- APPROVALS TABLE
-- ============================================================
CREATE TABLE public.approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  change_order_id UUID NOT NULL REFERENCES public.change_orders(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('approved', 'rejected')),
  rejection_reason TEXT,
  ip_address TEXT,
  user_agent TEXT,
  pdf_url TEXT,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- AUDIT LOG TABLE
-- ============================================================
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  performed_by UUID,
  performed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_change_orders_project_id ON public.change_orders(project_id);
CREATE INDEX idx_change_orders_user_id ON public.change_orders(user_id);
CREATE INDEX idx_change_orders_status ON public.change_orders(status);
CREATE INDEX idx_attachments_change_order_id ON public.attachments(change_order_id);
CREATE INDEX idx_approvals_change_order_id ON public.approvals(change_order_id);
CREATE INDEX idx_audit_log_record_id ON public.audit_log(record_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_change_orders_updated_at BEFORE UPDATE ON public.change_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- AUTO-CREATE PROFILE + SUBSCRIPTION + ROLE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, phone)
  VALUES (NEW.id, NEW.phone);

  INSERT INTO public.subscriptions (user_id)
  VALUES (NEW.id);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'contractor');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- SECURITY DEFINER: has_role
-- ============================================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- ============================================================
-- STATE MACHINE VALIDATION TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.validate_change_order_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- Block updates on terminal states
  IF OLD.status IN ('approved', 'rejected', 'canceled') THEN
    RAISE EXCEPTION 'Cannot update change order in terminal state: %', OLD.status;
  END IF;

  -- Validate transitions
  IF OLD.status = 'draft' AND NEW.status NOT IN ('draft', 'priced', 'canceled') THEN
    RAISE EXCEPTION 'Invalid transition from draft to %', NEW.status;
  END IF;

  IF OLD.status = 'priced' AND NEW.status NOT IN ('priced', 'sent', 'draft', 'canceled') THEN
    RAISE EXCEPTION 'Invalid transition from priced to %', NEW.status;
  END IF;

  IF OLD.status = 'sent' AND NEW.status NOT IN ('sent', 'approved', 'rejected', 'canceled') THEN
    RAISE EXCEPTION 'Invalid transition from sent to %', NEW.status;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER validate_co_status
  BEFORE UPDATE ON public.change_orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.validate_change_order_status_transition();

-- ============================================================
-- AUDIT LOG TRIGGER FOR CHANGE ORDER STATUS CHANGES
-- ============================================================
CREATE OR REPLACE FUNCTION public.log_change_order_status()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_log (table_name, record_id, action, old_value, new_value, performed_by)
  VALUES (
    'change_orders',
    NEW.id,
    'status_change',
    jsonb_build_object('status', OLD.status),
    jsonb_build_object('status', NEW.status),
    auth.uid()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER log_co_status_change
  AFTER UPDATE ON public.change_orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.log_change_order_status();

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES: PROFILES
-- ============================================================
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- RLS POLICIES: USER_ROLES
-- ============================================================
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- RLS POLICIES: SUBSCRIPTIONS
-- ============================================================
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- RLS POLICIES: PROJECTS
-- ============================================================
CREATE POLICY "Users can view own projects"
  ON public.projects FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own projects"
  ON public.projects FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own projects"
  ON public.projects FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own projects"
  ON public.projects FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- RLS POLICIES: CHANGE_ORDERS
-- ============================================================
CREATE POLICY "Users can view own change orders"
  ON public.change_orders FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own change orders"
  ON public.change_orders FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own change orders"
  ON public.change_orders FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete draft change orders"
  ON public.change_orders FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND status = 'draft');

-- ============================================================
-- RLS POLICIES: ATTACHMENTS
-- ============================================================
CREATE POLICY "Users can view own attachments"
  ON public.attachments FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create attachments"
  ON public.attachments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own attachments"
  ON public.attachments FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- RLS POLICIES: APPROVALS (read-only for contractor, written by service role)
-- ============================================================
CREATE POLICY "Users can view approvals for own change orders"
  ON public.approvals FOR SELECT TO authenticated
  USING (
    change_order_id IN (
      SELECT id FROM public.change_orders WHERE user_id = auth.uid()
    )
  );

-- ============================================================
-- RLS POLICIES: AUDIT_LOG (read-only for contractor)
-- ============================================================
CREATE POLICY "Users can view audit logs for own records"
  ON public.audit_log FOR SELECT TO authenticated
  USING (performed_by = auth.uid());

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('pdfs', 'pdfs', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true);

-- Storage policies: attachments
CREATE POLICY "Users can upload own attachments"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own attachments"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own attachments"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies: pdfs
CREATE POLICY "Users can view own pdfs"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies: logos (public read, authenticated write)
CREATE POLICY "Anyone can view logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'logos');

CREATE POLICY "Users can upload own logo"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own logo"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);
