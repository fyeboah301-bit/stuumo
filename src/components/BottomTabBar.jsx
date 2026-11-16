import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { isNativeApp } from '../lib/platform'
import { BLUE, TEXT_MUTED } from '../styles/colors'

const TABS = {
  teacher: [
    { to: '/dashboard', label: 'Home', icon: '\uD83C\uDFE0' },
    { to: '/booking-requests', label: 'Requests', icon: '\uD83D\uDCCB' },
    { to: '/sessions', label: 'Sessions', icon: '\uD83C\uDFA5' },
    { to: '/messages', label: 'Messages', icon: '\uD83D\uDCAC' },
    { to: '/referrals', label: 'Earn', icon: '\uD83C\uDF81' },
  ],
  parent: [
    { to: '/progress', label: 'Home', icon: '\uD83C\uDFE0' },
    { to: '/teachers', label: 'Tutors', icon: '\uD83D\uDD0E' },
    { to: '/booking', label: 'Book', icon: '\uD83D\uDCC5' },
    { to: '/sessions', label: 'Sessions', icon: '\uD83C\uDFA5' },
    { to: '/messages', label: 'Messages', icon: '\uD83D\uDCAC' },
  ],
  learner: [
    { to: '/dashboard', label: 'Home', icon: '\uD83C\uDFE0' },
    { to: '/teachers', label: 'Tutors', icon: '\uD83D\uDD0E' },
    { to: '/booking', label: 'Book', icon: '\uD83D\uDCC5' },
    { to: '/sessions', label: 'Sessions', icon: '\uD83C\uDFA5' },
    { to: '/messages', label: 'Messages', icon: '\uD83D\uDCAC' },
  ],
}
const HIDDEN = ['/login', '/register', '/reset-password']

export default function BottomTabBar() {
  const { user, profile } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const path = location.pathname
  const hidden = !isNativeApp() || !user || path === '/' || HIDDEN.includes(path) || path.startsWith('/call/')

  useEffect(() => {
    if (hidden) { document.body.style.paddingBottom = ''; return }
    document.body.style.paddingBottom = 'calc(64px + env(safe-area-inset-bottom))'
    return () => { document.body.style.paddingBottom = '' }
  }, [hidden])

  if (hidden) return null
  const tabs = TABS[profile?.role] || TABS.learner
  const active = (to) => path === to || path.startsWith(to + '/')

  return (
    <nav style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 300, background: '#FFFFFF', borderTop: '1px solid #E2E8F0', display: 'flex', boxShadow: '0 -2px 16px rgba(0,0,0,0.06)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {tabs.map(t => {
        const on = active(t.to)
        return (
          <button key={t.to} onClick={() => navigate(t.to)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '8px 2px 7px' }}>
            <span style={{ fontSize: '20px', opacity: on ? 1 : 0.55, transform: on ? 'translateY(-1px)' : 'none', transition: 'all 0.15s' }}>{t.icon}</span>
            <span style={{ fontSize: '10.5px', fontWeight: on ? '800' : '600', color: on ? BLUE : TEXT_MUTED }}>{t.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
