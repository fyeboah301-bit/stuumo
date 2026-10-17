// Stuumo wordmark — text only. Royal purple on light, white on dark. Roboto Serif Bold.
export default function Logo({ variant = 'blue', height = 32 }) {
  const onDark = variant === 'blue' || variant === 'dark'
  const c = onDark ? '#FFFFFF' : '#6D28D9'  // white on dark, royal purple on light
  return (
    <span
      style={{
        fontFamily: "'Roboto Serif', Georgia, 'Times New Roman', serif",
        fontWeight: 700,
        fontSize: Math.round(height * 1.05),
        lineHeight: 1,
        letterSpacing: '-0.01em',
        whiteSpace: 'nowrap',
        display: 'inline-block',
        color: c,
      }}
    >
      Stuumo
    </span>
  )
}
