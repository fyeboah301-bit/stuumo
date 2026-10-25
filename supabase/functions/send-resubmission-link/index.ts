import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const { email, name } = await req.json()
    if (!email) {
      return new Response(JSON.stringify({ error: 'email required' }), { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } })
    }

    const SB_URL = Deno.env.get('SUPABASE_URL')!
    const SB_SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const APP_URL = Deno.env.get('APP_URL') || 'https://stuumo.com'
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

    // Passwordless magic link that drops the teacher back into their application at the document step.
    const admin = createClient(SB_URL, SB_SERVICE)
    const { data, error } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: `${APP_URL}/apply?resubmit=1` },
    })
    if (error) throw error
    const link = data?.properties?.action_link
    if (!link) throw new Error('No link generated')

    if (RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Stuumo <onboarding@resend.dev>',
          to: [email],
          subject: 'Action needed: resubmit a document on your Stuumo application',
          html: `
            <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#0B0B0B">
              <h2 style="color:#6D28D9">One more step on your application</h2>
              <p>Hi ${name || 'there'},</p>
              <p>A document on your Stuumo teacher application needs to be re-uploaded. Use the secure button below to go straight to that step and upload the corrected document — no password needed.</p>
              <p style="margin:24px 0">
                <a href="${link}" style="background:#6D28D9;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700">Resume my application</a>
              </p>
              <p style="font-size:13px;color:#6B7280">This link is personal to you — please don't share it. If you didn't expect this email, you can ignore it.</p>
            </div>`,
        }),
      })
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { ...CORS, 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } })
  }
})
