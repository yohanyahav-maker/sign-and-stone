
-- Add type and file_url columns to messages for voice support
ALTER TABLE public.messages ADD COLUMN type text NOT NULL DEFAULT 'text';
ALTER TABLE public.messages ADD COLUMN file_url text;
