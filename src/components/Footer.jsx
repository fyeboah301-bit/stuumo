import { Link } from 'react-router-dom'
import {
  BLUE, YELLOW, DARK_BLUE, LIGHT_BLUE, GREY_BG, GREY_LIGHT,
  TEXT_MUTED, GRADIENT_HERO, TRANSITION, BORDER,
} from '../styles/colors'
import Logo from './Logo'

export default function Footer({ variant = 'light' }) {
  const isDark = false  // dark variant retired — always light, keeps 'Teach' visible
  const year = new Date().getFullYear()

  if (isDark) {
    return (
      <footer style={{ background: GRADIENT_HERO, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>

            <div style={{ maxWidth: '280px' }}>
              <Link to="/" style={{ display: 'inline-block', marginBottom: '14px', textDecoration: 'none' }}>
                <Logo variant="blue" height={36} />
              </Link>
              <p style={{ fontSize: '13px', color: 'rgba(0,0,0,0.55)', lineHeight: '1.7', margin: '0 0 16px' }}>
                The trusted platform for verified teachers and private online sessions.
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { icon: '🛡️', label: 'Verified teachers' },
                  { icon: '🔒', label: 'Safe & secure' },
                ].map(({ icon, label }) => (
                  <div key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(0,0,0,0.08)', borderRadius: '50px', padding: '4px 10px', border: '1px solid rgba(0,0,0,0.1)' }}>
                    <span style={{ fontSize: '12px' }}>{icon}</span>
                    <span style={{ fontSize: '11px', color: 'rgba(0,0,0,0.6)', fontWeight: '600' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
              {[
                {
                  heading: 'Platform',
                  links: [
                    { label: 'Find teachers',      to: '/teachers' },
                    { label: 'Live sessions',       to: '/sessions' },
                    { label: 'Book a session',      to: '/booking' },
                    { label: 'Verify certificate',  to: '/verify' },
                  ]
                },
                {
                  heading: 'Join us',
                  links: [
                    { label: 'Teach on Stuumo',   to: '/register?role=teacher' },
                    { label: 'Sign up as parent',   to: '/register?role=parent' },
                    { label: 'Sign up as learner',  to: '/register?role=learner' },
                    { label: 'Log in',              to: '/login' },
                  ]
                },
              ].map(({ heading, links }) => (
                <div key={heading}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>{heading}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {links.map(({ label, to }) => (
                      <Link key={label} to={to}
                        style={{ fontSize: '13px', color: 'rgba(0,0,0,0.65)', textDecoration: 'none', fontWeight: '500', transition: TRANSITION }}
                        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(0,0,0,0.65)'}>
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ height: '1px', background: 'rgba(0,0,0,0.08)', marginBottom: '1.5rem' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <p style={{ fontSize: '12px', color: 'rgba(0,0,0,0.35)', margin: 0, fontWeight: '500' }}>
              © {year} Stuumo. All rights reserved.
            </p>
            <div style={{ display: 'flex', gap: '20px' }}>
              {[
                { label: 'Privacy', to: '/privacy' },
                { label: 'Terms', to: '/terms' },
                { label: 'Refund Policy', to: '/refund-policy' },
                { label: 'Contact', to: 'mailto:support@teachme.com', external: true },
              ].map(({ label, to, external }) => {
                const style = { fontSize: '12px', color: 'rgba(0,0,0,0.45)', cursor: 'pointer', fontWeight: '500', transition: TRANSITION, textDecoration: 'none' }
                const onEnter = e => e.currentTarget.style.color = 'rgba(0,0,0,0.8)'
                const onLeave = e => e.currentTarget.style.color = 'rgba(0,0,0,0.45)'
                return external
                  ? <a key={label} href={to} style={style} onMouseEnter={onEnter} onMouseLeave={onLeave}>{label}</a>
                  : <Link key={label} to={to} style={style} onMouseEnter={onEnter} onMouseLeave={onLeave}>{label}</Link>
              })}
            </div>
          </div>
        </div>
      </footer>
    )
  }

  // PURPLE VARIANT (default)
  const PURPLE = '#6D28D9'
  return (
    <footer style={{ background: PURPLE, borderTop: 'none' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>

          <div style={{ maxWidth: '280px' }}>
            <Link to="/" style={{ display: 'inline-block', marginBottom: '14px', textDecoration: 'none' }}>
              <Logo variant="blue" height={36} />
            </Link>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', lineHeight: '1.7', margin: '0 0 16px' }}>
              The trusted platform for verified teachers and private online sessions.
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { icon: '🛡️', label: 'Verified teachers' },
                { icon: '🔒', label: 'Safe & secure' },
              ].map(({ icon, label }) => (
                <div key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.14)', borderRadius: '50px', padding: '4px 10px', border: '1px solid rgba(255,255,255,0.25)' }}>
                  <span style={{ fontSize: '12px' }}>{icon}</span>
                  <span style={{ fontSize: '11px', color: '#fff', fontWeight: '700' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
            {[
              {
                heading: 'Platform',
                links: [
                  { label: 'Find teachers',      to: '/teachers' },
                  { label: 'Live sessions',       to: '/sessions' },
                  { label: 'Book a session',      to: '/booking' },
                  { label: 'Verify certificate',  to: '/verify' },
                ]
              },
              {
                heading: 'Join us',
                links: [
                  { label: 'Teach on Stuumo',   to: '/register?role=teacher' },
                  { label: 'Sign up as parent',   to: '/register?role=parent' },
                  { label: 'Sign up as learner',  to: '/register?role=learner' },
                  { label: 'Log in',              to: '/login' },
                ]
              },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>{heading}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {links.map(({ label, to }) => (
                    <Link key={label} to={to}
                      style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontWeight: '500', transition: TRANSITION }}
                      onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}>
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '14px', padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
          {[
            ['🏅', 'Certificate verified'],
            ['⭐', 'Rated by parents'],
            ['⚡', 'Fast response'],
          ].map(([icon, label]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <span style={{ fontSize: '16px' }}>{icon}</span>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', fontWeight: '600' }}>{label}</span>
            </div>
          ))}
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.2)', marginBottom: '1.25rem' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', margin: 0, fontWeight: '500' }}>
            © {year} Stuumo. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
            {[
              { label: 'Privacy', to: '/privacy' },
              { label: 'Terms', to: '/terms' },
              { label: 'Refund Policy', to: '/refund-policy' },
              { label: 'Contact', to: 'mailto:support@teachme.com', external: true },
            ].map(({ label, to, external }) => {
              const style = { fontSize: '12px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontWeight: '500', transition: TRANSITION, textDecoration: 'none' }
              const onEnter = e => e.currentTarget.style.color = '#fff'
              const onLeave = e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
              return external
                ? <a key={label} href={to} style={style} onMouseEnter={onEnter} onMouseLeave={onLeave}>{label}</a>
                : <Link key={label} to={to} style={style} onMouseEnter={onEnter} onMouseLeave={onLeave}>{label}</Link>
            })}
          </div>
        </div>
      </div>
    </footer>
  )
}
