
-- Add business_name to profiles
ALTER TABLE public.profiles ADD COLUMN business_name text;

-- Add client_phone_2 to projects
ALTER TABLE public.projects ADD COLUMN client_phone_2 text;
