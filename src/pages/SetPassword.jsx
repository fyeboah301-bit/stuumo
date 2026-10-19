import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Logo from '../components/Logo'

const inp = { width: '100%', padding: '12px 16px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '15px', color: '#0B0B0B', background: '#fff', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }
const lbl = { fontSize: '13px', fontWeight: '600', color: '#0B0B0B', display: 'block', marginBottom: '6px' }

export default function SetPassword() {
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) return setError('Password must be at least 6 characters')
    if (password !== confirm) return setError('Passwords do not match')
    setLoading(true)
    const { error: upErr } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (upErr) return setError(upErr.message)
    setDone(true)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', fontFamily: 'Tahoma, Geneva, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <Logo variant="yellow" height={32} />
        </div>
        <div style={{ background: '#fff', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #E2E8F0' }}>
          {done ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '1rem' }}>✅</div>
              <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0B0B0B', marginBottom: '0.75rem' }}>Password set!</h1>
              <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '1.5rem', lineHeight: '1.6' }}>You are now signed in to your Stuumo account.</p>
              <button onClick={() => navigate('/dashboard')} style={{ width: '100%', padding: '14px', background: '#6D28D9', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>Go to dashboard</button>
            </div>
          ) : !ready ? (
            <div style={{ textAlign: 'center' }}>
              <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#0B0B0B', marginBottom: '0.75rem' }}>Set your password</h1>
              <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6' }}>
                Open this page from the link we emailed you. If you have not received it yet, go to the{' '}
                <Link to="/login" style={{ color: '#6D28D9', fontWeight: '700', textDecoration: 'none' }}>login page</Link>{' '}
                and choose the "Set or reset your password" option.
              </p>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#0B0B0B', marginBottom: '0.5rem' }}>Set your password</h1>
              <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '1.25rem' }}>Choose a password for your Stuumo account.</p>
              {error && <div style={{ background: '#F5F5F5', color: '#DC2626', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '1rem', border: '1px solid #E2E8F0' }}>{error}</div>}
              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={lbl}>New password *</label>
                  <input type="password" style={inp} placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                </div>
                <div>
                  <label style={lbl}>Confirm password *</label>
                  <input type="password" style={inp} placeholder="Repeat your password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
                </div>
                <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: loading ? '#E2E8F0' : '#6D28D9', color: loading ? '#9CA3AF' : '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>{loading ? 'Saving...' : 'Set password'}</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
