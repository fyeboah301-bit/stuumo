import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import heroVideo from '../assets/images/hero-video.mp4'
import Footer from '../components/Footer'
import teacherImg from '../assets/images/teacher.png'
import parentImg from '../assets/images/parent.png'
import learnerImg from '../assets/images/learner.png'
import usePageMeta from '../hooks/usePageMeta'
import Logo from '../components/Logo'
import {
  BLUE, YELLOW, DARK_BLUE, LIGHT_BLUE,
  GRADIENT_BLUE, GRADIENT_HERO, GRADIENT_YELLOW,
  SHADOW_LG, SHADOW_XL, SHADOW_BLUE, SHADOW_YELLOW,
  TRANSITION, TEXT, TEXT_MUTED,
  GREY_BG, GREY_LIGHT,
} from '../styles/colors'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 769)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0)
  const started = useRef(false)
  useEffect(() => {
    if (!target || started.current) return
    started.current = true
    const start = performance.now()
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target])
  return value
}

function useSessionCountdown(session) {
  const [timeLeft, setTimeLeft] = useState(null)
  useEffect(() => {
    const calc = () => {
      const diff = new Date(`${session.session_date}T${session.start_time}`) - new Date()
      if (diff <= 0) { setTimeLeft(null); return }
      setTimeLeft({
        days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        total:   diff,
      })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [session.session_date, session.start_time])
  return timeLeft
}

function CountdownLine({ session }) {
  const t = useSessionCountdown(session)
  if (!t) return <span>Starting now</span>
  if (t.days > 0) return <span>Starts in {t.days}d {t.hours}h {t.minutes}m</span>
  if (t.hours > 0) return <span>Starts in {t.hours}h {t.minutes}m</span>
  return <span>Starts in {t.minutes}m {String(t.seconds).padStart(2, '0')}s</span>
}

function SessionCarousel({ sessions, isMobile }) {
  const [current, setCurrent] = useState(0)
  const go = (dir) => setCurrent(c => (c + dir + sessions.length) % sessions.length)

  useEffect(() => {
    if (sessions.length <= 1) return
    const t = setInterval(() => setCurrent(c => (c + 1) % sessions.length), 6000)
    return () => clearInterval(t)
  }, [sessions.length, current])

  const arrow = (dir) => (
    <button onClick={() => go(dir)} aria-label={dir < 0 ? 'Previous session' : 'Next session'}
      style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [dir < 0 ? 'left' : 'right']: isMobile ? '4px' : '-14px', zIndex: 5, width: isMobile ? '40px' : '48px', height: isMobile ? '40px' : '48px', borderRadius: '50%', border: 'none', background: '#fff', color: BLUE, fontSize: '24px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 22px rgba(0,0,0,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, transition: 'all 0.18s' }}
      onMouseEnter={e => { e.currentTarget.style.background = GRADIENT_BLUE; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)' }}
      onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = BLUE; e.currentTarget.style.transform = 'translateY(-50%)' }}
    >{dir < 0 ? '‹' : '›'}</button>
  )

  return (
    <div style={{ position: 'relative', paddingLeft: isMobile ? '1.25rem' : '1.5rem', paddingRight: isMobile ? '1.25rem' : '1.5rem' }}>
      <style>{`@keyframes cardFloat{0%{opacity:0;transform:translateX(42px) scale(0.985)}100%{opacity:1;transform:translateX(0) scale(1)}}@media (prefers-reduced-motion:reduce){.cs-float{animation:none!important}}`}</style>
      <div style={{ position: 'relative' }}>
        <div key={current} className="cs-float" style={{ animation: 'cardFloat 0.6s cubic-bezier(0.22,1,0.36,1)' }}>
          <FeaturedSession session={sessions[current]} isMobile={isMobile} />
        </div>
        {sessions.length > 1 && <>{arrow(-1)}{arrow(1)}</>}
      </div>

      {sessions.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '1.75rem' }}>
          {sessions.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} aria-label={`Go to session ${i + 1}`}
              style={{ width: i === current ? '28px' : '9px', height: '9px', borderRadius: '9999px', border: 'none', cursor: 'pointer', padding: 0, background: i === current ? '#6D28D9' : '#E2E8F0', transition: 'all 0.3s' }} />
          ))}
        </div>
      )}
    </div>
  )
}

function FeaturedSession({ session, isMobile }) {
  const timeLeft  = useSessionCountdown(session)
  const date      = new Date(session.session_date + 'T00:00:00')
  const enrolled  = session.enrolledCount || 0
  const maxSpots  = session.max_spots || 20
  const spotsLeft = maxSpots - enrolled
  const spotsPct  = Math.min(Math.round((enrolled / maxSpots) * 100), 100)
  const isFree    = !session.price || session.price <= 0
  const isWithin48h = timeLeft && timeLeft.total < 48 * 60 * 60 * 1000

  const barColor     = '#6D28D9'
  const spotsMsg     = spotsPct >= 70 ? '🔥 Filling fast' : spotsPct >= 40 ? 'Going fast' : 'Spots available'
  const spotsMsgColor = spotsPct >= 70 ? '#6D28D9' : spotsPct >= 40 ? '#0B0B0B' : '#0B0B0B'

  return (
    <div style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.15)', boxShadow: SHADOW_XL, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '320px 1fr', minHeight: isMobile ? 'auto' : '420px' }}>

      {/* Left — teacher panel */}
      <div style={{ background: 'linear-gradient(160deg, #6D28D9 0%, #5B21B6 100%)', padding: isMobile ? '1.5rem' : '3rem 2.25rem', display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: isMobile ? '14px' : '1.25rem', alignItems: isMobile ? 'center' : 'flex-start' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.18)', border: '1px solid rgba(255,255,255,0.22)', borderRadius: '50px', padding: '4px 12px', order: isMobile ? 2 : 0, flexShrink: 0 }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4ADE80', animation: 'pulse 2s infinite', flexShrink: 0 }} />
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#FFFFFF', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Next up</span>
        </div>
        {session.teachers?.profiles?.avatar_url ? (
          <img src={session.teachers.profiles.avatar_url} alt="" style={{ width: isMobile ? '56px' : '84px', height: isMobile ? '56px' : '84px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.85)', flexShrink: 0 }} />
        ) : (
          <div style={{ width: isMobile ? '56px' : '84px', height: isMobile ? '56px' : '84px', borderRadius: '50%', background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? '22px' : '32px', fontWeight: '800', color: '#FFFFFF', border: '3px solid rgba(255,255,255,0.85)', flexShrink: 0 }}>
            {session.teachers?.profiles?.full_name?.charAt(0)}
          </div>
        )}
        <div style={{ flex: isMobile ? 1 : 'none', minWidth: 0 }}>
          <div style={{ fontSize: isMobile ? '15px' : '17px', fontWeight: '700', color: '#FFFFFF', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {session.teachers?.profiles?.full_name}
          </div>
          {session.avgRating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
              <span style={{ color: '#0B0B0B', fontSize: '13px' }}>⭐</span>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.92)', fontWeight: '600' }}>{session.avgRating}</span>
            </div>
          )}
          {!isMobile && session.teachers?.profiles?.city && (
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginTop: '6px' }}>📍 {session.teachers.profiles.city}</div>
          )}
        </div>
      </div>

      {/* Right — session details */}
      <div style={{ background: '#fff', padding: isMobile ? '1.5rem' : '3rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Badges + title */}
        <div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
            {session.subject && <span style={{ fontSize: '12px', background: 'rgba(109,40,217,0.1)', color: '#6D28D9', padding: '3px 12px', borderRadius: '20px', fontWeight: '700' }}>{session.subject}</span>}
            {isFree && <span style={{ fontSize: '12px', background: '#F5F5F5', color: '#0B0B0B', padding: '3px 12px', borderRadius: '20px', fontWeight: '800' }}>🎓 FREE</span>}
          </div>
          <h3 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', color: TEXT, margin: 0, lineHeight: '1.3', letterSpacing: '-0.01em' }}>{session.title}</h3>
        </div>

        {/* Date + time */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '14px', color: TEXT_MUTED }}>📅 {date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'long' })}</span>
          <span style={{ fontSize: '14px', color: TEXT_MUTED }}>🕐 {session.start_time?.slice(0, 5)} – {session.end_time?.slice(0, 5)}</span>
        </div>

        {/* Countdown */}
        {timeLeft && isWithin48h && (
          <div style={{ background: '#F5F5F5', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>⏱</span>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#0B0B0B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Starting in</div>
              <div style={{ fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: '20px', fontWeight: '700', color: '#0B0B0B' }}>
                {timeLeft.days > 0 && `${timeLeft.days}d `}{String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
              </div>
            </div>
          </div>
        )}

        {/* Spots progress */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '13px', color: TEXT_MUTED }}>{enrolled} enrolled · {spotsLeft} spots left</span>
            <span style={{ fontSize: '12px', fontWeight: '700', color: spotsMsgColor }}>{spotsMsg}</span>
          </div>
          <div style={{ height: '8px', background: '#F5F5F5', borderRadius: '50px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${spotsPct}%`, background: barColor, borderRadius: '50px', transition: 'width 0.6s ease' }} />
          </div>
        </div>

        {/* Price + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: 'auto', paddingTop: '4px' }}>
          <div>
            <div style={{ fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: '26px', fontWeight: '700', color: isFree ? '#0B0B0B' : '#6D28D9' }}>
              {isFree ? 'Free' : `GH₵ ${session.price}`}
            </div>
            <div style={{ fontSize: '11px', color: TEXT_MUTED }}>per person</div>
          </div>
          <Link to="/sessions" style={{ flex: 1, display: 'block', padding: '14px 24px', background: '#6D28D9', color: '#fff', borderRadius: '50px', fontSize: '15px', textDecoration: 'none', fontWeight: '800', textAlign: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.15)', transition: TRANSITION }}>
            {isFree ? '🎓 Enroll free →' : '🎓 Enroll now →'}
          </Link>
        </div>
      </div>
    </div>
  )
}

function SessionCard({ session, isMobile }) {
  const [hovered, setHovered] = useState(false)
  const date      = new Date(session.session_date + 'T00:00:00')
  const diffMs    = new Date(`${session.session_date}T${session.start_time}`) - new Date()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const enrolled  = session.enrolledCount || 0
  const maxSpots  = session.max_spots || 20
  const spotsLeft = maxSpots - enrolled
  const spotsPct  = Math.min(Math.round((enrolled / maxSpots) * 100), 100)
  const isFree    = !session.price || session.price <= 0
  const isWithin24h = diffHours >= 0 && diffHours < 24
  const isWithin48h = diffHours >= 0 && diffHours < 48
  const barColor  = '#6D28D9'

  return (
    <Link to="/sessions"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: '#fff', borderRadius: '18px', border: `1px solid ${hovered ? 'rgba(0,0,0,0.3)' : GREY_LIGHT}`, overflow: 'hidden', boxShadow: hovered ? SHADOW_BLUE : SHADOW_LG, flexShrink: 0, width: isMobile ? '270px' : 'auto', textDecoration: 'none', display: 'flex', flexDirection: 'column', transition: TRANSITION, transform: hovered ? 'translateY(-3px)' : 'translateY(0)' }}
    >
      {/* Header */}
      <div style={{ background: '#F5F5F5', padding: '1rem 1.25rem', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <div style={{ background: 'rgba(0,0,0,0.15)', borderRadius: '10px', padding: '8px 10px', textAlign: 'center', minWidth: '48px', flexShrink: 0 }}>
          <div style={{ fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: '22px', fontWeight: '700', color: '#0B0B0B', lineHeight: 1 }}>{date.getDate()}</div>
          <div style={{ fontSize: '10px', color: 'rgba(0,0,0,0.75)', textTransform: 'uppercase', marginTop: '2px', fontWeight: '600' }}>{date.toLocaleString('default', { month: 'short' })}</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#0B0B0B', lineHeight: '1.35', marginBottom: '6px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{session.title}</div>
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {session.subject && <span style={{ fontSize: '11px', background: YELLOW, color: '#FFFFFF', padding: '2px 9px', borderRadius: '20px', fontWeight: '700' }}>{session.subject}</span>}
            {isFree && <span style={{ fontSize: '11px', background: '#6D28D9', color: '#FFFFFF', padding: '2px 9px', borderRadius: '20px', fontWeight: '800' }}>FREE</span>}
            {!isFree && isWithin48h && <span style={{ fontSize: '11px', background: '#6D28D9', color: '#FFFFFF', padding: '2px 9px', borderRadius: '20px', fontWeight: '700' }}>🔥 Soon</span>}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '1rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {session.teachers?.profiles?.avatar_url ? (
            <img src={session.teachers.profiles.avatar_url} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
          ) : (
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: GRADIENT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: '#fff', flexShrink: 0 }}>{session.teachers?.profiles?.full_name?.charAt(0)}</div>
          )}
          <span style={{ fontSize: '12px', color: TEXT_MUTED, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.teachers?.profiles?.full_name}</span>
          {session.avgRating && <span style={{ fontSize: '11px', color: '#0B0B0B', fontWeight: '700', flexShrink: 0 }}>⭐ {session.avgRating}</span>}
        </div>

        {isWithin24h && (
          <div style={{ background: '#F5F5F5', borderRadius: '8px', padding: '5px 10px', fontSize: '11px', color: '#0B0B0B', fontWeight: '700' }}>
            ⏱ <CountdownLine session={session} />
          </div>
        )}

        <div style={{ fontSize: '12px', color: TEXT_MUTED }}>🕐 {session.start_time?.slice(0, 5)} – {session.end_time?.slice(0, 5)}</div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span style={{ fontSize: '11px', color: TEXT_MUTED }}>{enrolled} enrolled</span>
            <span style={{ fontSize: '11px', fontWeight: '700', color: spotsPct >= 70 ? '#6D28D9' : TEXT_MUTED }}>{spotsLeft} left {spotsPct >= 70 ? '🔥' : ''}</span>
          </div>
          <div style={{ height: '4px', background: '#F5F5F5', borderRadius: '50px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${spotsPct}%`, background: barColor, borderRadius: '50px' }} />
          </div>
        </div>

        <div style={{ fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: '18px', fontWeight: '700', color: isFree ? '#0B0B0B' : BLUE }}>
          {isFree ? 'Free' : `GH₵ ${session.price}`}
        </div>
      </div>

      <div style={{ padding: '9px 1.25rem', borderTop: `1px solid ${GREY_LIGHT}`, background: hovered ? LIGHT_BLUE : GREY_BG, transition: TRANSITION }}>
        <div style={{ fontSize: '13px', fontWeight: '700', color: BLUE }}>
          View & enroll <span style={{ display: 'inline-block', transform: hovered ? 'translateX(3px)' : 'translateX(0)', transition: TRANSITION }}>→</span>
        </div>
      </div>
    </Link>
  )
}

export default function Home() {
  usePageMeta('Find Verified Teachers', 'Connect with verified, certificate-checked teachers worldwide for private online sessions and live group classes.')

  const [sessionCount, setSessionCount]       = useState(0)
  const [teacherCount, setTeacherCount]       = useState(0)
  const [upcomingSessions, setUpcomingSessions] = useState([])
  const isMobile = useIsMobile()
  const animatedTeachers = useCountUp(teacherCount)
  const animatedSessions = useCountUp(sessionCount)

  useEffect(() => {
    const fetchData = async () => {
      const today = new Date().toISOString().split('T')[0]
      const [
        { count: sessions },
        { count: teachers },
        { data: liveSessions },
        { data: enrollData },
      ] = await Promise.all([
        supabase.from('live_sessions').select('*', { count: 'exact', head: true }).gte('session_date', today),
        supabase.from('teachers').select('*', { count: 'exact', head: true }).eq('is_verified', true),
        supabase.from('live_sessions')
          .select('*, teachers (id, profiles (full_name, avatar_url, city), reviews (rating))')
          .gte('session_date', today)
          .is('deleted_at', null)
          .order('session_date', { ascending: true })
          .order('start_time', { ascending: true })
          .limit(7),
        supabase.from('enrollments').select('session_id'),
      ])
      setSessionCount(sessions || 0)
      setTeacherCount(teachers || 0)
      const counts = {}
      ;(enrollData || []).forEach(e => { counts[e.session_id] = (counts[e.session_id] || 0) + 1 })
      setUpcomingSessions((liveSessions || []).map(s => {
        const reviews = s.teachers?.reviews || []
        return {
          ...s,
          enrolledCount: counts[s.id] || 0,
          avgRating: reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : null,
        }
      }))
    }
    fetchData()
  }, [])

  return (
    <div style={{ fontFamily: 'Tahoma, Geneva, sans-serif', background: '#fff', minHeight: '100vh', overflowX: 'clip' }}>

      {/* NAV */}
      <nav style={{ background: '#6D28D9', padding: isMobile ? 'calc(0.875rem + env(safe-area-inset-top)) calc(1.25rem + env(safe-area-inset-right)) 0.875rem calc(1.25rem + env(safe-area-inset-left))' : '1rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
        <Logo variant="blue" height={isMobile ? 28 : 32} />
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link to="/login" style={{ padding: isMobile ? '8px 14px' : '9px 20px', background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', borderRadius: '50px', fontSize: '13px', textDecoration: 'none', fontWeight: '600', border: '1px solid rgba(255,255,255,0.3)', transition: TRANSITION }}>Log in</Link>
          <Link to="/register" style={{ padding: isMobile ? '8px 14px' : '9px 20px', background: '#FFFFFF', color: '#6D28D9', borderRadius: '50px', fontSize: '13px', textDecoration: 'none', fontWeight: '700', boxShadow: '0 4px 14px rgba(0,0,0,0.18)', transition: TRANSITION }}>Sign up free</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: 'relative', minHeight: isMobile ? '100svh' : '680px', display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', overflow: 'hidden' }}>
        <video src={heroVideo} autoPlay muted loop playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: isMobile ? 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.82) 100%)' : 'linear-gradient(100deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.25) 70%, rgba(0,0,0,0) 100%)', zIndex: 1 }} />
        <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: isMobile ? '100%' : '700px', padding: isMobile ? '3rem 1.5rem 3.5rem' : '5rem 5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#F5F5F5', border: '1px solid #E2E8F0', borderRadius: '50px', padding: '5px 14px', marginBottom: '1.5rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: YELLOW, flexShrink: 0, animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: '12px', fontWeight: '700', color: YELLOW, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Verified. Trusted. Effective.</span>
          </div>
          <h1 style={{ fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: isMobile ? '36px' : '58px', fontWeight: '700', color: '#fff', lineHeight: '1.1', marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
            Find the <span style={{ color: YELLOW, fontStyle: 'italic' }}>right teacher</span> for every learner
          </h1>
          <p style={{ fontSize: isMobile ? '15px' : '17px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.75', marginBottom: '2rem', maxWidth: '520px' }}>
            Stuumo connects verified, certificate-checked teachers with parents and learners worldwide — for private online sessions and live group classes.
          </p>
          <div style={{ display: 'flex', gap: '10px', flexDirection: isMobile ? 'column' : 'row', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            {[
              { to: '/register?role=teacher', label: 'Join as a teacher', bg: YELLOW,                       color: BLUE,   shadow: SHADOW_YELLOW },
              { to: '/register?role=learner', label: 'Join as a learner', bg: '#fff',                       color: BLUE,   shadow: '0 4px 16px rgba(0,0,0,0.15)' },
              { to: '/register?role=parent',  label: 'Join as a parent',  bg: 'rgba(255,255,255,0.1)',      color: '#fff', shadow: 'none', border: '1px solid rgba(255,255,255,0.3)' },
            ].map(({ to, label, bg, color, shadow, border }) => (
              <Link key={to} to={to} style={{ padding: isMobile ? '13px 20px' : '14px 28px', background: bg, color, borderRadius: '50px', fontSize: isMobile ? '14px' : '15px', textDecoration: 'none', fontWeight: '700', textAlign: 'center', boxShadow: shadow, border: border || 'none', transition: TRANSITION }}>
                {label}
              </Link>
            ))}
          </div>
          <div style={{ display: 'flex', gap: isMobile ? '1.5rem' : '3rem', paddingTop: '1.75rem', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
            {[
              ['100%', 'ID-verified tutors', null],
              ['24h', 'Avg. verification', null],
              ['Secure', 'Pay after you match', null],
            ].map(([val, label, link]) => {
              const content = (
                <div>
                  <div style={{ fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: isMobile ? '24px' : '32px', fontWeight: '700', color: '#fff', lineHeight: 1, letterSpacing: '-0.02em' }}>{val}</div>
                  <div style={{ fontSize: isMobile ? '11px' : '12px', color: 'rgba(255,255,255,0.6)', marginTop: '4px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                </div>
              )
              return link ? <Link key={label} to={link} style={{ textDecoration: 'none' }}>{content}</Link> : <div key={label}>{content}</div>
            })}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section style={{ padding: isMobile ? '4rem 1.25rem' : '5.5rem 2.5rem', background: '#F5F5F5' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? '2.5rem' : '3.5rem' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', color: '#6D28D9', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>Why Stuumo</p>
            <h2 style={{ fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: isMobile ? '28px' : '40px', fontWeight: '700', color: TEXT, marginBottom: '12px', letterSpacing: '-0.02em' }}>Safe, verified, and on your terms</h2>
            <p style={{ fontSize: isMobile ? '14px' : '16px', color: TEXT_MUTED, maxWidth: '540px', margin: '0 auto', lineHeight: '1.7' }}>Every tutor is checked before they reach your child — and you only pay once you're matched.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: isMobile ? '0.875rem' : '1.25rem' }}>
            {[
              ['ID-verified tutors', 'Every teacher confirms their identity before they can appear in search.',
                <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></>],
              ['Certificates checked', "We review each tutor's certificates within 24\u201348 hours of sign-up.",
                <><circle cx="12" cy="8" r="6"/><polyline points="8.5 13 7 22 12 19 17 22 15.5 13"/></>],
              ['Secure payments', 'Card and mobile-money payments are processed safely through Paystack.',
                <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>],
              ['Pay after you match', "You're only charged once your teacher confirms the booking \u2014 never before.",
                <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>],
            ].map(([title, desc, paths]) => (
              <div key={title} style={{ background: '#fff', border: `1px solid ${GREY_LIGHT}`, borderRadius: '18px', padding: isMobile ? '1.5rem' : '1.75rem', display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: isMobile ? '1rem' : '0', alignItems: isMobile ? 'center' : 'flex-start', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                <div style={{ width: isMobile ? '48px' : '56px', height: isMobile ? '48px' : '56px', borderRadius: '14px', background: 'rgba(109,40,217,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: isMobile ? 0 : '1.25rem' }}>
                  <svg width={isMobile ? 22 : 26} height={isMobile ? 22 : 26} viewBox="0 0 24 24" fill="none" stroke="#6D28D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{paths}</svg>
                </div>
                <div>
                  <h3 style={{ fontSize: isMobile ? '16px' : '17px', fontWeight: '700', color: TEXT, marginBottom: '6px', letterSpacing: '-0.01em' }}>{title}</h3>
                  <p style={{ fontSize: '13.5px', color: TEXT_MUTED, lineHeight: '1.6', margin: 0 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* UPCOMING LIVE SESSIONS */}
      {upcomingSessions.length > 0 && (
        <section style={{ padding: isMobile ? '4rem 0' : '6rem 0', background: '#fff', overflow: 'hidden' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', marginBottom: isMobile ? '1.75rem' : '2rem', flexDirection: isMobile ? 'column' : 'row', gap: '12px', paddingLeft: isMobile ? '1.25rem' : '2.5rem', paddingRight: isMobile ? '1.25rem' : '2.5rem' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: '700', color: BLUE, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>Live & upcoming</p>
                <h2 style={{ fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: isMobile ? '28px' : '40px', fontWeight: '700', color: TEXT, margin: 0, letterSpacing: '-0.02em' }}>Upcoming live sessions</h2>
              </div>
              <Link to="/sessions"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 22px', background: LIGHT_BLUE, color: BLUE, borderRadius: '50px', fontSize: '13px', textDecoration: 'none', fontWeight: '700', border: '1px solid rgba(0,0,0,0.2)', transition: TRANSITION, flexShrink: 0 }}
                onMouseEnter={e => { e.currentTarget.style.background = GRADIENT_BLUE; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.background = LIGHT_BLUE; e.currentTarget.style.color = BLUE }}
              >
                View all sessions →
              </Link>
            </div>

            {/* Auto-rotating carousel */}
            <SessionCarousel sessions={upcomingSessions} isMobile={isMobile} />

          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      <section style={{ padding: isMobile ? '4rem 1.25rem' : '6rem 2.5rem', background: GREY_BG, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '80px', height: '3px', background: GRADIENT_YELLOW, borderRadius: '0 0 4px 4px' }} />
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? '2.5rem' : '4rem' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', color: BLUE, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>Simple process</p>
            <h2 style={{ fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: isMobile ? '28px' : '40px', fontWeight: '700', color: TEXT, marginBottom: '12px', letterSpacing: '-0.02em' }}>How Stuumo works</h2>
            <p style={{ fontSize: isMobile ? '14px' : '16px', color: TEXT_MUTED, maxWidth: '480px', margin: '0 auto', lineHeight: '1.7' }}>From sign-up to first lesson in three simple steps</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? '1rem' : '1.5rem' }}>
            {[
              { num: '1', title: 'Create your profile',  desc: 'Teachers upload certificates and pitch videos. Parents and learners just need basic details to get started.', icon: '✏️' },
              { num: '2', title: 'We verify teachers',   desc: 'Our team checks every certificate within 24–48 hours. Only approved teachers appear in search results.', icon: '🛡️' },
              { num: '3', title: 'Book or enroll',       desc: 'Book a private session with a teacher, or enroll in a live group class — all managed on the platform.', icon: '🎓' },
            ].map(({ num, title, desc, icon }) => (
              <div key={num}
                style={{ background: '#fff', borderRadius: '20px', padding: isMobile ? '1.5rem' : '2rem', border: `1px solid ${GREY_LIGHT}`, boxShadow: SHADOW_LG, display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: isMobile ? '1rem' : '0', alignItems: isMobile ? 'flex-start' : 'flex-start', position: 'relative', overflow: 'hidden', transition: TRANSITION }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = SHADOW_BLUE; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = SHADOW_LG; e.currentTarget.style.borderColor = GREY_LIGHT; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: GRADIENT_YELLOW, borderRadius: '20px 20px 0 0' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: isMobile ? 0 : '1.25rem', flexShrink: 0 }}>
                  <div style={{ width: isMobile ? '44px' : '52px', height: isMobile ? '44px' : '52px', borderRadius: '14px', background: LIGHT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? '20px' : '24px', flexShrink: 0 }}>{icon}</div>
                  <span style={{ fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: '13px', fontWeight: '700', color: '#fff', background: GRADIENT_YELLOW, padding: '3px 10px', borderRadius: '20px' }}>Step {num}</span>
                </div>
                <div>
                  <h3 style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: '700', color: TEXT, marginBottom: '8px', letterSpacing: '-0.01em' }}>{title}</h3>
                  <p style={{ fontSize: isMobile ? '13px' : '15px', color: TEXT_MUTED, lineHeight: '1.7', margin: 0 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: isMobile ? '2rem' : '3rem' }}>
            <Link to="/teachers"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: isMobile ? '13px 28px' : '14px 36px', background: GRADIENT_BLUE, color: '#fff', borderRadius: '50px', fontSize: isMobile ? '14px' : '15px', textDecoration: 'none', fontWeight: '700', boxShadow: SHADOW_BLUE, transition: TRANSITION }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.35)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = SHADOW_BLUE }}
            >
              Browse verified teachers →
            </Link>
          </div>
        </div>
      </section>

      {/* USER TYPES */}
      <section style={{ padding: isMobile ? '4rem 1.25rem' : '6rem 2.5rem', background: '#fff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? '2.5rem' : '4rem' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', color: BLUE, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>Who it's for</p>
            <h2 style={{ fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: isMobile ? '28px' : '40px', fontWeight: '700', color: TEXT, marginBottom: '12px', letterSpacing: '-0.02em' }}>Built for everyone</h2>
            <p style={{ fontSize: isMobile ? '14px' : '16px', color: TEXT_MUTED, maxWidth: '400px', margin: '0 auto', lineHeight: '1.7' }}>Three distinct experiences, one trusted platform</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? '1.25rem' : '1.5rem' }}>
            {[
              { role: 'Teachers', headerBg: GRADIENT_YELLOW,                                          headerColor: '#fff',  img: teacherImg, desc: 'Build your profile and grow your student base',         features: ['Upload certificates for verification', 'Two 30-second pitch videos', 'Schedule live online sessions', 'Receive private session bookings'],      ctaBg: GRADIENT_YELLOW,                                          ctaColor: '#fff' },
              { role: 'Parents',  headerBg: 'linear-gradient(135deg, #4B5563 0%, #6B7280 100%)',    headerColor: '#fff',  img: parentImg,  desc: 'Find trusted, verified teachers for your children',     features: ['Browse verified profiles', 'Watch teaching preview videos', 'Book private sessions for your ward', 'View teacher credentials and reviews'],   ctaBg: 'linear-gradient(135deg, #4B5563 0%, #6B7280 100%)',    ctaColor: '#fff' },
              { role: 'Learners', headerBg: GRADIENT_YELLOW,                                        headerColor: '#fff',    img: learnerImg, desc: 'Take charge of your own education journey',             features: ['Search teachers by subject or level', 'Enroll in live online classes', 'Book private one-on-one sessions', 'Watch teacher pitch videos before booking'], ctaBg: GRADIENT_YELLOW, ctaColor: '#fff' },
            ].map(({ role, headerBg, headerColor, img, desc, features, ctaBg, ctaColor }) => (
              <div key={role}
                style={{ borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: `1px solid ${GREY_LIGHT}`, boxShadow: SHADOW_LG, transition: TRANSITION }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = SHADOW_XL }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = SHADOW_LG }}
              >
                <div style={{ width: '100%', height: isMobile ? '200px' : '260px', overflow: 'hidden' }}>
                  <img src={img} alt={role} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', display: 'block', transition: 'transform 0.5s ease' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                </div>
                <div style={{ background: headerBg, padding: '1.25rem 1.5rem' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', color: headerColor, margin: 0 }}>{role}</h3>
                  <p style={{ fontSize: '13px', color: headerColor, opacity: 0.8, marginTop: '4px', marginBottom: 0, lineHeight: '1.5' }}>{desc}</p>
                </div>
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, margin: 0, padding: 0 }}>
                    {features.map(f => (
                      <li key={f} style={{ fontSize: '14px', color: TEXT_MUTED, display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: LIGHT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: BLUE, fontWeight: '800', flexShrink: 0, marginTop: '1px' }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link to={`/register?role=${role.toLowerCase().slice(0, -1)}`}
                    style={{ display: 'block', marginTop: '1.5rem', padding: '12px 20px', background: ctaBg, color: ctaColor, borderRadius: '50px', fontSize: '14px', textDecoration: 'none', fontWeight: '700', textAlign: 'center', transition: TRANSITION }}>
                    Sign up as a {role.toLowerCase().slice(0, -1)} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{ background: GRADIENT_HERO, padding: isMobile ? '4rem 1.25rem' : '6rem 2.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', border: '1px solid rgba(0,0,0,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', border: '1px solid rgba(0,0,0,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '280px', height: '280px', borderRadius: '50%', border: '1px solid rgba(0,0,0,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px', margin: '0 auto' }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: YELLOW, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px' }}>Get started today</p>
          <h2 style={{ fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: isMobile ? '28px' : '44px', fontWeight: '700', color: '#0B0B0B', marginBottom: '16px', lineHeight: '1.2', letterSpacing: '-0.02em' }}>
            The right teacher is waiting for you
          </h2>
          <p style={{ fontSize: isMobile ? '14px' : '16px', color: 'rgba(0,0,0,0.75)', marginBottom: '2.5rem', lineHeight: '1.7' }}>
            Join thousands of learners worldwide finding verified, trusted teachers on Stuumo.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register"
              style={{ padding: isMobile ? '13px 28px' : '15px 40px', background: YELLOW, color: '#FFFFFF', borderRadius: '50px', fontSize: isMobile ? '14px' : '16px', textDecoration: 'none', fontWeight: '800', boxShadow: SHADOW_YELLOW, transition: TRANSITION }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.23)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = SHADOW_YELLOW }}
            >
              Create a free account →
            </Link>
            <Link to="/teachers"
              style={{ padding: isMobile ? '13px 28px' : '15px 40px', background: 'transparent', color: '#0B0B0B', borderRadius: '50px', fontSize: isMobile ? '14px' : '16px', textDecoration: 'none', fontWeight: '700', border: '1px solid #E2E8F0', transition: TRANSITION }}>
              Browse teachers
            </Link>
          </div>
        </div>
      </section>

      <Footer variant="blue" />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.85); }
        }
      `}</style>
    </div>
  )
}