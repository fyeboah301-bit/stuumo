import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import usePageMeta from '../hooks/usePageMeta'
import Logo from '../components/Logo'
import Footer from '../components/Footer'
import {
  YELLOW, TEXT, TEXT_MUTED, GREY_BG, GREY_LIGHT, BORDER,
  TRANSITION, GRADIENT_YELLOW, SHADOW_YELLOW,
} from '../styles/colors'

const NAV_LINKS = [
  { to: '/teachers', label: 'Browse teachers' },
  { to: '/sessions', label: 'Live sessions' },
  { to: '/about', label: 'About us' },
]

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 769)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

function Section({ children, bg = '#fff', isMobile }) {
  return (
    <section style={{ padding: isMobile ? '3.5rem 1.25rem' : '5.5rem 2.5rem', background: bg }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>{children}</div>
    </section>
  )
}

function Eyebrow({ children }) {
  return <p style={{ fontSize: '12px', fontWeight: '700', color: '#6D28D9', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>{children}</p>
}

export default function About() {
  usePageMeta('About Stuumo', 'Stuumo connects verified, certificate-checked teachers with parents and learners for safe private online sessions and live group classes.')
  const isMobile = useIsMobile()
  const { user } = useAuth()

  const steps = [
    ['Find the right teacher', 'Browse verified teachers by subject, level and price. Every teacher confirms their identity and has their certificates reviewed before they appear.'],
    ['Book and pay safely', 'Send a booking request and pay securely with card or mobile money through Paystack. You are only charged once the teacher confirms — never before.'],
    ['Learn live', 'Meet in a private video classroom right inside Stuumo. Message, share assignments and track progress, all in one place.'],
  ]

  const safety = [
    ['Identity verified', 'Every teacher confirms their identity with a Ghana Card before they can be found in search.'],
    ['Certificates checked', 'We review each teacher’s qualifications within 24–48 hours of sign-up.'],
    ['Contact stays protected', 'Personal phone numbers and social handles are kept off the platform, so conversations stay safe and on Stuumo.'],
    ['Pay after you match', 'Payments are held and only released around confirmed sessions, so your money is protected.'],
  ]

  const faqs = [
    ['Who can use Stuumo?', 'Parents looking for a tutor for their child, independent learners studying on their own, and qualified teachers who want to reach more students — all in one place.'],
    ['How are teachers verified?', 'Teachers submit a Ghana Card for identity and upload their certificates. Our team reviews both before a teacher can appear in search or take bookings.'],
    ['How do payments work?', 'You pay securely by card or mobile money through Paystack when you book. The teacher is paid out after the session, and Stuumo keeps a small service fee.'],
    ['What does it cost to join?', 'Creating an account is free for everyone. Teachers set their own hourly rate, and you only pay when you book a session.'],
    ['Are sessions online or in person?', 'Sessions happen online in a private video classroom built into Stuumo, so a learner can meet a great teacher no matter where either of them is.'],
  ]

  return (
    <div style={{ fontFamily: 'Tahoma, Geneva, sans-serif', background: '#fff', minHeight: '100vh', overflowX: 'clip' }}>

      {/* NAV */}
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
            {user ? (
              <Link to="/dashboard" style={{ padding: isMobile ? '8px 14px' : '9px 20px', background: '#FFFFFF', color: '#6D28D9', borderRadius: '50px', fontSize: '13px', textDecoration: 'none', fontWeight: '700', boxShadow: '0 4px 14px rgba(0,0,0,0.18)', transition: TRANSITION }}>My dashboard</Link>
            ) : (
              <>
                <Link to="/login" style={{ padding: isMobile ? '8px 14px' : '9px 20px', background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', borderRadius: '50px', fontSize: '13px', textDecoration: 'none', fontWeight: '600', border: '1px solid rgba(255,255,255,0.3)', transition: TRANSITION }}>Log in</Link>
                <Link to="/register" style={{ padding: isMobile ? '8px 14px' : '9px 20px', background: '#FFFFFF', color: '#6D28D9', borderRadius: '50px', fontSize: '13px', textDecoration: 'none', fontWeight: '700', boxShadow: '0 4px 14px rgba(0,0,0,0.18)', transition: TRANSITION }}>Sign up free</Link>
              </>
            )}
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

      {/* HERO */}
      <section style={{ background: '#6D28D9', padding: isMobile ? '3.5rem 1.25rem 4rem' : '5.5rem 2.5rem 6rem' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: isMobile ? '32px' : '48px', fontWeight: '700', color: '#fff', lineHeight: '1.15', letterSpacing: '-0.02em', margin: '0 0 1.25rem' }}>
            Great teaching, made <span style={{ fontStyle: 'italic' }}>safe and simple</span>
          </h1>
          <p style={{ fontSize: isMobile ? '15px' : '18px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.75', margin: 0 }}>
            Stuumo connects verified, certificate-checked teachers with parents and learners for private online sessions and live group classes — built around trust, safety and real results.
          </p>
        </div>
      </section>

      {/* MISSION */}
      <Section isMobile={isMobile}>
        <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto' }}>
          <Eyebrow>Our mission</Eyebrow>
          <h2 style={{ fontSize: isMobile ? '26px' : '36px', fontWeight: '700', color: TEXT, letterSpacing: '-0.02em', margin: '0 0 1.25rem' }}>Every learner deserves a teacher they can trust</h2>
          <p style={{ fontSize: isMobile ? '15px' : '17px', color: TEXT_MUTED, lineHeight: '1.8', margin: 0 }}>
            Finding a good tutor usually means asking around and hoping for the best. Stuumo changes that. We verify who a teacher is and check their qualifications, put payments on a secure footing, and keep every conversation on a safe platform — so parents and learners can focus on learning, and great teachers can reach the students who need them.
          </p>
        </div>
      </Section>

      {/* HOW IT WORKS */}
      <Section bg={GREY_BG} isMobile={isMobile}>
        <div style={{ textAlign: 'center', marginBottom: isMobile ? '2.5rem' : '3.5rem' }}>
          <Eyebrow>How it works</Eyebrow>
          <h2 style={{ fontSize: isMobile ? '26px' : '36px', fontWeight: '700', color: TEXT, letterSpacing: '-0.02em', margin: 0 }}>Three steps to a better session</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? '1rem' : '1.5rem' }}>
          {steps.map(([title, desc], i) => (
            <div key={title} style={{ background: '#fff', border: `1px solid ${GREY_LIGHT}`, borderRadius: '18px', padding: '1.75rem', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(109,40,217,0.12)', color: '#6D28D9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '18px', marginBottom: '1.25rem' }}>{i + 1}</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: TEXT, margin: '0 0 8px', letterSpacing: '-0.01em' }}>{title}</h3>
              <p style={{ fontSize: '14px', color: TEXT_MUTED, lineHeight: '1.7', margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* SAFETY */}
      <Section isMobile={isMobile}>
        <div style={{ textAlign: 'center', marginBottom: isMobile ? '2.5rem' : '3.5rem' }}>
          <Eyebrow>Safety first</Eyebrow>
          <h2 style={{ fontSize: isMobile ? '26px' : '36px', fontWeight: '700', color: TEXT, letterSpacing: '-0.02em', margin: '0 0 12px' }}>Built to protect families</h2>
          <p style={{ fontSize: isMobile ? '14px' : '16px', color: TEXT_MUTED, maxWidth: '540px', margin: '0 auto', lineHeight: '1.7' }}>Trust is the whole point. Here is how we earn it.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: isMobile ? '0.875rem' : '1.25rem' }}>
          {safety.map(([title, desc]) => (
            <div key={title} style={{ background: '#fff', border: `1px solid ${GREY_LIGHT}`, borderRadius: '16px', padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(109,40,217,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: TEXT, margin: '0 0 4px' }}>{title}</h3>
                <p style={{ fontSize: '13.5px', color: TEXT_MUTED, lineHeight: '1.6', margin: 0 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section bg={GREY_BG} isMobile={isMobile}>
        <div style={{ textAlign: 'center', marginBottom: isMobile ? '2.5rem' : '3rem' }}>
          <Eyebrow>Questions</Eyebrow>
          <h2 style={{ fontSize: isMobile ? '26px' : '36px', fontWeight: '700', color: TEXT, letterSpacing: '-0.02em', margin: 0 }}>Frequently asked</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', maxWidth: '760px', margin: '0 auto' }}>
          {faqs.map(([q, a]) => (
            <div key={q} style={{ background: '#fff', border: `1px solid ${GREY_LIGHT}`, borderRadius: '14px', padding: '1.25rem 1.5rem' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: TEXT, margin: '0 0 6px' }}>{q}</h3>
              <p style={{ fontSize: '14px', color: TEXT_MUTED, lineHeight: '1.7', margin: 0 }}>{a}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <section style={{ background: GRADIENT_YELLOW, padding: isMobile ? '4rem 1.25rem' : '5.5rem 2.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <h2 style={{ fontSize: isMobile ? '26px' : '36px', fontWeight: '700', color: '#fff', letterSpacing: '-0.02em', margin: '0 0 1rem' }}>Ready to get started?</h2>
          <p style={{ fontSize: isMobile ? '15px' : '17px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.7', margin: '0 0 2rem' }}>Join Stuumo free today — as a parent, a learner, or a teacher.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ padding: '14px 28px', background: '#fff', color: '#6D28D9', borderRadius: '50px', fontSize: '15px', textDecoration: 'none', fontWeight: '700', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>Sign up free</Link>
            <Link to="/teachers" style={{ padding: '14px 28px', background: 'rgba(255,255,255,0.12)', color: '#fff', borderRadius: '50px', fontSize: '15px', textDecoration: 'none', fontWeight: '700', border: '1px solid rgba(255,255,255,0.4)' }}>Browse teachers</Link>
          </div>
        </div>
      </section>

      <Footer variant="blue" />
    </div>
  )
}
