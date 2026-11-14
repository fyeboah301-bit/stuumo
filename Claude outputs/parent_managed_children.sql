-- ============================================================
-- Stuumo — Parent-managed child profiles (no separate login)
-- Run ONCE in the Supabase SQL editor (Database → SQL editor → New query).
--
-- What it does:
--   A child becomes a profile row OWNED by a parent, with NO auth
--   account — no email, no password, no login link. The parent is the
--   only login and acts on the child's behalf (booking, progress, etc.).
--   Existing children (already profiles with parent_id) keep working;
--   their old login accounts are simply no longer used.
-- ============================================================

-- 1) Optional child metadata ---------------------------------
alter table public.profiles
  add column if not exists grade text;

-- 2) Allow a profile that is NOT backed by an auth user -------
--    Children get a generated id, so the id -> auth.users link
--    must be dropped. This removes it for whichever constraint
--    name your project uses.
do $$
declare r record;
begin
  for r in
    select con.conname
    from pg_constraint con
    join pg_class     rel on rel.oid = con.conrelid
    join pg_namespace ns  on ns.oid  = rel.relnamespace
    where ns.nspname = 'public'
      and rel.relname = 'profiles'
      and con.contype = 'f'
      and con.confrelid = 'auth.users'::regclass
  loop
    execute format('alter table public.profiles drop constraint %I', r.conname);
    raise notice 'Dropped FK %', r.conname;
  end loop;
end $$;

-- 3) Row-level security: a parent may act for their children --
--    These are ADDED alongside your existing policies (RLS is
--    permissive/OR), so they only widen access — a parent gains
--    rights over rows whose owner is one of their children. No
--    existing policy is removed.

-- profiles: create / read / update / remove own children
drop policy if exists "parents manage their children" on public.profiles;
create policy "parents manage their children"
  on public.profiles for all
  using      (parent_id = auth.uid())
  with check (parent_id = auth.uid());

-- bookings: book, view, cancel on behalf of a child
drop policy if exists "parents act on child bookings" on public.bookings;
create policy "parents act on child bookings"
  on public.bookings for all
  using      (client_id in (select id from public.profiles where parent_id = auth.uid()))
  with check (client_id in (select id from public.profiles where parent_id = auth.uid()));

-- assignments: read a child's assignments
drop policy if exists "parents read child assignments" on public.assignments;
create policy "parents read child assignments"
  on public.assignments for select
  using (learner_id in (select id from public.profiles where parent_id = auth.uid()));

-- submissions: read a child's submitted work + grades
drop policy if exists "parents read child submissions" on public.submissions;
create policy "parents read child submissions"
  on public.submissions for select
  using (learner_id in (select id from public.profiles where parent_id = auth.uid()));

-- course_certificates: read a child's certificates
drop policy if exists "parents read child certificates" on public.course_certificates;
create policy "parents read child certificates"
  on public.course_certificates for select
  using (learner_id in (select id from public.profiles where parent_id = auth.uid()));

-- Done. New children can now be added with no login, and parents
-- can see and manage everything for them from their own account.
