import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Link, useNavigate } from 'react-router-dom'
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

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 769)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

const gradeColor = (score, max) => {
  const pct = (score / max) * 100
  if (pct >= 80) return { color: '#0B0B0B', bg: '#F5F5F5', label: 'Distinction' }
  if (pct >= 70) return { color: '#0B0B0B', bg: '#F5F5F5', label: 'Merit' }
  if (pct >= 60) return { color: '#0B0B0B', bg: '#F5F5F5', label: 'Pass' }
  return { color: '#6D28D9', bg: '#F5F5F5', label: 'Below pass' }
}

const fmtDate = (d) => d ? new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : null

export default function Progress() {
  usePageMeta('My Children')

  const { user } = useAuth()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [children, setChildren] = useState([])
  const [summaries, setSummaries] = useState({})
  const [selectedChild, setSelectedChild] = useState(null)
  const [data, setData] = useState({ assignments: [], certificates: [], bookings: [] })
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    if (!user) navigate('/login')
    else fetchChildren()
  }, [user])

  useEffect(() => {
    if (selectedChild) fetchChildData(selectedChild.id)
  }, [selectedChild])

  const fetchChildren = async () => {
    const { data: kids } = await supabase.from('profiles').select('id, full_name, grade, avatar_url').eq('parent_id', user.id)
    const list = kids || []
    setChildren(list)
    if (list.length === 0) { setSummaries({}); setLoading(false); return }
    const ids = list.map(k => k.id)
    const today = new Date().toISOString().slice(0, 10)
    const [{ data: bk }, { data: asg }, { data: certs }] = await Promise.all([
      supabase.from('bookings').select('client_id, status, session_date').in('client_id', ids),
      supabase.from('assignments').select('learner_id, max_score, submissions (score)').in('learner_id', ids),
      supabase.from('course_certificates').select('learner_id').in('learner_id', ids),
    ])
    const sum = {}
    list.forEach(k => { sum[k.id] = { upcoming: 0, nextDate: null, avg: null, certs: 0 } })
    ;(bk || []).forEach(b => {
      const s = sum[b.client_id]; if (!s) return
      if (b.status === 'confirmed' || b.status === 'pending') {
        s.upcoming++
        if (b.session_date && b.session_date >= today && (!s.nextDate || b.session_date < s.nextDate)) s.nextDate = b.session_date
      }
    })
    const agg = {}
    ;(asg || []).forEach(a => {
      const sc = a.submissions?.[0]?.score
      if (sc != null && a.max_score) (agg[a.learner_id] = agg[a.learner_id] || []).push((sc / a.max_score) * 100)
    })
    Object.entries(agg).forEach(([id, arr]) => { if (sum[id]) sum[id].avg = Math.round(arr.reduce((x, y) => x + y, 0) / arr.length) })
    ;(certs || []).forEach(c => { if (sum[c.learner_id]) sum[c.learner_id].certs++ })
    setSummaries(sum)
    setLoading(false)
    if (list.length === 1) setSelectedChild(list[0])
  }

  const fetchChildData = async (childId) => {
    setDetailLoading(true)
    const [{ data: assignments }, { data: certificates }, { data: bookings }] = await Promise.all([
      supabase.from('assignments').select('*, submissions (score, feedback, graded_at, submitted_at)').eq('learner_id', childId).order('created_at', { ascending: false }),
      supabase.from('course_certificates').select('*, teacher:teacher_id (id, profiles (full_name))').eq('learner_id', childId).order('issued_at', { ascending: false }),
      supabase.from('bookings').select('*, teachers (id, profiles (full_name, avatar_url))').eq('client_id', childId).order('created_at', { ascending: false }),
    ])
    setData({ assignments: assignments || [], certificates: certificates || [], bookings: bookings || [] })
    setDetailLoading(false)
  }

  const initial = (c) => (c?.full_name || '?').charAt(0).toUpperCase()

  // ── derived for the open child ──────────────────────────────
  const gradedAssignments = data.assignments.filter(a => a.submissions?.[0]?.score != null)
  const activeBookings = data.bookings.filter(b => b.status === 'confirmed' || b.status === 'pending')
  const avgScore = gradedAssignments.length > 0
    ? Math.round(gradedAssignments.reduce((sum, a) => sum + ((a.submissions[0].score / a.max_score) * 100), 0) / gradedAssignments.length)
    : null
  const sortedBookings = [...data.bookings].sort((a, b) => {
    const au = (a.status === 'confirmed' || a.status === 'pending') ? 0 : 1
    const bu = (b.status === 'confirmed' || b.status === 'pending') ? 0 : 1
    if (au !== bu) return au - bu
    return new Date(b.created_at) - new Date(a.created_at)
  })

  const Avatar = ({ c, size }) => (
    c?.avatar_url
      ? <img src={c.avatar_url} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `2px solid ${GREY_LIGHT}` }} />
      : <div style={{ width: size, height: size, borderRadius: '50%', background: GRADIENT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.4, fontWeight: '800', color: '#fff', flexShrink: 0 }}>{initial(c)}</div>
  )

  const AddCard = () => (
    <div style={{ background: '#fff', borderRadius: '18px', border: BORDER, overflow: 'hidden', marginBottom: '1.5rem', boxShadow: SHADOW_LG }}>
      <div style={{ background: '#F5F5F5', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '18px' }}>👶</span>
        <div><h3 style={{ color: '#0B0B0B', fontSize: '14px', fontWeight: '700', margin: 0 }}>Add a child</h3>
          <p style={{ color: 'rgba(0,0,0,0.65)', fontSize: '12px', margin: '2px 0 0' }}>No extra login needed — you manage everything from here.</p></div>
      </div>
      <div style={{ padding: '1.1rem 1.25rem' }}>
        <CreateChildForm parentId={user.id} onCreated={() => { setShowAdd(false); fetchChildren() }} />
      </div>
    </div>
  )

  const SectionHead = ({ title, count }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 12px' }}>
      <h3 style={{ fontSize: '15px', fontWeight: '800', color: TEXT, margin: 0, letterSpacing: '-0.01em' }}>{title}</h3>
      {count > 0 && <span style={{ fontSize: '11px', fontWeight: '800', color: TEXT_MUTED, background: GREY_BG, border: BORDER, borderRadius: '50px', padding: '1px 9px' }}>{count}</span>}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: GREY_BG, fontFamily: 'Tahoma, Geneva, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <NavBar />

      <div style={{ background: GRADIENT_HERO, padding: isMobile ? '1.75rem 1.25rem' : '2.25rem 2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '220px', height: '220px', borderRadius: '50%', border: '1px solid rgba(0,0,0,0.06)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {selectedChild && children.length > 1 && (
            <button onClick={() => { setSelectedChild(null); setShowAdd(false) }} style={{ background: 'none', border: 'none', color: BLUE, fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', padding: 0, marginBottom: '10px' }}>‹ All children</button>
          )}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F5F5F5', border: '1px solid #E2E8F0', color: YELLOW, fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 14px', borderRadius: '50px', marginBottom: '10px' }}>
            👨‍👩‍👧 My Children
          </div>
          <h1 style={{ fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: isMobile ? '26px' : '34px', color: '#0B0B0B', margin: 0, fontWeight: '700', letterSpacing: '-0.02em', lineHeight: '1.15' }}>
            {selectedChild ? selectedChild.full_name : 'My Children'}
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.7)', margin: '6px 0 0', lineHeight: '1.6' }}>
            {selectedChild
              ? `${selectedChild.grade ? selectedChild.grade + ' · ' : ''}Sessions, assignments and certificates`
              : 'Pick a child to see their lessons, grades and certificates'}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: isMobile ? '1.25rem' : '1.75rem 2rem', flex: 1, width: '100%', boxSizing: 'border-box' }}>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2].map(i => <div key={i} style={{ background: '#fff', borderRadius: '18px', border: BORDER, height: '92px', animation: 'pulse 1.5s infinite' }} />)}
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
          </div>

        ) : children.length === 0 ? (
          <>
            <AddCard />
            <div style={{ background: '#fff', borderRadius: '20px', border: BORDER, padding: '3.5rem 2rem', textAlign: 'center', boxShadow: SHADOW_LG }}>
              <div style={{ width: '76px', height: '76px', borderRadius: '50%', background: LIGHT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', margin: '0 auto 1.1rem' }}>👨‍👩‍👧</div>
              <h3 style={{ fontSize: '19px', fontWeight: '700', color: TEXT, marginBottom: '8px' }}>No children added yet</h3>
              <p style={{ fontSize: '14px', color: TEXT_MUTED, maxWidth: '340px', margin: '0 auto', lineHeight: '1.7' }}>Add your child above to start booking lessons and tracking their progress.</p>
            </div>
          </>

        ) : !selectedChild ? (
          /* ── OVERVIEW: one card per child ── */
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ fontSize: '14px', color: TEXT_MUTED }}>{children.length} {children.length === 1 ? 'child' : 'children'}</div>
              <button onClick={() => setShowAdd(s => !s)} style={{ padding: '9px 18px', borderRadius: '50px', border: `2px solid ${BLUE}`, background: showAdd ? LIGHT_BLUE : '#fff', color: BLUE, fontSize: '13px', fontWeight: '800', cursor: 'pointer', fontFamily: 'inherit' }}>{showAdd ? '✕ Close' : '+ Add a child'}</button>
            </div>
            {showAdd && <AddCard />}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))', gap: '14px' }}>
              {children.map(child => {
                const s = summaries[child.id] || {}
                return (
                  <button key={child.id} onClick={() => setSelectedChild(child)}
                    style={{ textAlign: 'left', background: '#fff', borderRadius: '18px', border: BORDER, padding: '1.25rem', boxShadow: SHADOW_LG, cursor: 'pointer', fontFamily: 'inherit', transition: TRANSITION, display: 'flex', flexDirection: 'column', gap: '14px' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = SHADOW_BLUE; e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = SHADOW_LG; e.currentTarget.style.transform = 'translateY(0)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Avatar c={child} size={48} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '16px', fontWeight: '800', color: TEXT, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{child.full_name}</div>
                        <div style={{ fontSize: '12px', color: TEXT_MUTED, marginTop: '2px' }}>{child.grade || 'No grade set'}</div>
                      </div>
                      <span style={{ fontSize: '20px', color: GREY_LIGHT }}>›</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px' }}>
                      {[
                        ['Next session', s.nextDate ? fmtDate(s.nextDate) : (s.upcoming ? 'TBC' : '—')],
                        ['Avg grade', s.avg != null ? `${s.avg}%` : '—'],
                        ['Certificates', s.certs || 0],
                      ].map(([label, val]) => (
                        <div key={label} style={{ background: GREY_BG, border: BORDER, borderRadius: '12px', padding: '10px 8px', textAlign: 'center' }}>
                          <div style={{ fontSize: '15px', fontWeight: '800', color: BLUE, lineHeight: 1.1 }}>{val}</div>
                          <div style={{ fontSize: '10px', color: TEXT_MUTED, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '4px' }}>{label}</div>
                        </div>
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>
          </>

        ) : (
          /* ── DETAIL: one child, single scroll ── */
          <>
            <div style={{ background: '#fff', borderRadius: '18px', border: BORDER, padding: '1.1rem 1.25rem', boxShadow: SHADOW_LG, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <Avatar c={selectedChild} size={50} />
              <div style={{ flex: 1, minWidth: '140px' }}>
                <div style={{ fontSize: '17px', fontWeight: '800', color: TEXT, letterSpacing: '-0.01em' }}>{selectedChild.full_name}</div>
                <div style={{ fontSize: '13px', color: TEXT_MUTED, marginTop: '2px' }}>
                  {activeBookings.length} active {activeBookings.length === 1 ? 'session' : 'sessions'}
                  {avgScore != null && <> · {avgScore}% avg</>}
                  {data.certificates.length > 0 && <> · {data.certificates.length} {data.certificates.length === 1 ? 'certificate' : 'certificates'}</>}
                </div>
              </div>
              <Link to="/teachers" style={{ padding: '10px 18px', borderRadius: '50px', background: YELLOW, color: '#fff', fontSize: '13px', fontWeight: '800', textDecoration: 'none', boxShadow: SHADOW_YELLOW, flexShrink: 0 }}>Find a tutor</Link>
            </div>

            {detailLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[1, 2, 3].map(i => <div key={i} style={{ background: '#fff', borderRadius: '16px', border: BORDER, height: '80px', animation: 'pulse 1.5s infinite' }} />)}
                <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
              </div>
            ) : (
              <>
                {/* SESSIONS */}
                <div style={{ marginBottom: '2rem' }}>
                  <SectionHead title="Sessions" count={data.bookings.length} />
                  {data.bookings.length === 0 ? (
                    <Empty icon="📅" title="No sessions yet" desc="When a teacher accepts a booking for this child, it will appear here." />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {sortedBookings.map(b => {
                        const sc = b.status === 'confirmed' ? { bg: '#F5F5F5', color: '#0B0B0B' } : b.status === 'pending' ? { bg: '#F5F5F5', color: '#0B0B0B' } : { bg: '#F5F5F5', color: '#6D28D9' }
                        return (
                          <div key={b.id} style={{ background: '#fff', borderRadius: '16px', border: BORDER, padding: '1.1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', boxShadow: SHADOW_LG }}>
                            {b.teachers?.profiles?.avatar_url ? (
                              <img src={b.teachers.profiles.avatar_url} alt="" style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `2px solid ${GREY_LIGHT}` }} />
                            ) : (
                              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: GRADIENT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', fontWeight: '800', color: '#fff', flexShrink: 0 }}>{b.teachers?.profiles?.full_name?.charAt(0)}</div>
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '15px', fontWeight: '700', color: TEXT, marginBottom: '3px' }}>{b.subject}</div>
                              <div style={{ fontSize: '13px', color: TEXT_MUTED }}>👩‍🏫 {b.teachers?.profiles?.full_name}{b.session_date ? ` · 📅 ${fmtDate(b.session_date)}${b.start_time ? ' · ' + b.start_time : ''}` : ''}</div>
                            </div>
                            {b.amount > 0 && (
                              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <div style={{ fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: '16px', fontWeight: '700', color: BLUE }}>GH₵ {b.amount}</div>
                                {b.payment_status === 'paid' && <div style={{ fontSize: '11px', color: '#0B0B0B', fontWeight: '700' }}>✅ Paid</div>}
                              </div>
                            )}
                            <span style={{ fontSize: '12px', fontWeight: '700', color: sc.color, background: sc.bg, padding: '4px 12px', borderRadius: '50px', border: BORDER, textTransform: 'capitalize', flexShrink: 0 }}>{b.status}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* ASSIGNMENTS */}
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', margin: '0 0 12px', flexWrap: 'wrap' }}>
                    <SectionHead title="Assignments & grades" count={data.assignments.length} />
                    {avgScore != null && (
                      <span style={{ fontSize: '12.5px', fontWeight: '800', color: avgScore >= 60 ? '#0B0B0B' : '#DC2626', background: GREY_BG, border: BORDER, borderRadius: '50px', padding: '5px 14px' }}>
                        {avgScore}% average · {gradedAssignments.length} graded
                      </span>
                    )}
                  </div>
                  {data.assignments.length === 0 ? (
                    <Empty icon="📝" title="No assignments yet" desc="Assignments, grades and teacher feedback will show here." />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {data.assignments.map(a => {
                        const sub = a.submissions?.[0]
                        const isGraded = sub?.score != null
                        const gc = isGraded ? gradeColor(sub.score, a.max_score) : null
                        const scorePercent = isGraded ? Math.round((sub.score / a.max_score) * 100) : null
                        return (
                          <div key={a.id} style={{ background: '#fff', borderRadius: '16px', border: BORDER, boxShadow: SHADOW_LG, padding: '1.1rem 1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: isGraded || sub?.feedback ? '10px' : 0, flexWrap: 'wrap' }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <h4 style={{ fontSize: '15px', fontWeight: '700', color: TEXT, margin: '0 0 4px' }}>{a.title}</h4>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                  {a.subject && <span style={{ fontSize: '12px', background: LIGHT_BLUE, color: BLUE, padding: '2px 9px', borderRadius: '50px', fontWeight: '700' }}>{a.subject}</span>}
                                  {a.due_date && <span style={{ fontSize: '12px', color: TEXT_MUTED }}>📅 Due {fmtDate(a.due_date)}</span>}
                                </div>
                              </div>
                              {isGraded ? (
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                  <div style={{ fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: '22px', fontWeight: '700', color: gc.color, lineHeight: 1 }}>{sub.score}<span style={{ fontSize: '13px', fontWeight: '400', color: TEXT_MUTED }}>/{a.max_score}</span></div>
                                  <span style={{ fontSize: '11px', fontWeight: '700', color: gc.color, background: gc.bg, padding: '2px 8px', borderRadius: '50px', display: 'inline-block', marginTop: '4px' }}>{gc.label}</span>
                                </div>
                              ) : sub ? (
                                <span style={{ fontSize: '12px', background: '#F5F5F5', color: '#0B0B0B', padding: '4px 12px', borderRadius: '50px', fontWeight: '700', flexShrink: 0, border: BORDER }}>⏳ Awaiting grade</span>
                              ) : (
                                <span style={{ fontSize: '12px', background: LIGHT_BLUE, color: BLUE, padding: '4px 12px', borderRadius: '50px', fontWeight: '700', flexShrink: 0 }}>📋 Pending</span>
                              )}
                            </div>
                            {isGraded && scorePercent !== null && (
                              <div style={{ height: '6px', background: GREY_BG, borderRadius: '50px', overflow: 'hidden', border: BORDER, marginBottom: sub?.feedback ? '12px' : 0 }}>
                                <div style={{ height: '100%', width: `${scorePercent}%`, background: scorePercent >= 60 ? '#6D28D9' : '#DC2626', borderRadius: '50px', transition: 'width 0.5s ease' }} />
                              </div>
                            )}
                            {sub?.feedback && (
                              <div style={{ paddingTop: '10px', borderTop: BORDER }}>
                                <div style={{ fontSize: '11px', fontWeight: '800', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>Teacher feedback</div>
                                <p style={{ fontSize: '13px', color: '#0B0B0B', lineHeight: '1.6', margin: 0, background: GREY_BG, borderRadius: '10px', padding: '10px 14px', border: BORDER }}>{sub.feedback}</p>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* CERTIFICATES */}
                <div>
                  <SectionHead title="Certificates" count={data.certificates.length} />
                  {data.certificates.length === 0 ? (
                    <Empty icon="🏆" title="No certificates yet" desc={`${selectedChild.full_name} earns certificates by completing assignments and scoring 60% or above.`} />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {data.certificates.map(c => {
                        const gc = gradeColor(c.average_score, 100)
                        return (
                          <div key={c.id} style={{ background: '#fff', borderRadius: '18px', border: `2px solid ${YELLOW}`, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                            <div style={{ background: '#F5F5F5', padding: '0.9rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: '16px', fontWeight: '700', color: '#0B0B0B' }}>Certificate of Completion</div>
                                <div style={{ fontSize: '11px', color: 'rgba(0,0,0,0.6)', marginTop: '2px', fontWeight: '500' }}>Stuumo · Verified. Trusted.</div>
                              </div>
                              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(109,40,217,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', border: '1px solid rgba(109,40,217,0.3)' }}>🏆</div>
                            </div>
                            <div style={{ padding: '1.1rem 1.25rem' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: gc.bg, color: gc.color, padding: '4px 12px', borderRadius: '50px', fontSize: '12px', fontWeight: '800', marginBottom: '1rem' }}>
                                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: gc.color }} /> {c.grade_label} — {c.average_score}%
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '10px', marginBottom: '1rem' }}>
                                {[['Subject', c.subject], ['Issued by', c.teacher?.profiles?.full_name], ['Date', fmtDate(c.issued_at)], ['Code', c.certificate_code]].map(([label, value]) => (
                                  <div key={label} style={{ background: GREY_BG, borderRadius: '10px', padding: '10px 12px', border: BORDER }}>
                                    <div style={{ fontSize: '10px', fontWeight: '800', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '3px' }}>{label}</div>
                                    <div style={{ fontSize: '13px', fontWeight: '700', color: TEXT, fontFamily: label === 'Code' ? 'monospace' : 'inherit' }}>{value}</div>
                                  </div>
                                ))}
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Link to={`/verify/${c.certificate_code}`} style={{ fontSize: '13px', color: BLUE, fontWeight: '700', textDecoration: 'none', background: LIGHT_BLUE, padding: '8px 18px', borderRadius: '50px', border: '1px solid rgba(0,0,0,0.2)' }}>Verify online ↗</Link>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}

function Empty({ icon, title, desc }) {
  return (
    <div style={{ background: '#fff', borderRadius: '18px', border: `1px solid ${GREY_LIGHT}`, padding: '2.5rem 2rem', textAlign: 'center', boxShadow: SHADOW_LG }}>
      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: LIGHT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', margin: '0 auto 1rem' }}>{icon}</div>
      <h3 style={{ fontSize: '17px', fontWeight: '700', color: TEXT, marginBottom: '8px' }}>{title}</h3>
      <p style={{ fontSize: '14px', color: TEXT_MUTED, maxWidth: '340px', margin: '0 auto', lineHeight: '1.7' }}>{desc}</p>
    </div>
  )
}
