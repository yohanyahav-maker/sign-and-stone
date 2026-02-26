
-- Add context column to attachments for BEFORE/AFTER distinction
ALTER TABLE public.attachments
ADD COLUMN context text;

-- Add signature_url column to approvals
ALTER TABLE public.approvals
ADD COLUMN signature_url text;
