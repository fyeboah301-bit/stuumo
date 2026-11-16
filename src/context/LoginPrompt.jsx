import { createContext, useContext, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Logo from '../components/Logo'

const Ctx = createContext(() => {})
export const useLoginPrompt = () => useContext(Ctx)

// Wrap the app so any component can call promptLogin('...') to ask a guest
// to log in / sign up instead of silently doing nothing.
export function LoginPromptProvider({ children }) {
  const [open, setOpen] = useState(false)
  const [msg, setMsg] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  const promptLogin = (message) => {
    setMsg(message || 'Log in or create a free account to continue.')
    setOpen(true)
  }

  const go = (path) => {
    const next = encodeURIComponent(location.pathname + location.search)
    setOpen(false)
    navigate(`${path}?next=${next}`)
  }

  return (
    <Ctx.Provider value={promptLogin}>
      {children}
      {open && (
        <div onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(11,11,11,0.55)', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: '20px', padding: '30px 26px', maxWidth: '360px', width: '100%', textAlign: 'center', boxShadow: '0 24px 60px rgba(0,0,0,0.35)', fontFamily: 'Tahoma, Geneva, sans-serif' }}>
            <div style={{ marginBottom: '16px' }}><Logo variant="yellow" height={30} /></div>
            <h3 style={{ fontSize: '19px', fontWeight: '700', color: '#0B0B0B', margin: '0 0 8px', letterSpacing: '-0.01em' }}>Join Stuumo to continue</h3>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 22px', lineHeight: 1.6 }}>{msg}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={() => go('/register')}
                style={{ padding: '14px', background: 'linear-gradient(135deg,#6D28D9,#5B21B6)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 6px 18px rgba(109,40,217,0.28)' }}>Sign up free</button>
              <button onClick={() => go('/login')}
                style={{ padding: '13px', background: '#fff', color: '#6D28D9', border: '2px solid #6D28D9', borderRadius: '12px', fontSize: '15px', fontWeight: '800', cursor: 'pointer', fontFamily: 'inherit' }}>Log in</button>
              <button onClick={() => setOpen(false)}
                style={{ padding: '8px', background: 'none', color: '#9CA3AF', border: 'none', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Maybe later</button>
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  )
}
