-- ============================================================
-- Stuumo — Parent access to children's notifications & messages
-- Run ONCE in the Supabase SQL editor, after parent_managed_children.sql.
-- Additive (permissive) policies — they only widen access and remove
-- nothing. A parent can now see booking/enrolment alerts addressed to
-- their children, and read + send + mark-read messages in their
-- children's conversations with teachers.
-- ============================================================

-- notifications: read a child's notifications (booking confirmed, etc.)
drop policy if exists "parents read child notifications" on public.notifications;
create policy "parents read child notifications"
  on public.notifications for select
  using (user_id in (select id from public.profiles where parent_id = auth.uid()));

-- notifications: mark a child's notifications as read
drop policy if exists "parents update child notifications" on public.notifications;
create policy "parents update child notifications"
  on public.notifications for update
  using      (user_id in (select id from public.profiles where parent_id = auth.uid()))
  with check (user_id in (select id from public.profiles where parent_id = auth.uid()));

-- messages: read messages in a child's booking conversations
drop policy if exists "parents read child messages" on public.messages;
create policy "parents read child messages"
  on public.messages for select
  using (booking_id in (
    select id from public.bookings
    where client_id in (select id from public.profiles where parent_id = auth.uid())
  ));

-- messages: send a message in a child's conversation (as the parent)
drop policy if exists "parents send child messages" on public.messages;
create policy "parents send child messages"
  on public.messages for insert
  with check (
    sender_id = auth.uid()
    and booking_id in (
      select id from public.bookings
      where client_id in (select id from public.profiles where parent_id = auth.uid())
    )
  );

-- messages: mark a child's incoming messages as read
drop policy if exists "parents update child messages" on public.messages;
create policy "parents update child messages"
  on public.messages for update
  using      (booking_id in (select id from public.bookings where client_id in (select id from public.profiles where parent_id = auth.uid())))
  with check (booking_id in (select id from public.bookings where client_id in (select id from public.profiles where parent_id = auth.uid())));
