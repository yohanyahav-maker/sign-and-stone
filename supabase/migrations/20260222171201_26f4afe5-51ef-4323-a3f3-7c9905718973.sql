
-- Enhanced state machine trigger: block sending without price_amount or client_portal_enabled
CREATE OR REPLACE FUNCTION public.validate_change_order_status_transition()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  -- Block updates on terminal states
  IF OLD.status IN ('approved', 'rejected', 'canceled') THEN
    RAISE EXCEPTION 'Cannot update change order in terminal state: %', OLD.status
      USING ERRCODE = 'P0403';
  END IF;

  -- Validate transitions
  IF OLD.status = 'draft' AND NEW.status NOT IN ('draft', 'priced', 'canceled') THEN
    RAISE EXCEPTION 'Invalid transition from draft to %', NEW.status
      USING ERRCODE = 'P0422';
  END IF;

  IF OLD.status = 'priced' AND NEW.status NOT IN ('priced', 'sent', 'draft', 'canceled') THEN
    RAISE EXCEPTION 'Invalid transition from priced to %', NEW.status
      USING ERRCODE = 'P0422';
  END IF;

  IF OLD.status = 'sent' AND NEW.status NOT IN ('sent', 'approved', 'rejected', 'canceled') THEN
    RAISE EXCEPTION 'Invalid transition from sent to %', NEW.status
      USING ERRCODE = 'P0422';
  END IF;

  -- Block transition to 'sent' without price_amount
  IF NEW.status = 'sent' AND (NEW.price_amount IS NULL OR NEW.price_amount <= 0) THEN
    RAISE EXCEPTION 'Cannot send change order without a valid price amount'
      USING ERRCODE = 'P0422';
  END IF;

  -- Block transition to 'sent' without client_portal_enabled on the project
  IF NEW.status = 'sent' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = NEW.project_id AND client_portal_enabled = true
    ) THEN
      RAISE EXCEPTION 'Cannot send change order: client portal not enabled on project'
        USING ERRCODE = 'P0422';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Ensure the trigger is attached (recreate to be safe)
DROP TRIGGER IF EXISTS validate_change_order_status ON public.change_orders;
CREATE TRIGGER validate_change_order_status
  BEFORE UPDATE ON public.change_orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.validate_change_order_status_transition();
