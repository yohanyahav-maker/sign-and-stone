
-- 1. Create private bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('files', 'files', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Create files table
CREATE TABLE IF NOT EXISTS public.files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  owner_user_id uuid NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  bucket text NOT NULL DEFAULT 'files',
  path text NOT NULL,
  mime_type text,
  size bigint,
  original_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_files_entity ON public.files (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_files_project ON public.files (project_id);

-- 3. Enable RLS
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- 4. Helper function
CREATE OR REPLACE FUNCTION public.is_project_member(_user_id uuid, _project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = _project_id AND user_id = _user_id
  )
$$;

-- 5. RLS on public.files
CREATE POLICY "Project members can view files"
  ON public.files FOR SELECT
  USING (public.is_project_member(auth.uid(), project_id));

CREATE POLICY "Project members can insert files"
  ON public.files FOR INSERT
  WITH CHECK (
    owner_user_id = auth.uid()
    AND public.is_project_member(auth.uid(), project_id)
  );

CREATE POLICY "Owner or admin can delete files"
  ON public.files FOR DELETE
  USING (
    owner_user_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
  );

-- 6. Storage policies for bucket 'files'
-- Path: projects/{projectId}/{entityType}/{entityId}/{filename}
-- foldername returns array of folder segments (without filename)

CREATE POLICY "Project members can read files bucket"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'files'
    AND public.is_project_member(
      auth.uid(),
      NULLIF((string_to_array(name, '/'))[2], '')::uuid
    )
  );

CREATE POLICY "Project members can upload to files bucket"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'files'
    AND public.is_project_member(
      auth.uid(),
      NULLIF((string_to_array(name, '/'))[2], '')::uuid
    )
  );

CREATE POLICY "Owner or admin can delete from files bucket"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'files'
    AND (
      owner_id = auth.uid()::text
      OR public.has_role(auth.uid(), 'admin')
    )
  );
