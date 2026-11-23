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

    // Only issue a token for a room that actually belongs to a booking or a live session.
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE)
    const [{ data: b }, { data: s }] = await Promise.all([
      admin.from('bookings').select('id').eq('room_id', room).limit(1),
      admin.from('live_sessions').select('id').eq('room_id', room).limit(1),
    ])
    if ((!b || b.length === 0) && (!s || s.length === 0)) {
      return json({ ok: false, error: 'This session room does not exist.' })
    }
    // Hardening TODO: also verify this user is a participant of that booking/session
    // (client, their child, the teacher, or enrolled) before issuing the token.

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
