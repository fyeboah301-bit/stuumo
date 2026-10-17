import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { BLUE, YELLOW, DARK_BLUE, TRANSITION } from '../styles/colors'
import NotificationBell from './NotificationBell'
import Logo from './Logo'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 900)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

export default function NavBar() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const isMobile = useIsMobile()
  const drawerRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
    setMenuOpen(false)
  }

  const isActive = (path) => location.pathname === path

  const mobileLinkStyle = (path) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 16px',
    fontSize: '15px',
    color: isActive(path) ? YELLOW : '#0B0B0B',
    textDecoration: 'none',
    fontWeight: isActive(path) ? '700' : '400',
    borderRadius: '10px',
    background: isActive(path) ? 'rgba(109,40,217,0.08)' : 'transparent',
    transition: TRANSITION,
    margin: '1px 0',
  })

  const teacherLinks = [
    { to: '/sessions',         label: 'Live sessions',     icon: '🎥' },
    { to: '/booking-requests', label: 'Booking Requests',  icon: '📋' },
    { to: '/messages',         label: 'Messages',          icon: '💬' },
    { to: '/assignments',      label: 'Assignments',       icon: '📝' },
    { to: '/certificates',     label: 'Certificates',      icon: '📄' },
    { to: '/referrals',        label: 'Refer & Earn',      icon: '🎁' },
    { to: '/dashboard',        label: 'Dashboard',         icon: '👤' },
  ]

  const learnerLinks = [
    { to: '/teachers',     label: 'Find teachers',   icon: '🔍' },
    { to: '/sessions',     label: 'Live sessions',   icon: '🎥' },
    { to: '/booking',      label: 'Book a session',  icon: '📅' },
    { to: '/messages',     label: 'Messages',        icon: '💬' },
    { to: '/assignments',  label: 'Assignments',     icon: '📝' },
    { to: '/certificates', label: 'Certificates',    icon: '📄' },
    { to: '/referrals',    label: 'Refer & Earn',    icon: '🎁' },
    ...(profile?.role === 'parent' ? [{ to: '/progress', label: 'Progress', icon: '📈' }] : []),
    { to: '/dashboard',    label: 'Dashboard',       icon: '👤' },
  ]

  const mobileLinks = profile?.role === 'teacher' ? teacherLinks : learnerLinks
  const isTeacher = profile?.role === 'teacher'

  return (
    <>
      <nav style={{
        background: scrolled
          ? 'rgba(255,255,255,0.97)'
          : '#FFFFFF',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        padding: isMobile ? '0.75rem 1rem' : '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 200,
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.15)' : 'none',
        transition: 'box-shadow 0.3s ease, background 0.3s ease',
        borderBottom: '1px solid #E2E8F0',
        paddingLeft: isMobile ? '1rem' : '0',
        paddingRight: isMobile ? '1rem' : '0',
      }}>

        {/* LOGO */}
        <Link to="/dashboard" style={{ padding: isMobile ? '0' : '0.75rem 2rem', flexShrink: 0, display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <Logo variant="yellow" height={isMobile ? 30 : 34} />
        </Link>

        {/* DESKTOP NAV */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, paddingRight: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1, justifyContent: 'center' }}>
              {isTeacher ? (
                <>
                  <NavLink to="/sessions"         label="Live sessions"    isActive={isActive('/sessions')} />
                  <NavLink to="/booking-requests" label="Bookings"         isActive={isActive('/booking-requests')} />
                  <NavLink to="/messages"         label="Messages"         isActive={isActive('/messages')} />
                  <NavLink to="/assignments"      label="Assignments"      isActive={isActive('/assignments')} />
                  <NavLink to="/certificates"     label="Certificates"     isActive={isActive('/certificates')} />
                  <NavLink to="/referrals"        label="Refer & Earn"     isActive={isActive('/referrals')} />
                </>
              ) : (
                <>
                  <NavLink to="/teachers"    label="Find teachers"  isActive={isActive('/teachers')} />
                  <NavLink to="/sessions"    label="Live sessions"  isActive={isActive('/sessions')} />
                  <NavLink to="/booking"     label="Book a session" isActive={isActive('/booking')} />
                  <NavLink to="/messages"    label="Messages"       isActive={isActive('/messages')} />
                  <NavLink to="/assignments" label="Assignments"    isActive={isActive('/assignments')} />
                  <NavLink to="/referrals"   label="Refer & Earn"   isActive={isActive('/referrals')} />
                  {profile?.role === 'parent' && <NavLink to="/progress" label="Progress" isActive={isActive('/progress')} />}
                </>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <NotificationBell />

              <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', padding: '6px 10px', borderRadius: '50px', background: isActive('/dashboard') ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.1)', transition: TRANSITION }}>
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #E2E8F0', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', color: '#FFFFFF', flexShrink: 0 }}>
                    {profile?.full_name?.charAt(0)}
                  </div>
                )}
                <span style={{ fontSize: '13px', color: '#0B0B0B', fontWeight: '600', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {profile?.full_name?.split(' ')[0]}
                </span>
              </Link>

              <button
                onClick={handleSignOut}
                style={{ padding: '7px 16px', border: '1px solid rgba(0,0,0,0.15)', color: '#6B7280', background: 'transparent', borderRadius: '50px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500', transition: TRANSITION }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = '#0B0B0B' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6B7280' }}
              >
                Log out
              </button>
            </div>
          </div>
        )}

        {/* MOBILE RIGHT */}
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <NotificationBell />
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #E2E8F0' }} />
            ) : (
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '800', color: '#FFFFFF' }}>
                {profile?.full_name?.charAt(0)}
              </div>
            )}
            <button
              onClick={() => setMenuOpen(o => !o)}
              style={{ background: menuOpen ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.12)', borderRadius: '8px', cursor: 'pointer', padding: '7px 9px', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center', justifyContent: 'center', transition: TRANSITION }}
              aria-label="Menu"
            >
              <div style={{ width: '18px', height: '2px', background: '#6B7280', borderRadius: '2px', transform: menuOpen ? 'rotate(45deg) translate(0px, 6px)' : 'none', transition: 'all 0.2s ease' }} />
              <div style={{ width: '18px', height: '2px', background: '#6B7280', borderRadius: '2px', opacity: menuOpen ? 0 : 1, transition: 'all 0.2s ease' }} />
              <div style={{ width: '18px', height: '2px', background: '#6B7280', borderRadius: '2px', transform: menuOpen ? 'rotate(-45deg) translate(0px, -6px)' : 'none', transition: 'all 0.2s ease' }} />
            </button>
          </div>
        )}
      </nav>

      {/* MOBILE DRAWER */}
      {isMobile && (
        <div
          ref={drawerRef}
          style={{
            position: 'fixed',
            top: '60px',
            left: 0,
            right: 0,
            bottom: menuOpen ? 0 : '100vh',
            zIndex: 199,
            pointerEvents: menuOpen ? 'all' : 'none',
          }}
        >
          <div
            onClick={() => setMenuOpen(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', opacity: menuOpen ? 1 : 0, transition: 'opacity 0.25s ease' }}
          />

          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            background: '#FFFFFF',
            borderRadius: '0 0 20px 20px',
            padding: '1rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            transform: menuOpen ? 'translateY(0)' : 'translateY(-20px)',
            opacity: menuOpen ? 1 : 0,
            transition: 'transform 0.25s ease, opacity 0.25s ease',
            maxHeight: '85vh',
            overflowY: 'auto',
          }}>

            {/* USER INFO */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(0,0,0,0.08)', borderRadius: '12px', marginBottom: '12px', border: '1px solid rgba(0,0,0,0.1)' }}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #E2E8F0', flexShrink: 0 }} />
              ) : (
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '800', color: '#FFFFFF', flexShrink: 0 }}>
                  {profile?.full_name?.charAt(0)}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#0B0B0B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.full_name}</div>
                <div style={{ fontSize: '12px', color: 'rgba(0,0,0,0.6)', textTransform: 'capitalize', marginTop: '2px' }}>{profile?.role}</div>
              </div>
            </div>

            {/* LINKS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '12px' }}>
              {mobileLinks.map(({ to, label, icon }) => (
                <Link key={to} to={to} style={mobileLinkStyle(to)} onClick={() => setMenuOpen(false)}>
                  <span style={{ fontSize: '18px', flexShrink: 0 }}>{icon}</span>
                  <span>{label}</span>
                  {isActive(to) && <span style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: YELLOW, flexShrink: 0 }} />}
                </Link>
              ))}
            </div>

            <button
              onClick={handleSignOut}
              style={{ width: '100%', padding: '13px', background: 'rgba(0,0,0,0.08)', color: 'rgba(0,0,0,0.8)', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '12px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '600', transition: TRANSITION }}
            >
              Log out
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function NavLink({ to, label, isActive }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link
      to={to}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontSize: '13.5px',
        color: isActive ? '#6D28D9' : hovered ? '#0B0B0B' : '#6B7280',
        textDecoration: 'none',
        fontWeight: isActive ? '700' : '400',
        padding: '1.1rem 14px',
        borderBottom: isActive ? `3px solid ${YELLOW}` : hovered ? '3px solid rgba(0,0,0,0.12)' : '3px solid transparent',
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
        letterSpacing: '0.01em',
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      {label}
    </Link>
  )
}