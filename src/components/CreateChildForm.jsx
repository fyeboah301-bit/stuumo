import { useState } from 'react'
import { createChildAccount } from '../lib/createChildAccount'
import { BLUE, DARK_BLUE, LIGHT_BLUE, YELLOW, TEXT, TEXT_MUTED, GREY_BG, GREY_LIGHT, BORDER, GRADIENT_BLUE, SHADOW_BLUE, TRANSITION } from '../styles/colors'

const inp = { width: '100%', padding: '12px 16px', border: BORDER, borderRadius: '12px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', background: '#fff', color: TEXT, boxSizing: 'border-box', transition: TRANSITION }
const lbl = { fontSize: '11px', fontWeight: '800', color: TEXT_MUTED, display: 'block', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.07em' }

export default function CreateChildForm({ parentId, onCreated }) {
  const [name, setName]     = useState('')
  const [email, setEmail]   = useState('')
  const [busy, setBusy]     = useState(false)
  const [error, setError]   = useState('')
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState('')

  const copy = (text, key) => { try { navigator.clipboard?.writeText(text) } catch {} setCopied(key); setTimeout(() => setCopied(''), 1500) }

  const submit = async (e) => {
    e?.preventDefault?.()
    setError('')
    if (!name.trim()) return setError("Enter your child's name.")
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return setError('Enter a valid email your child can access.')
    setBusy(true)
    const res = await createChildAccount({ fullName: name, email, parentId })
    setBusy(false)
    if (res.error === 'already_registered') return setError('That email already has an account — use “Link existing account” instead.')
    if (res.error) return setError(res.error)
    setResult(res)
    onCreated?.({ id: res.childId, full_name: res.fullName })
  }

  const reset = () => { setResult(null); setName(''); setEmail(''); setError('') }

  if (result) {
    const Row = ({ label, value, k }) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', background: '#fff', border: BORDER, borderRadius: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '10px', fontWeight: '800', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>{label}</div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
        </div>
        <button type="button" onClick={() => copy(value, k)} style={{ flexShrink: 0, fontSize: '12px', fontWeight: '800', color: copied === k ? '#0B0B0B' : BLUE, background: copied === k ? '#F5F5F5' : LIGHT_BLUE, border: 'none', borderRadius: '8px', padding: '7px 12px', cursor: 'pointer', fontFamily: 'inherit' }}>{copied === k ? '✓ Copied' : 'Copy'}</button>
      </div>
    )
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: 'linear-gradient(135deg, #6D28D9, #0B0B0B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>✅</div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '800', color: TEXT }}>Account created for {result.fullName}</div>
            <div style={{ fontSize: '12.5px', color: TEXT_MUTED }}>Share these so your child can log in.</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
          <Row label="Login email" value={result.email} k="email" />
          <Row label="Password" value={result.password} k="password" />
          <Row label="One-tap login link" value={result.loginLink} k="link" />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '9px', marginTop: '12px', padding: '11px 14px', background: '#F5F5F5', borderRadius: '11px', border: '1px solid #E2E8F0' }}>
          <span style={{ fontSize: '15px', flexShrink: 0 }}>💡</span>
          <p style={{ fontSize: '12.5px', color: '#0B0B0B', margin: 0, lineHeight: '1.6' }}>Save the password now — it won't be shown again. Your child can change it later from their account.</p>
        </div>
        <button type="button" onClick={reset} style={{ marginTop: '14px', width: '100%', padding: '12px', background: '#fff', color: BLUE, border: `1.5px solid ${BLUE}`, borderRadius: '12px', fontSize: '14px', fontWeight: '800', cursor: 'pointer', fontFamily: 'inherit' }}>+ Add another child</button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <label style={lbl}>Child's name</label>
        <input style={inp} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ama Mensah"
          onFocus={e => e.target.style.borderColor = BLUE} onBlur={e => e.target.style.borderColor = GREY_LIGHT} />
      </div>
      <div>
        <label style={lbl}>Child's email</label>
        <input style={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="child@email.com"
          onFocus={e => e.target.style.borderColor = BLUE} onBlur={e => e.target.style.borderColor = GREY_LIGHT} />
        <p style={{ fontSize: '11.5px', color: TEXT_MUTED, margin: '6px 2px 0', lineHeight: '1.5' }}>Use an email your child can access. No email? Make a free one, or use <strong>yourname+child@gmail.com</strong>.</p>
      </div>
      {error && <div style={{ background: '#F5F5F5', color: '#DC2626', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', border: '1px solid #E2E8F0' }}>{error}</div>}
      <button type="submit" disabled={busy}
        style={{ padding: '13px', background: busy ? GREY_BG : GRADIENT_BLUE, color: busy ? TEXT_MUTED : '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '800', cursor: busy ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: busy ? 'none' : SHADOW_BLUE }}>
        {busy ? '⏳ Creating account…' : '✨ Create child account'}
      </button>
    </form>
  )
}