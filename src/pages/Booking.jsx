import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  BLUE, YELLOW, DARK_BLUE, LIGHT_BLUE, GREY_BG, GREY_LIGHT,
  TEXT, TEXT_MUTED, GRADIENT_BLUE, GRADIENT_HERO,
  SHADOW_LG, SHADOW_XL, SHADOW_BLUE, SHADOW_YELLOW,
  TRANSITION, BORDER,
} from '../styles/colors'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import CreateChildForm from '../components/CreateChildForm'
import usePageMeta from '../hooks/usePageMeta'

const sendEmail = async (payload) => {
  try { await supabase.functions.invoke('send-booking-email', { body: payload }) }
  catch (err) { console.log('Email error:', err) }
}

const MESSAGE_TEMPLATES = [
  'My child needs help preparing for BECE exams.',
  'Looking for weekly after-school sessions.',
  'Need urgent help before upcoming exams.',
  'My child is struggling and needs extra support.',
]

const DAYS_FULL  = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const toMin  = (t) => { const [h, m] = t.slice(0, 5).split(':').map(Number); return h * 60 + m }
const toHHMM = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`
const prettyDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Effective time of a booking (session slot if set, else creation) for ordering
const bookingTime = (b) => b.session_date ? new Date(`${b.session_date}T${b.start_time || '00:00'}`).getTime() : new Date(b.created_at).getTime()

// Is a booking in the past / resolved (vs upcoming / needs attention)?
const isBookingPast = (b) => {
  if (b.status === 'cancelled' || b.status === 'declined' || b.status === 'completed') return true
  if (b.status === 'confirmed') {
    if (b.session_date) return bookingTime(b) + 60 * 60 * 1000 < Date.now()
    const d = new Date(b.created_at); d.setHours(0, 0, 0, 0); const t = new Date(); t.setHours(0, 0, 0, 0); return d < t
  }
  return false // pending always counts as upcoming (needs resolution)
}

// Merge raw status + payment + timing into a single human-readable state
const deriveBookingState = ({ status, isPaid, isFree, amount, past }) => {
  if (status === 'cancelled') return { label: 'Cancelled', bg: '#F5F5F5', color: '#6B7280', muted: true }
  if (status === 'declined')  return { label: 'Not accepted', bg: '#F5F5F5', color: '#6D28D9', muted: true, dead: true }
  if (status === 'pending')   return { label: '⏳ Pending teacher review', bg: '#F5F5F5', color: '#0B0B0B' }
  if (status === 'completed') return { label: '✓ Completed', bg: '#F5F5F5', color: '#6B7280', muted: true }
  if (status === 'confirmed') {
    if (amount > 0 && !isPaid && !isFree) return { label: '💳 Action needed · Pay now', bg: '#F5F5F5', color: '#0B0B0B', urgent: true }
    if (past) return { label: '✓ Completed', bg: '#F5F5F5', color: '#6B7280', muted: true }
    return { label: '✓ Upcoming', bg: '#F5F5F5', color: '#0B0B0B' }
  }
  return { label: status, bg: '#F5F5F5', color: '#6B7280' }
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 769)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

// ── Teacher Card ──────────────────────────────────────────────────────────────
function TeacherCard({ teacher, avg, hasCerts, hasRate, onSelect }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={hasRate ? onSelect : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '14px 18px',
        border: `2px solid ${hovered && hasRate ? BLUE : '#E2E8F0'}`,
        borderRadius: '16px',
        cursor: hasRate ? 'pointer' : 'not-allowed',
        background: hovered && hasRate ? '#F5F5F5' : '#fff',
        transition: TRANSITION,
        boxShadow: hovered && hasRate ? SHADOW_BLUE : '0 1px 4px rgba(0,0,0,0.05)',
        transform: hovered && hasRate ? 'translateY(-2px)' : 'translateY(0)',
        opacity: hasRate ? 1 : 0.6,
      }}
    >
      {/* Avatar */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        {teacher.profiles?.avatar_url ? (
          <img src={teacher.profiles.avatar_url} alt="" style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${teacher.is_verified ? '#6D28D9' : '#E2E8F0'}`, display: 'block' }} />
        ) : (
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: hovered ? GRADIENT_BLUE : '#6D28D9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '800', color: '#fff', border: `3px solid ${teacher.is_verified ? '#6D28D9' : '#E2E8F0'}` }}>
            {teacher.profiles?.full_name?.charAt(0)}
          </div>
        )}
        {teacher.is_verified && (
          <div style={{ position: 'absolute', bottom: 0, right: 0, background: '#6D28D9', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#FFFFFF', fontWeight: '800', border: '2px solid #fff' }}>✓</div>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Name row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
          <span style={{ fontSize: '15px', fontWeight: '800', color: hovered ? BLUE : '#0B0B0B' }}>
            {teacher.profiles?.full_name}
          </span>
          {teacher.is_verified && (
            <span style={{ fontSize: '10px', background: '#F5F5F5', color: '#0B0B0B', padding: '2px 8px', borderRadius: '50px', fontWeight: '800' }}>✓ Verified</span>
          )}
          {hasCerts && (
            <span style={{ fontSize: '10px', background: '#F5F5F5', color: BLUE, padding: '2px 8px', borderRadius: '50px', fontWeight: '800' }}>📋 Certified</span>
          )}
        </div>

        {/* Location */}
        <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '7px' }}>
          📍 {teacher.profiles?.city}, {teacher.profiles?.country}
        </div>

        {/* Subjects */}
        {teacher.subjects?.length > 0 && (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {teacher.subjects.slice(0, 4).map(s => (
              <span key={s} style={{ fontSize: '11px', background: hovered ? '#F5F5F5' : '#F5F5F5', color: hovered ? BLUE : '#6B7280', padding: '3px 9px', borderRadius: '50px', fontWeight: '600' }}>{s}</span>
            ))}
            {teacher.subjects.length > 4 && (
              <span style={{ fontSize: '11px', color: '#9CA3AF', padding: '3px 6px' }}>+{teacher.subjects.length - 4}</span>
            )}
          </div>
        )}
      </div>

      {/* Right — price + rating */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
        {hasRate ? (
          <>
            <div style={{ background: hovered ? '#6D28D9' : '#F5F5F5', color: hovered ? '#FFFFFF' : '#6D28D9', padding: '6px 14px', borderRadius: '50px', fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: '16px', fontWeight: '700', boxShadow: hovered ? SHADOW_YELLOW : 'none', transition: TRANSITION }}>
              GH₵ {teacher.hourly_rate}
            </div>
            {avg ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: '12px', color: parseFloat(avg) >= s ? '#0B0B0B' : '#E2E8F0' }}>★</span>)}
                <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: '600', marginLeft: '3px' }}>{avg}</span>
              </div>
            ) : (
              <span style={{ fontSize: '11px', color: '#9CA3AF' }}>No reviews yet</span>
            )}
            {hovered && (
              <div style={{ fontSize: '12px', fontWeight: '800', color: '#fff', background: GRADIENT_BLUE, padding: '6px 14px', borderRadius: '50px', boxShadow: SHADOW_BLUE }}>
                Select →
              </div>
            )}
          </>
        ) : (
          <div style={{ fontSize: '11px', color: '#6D28D9', fontWeight: '700', background: '#F5F5F5', padding: '4px 12px', borderRadius: '20px' }}>
            Rate not set
          </div>
        )}
      </div>
    </div>
  )
}

// ── Pay Now Banner ────────────────────────────────────────────────────────────
function PayNowBanner({ bookings, userEmail, onSuccess }) {
  const unpaid = bookings.filter(b => b.status === 'confirmed' && b.payment_status !== 'paid' && b.amount > 0)
  if (!unpaid.length) return null
  return (
    <div style={{ marginBottom: '2rem' }}>
      {unpaid.map(booking => (
        <div key={booking.id} style={{ background: GRADIENT_HERO, borderRadius: '20px', overflow: 'hidden', boxShadow: SHADOW_BLUE, marginBottom: '12px', border: `2px solid ${YELLOW}` }}>
          <div style={{ background: YELLOW, padding: '8px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>⚡</span>
            <span style={{ fontSize: '13px', fontWeight: '800', color: BLUE, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Action required — Payment pending</span>
          </div>
          <div style={{ padding: '1.5rem 1.75rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ flexShrink: 0 }}>
              {booking.teachers?.profiles?.avatar_url ? (
                <img src={booking.teachers.profiles.avatar_url} alt="" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${YELLOW}` }} />
              ) : (
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: YELLOW, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: '800', color: '#FFFFFF', border: '3px solid rgba(255,255,255,0.3)' }}>
                  {booking.teachers?.profiles?.full_name?.charAt(0)}
                </div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ fontSize: '11px', color: YELLOW, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                {booking.teachers?.profiles?.full_name} accepted your request
              </div>
              <div style={{ fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: '22px', fontWeight: '700', color: '#0B0B0B', marginBottom: '4px' }}>
                {booking.subject} — Private Session
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(0,0,0,0.65)' }}>
                Pay to unlock your video call room and messaging
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: '36px', fontWeight: '700', color: YELLOW, lineHeight: 1 }}>GH₵ {booking.amount}</div>
                <div style={{ fontSize: '12px', color: 'rgba(0,0,0,0.5)', marginTop: '2px' }}>one session</div>
              </div>
              <PayButton booking={booking} userEmail={userEmail} onSuccess={onSuccess} large />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Booking Confirmation ──────────────────────────────────────────────────────
function BookingConfirmation({ booking, teacher, navigate }) {
  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '2rem 1.25rem' }}>
      <div style={{ background: 'linear-gradient(135deg, #4B5563 0%, #6B7280 100%)', borderRadius: '20px', padding: '2.5rem 2rem', textAlign: 'center', marginBottom: '1.25rem', boxShadow: '0 12px 32px rgba(0,0,0,0.25)' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', margin: '0 auto 1rem' }}>🎉</div>
        <h2 style={{ fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: '26px', fontWeight: '700', color: '#0B0B0B', marginBottom: '8px' }}>Booking request sent!</h2>
        <p style={{ fontSize: '15px', color: 'rgba(0,0,0,0.8)', margin: 0, lineHeight: '1.6' }}>
          Your request has been sent to <strong>{teacher?.profiles?.full_name}</strong>. They'll respond within 24 hours.
        </p>
      </div>

      <div style={{ background: '#fff', borderRadius: '20px', border: BORDER, overflow: 'hidden', marginBottom: '1rem', boxShadow: SHADOW_LG }}>
        <div style={{ background: '#F5F5F5', padding: '1rem 1.5rem' }}>
          <h3 style={{ color: '#0B0B0B', fontSize: '15px', fontWeight: '700', margin: 0 }}>📋 Booking summary</h3>
        </div>
        <div style={{ padding: '1.25rem 1.5rem' }}>
          {[
            ['Teacher',         teacher?.profiles?.full_name],
            ['Subject',         booking?.subject],
            ...(booking?.session_date ? [['Scheduled', `${new Date(booking.session_date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}${booking.start_time ? ` · ${booking.start_time.slice(0, 5)}` : ''}`]] : []),
            ['Sessions',        '1 private session'],
            ['Estimated total', booking?.amount > 0 ? `GH₵ ${booking.amount}` : 'To be confirmed'],
            ['Status',          '⏳ Pending teacher response'],
          ].map(([label, value], i, arr) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: i < arr.length - 1 ? BORDER : 'none' }}>
              <span style={{ fontSize: '13px', color: TEXT_MUTED, fontWeight: '500' }}>{label}</span>
              <span style={{ fontSize: '14px', fontWeight: '700', color: label === 'Status' ? '#0B0B0B' : TEXT }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '20px', border: BORDER, overflow: 'hidden', marginBottom: '1rem', boxShadow: SHADOW_LG }}>
        <div style={{ background: '#F5F5F5', padding: '1rem 1.5rem' }}>
          <h3 style={{ color: '#0B0B0B', fontSize: '15px', fontWeight: '700', margin: 0 }}>⏭ What happens next</h3>
        </div>
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { icon: '🔔', step: '1', title: 'Teacher is notified',    desc: 'They received your request and will respond soon.' },
            { icon: '✅', step: '2', title: 'They accept or decline', desc: "You'll get a notification and email when they respond." },
            { icon: '💳', step: '3', title: 'Pay to confirm',         desc: 'If accepted, a Pay Now button appears to secure your session.' },
            { icon: '🎥', step: '4', title: 'Start your session',     desc: 'Once paid, message your teacher and join the private video call.' },
          ].map(({ icon, step, title, desc }) => (
            <div key={step} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: LIGHT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>{icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: TEXT, marginBottom: '3px' }}>{title}</div>
                <div style={{ fontSize: '13px', color: TEXT_MUTED, lineHeight: '1.6' }}>{desc}</div>
              </div>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: GRADIENT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#fff', fontWeight: '800', flexShrink: 0 }}>{step}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#F5F5F5', borderRadius: '12px', padding: '12px 16px', marginBottom: '1.25rem', fontSize: '13px', color: '#0B0B0B', border: '1px solid #E2E8F0', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
        <span style={{ flexShrink: 0 }}>🔒</span>
        Your contact details are never shared until you choose to. All communication stays on Stuumo.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button onClick={() => navigate('/booking')} style={{ padding: '14px', background: YELLOW, color: '#FFFFFF', border: 'none', borderRadius: '50px', fontSize: '15px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '800', boxShadow: SHADOW_YELLOW, transition: TRANSITION }}>
          📅 View my bookings
        </button>
        <button onClick={() => navigate('/teachers')} style={{ padding: '12px', background: '#fff', color: TEXT_MUTED, border: BORDER, borderRadius: '50px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '600' }}>
          🔍 Find another teacher
        </button>
        <button onClick={() => navigate('/sessions')} style={{ padding: '12px', background: '#fff', color: TEXT_MUTED, border: BORDER, borderRadius: '50px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '600' }}>
          🎥 Browse live sessions
        </button>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Booking() {
  usePageMeta('Book a Private Session', 'Send a free booking request to a verified teacher. No payment until confirmed.')

  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [searchParams] = useSearchParams()
  const [teachers, setTeachers]               = useState([])
  const [loading, setLoading]                 = useState(true)
  const [submitting, setSubmitting]           = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [teacherAvailability, setTeacherAvailability] = useState([])
  const [teacherBusy, setTeacherBusy] = useState([])
  const [children, setChildren]               = useState([])
  const [selectedChild, setSelectedChild]     = useState(null)
  const [bookings, setBookings]               = useState([])
  const [search, setSearch]                   = useState('')
  const [locationFilter, setLocationFilter]   = useState('')
  const [subjectFilter, setSubjectFilter]     = useState('')
  const [form, setForm]                       = useState({ subject: '', message: '', session_date: '', start_time: '' })
  const [activeTab, setActiveTab]             = useState(() => new URLSearchParams(window.location.search).get('tab') === 'bookings' ? 'history' : 'new')
  const [confirmation, setConfirmation]       = useState(null)
  const [cancellingId, setCancellingId]       = useState(null)
  const [templateUsed, setTemplateUsed]       = useState(null)
  const [formError, setFormError]             = useState('')
  const [cancelTarget, setCancelTarget]       = useState(null)

  useEffect(() => {
    if (!user) navigate('/login')
    else { fetchTeachers(); fetchMyBookings() }
  }, [user])

  useEffect(() => {
    if (user && profile?.role === 'parent') {
      supabase.from('profiles').select('id, full_name').eq('parent_id', user.id).then(({ data }) => {
        setChildren(data || [])
        if (data && data.length === 1) setSelectedChild(data[0])
      })
    }
  }, [user, profile])

  useEffect(() => {
    const teacherId = searchParams.get('teacher')
    if (teacherId && teachers.length > 0) {
      const t = teachers.find(t => t.id === teacherId)
      if (t) selectTeacher(t)
    }
  }, [teachers, searchParams])

  const fetchTeachers = async () => {
    const { data } = await supabase.from('teachers')
      .select('*, profiles (full_name, city, country, avatar_url), reviews (rating), certificates (status)')
      .eq('is_verified', true)
    setTeachers(data || [])
    setLoading(false)
  }

  const fetchMyBookings = async () => {
    const { data } = await supabase.from('bookings')
      .select('*, teachers (id, profiles (full_name, avatar_url)), room_id')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false })
    setBookings(data || [])
  }

  const selectTeacher = async (teacher) => {
    if (!teacher.hourly_rate || teacher.hourly_rate <= 0) {
      setFormError('This teacher hasn\'t set their session rate yet. Please choose another teacher or check back later.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setFormError('')
    setSelectedTeacher(teacher)
    const subjectParam = searchParams.get('subject')
    if (subjectParam) setForm(f => ({ ...f, subject: subjectParam }))
    const { data } = await supabase.from('teacher_availability').select('*').eq('teacher_id', teacher.id).order('day_of_week')
    setTeacherAvailability(data || [])
    const [{ data: taken }, { data: liveSessions }] = await Promise.all([
      supabase.from('bookings').select('session_date, start_time').eq('teacher_id', teacher.id).in('status', ['pending', 'confirmed']).not('session_date', 'is', null),
      supabase.from('live_sessions').select('session_date, start_time, end_time').eq('teacher_id', teacher.id).is('deleted_at', null),
    ])
    const busy = []
    ;(taken || []).forEach(b => { if (b.session_date && b.start_time) { const s = toMin(b.start_time); busy.push({ date: b.session_date, start: s, end: s + 60 }) } })
    ;(liveSessions || []).forEach(s => { if (s.session_date && s.start_time && s.end_time) busy.push({ date: s.session_date, start: toMin(s.start_time), end: toMin(s.end_time) }) })
    setTeacherBusy(busy)
  }

  const submitBooking = async (e) => {
    e.preventDefault()
    if (!selectedTeacher) return
    setSubmitting(true)
    setFormError('')
    try {
      const isParent = profile?.role === 'parent'
      const clientId = isParent ? selectedChild?.id : user.id
      if (isParent && !clientId) { setFormError('Please select which child this booking is for.'); window.scrollTo({ top: 0, behavior: 'smooth' }); setSubmitting(false); return }
      const clientName = isParent ? (selectedChild?.full_name || 'your child') : (profile?.full_name || '')
      if (form.session_date && form.start_time) {
        const slotStart = toMin(form.start_time), slotEnd = slotStart + 60
        const [{ data: clash }, { data: liveClash }] = await Promise.all([
          supabase.from('bookings').select('id')
            .eq('teacher_id', selectedTeacher.id).eq('session_date', form.session_date).eq('start_time', form.start_time)
            .in('status', ['pending', 'confirmed']).limit(1),
          supabase.from('live_sessions').select('start_time, end_time')
            .eq('teacher_id', selectedTeacher.id).eq('session_date', form.session_date).is('deleted_at', null),
        ])
        const liveOverlap = (liveClash || []).some(s => slotStart < toMin(s.end_time) && toMin(s.start_time) < slotEnd)
        if ((clash && clash.length > 0) || liveOverlap) { setFormError('Sorry — that time is no longer available. Please choose another slot.'); window.scrollTo({ top: 0, behavior: 'smooth' }); setSubmitting(false); return }
      }
      const totalAmount = selectedTeacher.hourly_rate || 0
      const { error } = await supabase.from('bookings').insert({
        teacher_id: selectedTeacher.id, client_id: clientId,
        subject: form.subject, message: form.message, status: 'pending', amount: totalAmount,
        session_date: form.session_date || null, start_time: form.start_time || null,
      })
      if (error) throw error
      const whenText = form.session_date ? ` on ${prettyDate(form.session_date)}${form.start_time ? ` at ${form.start_time}` : ''}` : ''
      await sendEmail({
        type: 'new_booking_teacher',
        teacherId:    selectedTeacher.id,
        teacherName:  selectedTeacher.profiles?.full_name,
        clientName:   clientName,
        subject:      form.subject,
        amount:       totalAmount,
        message:      form.message,
      })
      await supabase.from('notifications').insert({
        user_id: selectedTeacher.id,
        title:   'New private session request',
        message: `${clientName} has requested a ${form.subject} private session${whenText}.`,
        type:    'booking_new',
        link:    '/booking-requests',
      })
      if (isParent && selectedChild) {
        await supabase.from('notifications').insert({
          user_id: selectedChild.id,
          title:   'A session was booked for you',
          message: `${profile?.full_name} booked a ${form.subject} private session for you with ${selectedTeacher.profiles?.full_name}${whenText}.`,
          type:    'booking_new',
          link:    '/booking?tab=bookings',
        })
      }
      setConfirmation({ booking: { subject: form.subject, amount: totalAmount, session_date: form.session_date, start_time: form.start_time }, teacher: selectedTeacher })
      setSelectedTeacher(null); setTeacherAvailability([]); setForm({ subject: '', message: '', session_date: '', start_time: '' })
      fetchMyBookings()
    } catch (err) {
      console.log(err)
      const conflict = err?.code === '23505' || (err?.message && err.message.includes('schedule_conflict'))
      setFormError(conflict ? 'Sorry — that time is no longer available. Please choose another slot.' : 'Something went wrong sending your request. Please try again.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    finally { setSubmitting(false) }
  }

  const cancelBooking = async (booking) => {
    setCancellingId(booking.id)
    await supabase.from('bookings').update({ status: 'cancelled', ...(booking.payment_status === 'paid' && booking.amount > 0 ? { refund_status: 'pending' } : {}) }).eq('id', booking.id)
    await supabase.from('notifications').insert({
      user_id: booking.teacher_id,
      title: 'Session cancelled',
      message: `${profile?.full_name} cancelled their ${booking.subject || 'private'} session${booking.session_date ? ` scheduled for ${prettyDate(booking.session_date)}` : ''}.`,
      type: 'booking_declined',
      link: '/booking-requests',
    })
    setCancelTarget(null)
    fetchMyBookings(); setCancellingId(null)
  }

  const quickRebook = (booking) => {
    const teacher = teachers.find(t => t.id === booking.teacher_id)
    if (teacher) {
      selectTeacher(teacher)
      setForm({ subject: booking.subject || '', message: booking.message || '', session_date: '', start_time: '' })
      setActiveTab('new')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const allLocations = [...new Set(teachers.map(t => t.profiles?.country).filter(Boolean))].sort()
  const allSubjects  = [...new Set(teachers.flatMap(t => t.subjects || []))].sort()

  const filteredTeachers = teachers.filter(teacher => {
    const name     = teacher.profiles?.full_name?.toLowerCase() || ''
    const subjects = teacher.subjects || []
    if (search.trim()) {
      const q = search.toLowerCase()
      if (!name.includes(q) && !subjects.join(' ').toLowerCase().includes(q)) return false
    }
    if (locationFilter && teacher.profiles?.country !== locationFilter) return false
    if (subjectFilter && !subjects.includes(subjectFilter)) return false
    return true
  }).sort((a, b) => (b.hourly_rate > 0 ? 1 : 0) - (a.hourly_rate > 0 ? 1 : 0))

  const availableDays  = DAYS_FULL.filter(day => teacherAvailability.some(s => s.day_of_week === day))
  const todayStr       = new Date().toISOString().split('T')[0]
  const selectedWeekday = form.session_date ? new Date(form.session_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' }) : null
  const dayWindows      = selectedWeekday ? teacherAvailability.filter(s => s.day_of_week === selectedWeekday) : []
  const timeSlots       = (() => {
    const set = new Set()
    dayWindows.forEach(w => { for (let t = toMin(w.start_time); t + 60 <= toMin(w.end_time); t += 60) set.add(toHHMM(t)) })
    const dayBusy = teacherBusy.filter(b => b.date === form.session_date)
    return [...set].filter(t => { const s = toMin(t); return !dayBusy.some(b => s < b.end && b.start < s + 60) }).sort()
  })()
  const bookingIncomplete = submitting || !form.subject || !form.message || (availableDays.length > 0 && (!form.session_date || !form.start_time)) || (profile?.role === 'parent' && !selectedChild)
  const estimatedTotal = selectedTeacher?.hourly_rate > 0 ? selectedTeacher.hourly_rate : null
  const unpaidCount    = bookings.filter(b => b.status === 'confirmed' && b.payment_status !== 'paid' && b.amount > 0).length

  const upcomingByTeacher = {}
  const pastByTeacher = {}
  bookings.forEach(b => {
    const bucket = isBookingPast(b) ? pastByTeacher : upcomingByTeacher
    const tid = b.teacher_id
    if (!bucket[tid]) bucket[tid] = { teacher: b.teachers, bookings: [] }
    bucket[tid].bookings.push(b)
  })
  // Soonest first for upcoming, most-recent first for past
  Object.values(upcomingByTeacher).forEach(g => g.bookings.sort((a, b) => bookingTime(a) - bookingTime(b)))
  Object.values(pastByTeacher).forEach(g => g.bookings.sort((a, b) => bookingTime(b) - bookingTime(a)))
  const upcomingGroups = Object.values(upcomingByTeacher)
  const pastGroups = Object.values(pastByTeacher)
  const upcomingCount = upcomingGroups.reduce((n, g) => n + g.bookings.length, 0)
  const pastCount = pastGroups.reduce((n, g) => n + g.bookings.length, 0)

  const renderTeacherGroup = ({ teacher, bookings: tBookings }) => (
                <div key={teacher?.id} style={{ background: '#fff', borderRadius: '20px', border: BORDER, overflow: 'hidden', boxShadow: SHADOW_LG }}>
                  <div style={{ padding: '1rem 1.5rem', background: GREY_BG, borderBottom: BORDER, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {teacher?.profiles?.avatar_url ? (
                      <img src={teacher.profiles.avatar_url} alt="" style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `2px solid ${BLUE}` }} />
                    ) : (
                      <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: GRADIENT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', fontWeight: '800', color: '#fff', flexShrink: 0 }}>{teacher?.profiles?.full_name?.charAt(0)}</div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: TEXT }}>{teacher?.profiles?.full_name}</div>
                      <div style={{ fontSize: '12px', color: TEXT_MUTED }}>{tBookings.length} session{tBookings.length !== 1 ? 's' : ''}</div>
                    </div>
                    <button onClick={() => quickRebook(tBookings[0])} style={{ padding: '8px 18px', background: YELLOW, color: '#FFFFFF', border: 'none', borderRadius: '50px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '800', boxShadow: SHADOW_YELLOW, transition: TRANSITION }}>
                      ↩ Book again
                    </button>
                  </div>
                  {tBookings.map((booking, idx) => {
                    const sc       = statusStyle(booking.status)
                    const isPaid   = booking.payment_status === 'paid'
                    const isFree   = booking.amount === 0
                    const unlocked = isPaid || isFree
                    const past = (() => {
                      if (booking.session_date) { const start = new Date(`${booking.session_date}T${booking.start_time || '00:00'}`); return start.getTime() + 60 * 60 * 1000 < Date.now() }
                      const d = new Date(booking.created_at); d.setHours(0, 0, 0, 0); const t = new Date(); t.setHours(0, 0, 0, 0); return d < t
                    })()
                    const state = deriveBookingState({ status: booking.status, isPaid, isFree, amount: booking.amount, past })
                    const sessionWhen = booking.session_date ? `${new Date(booking.session_date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}${booking.start_time ? ` · ${booking.start_time.slice(0, 5)}` : ''}` : null
                    return (
                      <div key={booking.id} style={{ padding: '1.25rem 1.5rem', borderBottom: idx < tBookings.length - 1 ? BORDER : 'none', background: state.muted ? '#F5F5F5' : '#fff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', gap: '12px' }}>
                          <div>
                            <div style={{ fontSize: '16px', fontWeight: '700', color: state.muted ? TEXT_MUTED : TEXT }}>{booking.subject}</div>
                            {sessionWhen && <div style={{ fontSize: '13px', fontWeight: '700', color: state.muted ? TEXT_MUTED : BLUE, marginTop: '3px' }}>🗓️ {sessionWhen}</div>}
                            <div style={{ fontSize: '12px', color: TEXT_MUTED, marginTop: '3px' }}>Requested {new Date(booking.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                          </div>
                          <span style={{ fontSize: '12px', background: state.bg, color: state.color, padding: '4px 14px', borderRadius: '50px', fontWeight: '800', flexShrink: 0, whiteSpace: 'nowrap' }}>{state.label}</span>
                        </div>
                        {booking.message && (
                          <p style={{ fontSize: '13px', color: TEXT_MUTED, margin: '0 0 12px', lineHeight: '1.6', background: GREY_BG, borderRadius: '10px', padding: '10px 14px' }}>
                            {booking.message.slice(0, 140)}{booking.message.length > 140 ? '…' : ''}
                          </p>
                        )}
                        {booking.amount > 0 && (
                          <div style={{ fontSize: '15px', fontWeight: '700', color: BLUE, marginBottom: '12px', fontFamily: 'Tahoma, Geneva, sans-serif' }}>
                            GH₵ {booking.amount}
                            {isPaid && <span style={{ fontSize: '13px', color: '#0B0B0B', marginLeft: '8px', fontFamily: 'inherit', fontWeight: '700' }}>✅ Paid</span>}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {booking.status === 'confirmed' && !isPaid && booking.amount > 0 && (
                            <PayButton booking={booking} userEmail={user.email} onSuccess={fetchMyBookings} />
                          )}
                          {booking.status === 'confirmed' && unlocked && booking.room_id && !past && (
                            <Link to={`/call/${booking.room_id}`} style={{ fontSize: '13px', fontWeight: '700', color: '#FFFFFF', background: '#6D28D9', padding: '9px 18px', borderRadius: '50px', textDecoration: 'none' }}>🎥 Join session</Link>
                          )}
                          {booking.status === 'confirmed' && unlocked && (
                            <Link to={`/messages?booking=${booking.id}`} style={{ fontSize: '13px', color: BLUE, fontWeight: '700', padding: '9px 18px', border: BORDER, borderRadius: '50px', textDecoration: 'none', background: '#fff' }}>💬 Message</Link>
                          )}
                          {booking.status === 'confirmed' && !past && (
                            <button onClick={() => setCancelTarget(booking)} disabled={cancellingId === booking.id}
                              style={{ fontSize: '13px', color: '#6D28D9', background: '#fff', border: '1px solid #E2E8F0', padding: '9px 18px', borderRadius: '50px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700' }}>
                              {cancellingId === booking.id ? 'Cancelling...' : 'Cancel session'}
                            </button>
                          )}
                          {booking.status === 'pending' && (
                            <button onClick={() => setCancelTarget(booking)} disabled={cancellingId === booking.id}
                              style={{ fontSize: '13px', color: '#6D28D9', background: '#F5F5F5', border: '1px solid #E2E8F0', padding: '9px 18px', borderRadius: '50px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700' }}>
                              {cancellingId === booking.id ? 'Cancelling...' : 'Cancel request'}
                            </button>
                          )}
                          {state.dead && (
                            <Link to="/teachers" style={{ fontSize: '13px', color: BLUE, fontWeight: '700', padding: '9px 18px', border: BORDER, borderRadius: '50px', textDecoration: 'none', background: '#fff' }}>Browse other teachers →</Link>
                          )}
                        </div>
                        {booking.status === 'confirmed' && unlocked && isPaid && (
                          <ReviewSection booking={booking} userId={user.id} onSuccess={fetchMyBookings} />
                        )}
                      </div>
                    )
                  })}
                </div>
  )


  const statusStyle = (s) => ({
    confirmed: { bg: '#F5F5F5', color: '#0B0B0B' },
    declined:  { bg: '#F5F5F5', color: '#6D28D9' },
    pending:   { bg: '#F5F5F5', color: '#0B0B0B' },
    cancelled: { bg: '#F5F5F5', color: '#6B7280' },
  }[s] || { bg: GREY_BG, color: TEXT_MUTED })

  if (profile?.role === 'teacher') return (
    <div style={{ minHeight: '100vh', background: GREY_BG, fontFamily: 'inherit', display: 'flex', flexDirection: 'column' }}>
      <NavBar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.25rem' }}>
        <div style={{ background: '#fff', borderRadius: '20px', border: BORDER, boxShadow: SHADOW_LG, padding: isMobile ? '2.5rem 1.5rem' : '3rem', maxWidth: '460px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: LIGHT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', margin: '0 auto 1.25rem' }}>🎓</div>
          <h1 style={{ fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: '24px', fontWeight: '700', color: TEXT, margin: '0 0 12px', letterSpacing: '-0.01em' }}>Booking is for learners</h1>
          <p style={{ fontSize: '15px', color: TEXT_MUTED, lineHeight: '1.7', margin: '0 0 1.75rem' }}>You're signed in as a teacher. To book a session with another teacher, please use a separate learner account.</p>
          <Link to="/dashboard" style={{ display: 'inline-block', padding: '13px 28px', background: GRADIENT_BLUE, color: '#fff', borderRadius: '50px', fontSize: '15px', fontWeight: '800', textDecoration: 'none', boxShadow: SHADOW_BLUE }}>Back to dashboard</Link>
        </div>
      </div>
      <Footer />
    </div>
  )

  if (confirmation) return (
    <div style={{ minHeight: '100vh', background: GREY_BG, fontFamily: 'inherit', display: 'flex', flexDirection: 'column' }}>
      <NavBar />
      <div style={{ background: GRADIENT_HERO, padding: isMobile ? '1.5rem 1.25rem' : '2rem 2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: isMobile ? '22px' : '28px', color: '#0B0B0B', margin: 0, fontWeight: '700' }}>Booking sent ✓</h1>
        </div>
      </div>
      <div style={{ flex: 1 }}><BookingConfirmation booking={confirmation.booking} teacher={confirmation.teacher} navigate={navigate} /></div>
      <Footer />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: GREY_BG, fontFamily: 'inherit', display: 'flex', flexDirection: 'column' }}>
      <NavBar />

      {/* HERO */}
      <div style={{ background: GRADIENT_HERO, padding: isMobile ? '2rem 1.25rem' : '2.5rem 2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '220px', height: '220px', borderRadius: '50%', border: '1px solid rgba(0,0,0,0.06)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: YELLOW, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Private Sessions</p>
          <h1 style={{ fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: isMobile ? '26px' : '36px', color: '#0B0B0B', marginBottom: '8px', fontWeight: '700', letterSpacing: '-0.02em' }}>Book a private session</h1>
          <p style={{ fontSize: isMobile ? '14px' : '15px', color: 'rgba(0,0,0,0.75)', margin: 0, lineHeight: '1.6' }}>
            One-on-one online sessions with verified teachers — free to request, no payment until confirmed
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: isMobile ? '1.25rem' : '1.75rem 2rem', flex: 1, width: '100%', boxSizing: 'border-box' }}>

        {/* PAY NOW BANNER */}
        <PayNowBanner bookings={bookings} userEmail={user?.email} onSuccess={fetchMyBookings} />

        {/* TABS */}
        <div style={{ display: 'flex', gap: '4px', background: '#fff', padding: '4px', borderRadius: '50px', border: BORDER, marginBottom: '1.75rem', width: 'fit-content', boxShadow: SHADOW_LG }}>
          {[
            ['new',     '📅 New booking'],
            ['history', `📋 My bookings (${bookings.length})${unpaidCount > 0 ? ` · ${unpaidCount} to pay` : ''}`],
          ].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              style={{ padding: '10px 22px', border: 'none', borderRadius: '50px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', background: activeTab === key ? '#6D28D9' : 'transparent', color: activeTab === key ? '#fff' : key === 'history' && unpaidCount > 0 ? '#6D28D9' : TEXT_MUTED, fontWeight: activeTab === key || (key === 'history' && unpaidCount > 0) ? '700' : '400', boxShadow: activeTab === key ? SHADOW_BLUE : 'none', transition: TRANSITION }}>
              {label}
            </button>
          ))}
        </div>

        {/* NEW BOOKING TAB */}
        {activeTab === 'new' && (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {formError && (
                <div style={{ background: '#F5F5F5', color: '#6D28D9', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', border: '1px solid #E2E8F0' }}>
                  <span style={{ flex: 1 }}>{formError}</span>
                  <button onClick={() => setFormError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'inherit', opacity: 0.6, padding: 0 }}>×</button>
                </div>
              )}

              {/* Step 1 */}
              <div style={{ background: '#fff', borderRadius: '20px', border: BORDER, overflow: 'hidden', boxShadow: SHADOW_LG }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: BORDER, display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: selectedTeacher ? '#F5F5F5' : GRADIENT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800', color: selectedTeacher ? '#0B0B0B' : '#fff', flexShrink: 0, transition: TRANSITION }}>
                    {selectedTeacher ? '✓' : '1'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: TEXT, margin: 0 }}>Choose a teacher</h3>
                    <p style={{ fontSize: '13px', color: TEXT_MUTED, margin: 0 }}>Browse verified teachers and pick the right one</p>
                  </div>
                  {selectedTeacher && <span style={{ fontSize: '12px', color: '#0B0B0B', background: '#F5F5F5', padding: '4px 12px', borderRadius: '50px', fontWeight: '700', flexShrink: 0 }}>Selected ✓</span>}
                </div>

                {!selectedTeacher ? (
                  <div style={{ padding: '1.25rem' }}>
                    {/* Filters */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '10px', border: `1.5px solid ${GREY_LIGHT}`, borderRadius: '50px', background: '#fff', padding: '0 16px', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                        <span style={{ fontSize: '15px', color: TEXT_MUTED }}>🔍</span>
                        <input style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px', fontFamily: 'inherit', padding: '12px 0', color: TEXT, background: 'transparent' }} placeholder="Search by name or subject..." value={search} onChange={e => setSearch(e.target.value)} />
                        {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', fontSize: '18px', color: TEXT_MUTED, cursor: 'pointer', padding: 0, lineHeight: 1 }}>×</button>}
                      </div>
                      <select style={{ padding: '12px 16px', border: `1.5px solid ${GREY_LIGHT}`, borderRadius: '50px', fontSize: '13px', fontFamily: 'inherit', outline: 'none', color: TEXT, cursor: 'pointer', background: '#fff', boxShadow: '0 1px 6px rgba(0,0,0,0.05)', fontWeight: '500' }} value={locationFilter} onChange={e => setLocationFilter(e.target.value)}>
                        <option value="">🌍 All countries</option>
                        {allLocations.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                      <select style={{ padding: '12px 16px', border: `1.5px solid ${GREY_LIGHT}`, borderRadius: '50px', fontSize: '13px', fontFamily: 'inherit', outline: 'none', color: TEXT, cursor: 'pointer', background: '#fff', boxShadow: '0 1px 6px rgba(0,0,0,0.05)', fontWeight: '500' }} value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)}>
                        <option value="">📚 All subjects</option>
                        {allSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    {loading ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {[1, 2, 3].map(i => <div key={i} style={{ height: '90px', background: GREY_BG, borderRadius: '16px', animation: 'pulse 1.5s infinite' }} />)}
                        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
                      </div>
                    ) : filteredTeachers.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '3rem', color: TEXT_MUTED }}>
                        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: TEXT, marginBottom: '6px' }}>No teachers found</p>
                        <p style={{ fontSize: '13px', margin: 0 }}>Try adjusting your search or filters</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '480px', overflowY: 'auto', paddingRight: '4px' }}>
                        {filteredTeachers.map(teacher => {
                          const avg      = teacher.reviews?.length > 0 ? (teacher.reviews.reduce((s, r) => s + r.rating, 0) / teacher.reviews.length).toFixed(1) : null
                          const hasCerts = teacher.certificates?.some(c => c.status === 'approved')
                          const hasRate  = teacher.hourly_rate > 0
                          return (
                            <TeacherCard
                              key={teacher.id}
                              teacher={teacher}
                              avg={avg}
                              hasCerts={hasCerts}
                              hasRate={hasRate}
                              onSelect={() => selectTeacher(teacher)}
                            />
                          )
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ padding: '1.25rem' }}>
                    <div style={{ background: LIGHT_BLUE, borderRadius: '16px', padding: '1.25rem', border: `2px solid ${BLUE}`, marginBottom: '12px', boxShadow: SHADOW_BLUE }}>
                      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: availableDays.length > 0 ? '14px' : 0 }}>
                        {selectedTeacher.profiles?.avatar_url ? (
                          <img src={selectedTeacher.profiles.avatar_url} alt="" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `3px solid ${BLUE}` }} />
                        ) : (
                          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: GRADIENT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800', color: '#fff', flexShrink: 0 }}>
                            {selectedTeacher.profiles?.full_name?.charAt(0)}
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                            <span style={{ fontSize: '17px', fontWeight: '800', color: BLUE }}>{selectedTeacher.profiles?.full_name}</span>
                            {selectedTeacher.is_verified && <span style={{ fontSize: '11px', background: '#F5F5F5', color: '#0B0B0B', padding: '3px 10px', borderRadius: '50px', fontWeight: '800' }}>✓ Verified</span>}
                          </div>
                          <div style={{ fontSize: '13px', color: TEXT_MUTED, marginBottom: '8px' }}>📍 {selectedTeacher.profiles?.city}, {selectedTeacher.profiles?.country}</div>
                          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '8px' }}>
                            {selectedTeacher.subjects?.map(s => <span key={s} style={{ fontSize: '12px', background: '#fff', color: BLUE, padding: '3px 10px', borderRadius: '50px', border: `1px solid ${BLUE}`, fontWeight: '600' }}>{s}</span>)}
                          </div>
                          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                            {selectedTeacher.hourly_rate > 0 && <span style={{ fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: '16px', fontWeight: '700', color: BLUE }}>GH₵ {selectedTeacher.hourly_rate}/session</span>}
                            {(() => {
                              const avg = selectedTeacher.reviews?.length > 0 ? (selectedTeacher.reviews.reduce((s, r) => s + r.rating, 0) / selectedTeacher.reviews.length).toFixed(1) : null
                              return avg ? <span style={{ fontSize: '13px', color: '#0B0B0B', fontWeight: '700', background: '#F5F5F5', padding: '3px 10px', borderRadius: '50px' }}>⭐ {avg} ({selectedTeacher.reviews.length})</span> : null
                            })()}
                          </div>
                        </div>
                        <Link to={`/teachers/${selectedTeacher.id}`} style={{ fontSize: '12px', color: BLUE, fontWeight: '700', textDecoration: 'none', background: '#fff', padding: '6px 12px', borderRadius: '50px', flexShrink: 0, border: `1px solid ${BLUE}` }}>View →</Link>
                      </div>
                      {availableDays.length > 0 && (
                        <div style={{ borderTop: 'rgba(0,0,0,0.15) solid 1px', paddingTop: '12px' }}>
                          <div style={{ fontSize: '11px', fontWeight: '800', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>Available days</div>
                          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                            {DAYS_FULL.map((day, i) => {
                              const avail = availableDays.includes(day)
                              return <span key={day} style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '50px', fontWeight: '700', background: avail ? '#F5F5F5' : GREY_BG, color: avail ? '#0B0B0B' : '#E2E8F0', border: `1px solid ${avail ? '#E2E8F0' : GREY_LIGHT}` }}>{DAYS_SHORT[i]}</span>
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    <button onClick={() => { setSelectedTeacher(null); setTeacherAvailability([]) }} style={{ fontSize: '13px', color: TEXT_MUTED, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', fontWeight: '500' }}>
                      ← Choose a different teacher
                    </button>
                  </div>
                )}
              </div>

              {/* Step 2 */}
              {selectedTeacher && (
                <div style={{ background: '#fff', borderRadius: '20px', border: BORDER, overflow: 'hidden', boxShadow: SHADOW_LG }}>
                  <div style={{ padding: '1.25rem 1.5rem', borderBottom: BORDER, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: GRADIENT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800', color: '#fff', flexShrink: 0 }}>2</div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '800', color: TEXT, margin: 0 }}>Session details</h3>
                      <p style={{ fontSize: '13px', color: TEXT_MUTED, margin: 0 }}>Tell the teacher what you need</p>
                    </div>
                  </div>
                  <form onSubmit={submitBooking} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {profile?.role === 'parent' && (
                      <div>
                        <label style={lbl}>Booking for</label>
                        {children.length === 0 ? (
                          <div style={{ padding: '14px', background: GREY_BG, borderRadius: '14px', border: BORDER }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '14px' }}>
                              <span style={{ fontSize: '18px', flexShrink: 0 }}>👶</span>
                              <p style={{ fontSize: '13px', color: TEXT_MUTED, margin: 0, lineHeight: '1.6' }}>No child linked yet. Create an account for your child now — you'll get their login to share, and this session will be booked for them.</p>
                            </div>
                            <CreateChildForm parentId={user.id} onCreated={(child) => setSelectedChild(child)} />
                          </div>
                        ) : children.length === 1 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '13px 16px', background: LIGHT_BLUE, borderRadius: '12px', border: '1px solid #F5F5F5' }}>
                            <span style={{ fontSize: '18px' }}>🧒</span>
                            <span style={{ fontSize: '14px', fontWeight: '700', color: DARK_BLUE }}>{children[0].full_name}</span>
                          </div>
                        ) : (
                          <select value={selectedChild?.id || ''} onChange={e => setSelectedChild(children.find(c => c.id === e.target.value) || null)} style={{ ...inp, cursor: 'pointer' }}>
                            <option value="">Select a child…</option>
                            {children.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                          </select>
                        )}
                      </div>
                    )}

                    <div>
                      <label style={lbl}>Subject(s) needed</label>
                      {selectedTeacher?.subjects?.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '14px', border: BORDER, borderRadius: '14px', background: GREY_BG }}>
                          {selectedTeacher.subjects.map(s => {
                            const selected = form.subject.split(',').map(x => x.trim()).filter(Boolean).includes(s)
                            return (
                              <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', cursor: 'pointer', padding: '8px 16px', borderRadius: '50px', background: selected ? '#6D28D9' : '#fff', color: selected ? '#fff' : TEXT, border: `1px solid ${selected ? '#6D28D9' : GREY_LIGHT}`, fontWeight: selected ? '700' : '400', transition: TRANSITION, boxShadow: selected ? SHADOW_BLUE : 'none' }}>
                                <input type="checkbox" checked={selected} onChange={e => {
                                  const cur = form.subject.split(',').map(x => x.trim()).filter(Boolean)
                                  setForm({ ...form, subject: (e.target.checked ? [...cur, s] : cur.filter(x => x !== s)).join(', ') })
                                }} style={{ display: 'none' }} />
                                {s}
                              </label>
                            )
                          })}
                        </div>
                      ) : (
                        <input style={inp} placeholder="e.g. Mathematics, Physics" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
                      )}
                    </div>

                    <div>
                      <label style={lbl}>When would you like the session?</label>
                      {availableDays.length === 0 ? (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 14px', background: GREY_BG, borderRadius: '12px', border: BORDER }}>
                          <span style={{ fontSize: '18px', flexShrink: 0 }}>🗓️</span>
                          <p style={{ fontSize: '13px', color: TEXT_MUTED, margin: 0, lineHeight: '1.6' }}>This teacher hasn't published their availability yet. Send your request and you can agree a time together.</p>
                        </div>
                      ) : (
                        <>
                          <input type="date" min={todayStr} value={form.session_date} required
                            onChange={e => setForm({ ...form, session_date: e.target.value, start_time: '' })}
                            style={{ ...inp, cursor: 'pointer' }} />
                          {form.session_date && dayWindows.length === 0 && (
                            <p style={{ fontSize: '13px', color: '#6D28D9', margin: '10px 0 0', fontWeight: '600' }}>
                              {selectedWeekday} isn't available. This teacher takes sessions on {availableDays.join(', ')}.
                            </p>
                          )}
                          {form.session_date && dayWindows.length > 0 && timeSlots.length === 0 && (
                            <p style={{ fontSize: '13px', color: '#6D28D9', margin: '10px 0 0', fontWeight: '600' }}>No full hour is open on {selectedWeekday}. Pick another day.</p>
                          )}
                          {timeSlots.length > 0 && (
                            <div style={{ marginTop: '12px' }}>
                              <div style={{ fontSize: '11px', fontWeight: '800', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>Pick a start time (1-hour session)</div>
                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {timeSlots.map(t => {
                                  const sel = form.start_time === t
                                  return (
                                    <button key={t} type="button" onClick={() => setForm({ ...form, start_time: t })}
                                      style={{ padding: '9px 16px', borderRadius: '50px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', background: sel ? '#6D28D9' : '#fff', color: sel ? '#fff' : TEXT, border: `1px solid ${sel ? '#6D28D9' : GREY_LIGHT}`, boxShadow: sel ? SHADOW_BLUE : 'none', transition: TRANSITION }}>
                                      {t}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div>
                      <label style={lbl}>Message to teacher</label>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                        {MESSAGE_TEMPLATES.map((t, i) => (
                          <button key={i} type="button" onClick={() => { setForm({ ...form, message: t }); setTemplateUsed(i) }}
                            style={{ fontSize: '11px', padding: '5px 13px', borderRadius: '50px', border: `1px solid ${templateUsed === i ? BLUE : GREY_LIGHT}`, background: templateUsed === i ? LIGHT_BLUE : '#fff', color: templateUsed === i ? BLUE : TEXT_MUTED, cursor: 'pointer', fontFamily: 'inherit', fontWeight: templateUsed === i ? '700' : '400', transition: TRANSITION }}>
                            {t.slice(0, 26)}…
                          </button>
                        ))}
                      </div>
                      <textarea style={{ ...inp, height: '110px', resize: 'vertical' }} placeholder="Introduce yourself. What level is the subject? What are your goals?" value={form.message} onChange={e => { setForm({ ...form, message: e.target.value }); setTemplateUsed(null) }} required />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px', background: '#F5F5F5', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                      <span style={{ fontSize: '22px', flexShrink: 0 }}>🎥</span>
                      <p style={{ fontSize: '13px', color: '#0B0B0B', margin: 0, lineHeight: '1.6' }}>
                        Sessions take place <strong>online</strong> via Stuumo's built-in video call. No travel needed.
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px', background: '#F5F5F5', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                      <span style={{ fontSize: '22px', flexShrink: 0 }}>⚡</span>
                      <p style={{ fontSize: '13px', color: '#0B0B0B', margin: 0, lineHeight: '1.6' }}>
                        Teachers typically respond within <strong>24 hours</strong>. You'll get a notification when they do.
                      </p>
                    </div>

                    <button type="submit" disabled={bookingIncomplete}
                      style={{ padding: '15px', background: bookingIncomplete ? GREY_BG : YELLOW, color: bookingIncomplete ? TEXT_MUTED : '#fff', border: 'none', borderRadius: '50px', fontSize: '16px', cursor: bookingIncomplete ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: '800', transition: TRANSITION, boxShadow: !bookingIncomplete ? SHADOW_YELLOW : 'none' }}>
                      {submitting ? '⏳ Sending request...' : `📅 Send booking request${isMobile && estimatedTotal ? ` · GH₵ ${estimatedTotal}` : ''}`}
                    </button>
                    {isMobile && estimatedTotal && (
                      <p style={{ fontSize: '12px', color: TEXT_MUTED, textAlign: 'center', margin: 0 }}>🔒 You only pay GH₵ {estimatedTotal} after the teacher accepts</p>
                    )}
                  </form>
                </div>
              )}

              {!selectedTeacher && (
                <div style={{ background: '#fff', borderRadius: '20px', border: `2px dashed ${GREY_LIGHT}`, padding: '4rem 2rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '52px', marginBottom: '14px' }}>👆</div>
                  <h3 style={{ fontSize: '17px', fontWeight: '700', color: TEXT, margin: '0 0 8px' }}>Select a teacher above to continue</h3>
                  <p style={{ fontSize: '14px', color: TEXT_MUTED, margin: 0 }}>
                    Or <Link to="/teachers" style={{ color: BLUE, fontWeight: '700', textDecoration: 'none' }}>browse all teachers</Link> to find the right match
                  </p>
                </div>
              )}
            </div>

            {/* SIDEBAR */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: isMobile ? 'static' : 'sticky', top: '80px' }}>
              <div style={{ background: '#fff', borderRadius: '20px', border: BORDER, overflow: 'hidden', boxShadow: SHADOW_XL }}>
                <div style={{ background: '#F5F5F5', padding: '1.25rem' }}>
                  <h3 style={{ color: '#0B0B0B', fontSize: '15px', fontWeight: '700', margin: 0 }}>💰 Booking summary</h3>
                </div>
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {selectedTeacher ? (
                    <>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', paddingBottom: '14px', borderBottom: BORDER }}>
                        {selectedTeacher.profiles?.avatar_url ? (
                          <img src={selectedTeacher.profiles.avatar_url} alt="" style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `2px solid ${BLUE}` }} />
                        ) : (
                          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: GRADIENT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '800', color: '#fff', flexShrink: 0 }}>{selectedTeacher.profiles?.full_name?.charAt(0)}</div>
                        )}
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: TEXT }}>{selectedTeacher.profiles?.full_name}</div>
                          <div style={{ fontSize: '12px', color: TEXT_MUTED }}>{selectedTeacher.profiles?.city}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {[
                          ['Rate per session', `GH₵ ${selectedTeacher.hourly_rate}`],
                          ['Sessions',         '1 private session'],
                          ...(form.subject ? [['Subject', form.subject]] : []),
                          ['Format',           '🎥 Online (video call)'],
                        ].map(([label, value]) => (
                          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                            <span style={{ fontSize: '13px', color: TEXT_MUTED }}>{label}</span>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: TEXT, textAlign: 'right', maxWidth: '140px' }}>{value}</span>
                          </div>
                        ))}
                      </div>
                      {estimatedTotal && (
                        <div style={{ background: '#F5F5F5', borderRadius: '14px', padding: '1.25rem', textAlign: 'center', boxShadow: SHADOW_BLUE }}>
                          <div style={{ fontSize: '12px', color: 'rgba(0,0,0,0.7)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: '600' }}>Session total</div>
                          <div style={{ fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: '36px', fontWeight: '700', color: YELLOW, letterSpacing: '-0.02em', lineHeight: 1 }}>GH₵ {estimatedTotal}</div>
                          <div style={{ fontSize: '11px', color: 'rgba(0,0,0,0.6)', marginTop: '6px' }}>Only paid after teacher confirms</div>
                        </div>
                      )}
                      <div style={{ fontSize: '12px', color: TEXT_MUTED, textAlign: 'center', lineHeight: '1.7', background: GREY_BG, borderRadius: '10px', padding: '10px' }}>
                        🔒 No payment until the teacher accepts.
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '1.5rem', color: TEXT_MUTED }}>
                      <div style={{ fontSize: '36px', marginBottom: '10px' }}>📋</div>
                      <p style={{ fontSize: '13px', margin: 0, lineHeight: '1.6' }}>Select a teacher to see your booking summary</p>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ background: '#fff', borderRadius: '20px', border: BORDER, padding: '1.25rem', boxShadow: SHADOW_LG }}>
                <h4 style={{ fontSize: '13px', fontWeight: '800', color: TEXT, marginBottom: '14px', marginTop: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Why book through Stuumo?</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    ['🏅', 'All teachers verified',   'Certificates manually checked'],
                    ['🎥', 'Fully online sessions',   'Join from anywhere, no travel needed'],
                    ['💳', 'Pay only when confirmed', 'No upfront payment required'],
                    ['⭐', 'Rated by real learners',  'Read reviews before booking'],
                  ].map(([icon, title, desc]) => (
                    <div key={title} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: LIGHT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>{icon}</div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: TEXT }}>{title}</div>
                        <div style={{ fontSize: '12px', color: TEXT_MUTED, marginTop: '2px' }}>{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {bookings.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: '20px', border: BORDER, padding: '5rem 2rem', textAlign: 'center', boxShadow: SHADOW_LG }}>
                <div style={{ fontSize: '52px', marginBottom: '1rem' }}>📭</div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: TEXT, marginBottom: '8px' }}>No bookings yet</h3>
                <p style={{ fontSize: '14px', color: TEXT_MUTED, marginBottom: '1.5rem', lineHeight: '1.6' }}>Send your first private session request to a verified teacher</p>
                <button onClick={() => setActiveTab('new')} style={{ padding: '12px 28px', background: YELLOW, color: '#FFFFFF', border: 'none', borderRadius: '50px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '800', boxShadow: SHADOW_YELLOW }}>
                  Book your first session
                </button>
              </div>
            ) : (
              <>
                {upcomingGroups.length > 0 && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0.25rem 0 0.25rem' }}>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: TEXT, textTransform: 'uppercase', letterSpacing: '0.06em' }}>📅 Upcoming</span>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: BLUE, background: LIGHT_BLUE, padding: '2px 10px', borderRadius: '50px' }}>{upcomingCount}</span>
                      <div style={{ flex: 1, height: '1px', background: GREY_LIGHT }} />
                    </div>
                    {upcomingGroups.map(renderTeacherGroup)}
                  </>
                )}
                {pastGroups.length > 0 && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: (upcomingGroups.length > 0 ? '1rem' : '0.25rem') + ' 0 0.25rem' }}>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.06em' }}>✓ Past &amp; completed</span>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: TEXT_MUTED, background: GREY_BG, padding: '2px 10px', borderRadius: '50px' }}>{pastCount}</span>
                      <div style={{ flex: 1, height: '1px', background: GREY_LIGHT }} />
                    </div>
                    {pastGroups.map(renderTeacherGroup)}
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
      <Footer />

      {cancelTarget && (
        <div onClick={() => cancellingId ? null : setCancelTarget(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: '20px', padding: '1.75rem', maxWidth: '380px', width: '100%', boxShadow: SHADOW_XL }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>🗓️</div>
              <h3 style={{ fontSize: '19px', fontWeight: '700', color: TEXT, margin: 0, fontFamily: 'Tahoma, Geneva, sans-serif' }}>
                {cancelTarget.status === 'pending' ? 'Cancel booking request?' : 'Cancel this session?'}
              </h3>
            </div>
            <p style={{ fontSize: '14px', color: TEXT_MUTED, lineHeight: '1.65', margin: '0 0 1rem' }}>
              {cancelTarget.status === 'pending' ? (
                <>Your request to <strong style={{ color: TEXT }}>{cancelTarget.teachers?.profiles?.full_name || 'this teacher'}</strong>{cancelTarget.subject ? ` for ${cancelTarget.subject}` : ''} will be withdrawn. This can't be undone.</>
              ) : (
                <>Your {cancelTarget.subject ? `${cancelTarget.subject} ` : ''}session with <strong style={{ color: TEXT }}>{cancelTarget.teachers?.profiles?.full_name || 'this teacher'}</strong> will be cancelled and they'll be notified. This can't be undone.</>
              )}
            </p>
            {cancelTarget.payment_status === 'paid' && cancelTarget.amount > 0 && (
              <div style={{ background: '#F5F5F5', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '11px 14px', marginBottom: '1.25rem', fontSize: '13px', color: '#0B0B0B', lineHeight: '1.6' }}>
                💳 You've paid GH₵ {cancelTarget.amount}. Cancellations are refunded by our team — contact support after cancelling.
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setCancelTarget(null)} disabled={!!cancellingId}
                style={{ flex: 1, padding: '12px', background: '#fff', color: TEXT, border: BORDER, borderRadius: '50px', fontSize: '14px', fontWeight: '700', cursor: cancellingId ? 'default' : 'pointer', fontFamily: 'inherit' }}>
                Keep it
              </button>
              <button onClick={() => cancelBooking(cancelTarget)} disabled={!!cancellingId}
                style={{ flex: 1, padding: '12px', background: '#6D28D9', color: '#FFFFFF', border: 'none', borderRadius: '50px', fontSize: '14px', fontWeight: '800', cursor: cancellingId ? 'default' : 'pointer', fontFamily: 'inherit', opacity: cancellingId ? 0.7 : 1 }}>
                {cancellingId ? 'Cancelling…' : cancelTarget.status === 'pending' ? 'Yes, cancel' : 'Yes, cancel session'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const lbl = { fontSize: '11px', fontWeight: '800', color: TEXT_MUTED, display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.07em' }
const inp = { width: '100%', padding: '12px 16px', border: BORDER, borderRadius: '12px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', background: '#fff', color: TEXT, boxSizing: 'border-box', transition: TRANSITION }

// ── Pay Button ────────────────────────────────────────────────────────────────
function PayButton({ booking, userEmail, onSuccess, large }) {
  const [loading, setLoading] = useState(false)
  const [payError, setPayError] = useState('')
  const handlePay = () => {
    setPayError('')
    setLoading(true)
    const handler = window.PaystackPop.setup({
      key:      import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email:    userEmail,
      amount:   booking.amount * 100,
      currency: 'GHS',
      ref:      'TM-' + Date.now() + '-' + booking.id.slice(0, 8),
      callback: (response) => confirmPayment(response.reference),
      onClose:  () => setLoading(false),
    })
    handler.openIframe()
  }
  const confirmPayment = async (reference) => {
    try {
      // Payment is verified server-side against Paystack before the booking is marked paid.
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { booking_id: booking.id, reference },
      })
      if (error || !data?.ok) {
        let detail = data?.error || ''
        try { if (error?.context?.json) { const b = await error.context.json(); detail = b?.error || detail } } catch (e) {}
        console.log('Payment verification failed', error || data, detail)
        setPayError(detail ? ('Payment failed: ' + detail) : 'We couldn\'t confirm your payment. If you were charged, contact support and we\'ll sort it out.')
        return
      }
      onSuccess()
    } catch (err) {
      console.log(err)
      setPayError('We couldn\'t confirm your payment. If you were charged, contact support and we\'ll sort it out.')
    }
    finally { setLoading(false) }
  }
  return (
    <>
    <button onClick={handlePay} disabled={loading}
      style={{
        fontSize:     large ? '16px' : '13px',
        fontWeight:   '800',
        color:        large ? '#6D28D9' : '#fff',
        background:   large ? YELLOW : '#6D28D9',
        border:       'none',
        padding:      large ? '16px 32px' : '9px 18px',
        borderRadius: '50px',
        cursor:       loading ? 'not-allowed' : 'pointer',
        fontFamily:   'inherit',
        boxShadow:    large ? SHADOW_YELLOW : '0 4px 12px rgba(0,0,0,0.15)',
        transition:   TRANSITION,
        whiteSpace:   'nowrap',
        opacity:      loading ? 0.7 : 1,
      }}>
      {loading ? '⏳ Processing...' : large ? '💳 Pay Now to unlock →' : '💳 Pay Now'}
    </button>
    {payError && <div style={{ fontSize: '12px', color: '#DC2626', marginTop: '6px', lineHeight: 1.5, maxWidth: '240px' }}>{payError}</div>}
    </>
  )
}

// ── Review Section ────────────────────────────────────────────────────────────
function ReviewSection({ booking, userId, onSuccess }) {
  const [existingReview, setExistingReview] = useState(null)
  const [rating, setRating]                 = useState(0)
  const [hoverRating, setHoverRating]       = useState(0)
  const [comment, setComment]               = useState('')
  const [loading, setLoading]               = useState(true)
  const [submitting, setSubmitting]         = useState(false)

  useEffect(() => {
    supabase.from('reviews').select('*').eq('booking_id', booking.id).maybeSingle()
      .then(({ data }) => { setExistingReview(data); setLoading(false) })
  }, [booking.id])

  const submitReview = async () => {
    if (rating === 0) return
    setSubmitting(true)
    try {
      await supabase.from('reviews').insert({ booking_id: booking.id, teacher_id: booking.teacher_id, reviewer_id: userId, rating, comment })
      setExistingReview({ rating, comment }); onSuccess()
    } catch (err) { console.log(err) }
    finally { setSubmitting(false) }
  }

  if (loading) return null
  if (existingReview) return (
    <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: BORDER }}>
      <div style={{ fontSize: '12px', color: TEXT_MUTED, marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your review</div>
      <div style={{ display: 'flex', gap: '2px', marginBottom: '4px' }}>
        {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: '18px', color: s <= existingReview.rating ? '#0B0B0B' : GREY_LIGHT }}>★</span>)}
      </div>
      {existingReview.comment && <p style={{ fontSize: '13px', color: TEXT_MUTED, margin: 0, lineHeight: '1.6' }}>{existingReview.comment}</p>}
    </div>
  )

  return (
    <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: BORDER }}>
      <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px', color: TEXT }}>Rate your session</div>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
        {[1, 2, 3, 4, 5].map(n => (
          <span key={n} onClick={() => setRating(n)} onMouseEnter={() => setHoverRating(n)} onMouseLeave={() => setHoverRating(0)}
            style={{ fontSize: '32px', cursor: 'pointer', color: n <= (hoverRating || rating) ? '#0B0B0B' : GREY_LIGHT, transition: 'color 0.1s' }}>★</span>
        ))}
      </div>
      <textarea style={{ ...inp, height: '75px', resize: 'vertical', marginBottom: '10px' }} placeholder="Leave a comment (optional)..." value={comment} onChange={e => setComment(e.target.value)} />
      <button onClick={submitReview} disabled={rating === 0 || submitting}
        style={{ width: '100%', padding: '11px', background: rating === 0 ? GREY_BG : GRADIENT_BLUE, color: rating === 0 ? TEXT_MUTED : '#fff', border: 'none', borderRadius: '50px', fontSize: '14px', cursor: rating === 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: '700', boxShadow: rating > 0 ? SHADOW_BLUE : 'none', transition: TRANSITION }}>
        {submitting ? 'Submitting...' : 'Submit review'}
      </button>
    </div>
  )
}