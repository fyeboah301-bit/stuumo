import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Logo from './Logo'
import { TRANSITION } from '../styles/colors'

const NAV_LINKS = [
  { to: '/teachers', label: 'Browse teachers' },
  { to: '/sessions', label: 'Live sessions' },
  { to: '/about', label: 'About us' },
]

export default function PublicNav() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769)
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 769)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  return (
    <nav style={{ background: '#6D28D9', padding: isMobile ? 'calc(0.875rem + env(safe-area-inset-top)) calc(1.25rem + env(safe-area-inset-right)) 0.7rem calc(1.25rem + env(safe-area-inset-left))' : '1rem 2.5rem', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <Link to="/" style={{ textDecoration: 'none' }}><Logo variant="blue" height={isMobile ? 28 : 32} /></Link>
        {!isMobile && (
          <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
            {NAV_LINKS.map(l => (
              <Link key={l.to} to={l.to} style={{ color: 'rgba(255,255,255,0.92)', fontSize: '14px', textDecoration: 'none', fontWeight: '600', transition: TRANSITION }}>{l.label}</Link>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link to="/login" style={{ padding: isMobile ? '8px 14px' : '9px 20px', background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', borderRadius: '50px', fontSize: '13px', textDecoration: 'none', fontWeight: '600', border: '1px solid rgba(255,255,255,0.3)', transition: TRANSITION }}>Log in</Link>
          <Link to="/register" style={{ padding: isMobile ? '8px 14px' : '9px 20px', background: '#FFFFFF', color: '#6D28D9', borderRadius: '50px', fontSize: '13px', textDecoration: 'none', fontWeight: '700', boxShadow: '0 4px 14px rgba(0,0,0,0.18)', transition: TRANSITION }}>Sign up free</Link>
        </div>
      </div>
      {isMobile && (
        <div style={{ display: 'flex', gap: '16px', marginTop: '12px', justifyContent: 'center', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '2px' }}>
          {NAV_LINKS.map(l => (
            <Link key={l.to} to={l.to} style={{ color: 'rgba(255,255,255,0.92)', fontSize: '13px', textDecoration: 'none', fontWeight: '600', whiteSpace: 'nowrap', flexShrink: 0 }}>{l.label}</Link>
          ))}
        </div>
      )}
    </nav>
  )
}
