import NavBar from './NavBar'
import Footer from './Footer'
import usePageMeta from '../hooks/usePageMeta'
import {
  GREY_BG, WHITE, TEXT, TEXT_MUTED, GRADIENT_HERO, YELLOW,
  RADIUS_LG, SHADOW_LG, BORDER, BLUE,
} from '../styles/colors'

/**
 * Shared layout for legal pages (Terms, Privacy, Refund Policy).
 * Renders the standard NavBar, a branded hero header, a readable prose
 * container, and the Footer.
 *
 * Content is passed as children. Use the exported <LegalSection> and
 * <LegalParagraph> / <LegalList> helpers for consistent typography.
 */
export default function LegalLayout({ title, subtitle, lastUpdated, metaTitle, children }) {
  usePageMeta(metaTitle || title)

  return (
    <div style={{ background: GREY_BG, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavBar />

      {/* Hero header */}
      <div style={{ background: GRADIENT_HERO, padding: '56px 24px 48px', color: '#0B0B0B' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-block', fontSize: '12px', fontWeight: '700', letterSpacing: '0.08em',
            textTransform: 'uppercase', color: YELLOW, marginBottom: '14px',
          }}>
            Legal
          </div>
          <h1 style={{
            fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: '40px', lineHeight: '1.1',
            margin: '0 0 12px', fontWeight: '700',
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: '17px', lineHeight: '1.6', color: 'rgba(0,0,0,0.85)', margin: '0', maxWidth: '640px' }}>
              {subtitle}
            </p>
          )}
          {lastUpdated && (
            <p style={{ fontSize: '13px', color: 'rgba(0,0,0,0.6)', margin: '18px 0 0', fontWeight: '500' }}>
              Last updated: {lastUpdated}
            </p>
          )}
        </div>
      </div>

      {/* Content card */}
      <div style={{ flex: 1, padding: '40px 24px 72px' }}>
        <div style={{
          maxWidth: '860px', margin: '0 auto', background: WHITE, border: BORDER,
          borderRadius: RADIUS_LG, boxShadow: SHADOW_LG, padding: '48px 48px 40px',
        }}>
          {children}

          <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: BORDER }}>
            <p style={{ fontSize: '14px', color: TEXT_MUTED, lineHeight: '1.6', margin: 0 }}>
              Questions about this policy? Contact us at{' '}
              <a href="mailto:support@stuumo.com" style={{ color: BLUE, fontWeight: '600', textDecoration: 'none' }}>
                support@stuumo.com
              </a>.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

/* ---------- Typography helpers ---------- */

export function LegalSection({ heading, children }) {
  return (
    <section style={{ marginBottom: '32px' }}>
      <h2 style={{
        fontFamily: 'Tahoma, Geneva, sans-serif', fontSize: '22px', color: TEXT,
        margin: '0 0 12px', fontWeight: '700',
      }}>
        {heading}
      </h2>
      {children}
    </section>
  )
}

export function LegalParagraph({ children }) {
  return (
    <p style={{ fontSize: '15.5px', lineHeight: '1.75', color: '#0B0B0B', margin: '0 0 14px' }}>
      {children}
    </p>
  )
}

export function LegalList({ items }) {
  return (
    <ul style={{ margin: '0 0 14px', paddingLeft: '22px' }}>
      {items.map((item, i) => (
        <li key={i} style={{ fontSize: '15.5px', lineHeight: '1.7', color: '#0B0B0B', marginBottom: '8px' }}>
          {item}
        </li>
      ))}
    </ul>
  )
}
