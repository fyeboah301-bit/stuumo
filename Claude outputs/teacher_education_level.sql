-- ============================================================
-- Stuumo — Verified teacher education level
-- Run once in the Supabase SQL editor.
--
-- How it works:
--   • A teacher picks their highest education at signup and uploads
--     the matching academic certificate (tagged with that level).
--   • An admin approving that certificate promotes the teacher:
--     teachers.education_level becomes the approved category, and the
--     Find Teachers filter uses it (SHS Graduate / Bachelors / Masters / PhD).
--   • To upgrade, the teacher uploads a new academic certificate for the
--     higher level (teachers.pending_education_level), which only takes
--     effect after an admin approves it.
-- ============================================================

-- Approved/verified category (null until a certificate is approved)
alter table public.teachers
  add column if not exists education_level text;

-- The level the teacher is claiming / upgrading to, awaiting approval
alter table public.teachers
  add column if not exists pending_education_level text;

-- The education level a specific academic certificate certifies
alter table public.certificates
  add column if not exists education_level text;
