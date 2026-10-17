import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { COUNTRIES, CITIES } from '../lib/locations'
import { BLUE, DARK_BLUE, YELLOW, GREY_BG, TEXT_MUTED } from '../styles/colors'

const lbl = { fontSize: '11px', fontWeight: '700', color: TEXT_MUTED, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }
const inp = { width: '100%', padding: '11px 14px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: '#fff', color: '#0B0B0B' }

function SearchableDropdown({ options, value, onChange, placeholder = 'Select...' }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setSearch('') } }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()))

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div onClick={() => { setOpen(o => !o); setSearch('') }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', border: `1.5px solid ${open ? BLUE : '#E2E8F0'}`, borderRadius: '10px', background: '#fff', cursor: 'pointer', fontSize: '14px', color: value ? '#0B0B0B' : '#9CA3AF', userSelect: 'none' }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value || placeholder}</span>
        <span style={{ fontSize: '11px', color: '#9CA3AF', marginLeft: '8px', flexShrink: 0 }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: '10px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 200, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '260px' }}>
          <div style={{ padding: '8px', borderBottom: '1px solid #F5F5F5' }}>
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)} onClick={e => e.stopPropagation()} placeholder="Search..."
              style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', outline: 'none', color: '#0B0B0B', background: '#F5F5F5', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filtered.length === 0
              ? <div style={{ padding: '14px 16px', fontSize: '14px', color: '#9CA3AF', textAlign: 'center' }}>No results</div>
              : filtered.map((o, i) => (
                <div key={i}
                  onMouseDown={() => { onChange(o); setOpen(false); setSearch('') }}
                  style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '14px', color: '#0B0B0B', background: o === value ? '#F5F5F5' : 'transparent', fontWeight: o === value ? '600' : '400', borderBottom: '1px solid #F5F5F5' }}
                  onMouseEnter={e => { if (o !== value) e.currentTarget.style.background = '#F5F5F5' }}
                  onMouseLeave={e => { if (o !== value) e.currentTarget.style.background = 'transparent' }}>
                  {o}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

function FieldTile({ label, value, icon }) {
  return (
    <div style={{ background: GREY_BG, borderRadius: '10px', padding: '12px 14px', border: '1px solid #E2E8F0' }}>
      <div style={{ fontSize: '11px', fontWeight: '700', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span>{icon}</span>{label}
      </div>
      <div style={{ fontSize: '14px', fontWeight: '600', color: '#0B0B0B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value || '—'}</div>
    </div>
  )
}

export default function ProfileEditor() {
  const { user, profile, refreshProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 640)

  const [form, setForm] = useState({ full_name: '', phone: '', country: '', city: '' })

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        country: profile.country || '',
        city: profile.city || '',
      })
    }
  }, [profile])

  const startEdit = () => { setMsg(null); setEditing(true) }

  const cancelEdit = () => {
    setEditing(false)
    setMsg(null)
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        country: profile.country || '',
        city: profile.city || '',
      })
    }
  }

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const onCountryChange = (country) => {
    setForm(f => {
      const cityStillValid = CITIES[country]?.includes(f.city)
      return { ...f, country, city: cityStillValid ? f.city : '' }
    })
  }

  const save = async () => {
    const fullName = form.full_name.trim()
    if (!fullName) { setMsg({ type: 'error', text: 'Please enter your name.' }); return }

    setSaving(true)
    setMsg(null)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: form.phone.trim() || null,
          country: form.country || null,
          city: form.city.trim() || null,
        })
        .eq('id', user.id)

      if (error) throw error

      await refreshProfile()
      setEditing(false)
      setMsg({ type: 'success', text: 'Profile updated.' })
      setTimeout(() => setMsg(null), 3500)
    } catch (err) {
      console.log('Profile update error:', err)
      setMsg({
        type: 'error',
        text: 'Could not save your changes. If this keeps happening, the profiles table may be missing an update policy.',
      })
    } finally {
      setSaving(false)
    }
  }

  const cityOptions = CITIES[form.country] || null

  return (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', marginBottom: '1.25rem' }}>
      <div style={{ background: '#F5F5F5', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '20px' }}>👤</span>
        <h3 style={{ color: '#0B0B0B', fontSize: '15px', fontWeight: '700', margin: 0, flex: 1 }}>Your profile</h3>
        {!editing && (
          <button
            onClick={startEdit}
            style={{ padding: '7px 16px', background: YELLOW, color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Edit
          </button>
        )}
      </div>

      <div style={{ padding: '1.5rem' }}>
        {msg && (
          <div style={{
            background: msg.type === 'success' ? '#F5F5F5' : '#F5F5F5',
            color: msg.type === 'success' ? '#0B0B0B' : '#DC2626',
            padding: '11px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '1rem',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <span>{msg.type === 'success' ? '✅' : '⚠️'}</span>
            <span style={{ flex: 1 }}>{msg.text}</span>
          </div>
        )}

        {!editing ? (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
            <FieldTile label="Full name" value={profile?.full_name} icon="🧑" />
            <FieldTile label="Email" value={profile?.email} icon="✉️" />
            <FieldTile label="Phone" value={profile?.phone} icon="📱" />
            <FieldTile label="Location" value={[profile?.city, profile?.country].filter(Boolean).join(', ')} icon="📍" />
          </div>
        ) : (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={lbl}>Full name</label>
                <input
                  style={inp}
                  value={form.full_name}
                  onChange={e => setField('full_name', e.target.value)}
                  placeholder="Your name"
                  onFocus={e => (e.currentTarget.style.borderColor = BLUE)}
                  onBlur={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
                />
              </div>

              <div>
                <label style={lbl}>Email</label>
                <input
                  style={{ ...inp, background: GREY_BG, color: TEXT_MUTED, cursor: 'not-allowed' }}
                  value={profile?.email || ''}
                  disabled
                  title="Email can't be changed here"
                />
              </div>

              <div>
                <label style={lbl}>Phone</label>
                <input
                  style={inp}
                  value={form.phone}
                  onChange={e => setField('phone', e.target.value)}
                  placeholder="Phone number"
                  onFocus={e => (e.currentTarget.style.borderColor = BLUE)}
                  onBlur={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
                />
              </div>

              <div>
                <label style={lbl}>Country</label>
                <SearchableDropdown
                  options={COUNTRIES}
                  value={form.country}
                  onChange={onCountryChange}
                  placeholder="Select country"
                />
              </div>

              <div>
                <label style={lbl}>City</label>
                {cityOptions ? (
                  <SearchableDropdown
                    options={cityOptions}
                    value={form.city}
                    onChange={val => setField('city', val)}
                    placeholder="Select city"
                  />
                ) : (
                  <input
                    style={inp}
                    value={form.city}
                    onChange={e => setField('city', e.target.value)}
                    placeholder={form.country ? 'Enter your city' : 'Select a country first'}
                    onFocus={e => (e.currentTarget.style.borderColor = BLUE)}
                    onBlur={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
                  />
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '1.25rem', flexWrap: 'wrap' }}>
              <button
                onClick={save}
                disabled={saving}
                style={{ padding: '11px 24px', background: '#6D28D9', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.7 : 1 }}
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              <button
                onClick={cancelEdit}
                disabled={saving}
                style={{ padding: '11px 24px', background: 'transparent', color: TEXT_MUTED, border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit' }}
              >
                Cancel
              </button>
            </div>

            <p style={{ fontSize: '12px', color: TEXT_MUTED, marginTop: '12px', marginBottom: 0 }}>
              To change your photo, use the ✎ badge on your avatar at the top of this page.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}