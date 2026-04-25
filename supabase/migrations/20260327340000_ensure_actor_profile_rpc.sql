-- Inserts/updates the caller's actor_profiles row using auth.uid() only.
-- SECURITY DEFINER bypasses RLS so signup succeeds even when PostgREST + RLS
-- reject the equivalent direct insert (e.g. session/JWT edge cases).

CREATE OR REPLACE FUNCTION public.ensure_actor_profile(
  p_role text,
  p_display_name text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated'
      USING ERRCODE = '42501';
  END IF;

  IF p_role NOT IN ('artist', 'gallery', 'collector') THEN
    RAISE EXCEPTION 'Invalid role';
  END IF;

  INSERT INTO public.actor_profiles (user_id, role, display_name)
  VALUES (auth.uid(), p_role, p_display_name)
  ON CONFLICT (user_id) DO UPDATE SET
    role = EXCLUDED.role,
    display_name = EXCLUDED.display_name,
    updated_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_actor_profile(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_actor_profile(text, text) TO authenticated;
