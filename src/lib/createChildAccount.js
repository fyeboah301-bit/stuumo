import { createClient } from '@supabase/supabase-js'

// Readable, unambiguous strong-ish password (no 0/O/1/l/I mixups)
const generatePassword = () => {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let p = ''
  for (let i = 0; i < 10; i++) p += chars[Math.floor(Math.random() * chars.length)]
  return p
}

/**
 * Creates a learner account for a parent's child and links it to the parent.
 * Uses a throwaway Supabase client so the parent's own session is never touched.
 * Returns { success, childId, fullName, email, password, loginLink } or { error }.
 */
export async function createChildAccount({ fullName, email, parentId }) {
  const cleanName = fullName.trim()
  const cleanEmail = email.trim().toLowerCase()
  const password = generatePassword()

  const tmp = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )

  try {
    const { data, error } = await tmp.auth.signUp({
      email: cleanEmail,
      password,
      options: { data: { full_name: cleanName } },
    })
    if (error) throw error
    const uid = data.user?.id
    if (!uid) throw new Error('Could not create the account. Please try again.')

    const referral_code = 'TM' + Math.random().toString(36).substring(2, 8).toUpperCase()
    const { error: pErr } = await tmp.from('profiles').upsert({
      id: uid,
      full_name: cleanName,
      role: 'learner',
      parent_id: parentId,
      phone: '',
      city: '',
      country: '',
      referral_code,
      status: 'active',
    })
    if (pErr) throw pErr

    await tmp.auth.signOut().catch(() => {})
    const loginLink = `${window.location.origin}/login?email=${encodeURIComponent(cleanEmail)}`
    return { success: true, childId: uid, fullName: cleanName, email: cleanEmail, password, loginLink }
  } catch (err) {
    await tmp.auth.signOut().catch(() => {})
    const msg = err?.message || ''
    if (/already registered|already been registered|already exists|user already/i.test(msg)) {
      return { error: 'already_registered' }
    }
    return { error: msg || 'Something went wrong. Please try again.' }
  }
}