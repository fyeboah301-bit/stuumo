export default function Logo({ variant = 'blue', height = 32 }) {
  if (variant === 'yellow') {
    return (
      <svg height={height} viewBox="0 0 294 76" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
        <rect width="294" height="76" rx="10" fill="#FFD700"/>
        <text x="14" y="56" fontFamily="Tahoma, Geneva, sans-serif" fontSize="50" fontWeight="700" fill="#2563EB">TeachMe</text>
      </svg>
    )
  }
  return (
    <svg height={height} viewBox="0 0 294 76" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <rect width="294" height="76" rx="10" fill="#2563EB"/>
      <text x="14" y="56" fontFamily="Tahoma, Geneva, sans-serif" fontSize="50" fontWeight="700" fill="#FFD700">TeachMe</text>
    </svg>
  )
}