import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import usePageMeta from '../hooks/usePageMeta'
import PublicNav from '../components/PublicNav'
import Footer from '../components/Footer'
import { TEXT, TEXT_MUTED, GREY_BG, GREY_LIGHT, GRADIENT_YELLOW } from '../styles/colors'

function useIsMobile() {
  const [m, setM] = useState(window.innerWidth < 769)
  useEffect(() => {
    const h = () => setM(window.innerWidth < 769)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return m
}

function Section({ id, bg = '#fff', isMobile, children }) {
  return (
    <section id={id} style={{ padding: isMobile ? '3.25rem 1.25rem' : '5rem 2.5rem', background: bg, scrollMarginTop: '90px' }}>
      <div style={{ maxWidth: '920px', margin: '0 auto' }}>{children}</div>
    </section>
  )
}
function Eyebrow({ children }) {
  return <p style={{ fontSize: '12px', fontWeight: '700', color: '#6D28D9', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '10px' }}>{children}</p>
}
function H2({ children }) {
  return <h2 style={{ fontSize: '28px', fontWeight: '700', color: TEXT, letterSpacing: '-0.02em', margin: '0 0 1rem' }}>{children}</h2>
}

export default function HowItWorks() {
  usePageMeta('How Stuumo works', 'How parents and learners find a verified teacher, book safely, and learn live on Stuumo — plus pricing, safety and FAQs.')
  const isMobile = useIsMobile()

  const steps = [
    ['Find the right teacher', 'Browse verified teachers by subject, level, price and rating. Every teacher has confirmed their identity and had their certificates checked.'],
    ['Book and pay safely', 'Send a booking request and pay by card or mobile money through Paystack. You are only charged once the teacher confirms.'],
    ['Learn live', 'Meet in a private video classroom inside Stuumo. Message your teacher, share assignments and track progress — all in one place.'],
  ]
  const safety = [
    ['Identity verified', 'Every teacher confirms their identity with a Ghana Card before they appear in search.'],
    ['Certificates checked', 'We review each teacher’s qualifications within 24–48 hours of sign-up.'],
    ['Contact stays protected', 'Phone numbers and social handles are kept off the platform, so conversations stay safe and on Stuumo.'],
    ['Report anytime', 'Every profile and chat has a report option, and our team reviews flags quickly.'],
  ]
  const faqs = [
    ['Is it free to join?', 'Yes. Creating a parent or learner account is completely free. You only pay when you book a session.'],
    ['How do I pay?', 'Securely by card or mobile money through Paystack, right when you book. Your payment is held and released around the confirmed session.'],
    ['What if a teacher doesn’t confirm?', 'You are not charged until the teacher accepts your booking. If they don’t confirm, nothing leaves your account.'],
    ['Can a parent book for a child?', 'Yes. Parents can manage bookings and sessions on behalf of their child from one account.'],
    ['Are sessions online?', 'Yes — sessions happen in a private video classroom built into Stuumo, so you can learn from anywhere.'],
  ]

  return (
    <div style={{ fontFamily: 'Tahoma, Geneva, sans-serif', background: '#fff', minHeight: '100vh', overflowX: 'clip' }}>
      <PublicNav />

      <section style={{ background: '#6D28D9', padding: isMobile ? '3.25rem 1.25rem 3.75rem' : '5rem 2.5rem 5.5rem' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: isMobile ? '30px' : '44px', fontWeight: '700', color: '#fff', lineHeight: '1.15', letterSpacing: '-0.02em', margin: '0 0 1rem' }}>How Stuumo works</h1>
          <p style={{ fontSize: isMobile ? '15px' : '17px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.7', margin: '0 0 1.75rem' }}>For parents and learners — find a trusted teacher, book safely, and learn live. Here's everything you need to know.</p>
          <Link to="/teachers" style={{ padding: '13px 26px', background: '#fff', color: '#6D28D9', borderRadius: '50px', fontSize: '15px', textDecoration: 'none', fontWeight: '700', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>Browse teachers</Link>
        </div>
      </section>

      {/* STEPS */}
      <Section isMobile={isMobile}>
        <div style={{ textAlign: 'center', marginBottom: isMobile ? '2.25rem' : '3rem' }}>
          <Eyebrow>Three simple steps</Eyebrow>
          <H2>From search to session</H2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? '1rem' : '1.5rem' }}>
          {steps.map(([t, d], i) => (
            <div key={t} style={{ background: '#fff', border: `1px solid ${GREY_LIGHT}`, borderRadius: '18px', padding: '1.75rem', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(109,40,217,0.12)', color: '#6D28D9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '18px', marginBottom: '1.25rem' }}>{i + 1}</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: TEXT, margin: '0 0 8px' }}>{t}</h3>
              <p style={{ fontSize: '14px', color: TEXT_MUTED, lineHeight: '1.7', margin: 0 }}>{d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* LIVE CLASSES */}
      <Section id="live" bg={GREY_BG} isMobile={isMobile}>
        <Eyebrow>Live classes</Eyebrow>
        <H2>How live classes work</H2>
        <p style={{ fontSize: isMobile ? '15px' : '16px', color: TEXT_MUTED, lineHeight: '1.8', margin: '0 0 1rem' }}>
          Alongside one-to-one tutoring, teachers run scheduled live group classes on a subject and topic. You can browse upcoming sessions, see the date, time and how many spots are left, and reserve a place. When the class starts, you join the live video room directly from Stuumo — no extra apps or links to chase.
        </p>
        <Link to="/sessions" style={{ color: '#6D28D9', fontWeight: '700', textDecoration: 'none', fontSize: '15px' }}>See upcoming sessions →</Link>
      </Section>

      {/* SAFETY */}
      <Section id="safety" isMobile={isMobile}>
        <Eyebrow>Safety &amp; verification</Eyebrow>
        <H2>Built to protect families</H2>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: isMobile ? '0.875rem' : '1.25rem', marginTop: '1.5rem' }}>
          {safety.map(([t, d]) => (
            <div key={t} style={{ background: '#fff', border: `1px solid ${GREY_LIGHT}`, borderRadius: '16px', padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(109,40,217,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg>
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: TEXT, margin: '0 0 4px' }}>{t}</h3>
                <p style={{ fontSize: '13.5px', color: TEXT_MUTED, lineHeight: '1.6', margin: 0 }}>{d}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* PRICING */}
      <Section id="pricing" bg={GREY_BG} isMobile={isMobile}>
        <Eyebrow>Pricing &amp; payments</Eyebrow>
        <H2>Simple and transparent</H2>
        <p style={{ fontSize: isMobile ? '15px' : '16px', color: TEXT_MUTED, lineHeight: '1.8', margin: '0 0 1.25rem' }}>
          Joining Stuumo is free. Each teacher sets their own hourly rate, shown clearly on their profile, so you always know the price before you book. You pay only when you book a session — there are no subscriptions or hidden fees for parents and learners.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1rem' }}>
          {[
            ['Free to join', 'Create an account and browse teachers at no cost.'],
            ['Pay per session', 'You’re charged only when a teacher confirms your booking.'],
            ['Card or mobile money', 'Secure payments through Paystack, the way that suits you.'],
          ].map(([t, d]) => (
            <div key={t} style={{ background: '#fff', border: `1px solid ${GREY_LIGHT}`, borderRadius: '14px', padding: '1.25rem' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: TEXT, margin: '0 0 6px' }}>{t}</h3>
              <p style={{ fontSize: '13.5px', color: TEXT_MUTED, lineHeight: '1.6', margin: 0 }}>{d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section id="faq" isMobile={isMobile}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Eyebrow>Questions</Eyebrow>
          <H2>Frequently asked</H2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {faqs.map(([q, a]) => (
            <div key={q} style={{ background: '#fff', border: `1px solid ${GREY_LIGHT}`, borderRadius: '14px', padding: '1.25rem 1.5rem' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: TEXT, margin: '0 0 6px' }}>{q}</h3>
              <p style={{ fontSize: '14px', color: TEXT_MUTED, lineHeight: '1.7', margin: 0 }}>{a}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <section style={{ background: GRADIENT_YELLOW, padding: isMobile ? '3.5rem 1.25rem' : '5rem 2.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '620px', margin: '0 auto' }}>
          <h2 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '700', color: '#fff', letterSpacing: '-0.02em', margin: '0 0 1rem' }}>Find your teacher today</h2>
          <p style={{ fontSize: isMobile ? '15px' : '16px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.7', margin: '0 0 1.75rem' }}>Browse verified teachers or create your free account in minutes.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/teachers" style={{ padding: '13px 26px', background: '#fff', color: '#6D28D9', borderRadius: '50px', fontSize: '15px', textDecoration: 'none', fontWeight: '700' }}>Browse teachers</Link>
            <Link to="/register" style={{ padding: '13px 26px', background: 'rgba(255,255,255,0.12)', color: '#fff', borderRadius: '50px', fontSize: '15px', textDecoration: 'none', fontWeight: '700', border: '1px solid rgba(255,255,255,0.4)' }}>Sign up free</Link>
          </div>
        </div>
      </section>

      <Footer variant="blue" />
    </div>
  )
}
