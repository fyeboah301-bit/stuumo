import { useState } from 'react'
import { createChild } from '../lib/createChildAccount'
import { BLUE, DARK_BLUE, LIGHT_BLUE, YELLOW, TEXT, TEXT_MUTED, GREY_BG, GREY_LIGHT, BORDER, GRADIENT_BLUE, SHADOW_BLUE, TRANSITION } from '../styles/colors'

const inp = { width: '100%', padding: '12px 16px', border: BORDER, borderRadius: '12px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', background: '#fff', color: TEXT, boxSizing: 'border-box', transition: TRANSITION }
const lbl = { fontSize: '11px', fontWeight: '800', color: TEXT_MUTED, display: 'block', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.07em' }

export default function CreateChildForm({ parentId, onCreated }) {
  const [name, setName]         = useState('')
  const [grade, setGrade]       = useState('')
  const [busy, setBusy]         = useState(false)
  const [error, setError]       = useState('')
  const [justAdded, setJustAdded] = useState('')

  const submit = async (e) => {
    e?.preventDefault?.()
    setError('')
    if (!name.trim()) return setError("Enter your child's name.")
    setBusy(true)
    const res = await createChild({ fullName: name, grade, parentId })
    setBusy(false)
    if (res.error) return setError(res.error)
    setJustAdded(res.child.full_name)
    setName(''); setGrade('')
    onCreated?.(res.child)
    setTimeout(() => setJustAdded(''), 4000)
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {justAdded && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '11px 14px', background: '#F5F5F5', borderRadius: '11px', border: '1px solid #E2E8F0' }}>
          <span style={{ fontSize: '16px', flexShrink: 0 }}>✅</span>
          <p style={{ fontSize: '13px', color: TEXT, margin: 0, fontWeight: '600', lineHeight: '1.5' }}>{justAdded} added — pick their name to see their lessons.</p>
        </div>
      )}
      <div>
        <label style={lbl}>Child's name</label>
        <input style={inp} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ama Mensah"
          onFocus={e => e.target.style.borderColor = BLUE} onBlur={e => e.target.style.borderColor = GREY_LIGHT} />
      </div>
      <div>
        <label style={lbl}>Grade / level <span style={{ fontWeight: '500', textTransform: 'none', letterSpacing: 0, color: TEXT_MUTED }}>(optional)</span></label>
        <input style={inp} value={grade} onChange={e => setGrade(e.target.value)} placeholder="e.g. JHS 2, Primary 5, SHS 1"
          onFocus={e => e.target.style.borderColor = BLUE} onBlur={e => e.target.style.borderColor = GREY_LIGHT} />
      </div>
      {error && <div style={{ background: '#F5F5F5', color: '#DC2626', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', border: '1px solid #E2E8F0' }}>{error}</div>}
      <button type="submit" disabled={busy}
        style={{ padding: '13px', background: busy ? GREY_BG : GRADIENT_BLUE, color: busy ? TEXT_MUTED : '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '800', cursor: busy ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: busy ? 'none' : SHADOW_BLUE }}>
        {busy ? '⏳ Adding…' : '✨ Add child'}
      </button>
    </form>
  )
}
