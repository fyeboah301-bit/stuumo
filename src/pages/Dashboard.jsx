import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { BLUE, YELLOW, LIGHT_BLUE, GREY_BG, GREY_LIGHT, TEXT_MUTED, DARK_BLUE } from '../styles/colors'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import AnnouncementBanner from '../components/AnnouncementBanner'
import ProfileEditor from '../components/ProfileEditor'
import usePageMeta from '../hooks/usePageMeta'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 900)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

const lbl = { fontSize: '11px', fontWeight: '700', color: TEXT_MUTED, display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }
const inp = { width: '100%', padding: '11px 14px', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: '#fff', color: '#0B0B0B' }
const btnPrimary = { padding: '12px 24px', background: '#6D28D9', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700', width: '100%' }
const btnYellow = { padding: '12px 24px', background: YELLOW, color: '#FFFFFF', border: 'none', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700', width: '100%' }

function SectionCard({ title, icon, color, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', marginBottom: '1.25rem' }}>
      <div style={{ background: '#F5F5F5', borderBottom: '1px solid #E2E8F0', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '20px' }}>{icon}</span>
        <h3 style={{ color: '#0B0B0B', fontSize: '15px', fontWeight: '700', margin: 0 }}>{title}</h3>
      </div>
      <div style={{ padding: '1.5rem' }}>{children}</div>
    </div>
  )
}

function StatusMessage({ message, onClose }) {
  if (!message) return null
  const isSuccess = message.startsWith('✅')
  return (
    <div style={{ background: isSuccess ? '#F5F5F5' : '#F5F5F5', color: isSuccess ? '#0B0B0B' : '#DC2626', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ flex: 1 }}>{message}</span>
      {onClose && <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'inherit', opacity: 0.6, padding: 0 }}>×</button>}
    </div>
  )
}

// Resolve a teacher_documents.file_url for viewing. New IDs are stored as a path in the
// private `teacher-ids` bucket; legacy rows stored a full public URL (kept working).
async function resolvePrivateDoc(fileUrl) {
  if (!fileUrl) return null
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl
  const { data, error } = await supabase.storage.from('teacher-ids').createSignedUrl(fileUrl, 120)
  if (error) throw error
  return data?.signedUrl || null
}

const TEACHER_SECTIONS = [
  { key: 'overview', icon: '📊', label: 'Overview', group: 'Profile' },
  { key: 'about', icon: '✏️', label: 'About me', group: 'Profile' },
  { key: 'availability', icon: '📅', label: 'Availability', group: 'Profile' },
  { key: 'documents', icon: '🪪', label: 'ID & Docs', group: 'Verification' },
  { key: 'qualifications', icon: '🎓', label: 'Qualifications', group: 'Verification' },
  { key: 'portfolio', icon: '📁', label: 'Portfolio', group: 'Showcase' },
  { key: 'videos', icon: '🎥', label: 'Pitch videos', group: 'Showcase' },
  { key: 'earnings', icon: '💰', label: 'Earnings', group: 'Account' },
  { key: 'profile', icon: '👤', label: 'Profile', group: 'Account' },
]

export default function Dashboard() {
  usePageMeta('Dashboard')

  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [appStatus, setAppStatus] = useState(null)
  const [activeSection, setActiveSection] = useState('overview')

  useEffect(() => {
    if (profile?.role === 'teacher' && user) {
      supabase.from('teachers').select('application_status, application_notes').eq('id', user.id).single()
        .then(({ data }) => {
          if (data) {
            setAppStatus(data)
            if (data.application_status === 'incomplete') navigate('/apply')
          }
        })
    }
  }, [profile, user])

  const isTeacher = profile?.role === 'teacher'

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5', fontFamily: 'Tahoma, Geneva, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <NavBar />

      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: isMobile ? '1.5rem 1rem' : '2rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <AvatarUpload userId={user?.id} currentUrl={profile?.avatar_url} initial={profile?.full_name?.charAt(0)} onUpdate={refreshProfile} role={profile?.role} pendingUrl={profile?.pending_avatar_url} />
            <div>
              <p style={{ fontSize: '12px', color: 'rgba(0,0,0,0.65)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                {isTeacher ? '🎓 Teacher' : profile?.role === 'parent' ? '👨‍👩‍👧 Parent' : '📚 Learner'}
              </p>
              <h1 style={{ fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: isMobile ? '20px' : '26px', fontWeight: '700', color: '#0B0B0B', margin: 0 }}>
                Welcome back, {profile?.full_name?.split(' ')[0]} 👋
              </h1>
              <p style={{ fontSize: '13px', color: 'rgba(0,0,0,0.65)', margin: '4px 0 0' }}>
                {profile?.city && profile?.country ? `📍 ${profile.city}, ${profile.country}` : profile?.email}
              </p>
            </div>
          </div>
          {!isTeacher && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Link to="/teachers" style={{ padding: '9px 16px', background: 'rgba(0,0,0,0.15)', color: '#0B0B0B', borderRadius: '8px', fontSize: '13px', textDecoration: 'none', fontWeight: '600', border: '1px solid rgba(0,0,0,0.3)' }}>
                🔍 Find teachers
              </Link>
              <Link to="/sessions" style={{ padding: '9px 16px', background: YELLOW, color: '#FFFFFF', borderRadius: '8px', fontSize: '13px', textDecoration: 'none', fontWeight: '700' }}>
                🎥 Live sessions
              </Link>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: isMobile ? '1rem' : '1.5rem 2rem', flex: 1, width: '100%', boxSizing: 'border-box' }}>
        <AnnouncementBanner />

        {isTeacher && appStatus?.application_status === 'pending' && (
          <div style={{ background: '#F5F5F5', borderRadius: '14px', border: '2px solid #E2E8F0', padding: '1.25rem 1.5rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '32px', flexShrink: 0 }}>⏳</span>
            <div>
              <h3 style={{ fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: '16px', color: '#0B0B0B', margin: '0 0 4px' }}>Application under review</h3>
              <p style={{ fontSize: '13px', color: '#0B0B0B', margin: 0, lineHeight: '1.6' }}>Your teacher application has been submitted and is being reviewed. We'll notify you within 24–48 hours.</p>
            </div>
          </div>
        )}

        {isTeacher && appStatus?.application_status === 'rejected' && (
          <div style={{ background: '#F5F5F5', borderRadius: '14px', border: '2px solid #E2E8F0', padding: '1.25rem 1.5rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <span style={{ fontSize: '32px', flexShrink: 0 }}>❌</span>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: '16px', color: '#6D28D9', margin: '0 0 6px' }}>Application not approved</h3>
              {appStatus.application_notes && (
                <p style={{ fontSize: '13px', color: '#6D28D9', margin: '0 0 10px', lineHeight: '1.6', background: '#F5F5F5', borderRadius: '8px', padding: '10px 14px' }}>
                  <strong>Reason:</strong> {appStatus.application_notes}
                </p>
              )}
              <button onClick={() => navigate('/apply')} style={{ padding: '10px 22px', background: '#6D28D9', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700' }}>
                Update & resubmit
              </button>
            </div>
          </div>
        )}

        {isTeacher ? (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '220px 1fr', gap: '1.5rem', alignItems: 'start' }}>
            {!isMobile ? (
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', position: 'sticky', top: '1rem' }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid #E2E8F0', background: GREY_BG }}>
                  <p style={{ fontSize: '11px', fontWeight: '700', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>Dashboard</p>
                </div>
                <div style={{ padding: '8px' }}>
                  {TEACHER_SECTIONS.map(({ key, icon, label, group }, i) => (
                    <div key={key}>
                      {(i === 0 || TEACHER_SECTIONS[i - 1].group !== group) && (
                        <div style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9CA3AF', padding: '14px 12px 4px' }}>{group}</div>
                      )}
                      <button onClick={() => setActiveSection(key)}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: 'none', borderRadius: '10px', background: activeSection === key ? LIGHT_BLUE : 'transparent', color: activeSection === key ? BLUE : '#0B0B0B', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: activeSection === key ? '700' : '400', textAlign: 'left', marginBottom: '2px', transition: 'all 0.15s' }}>
                        <span style={{ fontSize: '16px', flexShrink: 0 }}>{icon}</span>
                        {label}
                        {activeSection === key && <span style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: '#6D28D9', flexShrink: 0 }} />}
                      </button>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '12px', borderTop: '1px solid #E2E8F0' }}>
                  <Link to="/sessions" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: YELLOW, color: '#FFFFFF', borderRadius: '10px', fontSize: '13px', textDecoration: 'none', fontWeight: '700' }}>
                    🎥 My live sessions
                  </Link>
                </div>
              </div>
            ) : (
              <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '6px', overflowX: 'auto', display: 'flex', gap: '4px', scrollbarWidth: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                {TEACHER_SECTIONS.map(({ key, icon, label }) => (
                  <button key={key} onClick={() => setActiveSection(key)}
                    style={{ padding: '8px 14px', border: 'none', borderRadius: '8px', background: activeSection === key ? '#6D28D9' : 'transparent', color: activeSection === key ? '#fff' : TEXT_MUTED, fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: activeSection === key ? '700' : '400', whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span>{icon}</span>{label}
                  </button>
                ))}
              </div>
            )}

            <div>
              {activeSection === 'overview' && <TeacherOverview userId={user.id} profile={profile} navigate={navigate} setActiveSection={setActiveSection} />}
              {activeSection === 'about' && <TeacherBioSection userId={user.id} />}
              {activeSection === 'availability' && <AvailabilitySchedule userId={user.id} />}
              {activeSection === 'documents' && <TeacherDocuments userId={user.id} />}
              {activeSection === 'qualifications' && <Qualifications userId={user.id} />}
              {activeSection === 'portfolio' && <PortfolioUploads userId={user.id} />}
              {activeSection === 'videos' && <PitchVideos userId={user.id} />}
              {activeSection === 'earnings' && <TeacherEarnings userId={user.id} />}
              {activeSection === 'profile' && <ProfileEditor />}
            </div>
          </div>
        ) : (
          <div>
            <LearnerOverview userId={user.id} profile={profile} />
            <ProfileEditor />
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

function AvatarUpload({ userId, currentUrl, initial, onUpdate, role, pendingUrl }) {
  const [uploading, setUploading] = useState(false)
  const [justSubmitted, setJustSubmitted] = useState(false)
  // Teacher photos are public-facing, so a change waits for admin approval.
  // Learners/parents update immediately. To require approval for everyone,
  // change this to: const needsApproval = true
  const needsApproval = role === 'teacher'
  const awaitingReview = needsApproval && (justSubmitted || !!pendingUrl)

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const fileName = `${userId}/${Date.now()}.${file.name.split('.').pop()}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName)
      const column = needsApproval ? 'pending_avatar_url' : 'avatar_url'
      const { error: updateError } = await supabase.from('profiles').update({ [column]: urlData.publicUrl }).eq('id', userId)
      if (updateError) throw updateError
      if (needsApproval) setJustSubmitted(true)
      onUpdate()
    } catch (err) { console.log(err) }
    finally { setUploading(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
      <label style={{ position: 'relative', cursor: 'pointer', display: 'inline-block' }}>
        <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
        {currentUrl ? (
          <img src={currentUrl} alt="Profile" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(0,0,0,0.3)', display: 'block' }} />
        ) : (
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '700', color: '#FFFFFF', border: '3px solid rgba(0,0,0,0.12)' }}>
            {initial}
          </div>
        )}
        <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', background: '#6D28D9', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#fff', border: '2px solid #fff' }}>
          {uploading ? '…' : '✎'}
        </div>
      </label>
      {awaitingReview && (
        <span style={{ fontSize: '10px', fontWeight: '700', color: '#fff', background: YELLOW, padding: '3px 8px', borderRadius: '9999px', whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>
          ⏳ Photo pending review
        </span>
      )}
    </div>
  )
}

function TeacherOverview({ userId, profile, navigate, setActiveSection }) {
  const [stats, setStats] = useState({ totalBookings: 0, pendingBookings: 0, totalEarned: 0, pendingPayout: 0, totalStudents: 0, avgRating: null, reviewCount: 0 })
  const [recentBookings, setRecentBookings] = useState([])
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [nextSession, setNextSession] = useState(null)
  const [setup, setSetup] = useState({ photo: false, bio: false, availability: false, id: false, verified: false })
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchStats() }, [])

  const fetchStats = async () => {
    const today = new Date().toISOString().split('T')[0]
    const [
      { data: bookings }, { data: reviews }, { count: unread },
      { data: sessions }, { data: teacherRow }, { count: availCount }, { count: docCount },
    ] = await Promise.all([
      supabase.from('bookings').select('amount, teacher_payout, payout_status, payment_status, status, client_id, subject, created_at').eq('teacher_id', userId),
      supabase.from('reviews').select('rating').eq('teacher_id', userId),
      supabase.from('messages').select('*', { count: 'exact', head: true }).eq('receiver_id', userId).eq('read', false),
      supabase.from('live_sessions').select('title, session_date, start_time').eq('teacher_id', userId).gte('session_date', today).order('session_date').order('start_time').limit(1),
      supabase.from('teachers').select('bio, is_verified').eq('id', userId).single(),
      supabase.from('teacher_availability').select('*', { count: 'exact', head: true }).eq('teacher_id', userId),
      supabase.from('teacher_documents').select('*', { count: 'exact', head: true }).eq('teacher_id', userId),
    ])

    const paid = (bookings || []).filter(b => b.payment_status === 'paid')
    const uniqueStudents = new Set((bookings || []).map(b => b.client_id)).size
    const totalEarned = paid.reduce((s, b) => s + (b.teacher_payout || 0), 0)
    const pendingPayout = paid.filter(b => b.payout_status === 'pending').reduce((s, b) => s + (b.teacher_payout || 0), 0)
    const avgRating = reviews?.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null
    setStats({ totalBookings: (bookings || []).length, pendingBookings: (bookings || []).filter(b => b.status === 'pending').length, totalEarned, pendingPayout, totalStudents: uniqueStudents, avgRating, reviewCount: reviews?.length || 0 })
    setRecentBookings((bookings || []).slice(0, 5))
    setUnreadMessages(unread || 0)
    setNextSession(sessions?.[0] || null)
    setSetup({
      photo: !!profile?.avatar_url,
      bio: !!(teacherRow?.bio && teacherRow.bio.trim()),
      availability: (availCount || 0) > 0,
      id: (docCount || 0) > 0,
      verified: !!teacherRow?.is_verified,
    })
    setLoading(false)
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: TEXT_MUTED }}>Loading...</div>

  const pending = stats.pendingBookings
  const fmtSession = (s) => {
    const d = new Date(`${s.session_date}T${s.start_time || '00:00'}`)
    const day = d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
    return s.start_time ? `${day} · ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : day
  }

  // Adaptive hero: surface the single most urgent thing.
  let hero
  if (pending > 0) {
    hero = { eyebrow: 'Needs your attention', title: `${pending} ${pending === 1 ? 'person wants' : 'people want'} to book you`, sub: 'Reply quickly to lock in the session before they look elsewhere.', cta: 'Review requests', onClick: () => navigate('/booking-requests') }
  } else if (unreadMessages > 0) {
    hero = { eyebrow: 'Needs your attention', title: `${unreadMessages} unread message${unreadMessages === 1 ? '' : 's'}`, sub: "Someone's waiting to hear back from you.", cta: 'Open messages', onClick: () => navigate('/messages') }
  } else if (nextSession) {
    hero = { eyebrow: "You're all set", title: 'Nothing needs you right now', sub: `Next up: ${nextSession.title} — ${fmtSession(nextSession)}.`, cta: 'View sessions', onClick: () => navigate('/sessions') }
  } else {
    hero = { eyebrow: "You're all caught up", title: 'No requests waiting', sub: 'Host a live class to reach more learners and fill your calendar.', cta: 'Create a session', onClick: () => navigate('/sessions') }
  }

  const glance = [
    { label: 'Requests', value: pending, onClick: () => navigate('/booking-requests') },
    { label: 'Unread', value: unreadMessages, onClick: () => navigate('/messages') },
    { label: 'Next session', value: nextSession ? fmtSession(nextSession) : 'None', onClick: () => navigate('/sessions') },
  ]

  const steps = [
    { key: 'photo', label: 'Add a profile photo', done: setup.photo, go: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
    { key: 'bio', label: 'Write your bio', done: setup.bio, go: () => setActiveSection?.('about') },
    { key: 'availability', label: 'Set your availability', done: setup.availability, go: () => setActiveSection?.('availability') },
    { key: 'id', label: 'Upload your ID', done: setup.id, go: () => setActiveSection?.('documents') },
  ]
  const doneCount = steps.filter(s => s.done).length
  const showChecklist = doneCount < steps.length

  return (
    <div>
      {/* ── Attention hero ─────────────────────────────────────────── */}
      <div style={{ position: 'relative', overflow: 'hidden', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '20px', padding: '1.75rem', marginBottom: '1.25rem', boxShadow: '0 12px 32px rgba(0,0,0,0.22)' }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(0,0,0,0.06)' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', color: YELLOW, marginBottom: '10px' }}>{hero.eyebrow}</div>
          <h2 style={{ fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: '24px', fontWeight: '700', color: '#0B0B0B', margin: '0 0 8px', lineHeight: 1.2, letterSpacing: '-0.01em', maxWidth: '520px' }}>{hero.title}</h2>
          <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.75)', margin: '0 0 18px', lineHeight: 1.6, maxWidth: '460px' }}>{hero.sub}</p>
          <button onClick={hero.onClick}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 22px', background: YELLOW, color: '#FFFFFF', border: 'none', borderRadius: '9999px', fontSize: '14px', fontWeight: '800', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 6px 18px rgba(0,0,0,0.17)' }}>
            {hero.cta} <span style={{ fontSize: '15px' }}>→</span>
          </button>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', paddingTop: '18px', borderTop: '1px solid rgba(0,0,0,0.15)', flexWrap: 'wrap' }}>
            {glance.map(g => (
              <button key={g.label} onClick={g.onClick}
                style={{ flex: '1 1 120px', textAlign: 'left', background: 'rgba(0,0,0,0.10)', border: '1px solid rgba(0,0,0,0.14)', borderRadius: '12px', padding: '10px 14px', cursor: 'pointer', fontFamily: 'inherit' }}>
                <div style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.6)', marginBottom: '3px' }}>{g.label}</div>
                <div style={{ fontSize: '17px', fontWeight: '800', color: '#0B0B0B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.value}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Setup checklist (only until complete) ──────────────────── */}
      {showChecklist && (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.5rem', marginBottom: '1.25rem', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '4px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0B0B0B', margin: 0 }}>Finish setting up your profile</h3>
            <span style={{ fontSize: '13px', fontWeight: '800', color: BLUE }}>{doneCount}/{steps.length}</span>
          </div>
          <p style={{ fontSize: '13px', color: TEXT_MUTED, margin: '0 0 14px' }}>Complete these so learners can find and book you.</p>
          <div style={{ height: '8px', background: GREY_BG, borderRadius: '9999px', overflow: 'hidden', marginBottom: '16px', border: '1px solid #E2E8F0' }}>
            <div style={{ height: '100%', width: `${(doneCount / steps.length) * 100}%`, background: '#6D28D9', borderRadius: '9999px', transition: 'width 0.4s ease' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {steps.map(s => (
              <button key={s.key} onClick={s.done ? undefined : s.go} disabled={s.done}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', background: s.done ? '#F5F5F5' : GREY_BG, border: `1px solid ${s.done ? '#E2E8F0' : '#E2E8F0'}`, borderRadius: '10px', cursor: s.done ? 'default' : 'pointer', fontFamily: 'inherit', textAlign: 'left', width: '100%' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', background: s.done ? '#6D28D9' : '#fff', color: s.done ? '#fff' : TEXT_MUTED, border: s.done ? 'none' : '2px solid #E2E8F0' }}>{s.done ? '✓' : ''}</span>
                <span style={{ flex: 1, fontSize: '14px', fontWeight: s.done ? '500' : '700', color: s.done ? TEXT_MUTED : '#0B0B0B', textDecoration: s.done ? 'line-through' : 'none' }}>{s.label}</span>
                {!s.done && <span style={{ fontSize: '13px', fontWeight: '700', color: BLUE, flexShrink: 0 }}>Do it →</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Stats (secondary) ──────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '1.25rem' }}>
        {[
          { icon: '📅', label: 'Total bookings', value: stats.totalBookings, sub: `${stats.pendingBookings} pending`, color: BLUE, bg: LIGHT_BLUE },
          { icon: '👥', label: 'Students taught', value: stats.totalStudents, sub: 'unique learners', color: '#0B0B0B', bg: '#F5F5F5' },
          { icon: '💰', label: 'Total earned', value: `GH₵ ${stats.totalEarned.toFixed(2)}`, sub: `GH₵ ${stats.pendingPayout.toFixed(2)} pending`, color: '#0B0B0B', bg: '#F5F5F5' },
          { icon: '⭐', label: 'Average rating', value: stats.avgRating || '—', sub: `${stats.reviewCount} review${stats.reviewCount !== 1 ? 's' : ''}`, color: '#0B0B0B', bg: '#F5F5F5' },
        ].map(({ icon, label, value, sub, color, bg }) => (
          <div key={label} style={{ position: 'relative', overflow: 'hidden', background: '#fff', borderRadius: '18px', border: '1px solid #F5F5F5', padding: '1.4rem', boxShadow: '0 3px 14px rgba(0,0,0,0.06)' }}>
            <div style={{ position: 'absolute', top: '-24px', right: '-24px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(0,0,0,0.04)' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>{icon}</div>
                <span style={{ fontSize: '11px', fontWeight: '700', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{label}</span>
              </div>
              <div style={{ fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: '28px', fontWeight: '700', color, lineHeight: 1, marginBottom: '5px' }}>{value}</div>
              <div style={{ fontSize: '12px', color: TEXT_MUTED }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {recentBookings.length > 0 && (
        <SectionCard title="Recent bookings" icon="📅">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentBookings.map((b, i) => {
              const sc = b.status === 'confirmed' ? { bg: '#F5F5F5', color: '#0B0B0B' } : b.status === 'declined' ? { bg: '#F5F5F5', color: '#6D28D9' } : { bg: '#F5F5F5', color: '#0B0B0B' }
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: GREY_BG, borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#0B0B0B', marginBottom: '2px' }}>{b.subject || 'Private session'}</div>
                    <div style={{ fontSize: '12px', color: TEXT_MUTED }}>{new Date(b.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </div>
                  {b.teacher_payout > 0 && <div style={{ fontSize: '14px', fontWeight: '700', color: '#0B0B0B' }}>GH₵ {b.teacher_payout?.toFixed(2)}</div>}
                  <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '700', background: sc.bg, color: sc.color, textTransform: 'capitalize', flexShrink: 0 }}>{b.status}</span>
                </div>
              )
            })}
          </div>
        </SectionCard>
      )}
    </div>
  )
}

function LearnerOverview({ userId, profile }) {
  const [loading, setLoading] = useState(true)
  const [nextSession, setNextSession] = useState(null)
  const [next1on1, setNext1on1] = useState(null)
  const [pendingPayment, setPendingPayment] = useState([])
  const [pendingAssignments, setPendingAssignments] = useState([])
  const [certCount, setCertCount] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)
  const [bookingCount, setBookingCount] = useState(0)

  useEffect(() => { fetchOverview() }, [userId])

  const fetchOverview = async () => {
    const today = new Date().toISOString().split('T')[0]
    const [{ data: enrollments }, { data: assignments }, { count: certs }, { count: unread }, { data: bookingsData }] = await Promise.all([
      supabase.from('enrollments').select('session_id, live_sessions (id, title, session_date, start_time, room_id, teachers (profiles (full_name)))').eq('user_id', userId),
      supabase.from('assignments').select('id, title, subject, due_date').eq('learner_id', userId).order('due_date', { ascending: true }),
      supabase.from('course_certificates').select('*', { count: 'exact', head: true }).eq('learner_id', userId),
      supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('read', false),
      supabase.from('bookings').select('id, subject, amount, payment_status, session_date, start_time, room_id, teachers (profiles (full_name))').eq('client_id', userId).eq('status', 'confirmed').order('session_date', { ascending: true }),
    ])
    const upcoming = (enrollments || []).map(e => e.live_sessions).filter(s => s && s.session_date >= today).sort((a, b) => `${a.session_date}T${a.start_time}`.localeCompare(`${b.session_date}T${b.start_time}`))
    setNextSession(upcoming[0] || null)

    const confirmed = bookingsData || []
    setBookingCount(confirmed.length)
    setPendingPayment(confirmed.filter(b => (b.amount || 0) > 0 && b.payment_status !== 'paid').slice(0, 3))
    setNext1on1(confirmed.find(b => (b.payment_status === 'paid' || (b.amount || 0) === 0) && b.session_date && b.session_date >= today) || null)

    if (assignments?.length > 0) {
      const { data: subs } = await supabase.from('submissions').select('assignment_id').in('assignment_id', assignments.map(a => a.id))
      const submittedIds = new Set((subs || []).map(s => s.assignment_id))
      setPendingAssignments(assignments.filter(a => !submittedIds.has(a.id)).slice(0, 3))
    }
    setCertCount(certs || 0); setUnreadCount(unread || 0)
    setLoading(false)
  }

  if (loading) return null

  const fmtWhen = (date, time) => {
    if (!date) return ''
    const d = new Date(`${date}T${time || '00:00'}`)
    const day = d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
    return time ? `${day} · ${time.slice(0, 5)}` : day
  }

  // Action feed — only things that actually need the learner to do something.
  const actions = []
  pendingPayment.forEach(b => actions.push({
    key: 'pay-' + b.id, icon: '💳', title: 'Payment due',
    desc: `${b.subject || 'Private session'} with ${b.teachers?.profiles?.full_name || 'your teacher'}${b.amount ? ` · GH₵ ${Number(b.amount).toFixed(2)}` : ''}`,
    cta: 'Pay now', link: '/booking?tab=bookings', tone: 'pay',
  }))
  if (nextSession) actions.push({
    key: 'live', icon: '🎥', title: 'Upcoming live session',
    desc: `${nextSession.title} · ${fmtWhen(nextSession.session_date, nextSession.start_time)}${nextSession.teachers?.profiles?.full_name ? ` · ${nextSession.teachers.profiles.full_name}` : ''}`,
    cta: nextSession.room_id ? 'Join' : 'View', link: nextSession.room_id ? `/call/${nextSession.room_id}` : '/sessions', tone: 'blue',
  })
  if (next1on1) actions.push({
    key: '1on1', icon: '📅', title: 'Upcoming private session',
    desc: `${next1on1.subject || 'Session'} with ${next1on1.teachers?.profiles?.full_name || 'your teacher'} · ${fmtWhen(next1on1.session_date, next1on1.start_time)}`,
    cta: next1on1.room_id ? 'Join' : 'View', link: next1on1.room_id ? `/call/${next1on1.room_id}` : '/booking?tab=bookings', tone: 'blue',
  })
  pendingAssignments.forEach(a => actions.push({
    key: 'assign-' + a.id, icon: '📝', title: 'Assignment to submit',
    desc: `${a.title} · ${a.subject}${a.due_date ? ` · Due ${new Date(a.due_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}` : ''}`,
    cta: 'Submit', link: '/assignments', tone: 'amber',
  }))

  const toneStyles = {
    pay:   { grad: '#F5F5F5', accent: '#6B7280', shadow: 'rgba(0,0,0,0.10)' },
    blue:  { grad: '#F5F5F5', accent: '#6B7280', shadow: 'rgba(0,0,0,0.10)' },
    amber: { grad: '#F5F5F5', accent: '#6B7280', shadow: 'rgba(0,0,0,0.10)' },
  }

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      {/* ── Action feed ─────────────────────────────────────────────── */}
      <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #F5F5F5', padding: '1.6rem', marginBottom: '1.25rem', boxShadow: '0 6px 22px rgba(0,0,0,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3px' }}>
          <h3 style={{ fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: '18px', fontWeight: '700', color: DARK_BLUE, margin: 0, letterSpacing: '-0.01em' }}>Needs your attention</h3>
          {actions.length > 0 && <span style={{ fontSize: '11px', fontWeight: '800', color: '#FFFFFF', background: '#6D28D9', borderRadius: '9999px', padding: '2px 9px', minWidth: '22px', textAlign: 'center', boxShadow: '0 3px 8px rgba(0,0,0,0.3)' }}>{actions.length}</span>}
        </div>
        <p style={{ fontSize: '13px', color: TEXT_MUTED, margin: '0 0 18px' }}>{actions.length > 0 ? 'A few things are waiting on you.' : "You're all caught up."}</p>

        {actions.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px', background: `linear-gradient(135deg, ${LIGHT_BLUE} 0%, #F5F5F5 100%)`, borderRadius: '15px', border: '1px solid #F5F5F5' }}>
            <span style={{ fontSize: '26px' }}>✨</span>
            <div style={{ flex: 1, fontSize: '14px', color: DARK_BLUE, fontWeight: '700' }}>Nothing needs you right now.</div>
            <Link to="/teachers" style={{ fontSize: '13px', fontWeight: '800', color: '#FFFFFF', background: '#6D28D9', padding: '9px 18px', borderRadius: '9999px', textDecoration: 'none', flexShrink: 0, boxShadow: '0 5px 14px rgba(0,0,0,0.3)' }}>Find a teacher</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
            {actions.map(a => {
              const t = toneStyles[a.tone]
              return (
                <div key={a.key}
                  style={{ position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 16px 15px 22px', background: '#fff', border: '1px solid #F5F5F5', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', transition: 'transform 0.18s, box-shadow 0.18s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 12px 26px ${t.shadow}` }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.04)' }}
                >
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', background: t.grad }} />
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '23px', background: t.grad, boxShadow: `0 7px 16px ${t.shadow}` }}>{a.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#0B0B0B', letterSpacing: '-0.01em' }}>{a.title}</div>
                    <div style={{ fontSize: '12.5px', color: TEXT_MUTED, marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.desc}</div>
                  </div>
                  <Link to={a.link} style={{ fontSize: '13px', fontWeight: '800', color: '#fff', background: '#6D28D9', border: 'none', padding: '9px 20px', borderRadius: '9999px', textDecoration: 'none', flexShrink: 0, boxShadow: '0 6px 15px rgba(0,0,0,0.12)', whiteSpace: 'nowrap' }}>{a.cta}</Link>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Stat glance ─────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '1.25rem' }}>
        {[
          { icon: '📅', label: 'Active bookings', value: bookingCount, hero: true },
          { icon: '🏆', label: 'Certificates', value: certCount, hero: false },
          { icon: '🔔', label: 'Unread alerts', value: unreadCount, hero: false },
        ].map(({ icon, label, value, hero }) => (
          <div key={label} style={{ position: 'relative', overflow: 'hidden', borderRadius: '18px', padding: '1.4rem 1.25rem', border: hero ? 'none' : '1px solid #F5F5F5', background: hero ? '#FFFFFF' : '#fff', boxShadow: hero ? '0 10px 26px rgba(0,0,0,0.28)' : '0 3px 14px rgba(0,0,0,0.06)' }}>
            <div style={{ position: 'absolute', top: '-24px', right: '-24px', width: '90px', height: '90px', borderRadius: '50%', background: hero ? 'rgba(109,40,217,0.18)' : 'rgba(0,0,0,0.05)' }} />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '14px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', background: hero ? 'rgba(0,0,0,0.18)' : '#F5F5F5', boxShadow: hero ? 'none' : '0 6px 15px rgba(0,0,0,0.25)' }}>{icon}</div>
              <div>
                <div style={{ fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: '32px', fontWeight: '700', lineHeight: 1, color: hero ? YELLOW : DARK_BLUE }}>{value}</div>
                <div style={{ fontSize: '12.5px', fontWeight: '600', marginTop: '5px', color: hero ? 'rgba(0,0,0,0.85)' : TEXT_MUTED }}>{label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


function TeacherEarnings({ userId }) {
  const [earnings, setEarnings] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchEarnings() }, [])

  const fetchEarnings = async () => {
    const { data } = await supabase.from('bookings').select('amount, commission_amount, teacher_payout, payout_status, payment_status, subject, created_at').eq('teacher_id', userId).eq('payment_status', 'paid').order('created_at', { ascending: false })
    const paid = data || []
    setEarnings({
      totalGross: paid.reduce((s, b) => s + (b.amount || 0), 0),
      totalCommission: paid.reduce((s, b) => s + (b.commission_amount || 0), 0),
      totalPayout: paid.reduce((s, b) => s + (b.teacher_payout || 0), 0),
      pendingPayout: paid.filter(b => b.payout_status === 'pending').reduce((s, b) => s + (b.teacher_payout || 0), 0),
    })
    setBookings(paid); setLoading(false)
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem', color: TEXT_MUTED }}>Loading...</div>

  return (
    <div>
      <SectionCard title="Earnings overview" icon="💰" color="linear-gradient(135deg, #4B5563 0%, #6B7280 100%)">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: earnings && bookings.length > 0 ? '1.25rem' : 0 }}>
          {[
            ['Gross earnings', `GH₵ ${(earnings?.totalGross || 0).toFixed(2)}`, '#0B0B0B', GREY_BG],
            ['Platform fee (20%)', `GH₵ ${(earnings?.totalCommission || 0).toFixed(2)}`, '#6D28D9', '#F5F5F5'],
            ['Your net payout', `GH₵ ${(earnings?.totalPayout || 0).toFixed(2)}`, '#0B0B0B', '#F5F5F5'],
            ['Pending payout', `GH₵ ${(earnings?.pendingPayout || 0).toFixed(2)}`, '#0B0B0B', '#F5F5F5'],
          ].map(([label, value, color, bg]) => (
            <div key={label} style={{ background: bg, borderRadius: '12px', padding: '14px 16px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{label}</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color, fontFamily: 'Tahoma, Geneva, sans-serif' }}>{value}</div>
            </div>
          ))}
        </div>
        {bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: TEXT_MUTED, background: GREY_BG, borderRadius: '10px' }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>💰</div>
            <p style={{ fontSize: '14px', margin: 0 }}>No paid bookings yet. Earnings will appear here once students pay.</p>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '12px', fontWeight: '700', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Recent transactions</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {bookings.slice(0, 6).map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: GREY_BG, borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>💳</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#0B0B0B' }}>{b.subject || 'Private session'}</div>
                    <div style={{ fontSize: '12px', color: TEXT_MUTED }}>{new Date(b.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#0B0B0B' }}>GH₵ {(b.teacher_payout || 0).toFixed(2)}</div>
                    <div style={{ fontSize: '11px', color: TEXT_MUTED }}>of GH₵ {(b.amount || 0).toFixed(2)}</div>
                  </div>
                  <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '700', flexShrink: 0, background: b.payout_status === 'paid' ? '#F5F5F5' : '#F5F5F5', color: b.payout_status === 'paid' ? '#0B0B0B' : '#0B0B0B' }}>
                    {b.payout_status === 'paid' ? '✓ Paid' : '⏳ Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  )
}

function TeacherBioSection({ userId }) {
  const [bio, setBio] = useState('')
  const [yearsExperience, setYearsExperience] = useState('')
  const [languages, setLanguages] = useState('')
  const [teachingLevels, setTeachingLevels] = useState([])
  const [rate, setRate] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    supabase.from('teachers').select('bio, years_experience, languages, teaching_levels, hourly_rate').eq('id', userId).single()
      .then(({ data }) => {
        if (data) { setBio(data.bio || ''); setYearsExperience(data.years_experience || ''); setLanguages((data.languages || []).join(', ')); setTeachingLevels(data.teaching_levels || []); setRate(data.hourly_rate?.toString() || '') }
      })
  }, [])

  const save = async () => {
    setSaving(true); setMessage('')
    try {
      const { error } = await supabase.from('teachers').update({ bio, years_experience: yearsExperience ? parseInt(yearsExperience) : null, languages: languages ? languages.split(',').map(l => l.trim()).filter(Boolean) : [], teaching_levels: teachingLevels, hourly_rate: rate ? parseFloat(rate) : 0 }).eq('id', userId)
      if (error) throw error
      setMessage('✅ Profile updated!')
    } catch (err) { setMessage('Error: ' + err.message) }
    finally { setSaving(false) }
  }

  return (
    <SectionCard title="About me" icon="✏️">
      <StatusMessage message={message} onClose={() => setMessage('')} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={lbl}>Bio</label>
          <textarea style={{ ...inp, height: '110px', resize: 'vertical' }} placeholder="Tell parents and learners about yourself..." value={bio} onChange={e => setBio(e.target.value)} />
        </div>
        <div>
          <label style={lbl}>Hourly rate (GH₵)</label>
          <input style={inp} type="number" min="0" step="5" placeholder="e.g. 150" value={rate} onChange={e => setRate(e.target.value)} />
          <div style={{ fontSize: '12px', color: TEXT_MUTED, marginTop: '4px' }}>What learners pay per session. You can change this anytime.</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={lbl}>Years of experience</label>
            <input style={inp} type="number" min="0" max="50" placeholder="e.g. 5" value={yearsExperience} onChange={e => setYearsExperience(e.target.value)} />
          </div>
          <div>
            <label style={lbl}>Languages spoken</label>
            <input style={inp} placeholder="e.g. English, Twi, French" value={languages} onChange={e => setLanguages(e.target.value)} />
          </div>
        </div>
        <div>
          <label style={lbl}>Teaching levels</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px', border: '1px solid #E2E8F0', borderRadius: '10px', background: GREY_BG }}>
            {['Primary (1–6)', 'JHS (7–9)', 'SHS (10–12)', 'University', 'Professional'].map(level => {
              const selected = teachingLevels.includes(level)
              return (
                <label key={level} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', cursor: 'pointer', padding: '7px 14px', borderRadius: '20px', background: selected ? '#6D28D9' : '#fff', color: selected ? '#fff' : '#0B0B0B', border: `1px solid ${selected ? '#6D28D9' : '#E2E8F0'}`, fontWeight: selected ? '700' : '400', transition: 'all 0.15s' }}>
                  <input type="checkbox" checked={selected} onChange={e => setTeachingLevels(prev => e.target.checked ? [...prev, level] : prev.filter(l => l !== level))} style={{ display: 'none' }} />
                  {level}
                </label>
              )
            })}
          </div>
        </div>
        <button onClick={save} disabled={saving} style={btnPrimary}>{saving ? 'Saving...' : 'Save changes'}</button>
      </div>
    </SectionCard>
  )
}

function TeacherDocuments({ userId }) {
  const [docs, setDocs] = useState([])
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [docType, setDocType] = useState('National ID')

  const fetchDocs = async () => {
    const { data } = await supabase.from('teacher_documents').select('*').eq('teacher_id', userId).order('uploaded_at', { ascending: false })
    setDocs(data || [])
  }

  useEffect(() => { fetchDocs() }, [])

  const uploadDoc = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true); setMessage('')
    try {
      const fileName = `${userId}/${Date.now()}.${file.name.split('.').pop()}`
      const { error: uploadError } = await supabase.storage.from('teacher-ids').upload(fileName, file)
      if (uploadError) throw uploadError
      await supabase.from('teacher_documents').insert({ teacher_id: userId, document_type: docType, file_url: fileName, status: 'pending' })
      setMessage('✅ Document uploaded! Our team will review within 24–48 hours.'); fetchDocs()
    } catch (err) { setMessage('Error: ' + err.message) }
    finally { setUploading(false) }
  }

  const statusStyle = (s) => ({ approved: { bg: '#F5F5F5', color: '#0B0B0B', label: '✓ Approved' }, declined: { bg: '#F5F5F5', color: '#6D28D9', label: '✗ Declined' }, pending: { bg: '#F5F5F5', color: '#0B0B0B', label: '⏳ Pending' } }[s] || { bg: GREY_BG, color: TEXT_MUTED, label: s })

  return (
    <SectionCard title="ID & Background check" icon="🪪" color="linear-gradient(135deg, #4B5563 0%, #6B7280 100%)">
      <StatusMessage message={message} onClose={() => setMessage('')} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={lbl}>Document type</label>
          <select style={{ ...inp, cursor: 'pointer' }} value={docType} onChange={e => setDocType(e.target.value)}>
            {['National ID', 'Passport', 'Police Clearance', 'Background Check', 'Other'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>Upload file (PDF, JPG, PNG)</label>
          <div style={{ border: '2px dashed #E2E8F0', borderRadius: '10px', padding: '1.25rem', textAlign: 'center', background: GREY_BG }}>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={uploadDoc} disabled={uploading} style={{ fontSize: '13px', cursor: 'pointer', color: '#0B0B0B' }} />
            <p style={{ fontSize: '12px', color: TEXT_MUTED, marginTop: '6px', marginBottom: 0 }}>PDF, JPG, or PNG — max 10MB</p>
          </div>
        </div>
        {uploading && <div style={{ fontSize: '13px', color: BLUE }}>⏳ Uploading...</div>}
        {docs.length > 0 && (
          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '14px' }}>
            <p style={lbl}>Uploaded documents</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {docs.map(doc => {
                const sc = statusStyle(doc.status)
                return (
                  <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: GREY_BG, borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '22px' }}>🪪</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#0B0B0B' }}>{doc.document_type}</div>
                      <div style={{ fontSize: '11px', color: TEXT_MUTED }}>{new Date(doc.uploaded_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', background: sc.bg, color: sc.color, flexShrink: 0 }}>{sc.label}</span>
                    <button onClick={async () => { try { const u = await resolvePrivateDoc(doc.file_url); if (u) window.open(u, '_blank', 'noopener') } catch (e) { alert('Could not open document') } }} style={{ fontSize: '12px', color: BLUE, fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, fontFamily: 'inherit' }}>View →</button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  )
}

function Qualifications({ userId }) {
  const [certType, setCertType] = useState('academic')
  const [certFile, setCertFile] = useState(null)
  const [certName, setCertName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [certificates, setCertificates] = useState([])

  const TYPE_META = {
    academic: { icon: '🎓', label: 'Academic degree' },
    teaching: { icon: '📄', label: 'Teaching certificate' },
  }

  const fetchUploads = async () => {
    const { data } = await supabase.from('certificates').select('*').eq('teacher_id', userId).order('id', { ascending: false })
    setCertificates(data || [])
  }

  useEffect(() => { fetchUploads() }, [])

  const upload = async () => {
    if (!certFile || !certName) return setMessage('Please select a file and enter a name.')
    setUploading(true); setMessage('')
    try {
      const fileName = `${userId}/${Date.now()}.${certFile.name.split('.').pop()}`
      const { error } = await supabase.storage.from('certificates').upload(fileName, certFile)
      if (error) throw error
      const { data: urlData } = supabase.storage.from('certificates').getPublicUrl(fileName)
      await supabase.from('certificates').insert({ teacher_id: userId, file_url: urlData.publicUrl, certificate_name: certName, status: 'pending', certificate_type: certType })
      setMessage('✅ Uploaded! Our team will review it shortly.'); setCertFile(null); setCertName(''); fetchUploads()
    } catch (err) { setMessage('Error: ' + err.message) }
    finally { setUploading(false) }
  }

  return (
    <SectionCard title="Qualifications" icon="🎓" color="linear-gradient(135deg, #4B5563 0%, #6B7280 100%)">
      <p style={{ fontSize: '13px', color: TEXT_MUTED, margin: '0 0 14px', lineHeight: 1.5 }}>
        🔒 Reviewed by Stuumo before the “Verified” badge shows on your public profile. Add your academic degrees and teaching certificates here.
      </p>
      <StatusMessage message={message} onClose={() => setMessage('')} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={lbl}>Type</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {Object.entries(TYPE_META).map(([val, meta]) => (
              <button key={val} type="button" onClick={() => setCertType(val)}
                style={{ flex: 1, padding: '10px', borderRadius: '10px', border: `1.5px solid ${certType === val ? BLUE : '#E2E8F0'}`, background: certType === val ? LIGHT_BLUE : '#fff', color: certType === val ? BLUE : '#6B7280', fontSize: '13px', fontWeight: certType === val ? '700' : '500', cursor: 'pointer', fontFamily: 'inherit' }}>
                {meta.icon} {meta.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label style={lbl}>{certType === 'academic' ? 'Degree name' : 'Certificate name'}</label>
          <input style={inp} placeholder={certType === 'academic' ? 'e.g. BSc Mathematics — University of Ghana' : 'e.g. PGDE — University of Education, Winneba'} value={certName} onChange={e => setCertName(e.target.value)} />
        </div>
        <div>
          <label style={lbl}>Upload file (PDF, JPG, PNG)</label>
          <div style={{ border: '2px dashed #E2E8F0', borderRadius: '10px', padding: '1.25rem', background: GREY_BG }}>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setCertFile(e.target.files[0])} style={{ fontSize: '13px', cursor: 'pointer', color: '#0B0B0B', width: '100%' }} />
            {certFile && <p style={{ fontSize: '12px', color: '#0B0B0B', marginTop: '6px', fontWeight: '600', marginBottom: 0 }}>📎 {certFile.name}</p>}
          </div>
        </div>
        <button onClick={upload} disabled={uploading} style={btnPrimary}>{uploading ? 'Uploading...' : 'Upload qualification'}</button>
        {certificates.length > 0 && (
          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {certificates.map(cert => {
              const meta = TYPE_META[cert.certificate_type] || TYPE_META.teaching
              return (
                <div key={cert.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: GREY_BG, borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '22px' }}>{meta.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#0B0B0B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cert.certificate_name}</div>
                    <div style={{ fontSize: '11px', color: TEXT_MUTED }}>{meta.label}</div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', background: cert.status === 'approved' ? '#F5F5F5' : '#F5F5F5', color: cert.status === 'approved' ? '#0B0B0B' : '#0B0B0B' }}>
                    {cert.status === 'approved' ? '✓ Approved' : '⏳ Pending'}
                  </span>
                  <a href={cert.file_url} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: BLUE, fontWeight: '700', textDecoration: 'none', flexShrink: 0 }}>View →</a>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </SectionCard>
  )
}

function PortfolioUploads({ userId }) {
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [items, setItems] = useState([])

  const fetchItems = async () => {
    const { data } = await supabase.from('teacher_portfolio').select('*').eq('teacher_id', userId).order('uploaded_at', { ascending: false })
    setItems(data || [])
  }

  useEffect(() => { fetchItems() }, [])

  const upload = async () => {
    if (!file || !title) return setMessage('Please select a file and enter a title.')
    setUploading(true); setMessage('')
    try {
      const fileName = `${userId}/portfolio/${Date.now()}.${file.name.split('.').pop()}`
      const { error } = await supabase.storage.from('documents').upload(fileName, file)
      if (error) throw error
      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(fileName)
      await supabase.from('teacher_portfolio').insert({ teacher_id: userId, title, subject, file_url: urlData.publicUrl })
      setMessage('✅ Uploaded!'); setFile(null); setTitle(''); setSubject(''); fetchItems()
    } catch (err) { setMessage('Error: ' + err.message) }
    finally { setUploading(false) }
  }

  return (
    <SectionCard title="Teaching portfolio" icon="📁" color="linear-gradient(135deg, #4B5563 0%, #6B7280 100%)">
      <p style={{ fontSize: '13px', color: TEXT_MUTED, margin: '0 0 14px', lineHeight: 1.5 }}>✨ Shown on your public profile as-is — this is your showcase, not a verified credential.</p>
      <StatusMessage message={message} onClose={() => setMessage('')} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={lbl}>Title</label>
            <input style={inp} placeholder="e.g. Grade 8 Algebra Lesson Plan" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label style={lbl}>Subject</label>
            <input style={inp} placeholder="e.g. Mathematics" value={subject} onChange={e => setSubject(e.target.value)} />
          </div>
        </div>
        <div>
          <label style={lbl}>Upload file</label>
          <div style={{ border: '2px dashed #E2E8F0', borderRadius: '10px', padding: '1.25rem', background: GREY_BG }}>
            <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={e => setFile(e.target.files[0])} style={{ fontSize: '13px', cursor: 'pointer', color: '#0B0B0B', width: '100%' }} />
            {file && <p style={{ fontSize: '12px', color: '#0B0B0B', marginTop: '6px', fontWeight: '600', marginBottom: 0 }}>📎 {file.name}</p>}
          </div>
        </div>
        <button onClick={upload} disabled={uploading} style={btnPrimary}>{uploading ? 'Uploading...' : 'Upload to portfolio'}</button>
        {items.length > 0 && (
          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {items.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: GREY_BG, borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '22px' }}>📄</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#0B0B0B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                  {item.subject && <div style={{ fontSize: '12px', color: TEXT_MUTED }}>{item.subject}</div>}
                </div>
                <a href={item.file_url} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: BLUE, fontWeight: '700', textDecoration: 'none', flexShrink: 0 }}>View →</a>
                <button onClick={() => { supabase.from('teacher_portfolio').delete().eq('id', item.id).then(fetchItems) }} style={{ fontSize: '16px', color: '#6D28D9', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, opacity: 0.7 }}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </SectionCard>
  )
}

function PitchVideos({ userId }) {
  const [videoFile, setVideoFile] = useState(null)
  const [videoTitle, setVideoTitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [videos, setVideos] = useState([])

  const fetchVideos = async () => {
    const { data } = await supabase.from('pitch_videos').select('*').eq('teacher_id', userId)
    setVideos(data || [])
  }

  useEffect(() => { fetchVideos() }, [])

  const upload = async () => {
    if (!videoFile || !videoTitle) return setMessage('Please select a video and enter a title.')
    if (videos.length >= 2) return setMessage('Maximum 2 pitch videos allowed.')
    setUploading(true); setMessage('')
    try {
      const fileName = `${userId}/${Date.now()}.${videoFile.name.split('.').pop()}`
      const { error } = await supabase.storage.from('pitch-videos').upload(fileName, videoFile)
      if (error) throw error
      const { data: urlData } = supabase.storage.from('pitch-videos').getPublicUrl(fileName)
      await supabase.from('pitch_videos').insert({ teacher_id: userId, video_url: urlData.publicUrl, title: videoTitle })
      setMessage('✅ Video uploaded!'); setVideoFile(null); setVideoTitle(''); fetchVideos()
    } catch (err) { setMessage('Error: ' + err.message) }
    finally { setUploading(false) }
  }

  return (
    <SectionCard title="Pitch videos" icon="🎥">
      <p style={{ fontSize: '13px', color: TEXT_MUTED, margin: '0 0 14px', lineHeight: 1.5 }}>✨ Shown on your public profile as-is — a quick intro so learners can get a feel for you before booking.</p>
      <StatusMessage message={message} onClose={() => setMessage('')} />
      <div style={{ background: LIGHT_BLUE, borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', fontSize: '13px', color: BLUE }}>
        💡 Upload up to 2 short videos (30–60 seconds) showing your teaching style.
      </div>
      {videos.length < 2 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={lbl}>Video title</label>
            <input style={inp} placeholder="e.g. My Mathematics teaching approach" value={videoTitle} onChange={e => setVideoTitle(e.target.value)} />
          </div>
          <div>
            <label style={lbl}>Upload video (MP4, MOV)</label>
            <div style={{ border: '2px dashed #E2E8F0', borderRadius: '10px', padding: '1.25rem', background: GREY_BG }}>
              <input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files[0])} style={{ fontSize: '13px', cursor: 'pointer', color: '#0B0B0B', width: '100%' }} />
              {videoFile && <p style={{ fontSize: '12px', color: '#0B0B0B', marginTop: '6px', fontWeight: '600', marginBottom: 0 }}>🎬 {videoFile.name}</p>}
            </div>
          </div>
          <button onClick={upload} disabled={uploading} style={btnPrimary}>{uploading ? '⏳ Uploading...' : 'Upload video'}</button>
        </div>
      ) : (
        <div style={{ background: '#F5F5F5', borderRadius: '10px', padding: '12px 14px', fontSize: '13px', color: '#0B0B0B', fontWeight: '600', marginBottom: '14px' }}>
          ✅ Both pitch videos uploaded.
        </div>
      )}
      {videos.length > 0 && (
        <div style={{ borderTop: videos.length < 2 ? '1px solid #E2E8F0' : 'none', paddingTop: videos.length < 2 ? '14px' : 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {videos.map(vid => (
            <div key={vid.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: GREY_BG, borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '22px' }}>🎬</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#0B0B0B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{vid.title}</div>
              </div>
              <a href={vid.video_url} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: BLUE, fontWeight: '700', textDecoration: 'none', flexShrink: 0 }}>Play →</a>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  )
}

function AvailabilitySchedule({ userId }) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const [slots, setSlots] = useState([])
  const [form, setForm] = useState({ day_of_week: 'Monday', start_time: '09:00', end_time: '11:00' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const fetchSlots = async () => {
    const { data } = await supabase.from('teacher_availability').select('*').eq('teacher_id', userId).order('day_of_week').order('start_time')
    setSlots(data || [])
  }

  useEffect(() => { fetchSlots() }, [])

  const addSlot = async () => {
    if (form.start_time >= form.end_time) return setMessage('End time must be after start time.')
    setSaving(true); setMessage('')
    try {
      const { error } = await supabase.from('teacher_availability').insert({ teacher_id: userId, ...form })
      if (error) throw error
      setMessage('✅ Slot added!'); fetchSlots()
    } catch (err) { setMessage('Error: ' + (err.message.includes('unique') ? 'That slot already exists.' : err.message)) }
    finally { setSaving(false) }
  }

  const slotsByDay = days.reduce((acc, day) => { acc[day] = slots.filter(s => s.day_of_week === day); return acc }, {})

  return (
    <SectionCard title="Weekly availability" icon="📅" color="linear-gradient(135deg, #4B5563 0%, #6B7280 100%)">
      <StatusMessage message={message} onClose={() => setMessage('')} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '1.5rem' }}>
        <div>
          <label style={lbl}>Day</label>
          <select style={{ ...inp, cursor: 'pointer' }} value={form.day_of_week} onChange={e => setForm({ ...form, day_of_week: e.target.value })}>
            {days.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={lbl}>Start time</label>
            <input style={inp} type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} />
          </div>
          <div>
            <label style={lbl}>End time</label>
            <input style={inp} type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} />
          </div>
        </div>
        <button onClick={addSlot} disabled={saving} style={btnPrimary}>{saving ? 'Adding...' : '+ Add availability slot'}</button>
      </div>
      {slots.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '1.5rem', background: GREY_BG, borderRadius: '12px', color: TEXT_MUTED, fontSize: '14px' }}>
          No availability set yet. Add slots above to let parents know when you're free.
        </div>
      ) : (
        <div>
          <p style={lbl}>Your schedule</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {days.map(day => (
              <div key={day} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: slotsByDay[day].length > 0 ? LIGHT_BLUE : GREY_BG, borderRadius: '10px', border: `1px solid ${slotsByDay[day].length > 0 ? '#E2E8F0' : '#E2E8F0'}` }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: slotsByDay[day].length > 0 ? BLUE : TEXT_MUTED, width: '60px', flexShrink: 0 }}>{day.slice(0, 3)}</span>
                {slotsByDay[day].length > 0 ? (
                  <div style={{ display: 'flex', gap: '6px', flex: 1, flexWrap: 'wrap' }}>
                    {slotsByDay[day].map(slot => (
                      <div key={slot.id} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#fff', border: `1px solid ${BLUE}`, color: BLUE, fontSize: '12px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px' }}>
                        {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                        <button onClick={() => { supabase.from('teacher_availability').delete().eq('id', slot.id).then(fetchSlots) }} style={{ background: 'none', border: 'none', color: BLUE, cursor: 'pointer', fontSize: '13px', lineHeight: 1, padding: 0, opacity: 0.6 }}>×</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: '13px', color: TEXT_MUTED }}>Not available</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </SectionCard>
  )
}