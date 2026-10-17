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

export default function Progress() {
  usePageMeta('Progress Dashboard')

  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [children, setChildren] = useState([])
  const [selectedChild, setSelectedChild] = useState(null)
  const [data, setData] = useState({ assignments: [], certificates: [], bookings: [] })
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('bookings')

  useEffect(() => {
    if (!user) navigate('/login')
    else fetchChildren()
  }, [user])

  useEffect(() => {
    if (selectedChild) fetchChildData(selectedChild.id)
  }, [selectedChild])

  const fetchChildren = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('parent_id', user.id)
    setChildren(data || [])
    if (data && data.length > 0) setSelectedChild(data[0])
    else setLoading(false)
  }

  const fetchChildData = async (childId) => {
    setLoading(true)
    const [{ data: assignments }, { data: certificates }, { data: bookings }] = await Promise.all([
      supabase.from('assignments').select('*, submissions (score, feedback, graded_at, submitted_at)').eq('learner_id', childId).order('created_at', { ascending: false }),
      supabase.from('course_certificates').select('*, teacher:teacher_id (id, profiles (full_name))').eq('learner_id', childId).order('issued_at', { ascending: false }),
      supabase.from('bookings').select('*, teachers (id, profiles (full_name, avatar_url))').eq('client_id', childId).order('created_at', { ascending: false }),
    ])
    setData({ assignments: assignments || [], certificates: certificates || [], bookings: bookings || [] })
    setLoading(false)
  }

  const confirmedBookings = data.bookings.filter(b => b.status === 'confirmed')
  const gradedAssignments = data.assignments.filter(a => a.submissions?.[0]?.score != null)
  const pendingAssignments = data.assignments.filter(a => !a.submissions?.[0])
  const avgScore = gradedAssignments.length > 0
    ? Math.round(gradedAssignments.reduce((sum, a) => sum + ((a.submissions[0].score / a.max_score) * 100), 0) / gradedAssignments.length)
    : null

  const SECTIONS = [
    { key: 'bookings', label: 'Bookings', icon: '📅', count: data.bookings.length },
    { key: 'assignments', label: 'Assignments', icon: '📝', count: data.assignments.length },
    { key: 'certificates', label: 'Certificates', icon: '🏆', count: data.certificates.length },
  ]

  return (
    <div style={{ minHeight: '100vh', background: GREY_BG, fontFamily: 'Tahoma, Geneva, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <NavBar />

      <div style={{ background: GRADIENT_HERO, padding: isMobile ? '2rem 1.25rem' : '2.5rem 2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '220px', height: '220px', borderRadius: '50%', border: '1px solid rgba(0,0,0,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '200px', width: '160px', height: '160px', borderRadius: '50%', border: '1px solid rgba(0,0,0,0.05)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '960px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F5F5F5', border: '1px solid #E2E8F0', color: YELLOW, fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 14px', borderRadius: '50px', marginBottom: '12px' }}>
              👨‍👩‍👧 Parent dashboard
            </div>
            <h1 style={{ fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: isMobile ? '26px' : '36px', color: '#0B0B0B', marginBottom: '8px', fontWeight: '700', letterSpacing: '-0.02em', lineHeight: '1.15' }}>
              {selectedChild ? `${selectedChild.full_name}'s Progress` : 'Progress Dashboard'}
            </h1>
            <p style={{ fontSize: '14px', color: 'rgba(0,0,0,0.7)', margin: 0, lineHeight: '1.6' }}>
              Monitor your child's bookings, assignments, grades and certificates
            </p>
          </div>

          {selectedChild && !loading && (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '10px' }}>
              {[
                ['📅', confirmedBookings.length, 'Active bookings'],
                ['📝', gradedAssignments.length, 'Graded'],
                ['⏳', pendingAssignments.length, 'Pending'],
                ['🏆', data.certificates.length, 'Certificates'],
              ].map(([icon, count, label]) => (
                <div key={label} style={{ background: 'rgba(0,0,0,0.1)', backdropFilter: 'blur(4px)', borderRadius: '14px', padding: '1rem', textAlign: 'center', border: '1px solid rgba(0,0,0,0.15)' }}>
                  <div style={{ fontSize: '20px', marginBottom: '6px' }}>{icon}</div>
                  <div style={{ fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: isMobile ? '24px' : '30px', fontWeight: '700', color: YELLOW, lineHeight: 1 }}>{count}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(0,0,0,0.65)', marginTop: '5px', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: '600' }}>{label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: isMobile ? '1.25rem' : '1.75rem 2rem', flex: 1, width: '100%', boxSizing: 'border-box' }}>

        <div style={{ background: '#fff', borderRadius: '20px', border: BORDER, overflow: 'hidden', marginBottom: '1.5rem', boxShadow: SHADOW_LG }}>
          <div style={{ background: '#F5F5F5', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>👶</span>
            <div>
              <h3 style={{ color: '#0B0B0B', fontSize: '15px', fontWeight: '700', margin: 0, letterSpacing: '-0.01em' }}>Add your child</h3>
              <p style={{ color: 'rgba(0,0,0,0.7)', fontSize: '12px', margin: 0, marginTop: '2px' }}>Create an account for your child in seconds — you'll get their login to share</p>
            </div>
          </div>
          <div style={{ padding: '1.25rem 1.5rem' }}>
            <CreateChildForm parentId={user.id} onCreated={fetchChildren} />
          </div>
        </div>

        {children.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '20px', border: BORDER, padding: '5rem 2rem', textAlign: 'center', boxShadow: SHADOW_LG }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: LIGHT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '38px', margin: '0 auto 1.25rem' }}>👨‍👩‍👧</div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: TEXT, marginBottom: '8px', letterSpacing: '-0.01em' }}>No linked accounts yet</h3>
            <p style={{ fontSize: '14px', color: TEXT_MUTED, maxWidth: '360px', margin: '0 auto', lineHeight: '1.7' }}>
              Link your child's account above to start monitoring their bookings, assignments and certificates.
            </p>
          </div>
        ) : (
          <>
            {children.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {children.map(child => (
                  <button key={child.id} onClick={() => setSelectedChild(child)}
                    style={{ padding: '10px 20px', borderRadius: '50px', border: `2px solid ${selectedChild?.id === child.id ? BLUE : GREY_LIGHT}`, background: selectedChild?.id === child.id ? LIGHT_BLUE : '#fff', color: selectedChild?.id === child.id ? BLUE : TEXT_MUTED, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: selectedChild?.id === child.id ? '800' : '400', transition: TRANSITION, boxShadow: selectedChild?.id === child.id ? SHADOW_BLUE : 'none' }}>
                    {child.full_name}
                  </button>
                ))}
              </div>
            )}

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ background: '#fff', borderRadius: '20px', border: BORDER, padding: '1.5rem', height: '80px', animation: 'pulse 1.5s infinite' }} />
                ))}
                <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
              </div>
            ) : (
              <>
                {avgScore !== null && (
                  <div style={{ background: '#fff', borderRadius: '20px', border: BORDER, padding: '1.25rem 1.5rem', marginBottom: '1.5rem', boxShadow: SHADOW_LG, display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '800', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>Overall average score</div>
                      <div style={{ fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: '36px', fontWeight: '700', color: avgScore >= 70 ? '#0B0B0B' : avgScore >= 60 ? '#0B0B0B' : '#DC2626', letterSpacing: '-0.02em', lineHeight: 1 }}>
                        {avgScore}%
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', color: TEXT_MUTED, fontWeight: '600' }}>Based on {gradedAssignments.length} graded assignment{gradedAssignments.length !== 1 ? 's' : ''}</span>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: avgScore >= 70 ? '#0B0B0B' : avgScore >= 60 ? '#0B0B0B' : '#DC2626' }}>
                          {avgScore >= 80 ? 'Distinction' : avgScore >= 70 ? 'Merit' : avgScore >= 60 ? 'Pass' : 'Needs improvement'}
                        </span>
                      </div>
                      <div style={{ height: '8px', background: GREY_BG, borderRadius: '50px', overflow: 'hidden', border: BORDER }}>
                        <div style={{ height: '100%', width: `${avgScore}%`, background: avgScore >= 70 ? '#6D28D9' : avgScore >= 60 ? '#0B0B0B' : '#DC2626', borderRadius: '50px', transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '4px', marginBottom: '1.25rem', background: '#fff', padding: '4px', borderRadius: '50px', border: BORDER, width: 'fit-content', boxShadow: SHADOW_LG }}>
                  {SECTIONS.map(({ key, label, icon, count }) => (
                    <button key={key} onClick={() => setActiveSection(key)}
                      style={{ padding: '9px 18px', border: 'none', borderRadius: '50px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', background: activeSection === key ? '#6D28D9' : 'transparent', color: activeSection === key ? '#fff' : TEXT_MUTED, fontWeight: activeSection === key ? '700' : '400', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: activeSection === key ? SHADOW_BLUE : 'none', transition: TRANSITION }}>
                      {icon} {label}
                      <span style={{ background: activeSection === key ? 'rgba(0,0,0,0.25)' : GREY_LIGHT, color: activeSection === key ? '#fff' : TEXT_MUTED, borderRadius: '50px', padding: '1px 7px', fontSize: '11px', fontWeight: '800' }}>{count}</span>
                    </button>
                  ))}
                </div>

                {/* BOOKINGS */}
                {activeSection === 'bookings' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {data.bookings.length === 0 ? (
                      <Empty icon="📅" title="No bookings yet" desc="When a teacher accepts a booking for your child, it will appear here." />
                    ) : data.bookings.map(b => {
                      const sc = b.status === 'confirmed' ? { bg: '#F5F5F5', color: '#0B0B0B', border: '#E2E8F0' } : b.status === 'pending' ? { bg: '#F5F5F5', color: '#0B0B0B', border: '#E2E8F0' } : { bg: '#F5F5F5', color: '#6D28D9', border: '#E2E8F0' }
                      return (
                        <div key={b.id} style={{ background: '#fff', borderRadius: '16px', border: BORDER, padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', boxShadow: SHADOW_LG, transition: TRANSITION }}
                          onMouseEnter={e => { e.currentTarget.style.boxShadow = SHADOW_BLUE; e.currentTarget.style.transform = 'translateY(-2px)' }}
                          onMouseLeave={e => { e.currentTarget.style.boxShadow = SHADOW_LG; e.currentTarget.style.transform = 'translateY(0)' }}>
                          {b.teachers?.profiles?.avatar_url ? (
                            <img src={b.teachers.profiles.avatar_url} alt="" style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `2px solid ${GREY_LIGHT}` }} />
                          ) : (
                            <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: GRADIENT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '800', color: '#fff', flexShrink: 0 }}>
                              {b.teachers?.profiles?.full_name?.charAt(0)}
                            </div>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '15px', fontWeight: '700', color: TEXT, marginBottom: '3px', letterSpacing: '-0.01em' }}>{b.subject}</div>
                            <div style={{ fontSize: '13px', color: TEXT_MUTED }}>
                              👩‍🏫 {b.teachers?.profiles?.full_name} · 📅 {new Date(b.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          </div>
                          {b.amount > 0 && (
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <div style={{ fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: '16px', fontWeight: '700', color: BLUE }}>GH₵ {b.amount}</div>
                              {b.payment_status === 'paid' && <div style={{ fontSize: '11px', color: '#0B0B0B', fontWeight: '700' }}>✅ Paid</div>}
                            </div>
                          )}
                          <span style={{ fontSize: '12px', fontWeight: '700', color: sc.color, background: sc.bg, padding: '4px 12px', borderRadius: '50px', border: `1px solid ${sc.border}`, textTransform: 'capitalize', flexShrink: 0 }}>
                            {b.status}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* ASSIGNMENTS */}
                {activeSection === 'assignments' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {data.assignments.length === 0 ? (
                      <Empty icon="📝" title="No assignments yet" desc="When a teacher assigns work to your child, it will appear here along with grades and feedback." />
                    ) : data.assignments.map(a => {
                      const sub = a.submissions?.[0]
                      const isGraded = sub?.score != null
                      const gc = isGraded ? gradeColor(sub.score, a.max_score) : null
                      const scorePercent = isGraded ? Math.round((sub.score / a.max_score) * 100) : null

                      return (
                        <div key={a.id} style={{ background: '#fff', borderRadius: '16px', border: BORDER, overflow: 'hidden', boxShadow: SHADOW_LG }}>
                          {isGraded && (
                            <div style={{ height: '3px', background: gc.color === '#0B0B0B' ? '#6D28D9' : gc.color === '#0B0B0B' ? BLUE : gc.color === '#0B0B0B' ? '#0B0B0B' : '#DC2626' }} />
                          )}
                          <div style={{ padding: '1.25rem 1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <h4 style={{ fontSize: '15px', fontWeight: '700', color: TEXT, margin: '0 0 4px', letterSpacing: '-0.01em' }}>{a.title}</h4>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                  {a.subject && <span style={{ fontSize: '12px', background: LIGHT_BLUE, color: BLUE, padding: '2px 9px', borderRadius: '50px', fontWeight: '700' }}>{a.subject}</span>}
                                  {a.due_date && <span style={{ fontSize: '12px', color: TEXT_MUTED }}>📅 Due {new Date(a.due_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>}
                                </div>
                              </div>
                              {isGraded ? (
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                  <div style={{ fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: '22px', fontWeight: '700', color: gc.color, lineHeight: 1 }}>{sub.score}<span style={{ fontSize: '13px', fontWeight: '400', color: TEXT_MUTED }}>/{a.max_score}</span></div>
                                  <span style={{ fontSize: '11px', fontWeight: '700', color: gc.color, background: gc.bg, padding: '2px 8px', borderRadius: '50px', display: 'inline-block', marginTop: '4px' }}>{gc.label}</span>
                                </div>
                              ) : sub ? (
                                <span style={{ fontSize: '12px', background: '#F5F5F5', color: '#0B0B0B', padding: '4px 12px', borderRadius: '50px', fontWeight: '700', flexShrink: 0, border: '1px solid #E2E8F0' }}>⏳ Awaiting grade</span>
                              ) : (
                                <span style={{ fontSize: '12px', background: LIGHT_BLUE, color: BLUE, padding: '4px 12px', borderRadius: '50px', fontWeight: '700', flexShrink: 0, border: '1px solid rgba(0,0,0,0.15)' }}>📋 Pending</span>
                              )}
                            </div>

                            {isGraded && scorePercent !== null && (
                              <div style={{ marginBottom: sub?.feedback ? '12px' : 0 }}>
                                <div style={{ height: '6px', background: GREY_BG, borderRadius: '50px', overflow: 'hidden', border: BORDER }}>
                                  <div style={{ height: '100%', width: `${scorePercent}%`, background: gc.color === '#0B0B0B' ? '#6D28D9' : gc.color === '#0B0B0B' ? BLUE : gc.color === '#0B0B0B' ? '#0B0B0B' : '#DC2626', borderRadius: '50px', transition: 'width 0.5s ease' }} />
                                </div>
                              </div>
                            )}

                            {sub?.feedback && (
                              <div style={{ paddingTop: '12px', borderTop: BORDER }}>
                                <div style={{ fontSize: '11px', fontWeight: '800', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>Teacher feedback</div>
                                <p style={{ fontSize: '13px', color: '#0B0B0B', lineHeight: '1.6', margin: 0, background: GREY_BG, borderRadius: '10px', padding: '10px 14px', border: BORDER }}>
                                  {sub.feedback}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* CERTIFICATES */}
                {activeSection === 'certificates' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {data.certificates.length === 0 ? (
                      <Empty icon="🏆" title="No certificates yet" desc={`${selectedChild?.full_name} will earn certificates by completing assignments and scoring 60% or above.`} />
                    ) : data.certificates.map(c => {
                      const gc = gradeColor(c.average_score, 100)
                      return (
                        <div key={c.id}
                          style={{ background: '#fff', borderRadius: '20px', border: `2px solid ${YELLOW}`, overflow: 'hidden', boxShadow: `0 4px 20px rgba(0,0,0,0.06)`, transition: TRANSITION }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,0.1)` }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 20px rgba(0,0,0,0.06)` }}
                        >
                          <div style={{ background: '#F5F5F5', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: '16px', fontWeight: '700', color: '#0B0B0B', letterSpacing: '-0.01em' }}>Certificate of Completion</div>
                              <div style={{ fontSize: '11px', color: 'rgba(0,0,0,0.6)', marginTop: '2px', fontWeight: '500', letterSpacing: '0.04em' }}>Stuumo · Verified. Trusted.</div>
                            </div>
                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(109,40,217,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', border: '1px solid rgba(109,40,217,0.3)', flexShrink: 0 }}>🏆</div>
                          </div>
                          <div style={{ padding: '1.25rem 1.5rem' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: gc.bg, color: gc.color, padding: '4px 12px', borderRadius: '50px', fontSize: '12px', fontWeight: '800', marginBottom: '1rem' }}>
                              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: gc.color, flexShrink: 0 }} />
                              {c.grade_label} — {c.average_score}%
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1rem' }}>
                              {[
                                ['Subject', c.subject],
                                ['Issued by', c.teacher?.profiles?.full_name],
                                ['Date', new Date(c.issued_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })],
                                ['Code', c.certificate_code],
                              ].map(([label, value]) => (
                                <div key={label} style={{ background: GREY_BG, borderRadius: '10px', padding: '10px 12px', border: BORDER }}>
                                  <div style={{ fontSize: '10px', fontWeight: '800', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '3px' }}>{label}</div>
                                  <div style={{ fontSize: '13px', fontWeight: '700', color: TEXT, fontFamily: label === 'Code' ? 'monospace' : 'inherit', letterSpacing: label === 'Code' ? '0.05em' : 'normal' }}>{value}</div>
                                </div>
                              ))}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                              <Link to={`/verify/${c.certificate_code}`}
                                style={{ fontSize: '13px', color: BLUE, fontWeight: '700', textDecoration: 'none', background: LIGHT_BLUE, padding: '8px 18px', borderRadius: '50px', border: '1px solid rgba(0,0,0,0.2)', transition: TRANSITION }}>
                                Verify online ↗
                              </Link>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
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
    <div style={{ background: '#fff', borderRadius: '20px', border: `1px solid ${GREY_LIGHT}`, padding: '4rem 2rem', textAlign: 'center', boxShadow: SHADOW_LG }}>
      <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: LIGHT_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '34px', margin: '0 auto 1rem' }}>{icon}</div>
      <h3 style={{ fontSize: '18px', fontWeight: '700', color: TEXT, marginBottom: '8px', letterSpacing: '-0.01em' }}>{title}</h3>
      <p style={{ fontSize: '14px', color: TEXT_MUTED, maxWidth: '340px', margin: '0 auto', lineHeight: '1.7' }}>{desc}</p>
    </div>
  )
}