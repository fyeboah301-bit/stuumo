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

export default function ForTeachers() {
  usePageMeta('Teach on Stuumo', 'Become a verified teacher on Stuumo — set your own rate, reach parents and learners, and get paid securely. How it works, earnings and FAQs.')
  const isMobile = useIsMobile()

  const steps = [
    ['Create your account', 'Sign up as a teacher and tell us the basics about you and what you teach.'],
    ['Get verified', 'Upload your Ghana Card and your certificates. Our team reviews them, usually within 24–48 hours.'],
    ['Set your rate', 'Choose your own hourly rate and build your profile — subjects, levels, bio and an intro video.'],
    ['Start teaching', 'Appear in search, accept bookings, host live classes, and teach in a private video classroom.'],
  ]
  const faqs = [
    ['What do I need to join?', 'A valid Ghana Card for identity, and your teaching certificates or qualifications to upload for review.'],
    ['How long does verification take?', 'Most teachers are reviewed within 24–48 hours of submitting their documents.'],
    ['Do I set my own price?', 'Yes. You choose your hourly rate and can change it anytime from your dashboard.'],
    ['When and how do I get paid?', 'You’re paid out after completed sessions, by mobile money or bank transfer. Payments are processed securely through Paystack.'],
    ['Is there a joining fee?', 'No. It’s free to create a teacher account. Stuumo keeps a small service fee on paid bookings — you keep the rest.'],
  ]

  return (
    <div style={{ fontFamily: 'Tahoma, Geneva, sans-serif', background: '#fff', minHeight: '100vh', overflowX: 'clip' }}>
      <PublicNav />

      <section style={{ background: '#6D28D9', padding: isMobile ? '3.25rem 1.25rem 3.75rem' : '5rem 2.5rem 5.5rem' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: isMobile ? '30px' : '44px', fontWeight: '700', color: '#fff', lineHeight: '1.15', letterSpacing: '-0.02em', margin: '0 0 1rem' }}>Teach on Stuumo</h1>
          <p style={{ fontSize: isMobile ? '15px' : '17px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.7', margin: '0 0 1.75rem' }}>Reach parents and learners who are looking for exactly what you teach. Set your own rate, teach online, and get paid securely.</p>
          <Link to="/register?role=teacher" style={{ padding: '13px 28px', background: '#fff', color: '#6D28D9', borderRadius: '50px', fontSize: '15px', textDecoration: 'none', fontWeight: '700', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>Become a teacher</Link>
        </div>
      </section>

      {/* HOW TEACHING WORKS */}
      <Section id="how" isMobile={isMobile}>
        <div style={{ textAlign: 'center', marginBottom: isMobile ? '2.25rem' : '3rem' }}>
          <Eyebrow>How teaching works</Eyebrow>
          <H2>From sign-up to your first student</H2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: isMobile ? '1rem' : '1.25rem' }}>
          {steps.map(([t, d], i) => (
            <div key={t} style={{ background: '#fff', border: `1px solid ${GREY_LIGHT}`, borderRadius: '16px', padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(109,40,217,0.12)', color: '#6D28D9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '16px', flexShrink: 0 }}>{i + 1}</div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: TEXT, margin: '0 0 6px' }}>{t}</h3>
                <p style={{ fontSize: '13.5px', color: TEXT_MUTED, lineHeight: '1.65', margin: 0 }}>{d}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* EARNINGS */}
      <Section id="earnings" bg={GREY_BG} isMobile={isMobile}>
        <Eyebrow>Earnings &amp; payouts</Eyebrow>
        <H2>You set the rate. You keep most of it.</H2>
        <p style={{ fontSize: isMobile ? '15px' : '16px', color: TEXT_MUTED, lineHeight: '1.8', margin: '0 0 1.5rem' }}>
          You decide your own hourly rate and can adjust it anytime. When a learner books and pays, Stuumo keeps a small service fee to run the platform and handle secure payments — you keep the large majority of every booking. Payouts are made after completed sessions by mobile money or bank transfer.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1rem' }}>
          {[
            ['Your rate, your call', 'Set and change your hourly rate whenever you like.'],
            ['Keep the majority', 'A small service fee covers payments and platform costs; the rest is yours.'],
            ['Secure payouts', 'Paid out after sessions via mobile money or bank transfer.'],
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
          <Eyebrow>Teacher FAQ</Eyebrow>
          <H2>Questions, answered</H2>
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
          <h2 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '700', color: '#fff', letterSpacing: '-0.02em', margin: '0 0 1rem' }}>Ready to start teaching?</h2>
          <p style={{ fontSize: isMobile ? '15px' : '16px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.7', margin: '0 0 1.75rem' }}>Create your teacher account and submit your profile for verification today.</p>
          <Link to="/register?role=teacher" style={{ padding: '13px 28px', background: '#fff', color: '#6D28D9', borderRadius: '50px', fontSize: '15px', textDecoration: 'none', fontWeight: '700', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>Become a teacher</Link>
        </div>
      </section>

      <Footer variant="blue" />
    </div>
  )
}
