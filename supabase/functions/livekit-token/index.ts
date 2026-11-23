import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { AccessToken } from 'https://esm.sh/livekit-server-sdk@2'

const LIVEKIT_URL = Deno.env.get('LIVEKIT_URL') ?? ''
const LIVEKIT_API_KEY = Deno.env.get('LIVEKIT_API_KEY') ?? ''
const LIVEKIT_API_SECRET = Deno.env.get('LIVEKIT_API_SECRET') ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
// Handled cases return 200 with { ok:false, error } so the client can read them cleanly.
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
      return json({ ok: false, error: 'Video service is not configured yet.' })
    }

    const { room, displayName } = await req.json()
    if (!room || typeof room !== 'string') return json({ ok: false, error: 'Missing room' })

    // Identify the caller from their Supabase login token (never trust the client for identity).
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !ANON_KEY) return json({ ok: false, error: 'Please sign in to join the call.' })
    const asUser = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: u } = await asUser.auth.getUser()
    const userId = u?.user?.id
    if (!userId) return json({ ok: false, error: 'Please sign in to join the call.' })

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE)

    // Identities this user may join as: themselves plus any child profiles they manage.
    const { data: kids } = await admin.from('profiles').select('id').eq('parent_id', userId)
    const ownedIds = new Set<string>([userId, ...((kids || []).map((k: { id: string }) => k.id))])

    let roomExists = false
    let allowed = false

    // 1:1 booking room? Allow the teacher, the client, or the client's parent.
    const { data: bk } = await admin
      .from('bookings')
      .select('client_id, teacher_id')
      .eq('room_id', room)
      .maybeSingle()
    if (bk) {
      roomExists = true
      if (bk.teacher_id === userId || ownedIds.has(bk.client_id)) allowed = true
    }

    // Live-session room? Allow the host teacher or anyone enrolled (self or their child).
    if (!allowed) {
      const { data: ls } = await admin
        .from('live_sessions')
        .select('id, teacher_id')
        .eq('room_id', room)
        .is('deleted_at', null)
        .maybeSingle()
      if (ls) {
        roomExists = true
        if (ls.teacher_id === userId) {
          allowed = true
        } else {
          const { data: enr } = await admin
            .from('enrollments')
            .select('id')
            .eq('session_id', ls.id)
            .in('user_id', Array.from(ownedIds))
            .limit(1)
          if (enr && enr.length > 0) allowed = true
        }
      }
    }

    if (!roomExists) return json({ ok: false, error: 'This session room does not exist.' })
    if (!allowed) return json({ ok: false, error: 'You are not a participant of this session.' })

    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: userId,
      name: (typeof displayName === 'string' && displayName ? displayName : 'Guest').slice(0, 80),
      ttl: '3h',
    })
    at.addGrant({ roomJoin: true, room, canPublish: true, canSubscribe: true })
    const token = await at.toJwt()

    return json({ ok: true, token, url: LIVEKIT_URL })
  } catch (e) {
    return json({ ok: false, error: String((e as Error)?.message || e) })
  }
})
