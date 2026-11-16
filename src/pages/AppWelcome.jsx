import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import { GRADIENT_HERO } from '../styles/colors'

// App-only landing shown at "/" when no one is logged in.
export default function AppWelcome() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: GRADIENT_HERO, fontFamily: 'Tahoma, Geneva, sans-serif', paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
        <Logo variant="yellow" height={46} />
        <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#0B0B0B', margin: '1.6rem 0 0.6rem', letterSpacing: '-0.02em', lineHeight: 1.2 }}>Learn with verified teachers</h1>
        <p style={{ fontSize: '15px', color: 'rgba(0,0,0,0.7)', margin: 0, maxWidth: '300px', lineHeight: 1.6 }}>Book trusted tutors, join live classes and track progress — all in one place.</p>
      </div>
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button onClick={() => navigate('/login')} style={{ padding: '15px', background: '#6D28D9', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: '800', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 6px 18px rgba(109,40,217,0.3)' }}>Log in</button>
        <button onClick={() => navigate('/register')} style={{ padding: '15px', background: '#fff', color: '#6D28D9', border: '2px solid #6D28D9', borderRadius: '14px', fontSize: '16px', fontWeight: '800', cursor: 'pointer', fontFamily: 'inherit' }}>Create account</button>
      </div>
    </div>
  )
}
