import { supabase } from './supabase'

/**
 * Adds a child as a profile owned by the parent — no auth account,
 * no email, no password, no login link. The parent is the only login
 * and manages the child from their own account.
 * Returns { success, child } or { error }.
 */
export async function createChild({ fullName, grade, parentId }) {
  const cleanName = (fullName || '').trim()
  if (!cleanName) return { error: "Enter your child's name." }

  const id = (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const referral_code = 'TM' + Math.random().toString(36).substring(2, 8).toUpperCase()

  const { data, error } = await supabase.from('profiles').insert({
    id,
    full_name: cleanName,
    role: 'learner',
    parent_id: parentId,
    grade: (grade || '').trim() || null,
    phone: '', city: '', country: '',
    referral_code,
    status: 'active',
  }).select('id, full_name, grade').single()

  if (error) return { error: error.message || 'Could not add your child. Please try again.' }
  return { success: true, child: data }
}
