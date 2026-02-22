
-- Add new project_type enum values for private construction
ALTER TYPE public.project_type ADD VALUE IF NOT EXISTS 'villa';
ALTER TYPE public.project_type ADD VALUE IF NOT EXISTS 'ground_attached';
ALTER TYPE public.project_type ADD VALUE IF NOT EXISTS 'advanced';
ALTER TYPE public.project_type ADD VALUE IF NOT EXISTS 'addition';

-- Add new change_order_category enum values
ALTER TYPE public.change_order_category ADD VALUE IF NOT EXISTS 'aluminum';
ALTER TYPE public.change_order_category ADD VALUE IF NOT EXISTS 'kitchen';
ALTER TYPE public.change_order_category ADD VALUE IF NOT EXISTS 'insulation';
ALTER TYPE public.change_order_category ADD VALUE IF NOT EXISTS 'concrete';
