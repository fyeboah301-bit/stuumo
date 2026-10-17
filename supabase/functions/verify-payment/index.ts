import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY') ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

// Commission on 1:1 private sessions
const COMMISSION_RATE = 0.125

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

// Verify a Paystack reference actually succeeded for at least `expectedPesewas` GHS.
async function verifyPaystack(reference: string, expectedPesewas: number) {
  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } },
  )
  const v = await res.json()
  if (!res.ok || !v?.status || v?.data?.status !== 'success') {
    return { ok: false, error: 'Payment was not successful' }
  }
  if (Number(v.data.amount) < expectedPesewas || v.data.currency !== 'GHS') {
    return { ok: false, error: 'Payment amount/currency mismatch' }
  }
  return { ok: true }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const { type, booking_id, session_id, reference } = await req.json()
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE)

    // Identify the caller from their login token (needed for enrollments).
    let callerId: string | null = null
    const authHeader = req.headers.get('Authorization')
    if (authHeader && ANON_KEY) {
      const asUser = createClient(SUPABASE_URL, ANON_KEY, {
        global: { headers: { Authorization: authHeader } },
      })
      const { data: u } = await asUser.auth.getUser()
      callerId = u?.user?.id ?? null
    }

    const kind = type || (session_id ? 'enrollment' : 'booking')

    // ---------- 1:1 BOOKING ----------
    if (kind === 'booking') {
      if (!booking_id || !reference) return json({ ok: false, error: 'Missing booking_id or reference' }, 400)

      const { data: booking, error: bErr } = await admin
        .from('bookings').select('*').eq('id', booking_id).single()
      if (bErr || !booking) return json({ ok: false, error: 'Booking not found' }, 404)
      if (booking.payment_status === 'paid') return json({ ok: true, already: true })

      const { data: existing } = await admin
        .from('payments').select('id').eq('reference', reference).maybeSingle()
      if (existing) return json({ ok: true, already: true })

      const vr = await verifyPaystack(reference, Math.round(Number(booking.amount) * 100))
      if (!vr.ok) return json({ ok: false, error: vr.error }, 400)

      const commissionAmount = Math.round(booking.amount * COMMISSION_RATE * 100) / 100
      const teacherPayout    = Math.round(booking.amount * (1 - COMMISSION_RATE) * 100) / 100

      await admin.from('payments').insert({
        booking_id: booking.id, payer_id: booking.client_id, amount: booking.amount,
        commission_amount: commissionAmount, teacher_payout: teacherPayout, reference, status: 'success',
      })
      const { error: uErr } = await admin.from('bookings').update({
        payment_status: 'paid', commission_rate: COMMISSION_RATE,
        commission_amount: commissionAmount, teacher_payout: teacherPayout, payout_status: 'pending',
      }).eq('id', booking.id)
      if (uErr) return json({ ok: false, error: uErr.message }, 500)

      return json({ ok: true })
    }

    // ---------- LIVE-SESSION ENROLLMENT ----------
    if (kind === 'enrollment') {
      if (!session_id) return json({ ok: false, error: 'Missing session_id' }, 400)
      if (!callerId)   return json({ ok: false, error: 'Not authenticated' }, 401)

      const { data: session, error: sErr } = await admin
        .from('live_sessions').select('*').eq('id', session_id).single()
      if (sErr || !session) return json({ ok: false, error: 'Session not found' }, 404)

      const { data: already } = await admin
        .from('enrollments').select('id').eq('session_id', session_id).eq('user_id', callerId).maybeSingle()
      if (already) return json({ ok: true, already: true })

      // Capacity
      const { count } = await admin
        .from('enrollments').select('*', { count: 'exact', head: true }).eq('session_id', session_id)
      if (session.max_spots && count !== null && count >= session.max_spots) {
        return json({ ok: false, error: 'This session is full' }, 400)
      }

      const price = Number(session.price) || 0
      if (price > 0) {
        if (!reference) return json({ ok: false, error: 'Missing reference' }, 400)
        const { data: existing } = await admin
          .from('payments').select('id').eq('reference', reference).maybeSingle()
        if (!existing) {
          const vr = await verifyPaystack(reference, Math.round(price * 100))
          if (!vr.ok) return json({ ok: false, error: vr.error }, 400)
          await admin.from('payments').insert({ payer_id: callerId, amount: price, reference, status: 'success' })
        }
      }

      const { error: eErr } = await admin.from('enrollments')
        .insert({ session_id, user_id: callerId, payment_status: 'paid' })
      if (eErr) return json({ ok: false, error: eErr.message }, 500)

      await admin.from('notifications').insert({
        user_id: session.teacher_id, title: 'New enrollment',
        message: `Someone enrolled in: ${session.title}.`, type: 'enrollment', link: '/sessions',
      })
      return json({ ok: true })
    }

    return json({ ok: false, error: 'Unknown payment type' }, 400)
  } catch (err) {
    return json({ ok: false, error: String((err as Error)?.message || err) }, 500)
  }
})
