import { useState, useEffect } from 'react'
import Logo from '../components/Logo'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  BLUE, YELLOW, DARK_BLUE, LIGHT_BLUE, GREY_BG, GREY_LIGHT,
  TEXT, TEXT_MUTED, GRADIENT_BLUE, GRADIENT_HERO,
  SHADOW_LG, SHADOW_XL, SHADOW_BLUE, SHADOW_YELLOW,
  TRANSITION, BORDER,
} from '../styles/colors'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import heroImg from '../assets/images/hero.png'
import usePageMeta from '../hooks/usePageMeta'

const toMin = (t) => { const [h, m] = t.slice(0, 5).split(':').map(Number); return h * 60 + m }

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 769)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState(null)
  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate) - new Date()
      if (diff <= 0) { setTimeLeft(null); return }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }
    calc()
    const interval = setInterval(calc, 1000)
    return () => clearInterval(interval)
  }, [targetDate])
  return timeLeft
}

function Countdown({ targetDate }) {
  const t = useCountdown(targetDate)
  if (!t) return (
    <span style={{ fontSize: '12px', background: '#F5F5F5', color: '#0B0B0B', padding: '4px 12px', borderRadius: '50px', fontWeight: '800' }}>
      🟢 Starting soon
    </span>
  )
  const pad = n => String(n).padStart(2, '0')
  const units = t.days > 0
    ? [['D', t.days], ['H', t.hours], ['M', t.minutes]]
    : [['H', t.hours], ['M', t.minutes], ['S', t.seconds]]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '11px', color: TEXT_MUTED, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Starts in</span>
      <div style={{ display: 'flex', gap: '4px' }}>
        {units.map(([label, val]) => (
          <div key={label} style={{ background: '#F5F5F5', borderRadius: '8px', padding: '5px 8px', textAlign: 'center', minWidth: '38px', boxShadow: SHADOW_BLUE }}>
            <div style={{ fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: '15px', fontWeight: '700', color: '#0B0B0B', lineHeight: 1 }}>{pad(val)}</div>
            <div style={{ fontSize: '8px', color: 'rgba(0,0,0,0.7)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px', marginTop: '2px' }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SpotsMeter({ spotsLeft, maxSpots }) {
  const pct = Math.max(0, Math.min(100, (spotsLeft / maxSpots) * 100))
  const color = spotsLeft === 0 ? '#6B7280' : spotsLeft <= 3 ? '#0B0B0B' : '#6D28D9'
  const bg = spotsLeft === 0 ? '#F5F5F5' : spotsLeft <= 3 ? '#F5F5F5' : '#F5F5F5'
  const textColor = spotsLeft === 0 ? '#6B7280' : spotsLeft <= 3 ? '#0B0B0B' : '#0B0B0B'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: textColor, fontWeight: '700', background: bg, padding: '2px 9px', borderRadius: '50px' }}>
          {spotsLeft === 0 ? 'Full' : `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`}
        </span>
        <span style={{ fontSize: '11px', color: TEXT_MUTED, fontWeight: '500' }}>{maxSpots} max</span>
      </div>
      <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '50px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '50px', transition: 'width 0.4s ease' }} />
      </div>
    </div>
  )
}

export default function LiveSessions() {
  usePageMeta('Live Sessions', 'Join live online classes with verified teachers from anywhere.')

  const { user, profile } = useAuth()
  const isMobile = useIsMobile()
  const [sessions, setSessions] = useState([])
  const [myEnrollments, setMyEnrollments] = useState({})
  const [enrollmentCounts, setEnrollmentCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [enrolling, setEnrolling] = useState(null)
  const [message, setMessage] = useState('')
  const [tab, setTab] = useState('upcoming')
  const [search, setSearch] = useState('')
  const [filterSubject, setFilterSubject] = useState('')
  const [filterPrice, setFilterPrice] = useState('all')
  const [form, setForm] = useState({ title: '', subject: '', session_date: '', start_time: '', end_time: '', max_spots: 20, price: 0 })

  useEffect(() => { fetchSessions(); if (user) fetchMyEnrollments() }, [user])

  const fetchSessions = async () => {
    let query = supabase
      .from('live_sessions')
      .select(`*, teachers (id, hourly_rate, profiles (full_name, avatar_url), reviews (rating))`)
      .is('deleted_at', null)
      .order('session_date', { ascending: true })
    if (profile?.role === 'teacher' && user) query = query.eq('teacher_id', user.id)
    const { data, error } = await query
    if (!error && data) {
      setSessions(data)
      if (data.length > 0) {
        const { data: enrollData } = await supabase.from('enrollments').select('session_id').in('session_id', data.map(s => s.id))
        const counts = {}
        enrollData?.forEach(e => { counts[e.session_id] = (counts[e.session_id] || 0) + 1 })
        setEnrollmentCounts(counts)
      }
    }
    setLoading(false)
  }

  const fetchMyEnrollments = async () => {
    const { data } = await supabase.from('enrollments').select('session_id, payment_status').eq('user_id', user.id)
    const map = {}
    data?.forEach(e => { map[e.session_id] = e.payment_status })
    setMyEnrollments(map)
  }

  const createSession = async (e) => {
    e.preventDefault()
    try {
      const start = toMin(form.start_time), end = toMin(form.end_time)
      if (end <= start) { setMessage('End time must be after the start time.'); window.scrollTo({ top: 0, behavior: 'smooth' }); return }

      // A teacher can't be in two places at once — check both his live sessions
      // and his private bookings on that date for an overlap.
      const [{ data: liveSame }, { data: bookingsSame }] = await Promise.all([
        supabase.from('live_sessions').select('title, start_time, end_time').eq('teacher_id', user.id).eq('session_date', form.session_date).is('deleted_at', null),
        supabase.from('bookings').select('start_time, profiles:client_id (full_name)').eq('teacher_id', user.id).eq('session_date', form.session_date).in('status', ['pending', 'confirmed']),
      ])
      const liveConflict = (liveSame || []).find(s => start < toMin(s.end_time) && toMin(s.start_time) < end)
      if (liveConflict) { setMessage(`You cannot hold this session at this time — it clashes with your live session "${liveConflict.title}".`); window.scrollTo({ top: 0, behavior: 'smooth' }); return }
      const bookingConflict = (bookingsSame || []).find(b => { const bs = toMin(b.start_time); return start < bs + 60 && bs < end })
      if (bookingConflict) { setMessage(`You cannot hold this session at this time — you have a Private Session with ${bookingConflict.profiles?.full_name || 'a learner'}.`); window.scrollTo({ top: 0, behavior: 'smooth' }); return }

      const roomId = 'stuumo-session-' + user.id.slice(0, 8) + '-' + Date.now()
      const { error } = await supabase.from('live_sessions').insert({
        ...form, teacher_id: user.id,
        max_spots: parseInt(form.max_spots), price: parseFloat(form.price) || 0, room_id: roomId
      })
      if (error) throw error
      setMessage('✅ Session created successfully!')
      setShowForm(false)
      setForm({ title: '', subject: '', session_date: '', start_time: '', end_time: '', max_spots: 20, price: 0 })
      fetchSessions()
    } catch (err) {
      setMessage(err?.message?.includes('schedule_conflict') ? 'You already have a session booked at this time. Please pick another slot.' : 'Error: ' + err.message)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const finalizeEnrollment = async (session, reference) => {
    try {
      // Enrollment (and any payment) is verified and recorded server-side.
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { type: 'enrollment', session_id: session.id, reference: reference || null },
      })
      if (error || !data?.ok) {
        let detail = data?.error || ''
        try { if (error?.context?.json) { const b = await error.context.json(); detail = b?.error || detail } } catch (e) {}
        console.log('Enrollment verification failed', error || data, detail)
        setMessage(detail ? ('Enrollment failed: ' + detail) : 'We couldn\'t confirm your enrollment. If you were charged, contact support.')
        return
      }
      setMessage('✅ Enrolled successfully!')
      fetchSessions(); fetchMyEnrollments()
    } catch (err) { setMessage('Error: ' + err.message) }
    finally { setEnrolling(null) }
  }

  const enroll = async (session) => {
    if (!user) return setMessage('Please log in to enroll.')
    if (myEnrollments[session.id]) return setMessage('You are already enrolled.')
    setEnrolling(session.id)
    try {
      if (!session.price || session.price <= 0) {
        await finalizeEnrollment(session, null); return
      }
      if (!window.PaystackPop) {
        setMessage('Payment system not available. Please refresh and try again.')
        setEnrolling(null); return
      }
      const handler = window.PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email: user.email,
        amount: session.price * 100,
        currency: 'GHS',
        ref: 'TM-SESS-' + Date.now() + '-' + session.id.slice(0, 8),
        callback: r => finalizeEnrollment(session, r.reference),
        onClose: () => setEnrolling(null)
      })
      handler.openIframe()
    } catch (err) {
      setMessage('Error: ' + err.message)
      setEnrolling(null)
    }
  }

  const today = new Date().toISOString().split('T')[0]
  const isTeacher = profile?.role === 'teacher'
  const upcomingSessions = sessions.filter(s => s.session_date >= today)
  const completedSessions = sessions.filter(s => s.session_date < today)
  const baseSessions = tab === 'upcoming' ? upcomingSessions : completedSessions
  const allSubjects = [...new Set(sessions.map(s => s.subject).filter(Boolean))].sort()

  const displayed = baseSessions.filter(s => {
    if (search && !s.title?.toLowerCase().includes(search.toLowerCase()) &&
      !s.subject?.toLowerCase().includes(search.toLowerCase()) &&
      !s.teachers?.profiles?.full_name?.toLowerCase().includes(search.toLowerCase())) return false
    if (filterSubject && s.subject !== filterSubject) return false
    if (filterPrice === 'free' && s.price > 0) return false
    if (filterPrice === 'paid' && (!s.price || s.price <= 0)) return false
    return true
  })

  const myEnrolledSessions = !isTeacher ? sessions.filter(s => myEnrollments[s.id] && s.session_date >= today) : []

  return (
    <div style={{ minHeight: '100vh', background: GREY_BG, fontFamily: 'Tahoma, Geneva, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {user ? <NavBar /> : (
        <nav style={{ background: GRADIENT_HERO, padding: '0.875rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
          <Link to="/" style={{ display: 'inline-block', textDecoration: 'none' }}>
          <Logo variant="yellow" height={30} />
        </Link>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/teachers" style={{ padding: '7px 16px', background: 'rgba(0,0,0,0.1)', color: '#0B0B0B', borderRadius: '50px', fontSize: '13px', textDecoration: 'none', border: '1px solid rgba(0,0,0,0.2)', fontWeight: '600' }}>Teachers</Link>
            <Link to="/login" style={{ padding: '7px 16px', background: YELLOW, color: '#FFFFFF', borderRadius: '50px', fontSize: '13px', textDecoration: 'none', fontWeight: '700', boxShadow: SHADOW_YELLOW }}>Log in</Link>
          </div>
        </nav>
      )}

      {/* HERO */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ position: 'relative', zIndex: 2, padding: isMobile ? '2.5rem 1.25rem' : '3.5rem 2.5rem', maxWidth: '920px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: !isTeacher ? '1.75rem' : 0, flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F5F5F5', border: '1px solid #E2E8F0', color: YELLOW, fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 14px', borderRadius: '50px', marginBottom: '12px' }}>
                🎥 {isTeacher ? 'Teacher dashboard' : `${upcomingSessions.length} upcoming session${upcomingSessions.length !== 1 ? 's' : ''}`}
              </div>
              <h1 style={{ fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: isMobile ? '28px' : '42px', color: '#0B0B0B', marginBottom: '8px', fontWeight: '700', letterSpacing: '-0.02em', lineHeight: '1.15' }}>
                {isTeacher ? 'My Live Sessions' : 'Live Online Sessions'}
              </h1>
              <p style={{ fontSize: isMobile ? '14px' : '16px', color: 'rgba(0,0,0,0.75)', margin: 0, lineHeight: '1.6', maxWidth: '480px' }}>
                {isTeacher ? 'Create and manage your group sessions with enrolled students' : 'Join live classes with verified teachers from anywhere'}
              </p>
            </div>
            {isTeacher && (
              <button onClick={() => setShowForm(!showForm)}
                style={{ padding: isMobile ? '11px 18px' : '13px 24px', background: showForm ? '#F5F5F5' : YELLOW, color: showForm ? '#0B0B0B' : '#fff', border: showForm ? '1px solid #E2E8F0' : 'none', borderRadius: '50px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '800', flexShrink: 0, boxShadow: showForm ? 'none' : SHADOW_YELLOW, transition: TRANSITION }}>
                {showForm ? '✕ Cancel' : '+ Create session'}
              </button>
            )}
          </div>

          {!isTeacher && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '220px', display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '50px', padding: '0 16px', boxShadow: SHADOW_XL }}>
                <span style={{ fontSize: '16px', marginRight: '8px' }}>🔍</span>
                <input
                  style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px', fontFamily: 'inherit', padding: '13px 0', color: TEXT, background: 'transparent' }}
                  placeholder="Search sessions, subjects, teachers..."
                  value={search} onChange={e => setSearch(e.target.value)}
                />
                {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', fontSize: '18px', color: TEXT_MUTED, cursor: 'pointer', padding: 0 }}>×</button>}
              </div>
              <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}
                style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.12)', border: '1px solid rgba(0,0,0,0.25)', borderRadius: '50px', fontSize: '13px', fontFamily: 'inherit', color: '#0B0B0B', cursor: 'pointer', outline: 'none' }}>
                <option value="" style={{ color: '#0B0B0B', background: '#fff' }}>All subjects</option>
                {allSubjects.map(s => <option key={s} value={s} style={{ color: '#0B0B0B', background: '#fff' }}>{s}</option>)}
              </select>
              <select value={filterPrice} onChange={e => setFilterPrice(e.target.value)}
                style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.12)', border: '1px solid rgba(0,0,0,0.25)', borderRadius: '50px', fontSize: '13px', fontFamily: 'inherit', color: '#0B0B0B', cursor: 'pointer', outline: 'none' }}>
                <option value="all" style={{ color: '#0B0B0B', background: '#fff' }}>All prices</option>
                <option value="free" style={{ color: '#0B0B0B', background: '#fff' }}>Free only</option>
                <option value="paid" style={{ color: '#0B0B0B', background: '#fff' }}>Paid only</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '920px', margin: '0 auto', padding: isMobile ? '1.25rem' : '1.75rem 2rem', flex: 1, width: '100%', boxSizing: 'border-box' }}>

        {message && (
          <div style={{ background: message.startsWith('✅') ? '#F5F5F5' : '#F5F5F5', color: message.startsWith('✅') ? '#0B0B0B' : '#DC2626', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
            <span style={{ flex: 1 }}>{message}</span>
            <button onClick={() => setMessage('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'inherit', opacity: 0.6, padding: 0 }}>×</button>
          </div>
        )}

        {showForm && (
          <div style={{ background: '#fff', borderRadius: '20px', border: BORDER, overflow: 'hidden', marginBottom: '1.5rem', boxShadow: SHADOW_XL }}>
            <div style={{ background: '#F5F5F5', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>🎥</div>
              <div>
                <h3 style={{ color: '#0B0B0B', fontSize: '16px', fontWeight: '700', margin: 0 }}>Create a new live session</h3>
                <p style={{ color: 'rgba(0,0,0,0.7)', fontSize: '13px', margin: 0 }}>A Jitsi video call room is auto-created</p>
              </div>
            </div>
            <form onSubmit={createSession} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={lbl}>Session title</label>
                  <input style={inp} placeholder="e.g. Advanced Mathematics — Calculus" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div>
                  <label style={lbl}>Subject</label>
                  <input style={inp} placeholder="e.g. Mathematics" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
                </div>
              </div>
              <div>
                <label style={lbl}>Date</label>
                <input style={inp} type="date" value={form.session_date} onChange={e => setForm({ ...form, session_date: e.target.value })} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={lbl}>Start time</label>
                  <input style={inp} type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} required />
                </div>
                <div>
                  <label style={lbl}>End time</label>
                  <input style={inp} type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={lbl}>Max spots</label>
                  <input style={inp} type="number" min="1" max="100" value={form.max_spots} onChange={e => setForm({ ...form, max_spots: e.target.value })} required />
                </div>
                <div>
                  <label style={lbl}>Price (GH₵) — 0 for free</label>
                  <input style={inp} type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                </div>
              </div>
              <div style={{ background: LIGHT_BLUE, borderRadius: '12px', padding: '12px 16px', fontSize: '13px', color: BLUE, display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid rgba(0,0,0,0.15)' }}>
                <span style={{ fontSize: '18px', flexShrink: 0 }}>🎥</span>
                A Jitsi video call room will be automatically created for this session.
              </div>
              <button type="submit" style={{ padding: '14px', background: YELLOW, color: '#FFFFFF', border: 'none', borderRadius: '50px', fontSize: '15px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '800', boxShadow: SHADOW_YELLOW, transition: TRANSITION }}>
                Create session →
              </button>
            </form>
          </div>
        )}

        {!isTeacher && myEnrolledSessions.length > 0 && (
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: TEXT, margin: 0 }}>My enrolled sessions</h2>
              <span style={{ fontSize: '12px', background: GRADIENT_BLUE, color: '#fff', padding: '2px 10px', borderRadius: '50px', fontWeight: '800', boxShadow: SHADOW_BLUE }}>{myEnrolledSessions.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {myEnrolledSessions.map(session => (
                <div key={session.id} style={{ background: '#fff', borderRadius: '16px', border: '2px solid #6D28D9', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                  <div style={{ background: 'linear-gradient(135deg, #6D28D9 0%, #6D28D9 100%)', borderRadius: '12px', padding: '10px 8px', textAlign: 'center', color: '#fff', minWidth: '50px', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                    <div style={{ fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: '20px', fontWeight: '700', lineHeight: 1 }}>{new Date(session.session_date).getDate()}</div>
                    <div style={{ fontSize: '9px', textTransform: 'uppercase', opacity: 0.85, marginTop: '3px' }}>{new Date(session.session_date).toLocaleString('default', { month: 'short' })}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: TEXT, marginBottom: '3px' }}>{session.title}</div>
                    <div style={{ fontSize: '12px', color: TEXT_MUTED }}>🕐 {session.start_time} – {session.end_time} · 👩‍🏫 {session.teachers?.profiles?.full_name}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
                    <Countdown targetDate={`${session.session_date}T${session.start_time}`} />
                    {session.room_id && (
                      <Link to={`/call/${session.room_id}`} style={{ padding: '9px 18px', background: 'linear-gradient(135deg, #6D28D9 0%, #6D28D9 100%)', color: '#fff', borderRadius: '50px', fontSize: '13px', textDecoration: 'none', fontWeight: '800', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                        🎥 Join
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '4px', marginBottom: '1.25rem', background: '#fff', padding: '4px', borderRadius: '50px', border: BORDER, width: 'fit-content', boxShadow: SHADOW_LG }}>
          {[['upcoming', '📅 Upcoming', upcomingSessions.length], ['completed', '✓ Completed', completedSessions.length]].map(([key, label, count]) => (
            <button key={key} onClick={() => setTab(key)}
              style={{ padding: '9px 22px', border: 'none', borderRadius: '50px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', background: tab === key ? '#6D28D9' : 'transparent', color: tab === key ? '#fff' : TEXT_MUTED, fontWeight: tab === key ? '700' : '400', display: 'flex', alignItems: 'center', gap: '7px', boxShadow: tab === key ? SHADOW_BLUE : 'none', transition: TRANSITION }}>
              {label}
              <span style={{ background: tab === key ? 'rgba(0,0,0,0.25)' : GREY_LIGHT, color: tab === key ? '#fff' : TEXT_MUTED, borderRadius: '50px', padding: '1px 8px', fontSize: '11px', fontWeight: '800' }}>{count}</span>
            </button>
          ))}
        </div>

        {!loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '6px' }}>
            <p style={{ fontSize: '14px', color: TEXT_MUTED, margin: 0 }}>
              <strong style={{ color: TEXT, fontWeight: '700' }}>{displayed.length}</strong> session{displayed.length !== 1 ? 's' : ''} found
              {filterSubject && <span style={{ color: BLUE, fontWeight: '600' }}> · {filterSubject}</span>}
              {filterPrice !== 'all' && <span style={{ color: BLUE, fontWeight: '600' }}> · {filterPrice === 'free' ? 'Free' : 'Paid'}</span>}
            </p>
            {(search || filterSubject || filterPrice !== 'all') && (
              <button onClick={() => { setSearch(''); setFilterSubject(''); setFilterPrice('all') }}
                style={{ fontSize: '12px', color: BLUE, background: LIGHT_BLUE, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700', padding: '4px 12px', borderRadius: '50px' }}>
                Clear filters ×
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: '#fff', borderRadius: '20px', border: BORDER, padding: '1.5rem', display: 'flex', gap: '1rem', animation: 'pulse 1.5s infinite' }}>
                <div style={{ width: '54px', height: '68px', background: GREY_BG, borderRadius: '12px', flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ height: '18px', background: GREY_BG, borderRadius: '6px', width: '55%' }} />
                  <div style={{ height: '13px', background: GREY_BG, borderRadius: '6px', width: '35%' }} />
                  <div style={{ height: '13px', background: GREY_BG, borderRadius: '6px', width: '75%' }} />
                </div>
                <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
              </div>
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#fff', borderRadius: '20px', border: BORDER, boxShadow: SHADOW_LG }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: LIGHT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', margin: '0 auto 1rem' }}>📅</div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: TEXT, marginBottom: '8px' }}>
              {isTeacher ? `No ${tab} sessions` : 'No sessions found'}
            </h3>
            <p style={{ fontSize: '14px', color: TEXT_MUTED, marginBottom: '1.5rem', lineHeight: '1.6' }}>
              {isTeacher ? 'Create a new session to get started.' : 'Try adjusting your search or check back soon.'}
            </p>
            {isTeacher && (
              <button onClick={() => setShowForm(true)}
                style={{ padding: '12px 28px', background: YELLOW, color: '#FFFFFF', border: 'none', borderRadius: '50px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '800', boxShadow: SHADOW_YELLOW }}>
                + Create your first session
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {displayed.map(session => {
              const enrolledCount = enrollmentCounts[session.id] || 0
              const spotsLeft = session.max_spots - enrolledCount
              const isFull = spotsLeft <= 0
              const isEnrolled = !!myEnrollments[session.id]
              const canSeeLink = isTeacher || isEnrolled
              const reviews = session.teachers?.reviews || []
              const avgRating = reviews.length > 0 ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : null
              const isUpcoming = session.session_date >= today
              const isFree = !session.price || session.price <= 0
              const avatar = session.teachers?.profiles?.avatar_url

              return (
                <div key={session.id}
                  style={{ background: '#fff', borderRadius: '20px', border: `1px solid ${isEnrolled ? '#6D28D9' : GREY_LIGHT}`, overflow: 'hidden', boxShadow: isEnrolled ? '0 4px 16px rgba(0,0,0,0.06)' : SHADOW_LG, transition: TRANSITION }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = isEnrolled ? '0 8px 28px rgba(0,0,0,0.07)' : SHADOW_BLUE; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = isEnrolled ? '0 4px 16px rgba(0,0,0,0.06)' : SHADOW_LG; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  {isEnrolled && (
                    <div style={{ background: 'rgba(109,40,217,0.1)', padding: '7px 18px', fontSize: '12px', fontWeight: '800', color: '#6D28D9', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> You're enrolled in this session
                    </div>
                  )}
                  {isFull && !isEnrolled && (
                    <div style={{ background: '#F5F5F5', padding: '7px 18px', fontSize: '12px', fontWeight: '800', color: '#6B7280' }}>
                      This session is full
                    </div>
                  )}

                  <div style={{ padding: '1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                    <div style={{ background: isUpcoming ? 'linear-gradient(135deg, #6D28D9 0%, #6D28D9 100%)' : 'linear-gradient(135deg, #9CA3AF, #6B7280)', borderRadius: '14px', padding: '12px 8px', textAlign: 'center', color: '#fff', minWidth: '58px', flexShrink: 0, boxShadow: isUpcoming ? SHADOW_BLUE : 'none' }}>
                      <div style={{ fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: '24px', fontWeight: '700', lineHeight: 1 }}>{new Date(session.session_date).getDate()}</div>
                      <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.07em', opacity: 0.85, marginTop: '3px' }}>{new Date(session.session_date).toLocaleString('default', { month: 'short' })}</div>
                      <div style={{ fontSize: '9px', opacity: 0.65, marginTop: '2px' }}>{new Date(session.session_date).getFullYear()}</div>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
                        <h4 style={{ fontSize: '17px', fontWeight: '800', color: TEXT, margin: 0, flex: 1, minWidth: 0, lineHeight: '1.3', letterSpacing: '-0.01em' }}>{session.title}</h4>
                        {isFree ? (
                          <span style={{ fontSize: '13px', fontWeight: '800', color: '#0B0B0B', background: '#F5F5F5', padding: '4px 12px', borderRadius: '50px', flexShrink: 0 }}>Free</span>
                        ) : (
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: '20px', fontWeight: '700', color: BLUE, letterSpacing: '-0.01em', lineHeight: 1 }}>GH₵ {session.price}</div>
                            <div style={{ fontSize: '10px', color: TEXT_MUTED, marginTop: '2px' }}>per seat</div>
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px', alignItems: 'center' }}>
                        {session.subject && (
                          <span style={{ fontSize: '12px', background: LIGHT_BLUE, color: BLUE, padding: '3px 11px', borderRadius: '50px', fontWeight: '700' }}>{session.subject}</span>
                        )}
                        {!isTeacher && session.teachers?.profiles?.full_name && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {avatar ? (
                              <img src={avatar} alt="" style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: GRADIENT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800', color: '#fff' }}>
                                {session.teachers.profiles.full_name.charAt(0)}
                              </div>
                            )}
                            <span style={{ fontSize: '13px', color: TEXT_MUTED, fontWeight: '600' }}>{session.teachers.profiles.full_name}</span>
                            {avgRating && <span style={{ fontSize: '12px', color: '#0B0B0B', fontWeight: '700', background: '#F5F5F5', padding: '1px 7px', borderRadius: '50px' }}>⭐ {avgRating}</span>}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '13px', color: TEXT_MUTED, fontWeight: '500' }}>🕐 {session.start_time} – {session.end_time}</span>
                        <span style={{ fontSize: '13px', color: TEXT_MUTED }}>·</span>
                        <span style={{ fontSize: '13px', color: TEXT_MUTED, fontWeight: '500' }}>👥 {enrolledCount}/{session.max_spots} enrolled</span>
                      </div>

                      <div style={{ marginBottom: '14px', maxWidth: '280px' }}>
                        <SpotsMeter spotsLeft={spotsLeft} maxSpots={session.max_spots} />
                      </div>

                      {isUpcoming && (
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <Countdown targetDate={`${session.session_date}T${session.start_time}`} />
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginLeft: 'auto' }}>
                            {canSeeLink && session.room_id && (
                              <Link to={`/call/${session.room_id}`}
                                style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #6D28D9 0%, #6D28D9 100%)', color: '#fff', borderRadius: '50px', fontSize: '13px', fontWeight: '800', textDecoration: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', transition: TRANSITION }}>
                                🎥 Join call
                              </Link>
                            )}
                            {!isTeacher && !isEnrolled && (
                              <button onClick={() => enroll(session)} disabled={isFull || enrolling === session.id}
                                style={{ padding: '10px 20px', background: isFull ? GREY_BG : YELLOW, color: isFull ? TEXT_MUTED : '#fff', border: 'none', borderRadius: '50px', fontSize: '13px', cursor: isFull ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: '800', boxShadow: !isFull ? SHADOW_YELLOW : 'none', transition: TRANSITION }}>
                                {enrolling === session.id ? '⏳ Processing...' : isFull ? 'Session full' : isFree ? '🎓 Enroll free' : `💳 Enroll · GH₵ ${session.price}`}
                              </button>
                            )}
                            {isEnrolled && (
                              <span style={{ fontSize: '13px', color: '#6D28D9', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(109,40,217,0.1)', padding: '10px 16px', borderRadius: '50px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Enrolled</span>
                            )}
                          </div>
                        </div>
                      )}

                      {!isUpcoming && (
                        <span style={{ fontSize: '12px', color: TEXT_MUTED, background: '#F5F5F5', padding: '5px 12px', borderRadius: '50px', fontWeight: '600' }}>✓ Session completed</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!isTeacher && !loading && displayed.length > 0 && (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '1rem 1.25rem', marginTop: '1.25rem', border: BORDER, display: 'flex', gap: '12px', alignItems: 'flex-start', boxShadow: SHADOW_LG }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: LIGHT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>🔒</div>
            <p style={{ fontSize: '13px', color: TEXT_MUTED, margin: 0, lineHeight: '1.7' }}>
              Video call links are only visible to enrolled students. Enroll to access the session link and join the class live.
            </p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

const lbl = { fontSize: '11px', fontWeight: '800', color: TEXT_MUTED, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.07em' }
const inp = { width: '100%', padding: '12px 16px', border: BORDER, borderRadius: '12px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', color: TEXT, background: '#fff', transition: TRANSITION }