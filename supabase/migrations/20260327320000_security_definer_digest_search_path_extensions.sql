-- Supabase installs digest() in the extensions schema; SECURITY DEFINER with
-- search_path = public alone cannot resolve it. Refresh function GUCs without
-- touching body logic.

alter function public.issue_certificate_for_verified_artwork(uuid)
  set search_path to public, extensions;

alter function public.update_artwork_timeline_hash()
  set search_path to public, extensions;

alter function public.ownership_certificate_verify(uuid)
  set search_path to public, extensions;
