-- ============================================================
-- Stuumo — Email/phone privacy, STEP 1 of 2  (run this FIRST)
-- Safe & additive: creates read paths for contacts. Nothing is
-- locked down yet, so the app keeps working exactly as before.
-- Run STEP 2 (the revoke) only after deploying the code and
-- verifying the app still works.
-- ============================================================

-- A user's own full profile (includes their own email/phone).
-- Security-definer (runs as owner) + a WHERE that limits it to the
-- caller, so it returns only the signed-in user's own row.
create or replace view public.profile_self as
  select * from public.profiles where id = auth.uid();
grant select on public.profile_self to authenticated;

-- Email/phone for the owner, OR for an admin (who may read everyone's).
create or replace view public.profile_contacts as
  select id, email, phone from public.profiles
  where id = auth.uid()
     or exists (select 1 from public.admins a where a.id = auth.uid());
grant select on public.profile_contacts to authenticated;

-- Full profiles, admins only (used by the admin console's bulk load).
create or replace view public.profiles_all as
  select * from public.profiles
  where exists (select 1 from public.admins a where a.id = auth.uid());
grant select on public.profiles_all to authenticated;

-- Note: the "select *" views snapshot the current columns. If you add
-- columns to public.profiles later, re-run this file to refresh them.
