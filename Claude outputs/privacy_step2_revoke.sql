-- ============================================================
-- Stuumo — Email/phone privacy, STEP 2 of 2  (run this LAST)
-- Only run this AFTER:
--   1. STEP 1 (the views) has been run, and
--   2. the updated code is deployed and verified working
--      (own profile still shows email/phone; the admin console
--       still shows teacher/learner contacts; booking, messages
--       and Find Teachers all still load).
--
-- This blocks every logged-in user from reading other people's
-- email/phone directly. Own contacts still come through
-- profile_self / profile_contacts; admins through profiles_all.
-- ============================================================

revoke select (email, phone) on public.profiles from anon, authenticated;

-- ── IF ANYTHING BREAKS, undo instantly with this one line: ──
-- grant select (email, phone) on public.profiles to anon, authenticated;
