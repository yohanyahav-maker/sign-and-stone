
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own project messages"
ON public.messages FOR SELECT
USING (is_project_member(auth.uid(), project_id));

CREATE POLICY "Users can insert own messages"
ON public.messages FOR INSERT
WITH CHECK (user_id = auth.uid() AND is_project_member(auth.uid(), project_id));

CREATE POLICY "Users can delete own messages"
ON public.messages FOR DELETE
USING (user_id = auth.uid());

CREATE INDEX idx_messages_project_id ON public.messages(project_id, created_at);

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
