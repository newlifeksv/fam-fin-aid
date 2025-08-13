-- Fix linter warnings: set search_path for functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_family_member(_user_id UUID, _family_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.family_members fm WHERE fm.user_id = _user_id AND fm.family_id = _family_id
  ) OR EXISTS (
    SELECT 1 FROM public.families f WHERE f.id = _family_id AND f.owner_id = _user_id
  );
$$;