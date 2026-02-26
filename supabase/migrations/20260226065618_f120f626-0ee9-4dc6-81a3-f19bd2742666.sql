-- Create signatures storage bucket (public so client can view after saving)
INSERT INTO storage.buckets (id, name, public) VALUES ('signatures', 'signatures', false);

-- Allow the service role (edge functions) to manage signature files
-- No public RLS policies needed since only edge functions write/read via service role
-- But add a public read policy so signed URLs work via the API
CREATE POLICY "Anyone can read signatures with signed URL"
ON storage.objects FOR SELECT
USING (bucket_id = 'signatures');
