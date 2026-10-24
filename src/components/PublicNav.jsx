import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Logo from './Logo'

const SUBJECTS = ['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology', 'ICT', 'French', 'Economics']
const LEVELS = ['Primary', 'JHS', 'SHS', 'University', 'Adult Learning']

const MENU = [
  {
    label: 'Find Teachers', to: '/teachers',
    mega: [
      { heading: 'Browse', items: [
        { label: 'All teachers', to: '/teachers' },
        { label: 'Top-rated teachers', to: '/teachers?sort=rating' },
        { label: 'Newest teachers', to: '/teachers' },
      ] },
      { heading: 'By subject', items: SUBJECTS.map(s => ({ label: s, to: `/teachers?subject=${encodeURIComponent(s)}` })) },
      { heading: 'By level', items: LEVELS.map(l => ({ label: l, to: `/teachers?level=${encodeURIComponent(l)}` })) },
    ],
  },
  {
    label: 'Live Classes', to: '/sessions',
    items: [
      { label: 'All upcoming sessions', to: '/sessions' },
      { label: 'How live classes work', to: '/how-it-works#live' },
      { label: 'Host a class (teachers)', to: '/for-teachers' },
    ],
  },
  {
    label: 'For Parents & Learners', to: '/how-it-works',
    items: [
      { label: 'How it works', to: '/how-it-works' },
      { label: 'Safety & verification', to: '/how-it-works#safety' },
      { label: 'Pricing & payments', to: '/how-it-works#pricing' },
      { label: 'FAQ', to: '/how-it-works#faq' },
    ],
  },
  {
    label: 'For Teachers', to: '/for-teachers',
    items: [
      { label: 'Become a teacher', to: '/register?role=teacher' },
      { label: 'How teaching works', to: '/for-teachers#how' },
      { label: 'Earnings & payouts', to: '/for-teachers#earnings' },
      { label: 'Teacher FAQ', to: '/for-teachers#faq' },
    ],
  },
  {
    label: 'About', to: '/about',
    items: [
      { label: 'About us', to: '/about' },
      { label: 'Why Stuumo', to: '/about#why' },
      { label: 'Testimonials', to: '/#testimonials' },
      { label: 'Contact', to: '/about#contact' },
    ],
  },
]

const PURPLE = '#6D28D9'
const INK = '#0B0B0B'
const MUTED = '#6B7280'
const LINE = '#E2E8F0'

function flatten(tab) {
  if (tab.items) return [{ heading: null, items: tab.items }]
  return tab.mega
}

export default function PublicNav() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900)
  const [openIdx, setOpenIdx] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 900)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  const closeAll = () => { setMobileOpen(false); setExpanded(null); setOpenIdx(null) }

  const tabLink = (active) => ({
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    color: 'rgba(255,255,255,0.92)', fontSize: '14px', fontWeight: '600',
    textDecoration: 'none', padding: '6px 2px', whiteSpace: 'nowrap',
    borderBottom: active ? '2px solid #fff' : '2px solid transparent', transition: 'all 0.15s ease',
  })

  const panelItem = {
    display: 'block', padding: '8px 12px', borderRadius: '8px',
    color: INK, fontSize: '13.5px', fontWeight: '500', textDecoration: 'none', whiteSpace: 'nowrap',
  }

  return (
    <nav style={{ background: PURPLE, padding: isMobile ? 'calc(0.75rem + env(safe-area-inset-top)) calc(1.25rem + env(safe-area-inset-right)) 0.75rem calc(1.25rem + env(safe-area-inset-left))' : '0.75rem 2.5rem', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1240px', margin: '0 auto', width: '100%', gap: '16px' }}>
        <Link to="/" onClick={closeAll} style={{ textDecoration: 'none', flexShrink: 0 }}><Logo variant="blue" height={isMobile ? 28 : 32} /></Link>

        {!isMobile && (
          <div style={{ display: 'flex', gap: '26px', alignItems: 'center' }}>
            {MENU.map((tab, i) => {
              const alignRight = i >= MENU.length - 2
              return (
                <div key={tab.label} style={{ position: 'relative' }}
                  onMouseEnter={() => setOpenIdx(i)} onMouseLeave={() => setOpenIdx(null)}>
                  <Link to={tab.to} onClick={() => setOpenIdx(null)} style={tabLink(openIdx === i)}>
                    {tab.label}
                    <span style={{ fontSize: '9px', opacity: 0.8, transform: openIdx === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>▾</span>
                  </Link>
                  {openIdx === i && (
                    <div style={{ position: 'absolute', top: '100%', [alignRight ? 'right' : 'left']: 0, paddingTop: '12px', zIndex: 200 }}>
                      <div style={{ background: '#fff', borderRadius: '14px', border: `1px solid ${LINE}`, boxShadow: '0 16px 40px rgba(0,0,0,0.14)', padding: '14px', display: 'flex', gap: tab.mega ? '10px' : '0', minWidth: tab.mega ? 'auto' : '220px' }}>
                        {flatten(tab).map((col, ci) => (
                          <div key={ci} style={{ minWidth: tab.mega ? '160px' : 'auto' }}>
                            {col.heading && <div style={{ fontSize: '11px', fontWeight: '800', color: PURPLE, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px 8px' }}>{col.heading}</div>}
                            {col.items.map(it => (
                              <Link key={it.label} to={it.to} onClick={() => setOpenIdx(null)} style={panelItem}
                                onMouseEnter={e => { e.currentTarget.style.background = '#F5F5F5'; e.currentTarget.style.color = PURPLE }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = INK }}>
                                {it.label}
                              </Link>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
          {!isMobile ? (
            <>
              <Link to="/login" style={{ padding: '9px 18px', background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', borderRadius: '50px', fontSize: '13px', textDecoration: 'none', fontWeight: '600', border: '1px solid rgba(255,255,255,0.3)' }}>Log in</Link>
              <Link to="/register" style={{ padding: '9px 18px', background: '#FFFFFF', color: PURPLE, borderRadius: '50px', fontSize: '13px', textDecoration: 'none', fontWeight: '700', boxShadow: '0 4px 14px rgba(0,0,0,0.18)' }}>Sign up free</Link>
            </>
          ) : (
            <button onClick={() => setMobileOpen(o => !o)} aria-label="Menu"
              style={{ width: '42px', height: '42px', borderRadius: '11px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
              {mobileOpen ? (
                <span style={{ color: '#fff', fontSize: '18px', lineHeight: 1 }}>✕</span>
              ) : (
                <>
                  <span style={{ width: '18px', height: '2px', background: '#fff', borderRadius: '2px' }} />
                  <span style={{ width: '18px', height: '2px', background: '#fff', borderRadius: '2px' }} />
                  <span style={{ width: '18px', height: '2px', background: '#fff', borderRadius: '2px' }} />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMobile && mobileOpen && (
        <div style={{ marginTop: '12px', background: '#fff', borderRadius: '14px', border: `1px solid ${LINE}`, padding: '8px', maxHeight: '70vh', overflowY: 'auto' }}>
          {MENU.map((tab, i) => (
            <div key={tab.label} style={{ borderBottom: i < MENU.length - 1 ? `1px solid ${LINE}` : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Link to={tab.to} onClick={closeAll} style={{ flex: 1, padding: '13px 10px', color: INK, fontSize: '15px', fontWeight: '700', textDecoration: 'none' }}>{tab.label}</Link>
                <button onClick={() => setExpanded(expanded === i ? null : i)} aria-label="Expand"
                  style={{ width: '44px', height: '44px', background: 'none', border: 'none', color: MUTED, fontSize: '13px', cursor: 'pointer' }}>
                  {expanded === i ? '▲' : '▼'}
                </button>
              </div>
              {expanded === i && (
                <div style={{ padding: '0 10px 10px' }}>
                  {flatten(tab).map((col, ci) => (
                    <div key={ci}>
                      {col.heading && <div style={{ fontSize: '11px', fontWeight: '800', color: PURPLE, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '8px 8px 4px' }}>{col.heading}</div>}
                      {col.items.map(it => (
                        <Link key={it.label} to={it.to} onClick={closeAll} style={{ display: 'block', padding: '9px 8px', color: MUTED, fontSize: '14px', textDecoration: 'none' }}>{it.label}</Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div style={{ display: 'flex', gap: '8px', padding: '12px 10px 6px' }}>
            <Link to="/login" onClick={closeAll} style={{ flex: 1, textAlign: 'center', padding: '12px', background: '#F5F5F5', color: INK, borderRadius: '50px', fontSize: '14px', textDecoration: 'none', fontWeight: '700', border: `1px solid ${LINE}` }}>Log in</Link>
            <Link to="/register" onClick={closeAll} style={{ flex: 1, textAlign: 'center', padding: '12px', background: PURPLE, color: '#fff', borderRadius: '50px', fontSize: '14px', textDecoration: 'none', fontWeight: '700' }}>Sign up free</Link>
          </div>
        </div>
      )}
    </nav>
  )
}
