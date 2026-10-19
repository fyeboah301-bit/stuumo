import { useState, useEffect, useRef } from 'react'
import Logo from '../components/Logo'
import { supabase } from '../lib/supabase'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import usePageMeta from '../hooks/usePageMeta'
import teacherImg from '../assets/images/teacher.png'
import parentImg from '../assets/images/parent.png'
import learnerImg from '../assets/images/learner.png'

// ── Data ─────────────────────────────────────────────────────────────────────

const COUNTRY_CODES = [
  { code: 'GH', dial: '+233', flag: '🇬🇭', name: 'Ghana' },
  { code: 'NG', dial: '+234', flag: '🇳🇬', name: 'Nigeria' },
  { code: 'KE', dial: '+254', flag: '🇰🇪', name: 'Kenya' },
  { code: 'ZA', dial: '+27',  flag: '🇿🇦', name: 'South Africa' },
  { code: 'UG', dial: '+256', flag: '🇺🇬', name: 'Uganda' },
  { code: 'TZ', dial: '+255', flag: '🇹🇿', name: 'Tanzania' },
  { code: 'RW', dial: '+250', flag: '🇷🇼', name: 'Rwanda' },
  { code: 'ET', dial: '+251', flag: '🇪🇹', name: 'Ethiopia' },
  { code: 'CM', dial: '+237', flag: '🇨🇲', name: 'Cameroon' },
  { code: 'SN', dial: '+221', flag: '🇸🇳', name: 'Senegal' },
  { code: 'CI', dial: '+225', flag: '🇨🇮', name: 'Ivory Coast' },
  { code: 'BJ', dial: '+229', flag: '🇧🇯', name: 'Benin' },
  { code: 'TG', dial: '+228', flag: '🇹🇬', name: 'Togo' },
  { code: 'LR', dial: '+231', flag: '🇱🇷', name: 'Liberia' },
  { code: 'SL', dial: '+232', flag: '🇸🇱', name: 'Sierra Leone' },
  { code: 'GM', dial: '+220', flag: '🇬🇲', name: 'Gambia' },
  { code: 'ZM', dial: '+260', flag: '🇿🇲', name: 'Zambia' },
  { code: 'ZW', dial: '+263', flag: '🇿🇼', name: 'Zimbabwe' },
  { code: 'GB', dial: '+44',  flag: '🇬🇧', name: 'United Kingdom' },
  { code: 'US', dial: '+1',   flag: '🇺🇸', name: 'United States' },
  { code: 'CA', dial: '+1',   flag: '🇨🇦', name: 'Canada' },
  { code: 'DE', dial: '+49',  flag: '🇩🇪', name: 'Germany' },
  { code: 'FR', dial: '+33',  flag: '🇫🇷', name: 'France' },
  { code: 'NL', dial: '+31',  flag: '🇳🇱', name: 'Netherlands' },
  { code: 'AU', dial: '+61',  flag: '🇦🇺', name: 'Australia' },
]

const COUNTRIES = [
  'Ghana','Nigeria','Kenya','South Africa','Uganda','Tanzania','Rwanda','Zambia',
  'Zimbabwe','Ethiopia','Cameroon','Senegal','Ivory Coast','Benin','Togo','Liberia',
  'Sierra Leone','Gambia','United Kingdom','United States','Canada','Germany',
  'France','Netherlands','Australia','Other',
]

const CITIES = {
  Ghana: ['Accra','Kumasi','Tamale','Sekondi-Takoradi','Ashaiman','Sunyani','Cape Coast','Obuasi','Tema','Koforidua','Ho','Wa','Bolgatanga','Techiman','Nkawkaw','Hohoe','Teshie','Madina','Kasoa','Winneba','Aflao','Nsawam','Agona Swedru','Berekum','Dunkwa-on-Offin'],
  Nigeria: ['Lagos','Abuja','Kano','Ibadan','Benin City','Port Harcourt','Kaduna','Enugu','Onitsha','Aba','Warri','Ilorin','Jos','Zaria','Owerri','Uyo','Abeokuta','Sokoto','Maiduguri','Calabar'],
  Kenya: ['Nairobi','Mombasa','Kisumu','Nakuru','Eldoret','Thika','Malindi','Kitale','Machakos','Nyeri','Garissa','Kisii'],
  'South Africa': ['Johannesburg','Cape Town','Durban','Pretoria','Port Elizabeth','Bloemfontein','East London','Polokwane','Nelspruit','Kimberley'],
  Uganda: ['Kampala','Gulu','Lira','Mbarara','Jinja','Mbale','Mukono','Kasese','Masaka','Entebbe'],
  Tanzania: ['Dar es Salaam','Mwanza','Arusha','Dodoma','Mbeya','Morogoro','Zanzibar City','Tanga','Kahama','Tabora'],
  Rwanda: ['Kigali','Butare','Gitarama','Musanze','Byumba','Cyangugu','Gisenyi'],
  Zambia: ['Lusaka','Kitwe','Ndola','Kabwe','Chingola','Mufulira','Livingstone','Luanshya'],
  Zimbabwe: ['Harare','Bulawayo','Chitungwiza','Mutare','Gweru','Kwekwe','Kadoma','Masvingo'],
  Ethiopia: ['Addis Ababa','Dire Dawa','Mekelle','Gondar','Hawassa','Bahir Dar','Dessie','Jimma'],
  Cameroon: ['Yaoundé','Douala','Garoua','Bamenda','Maroua','Bafoussam','Ngaoundéré'],
  Senegal: ['Dakar','Thiès','Saint-Louis','Kaolack','Ziguinchor','Mbour','Diourbel'],
  'Ivory Coast': ['Abidjan','Bouaké','Daloa','Yamoussoukro','San-Pédro','Korhogo'],
  'United Kingdom': ['London','Manchester','Birmingham','Leeds','Glasgow','Sheffield','Bradford','Liverpool','Edinburgh','Bristol','Cardiff','Leicester','Coventry','Nottingham','Newcastle','Aberdeen','Oxford','Cambridge'],
  'United States': ['New York','Los Angeles','Chicago','Houston','Phoenix','Philadelphia','San Antonio','San Diego','Dallas','San Jose','Austin','Atlanta','Boston','Seattle','Washington DC','Miami','Denver','Baltimore','Charlotte','Detroit'],
  Canada: ['Toronto','Montreal','Vancouver','Calgary','Edmonton','Ottawa','Winnipeg','Quebec City','Hamilton','Kitchener','Halifax','Victoria'],
  Germany: ['Berlin','Hamburg','Munich','Cologne','Frankfurt','Stuttgart','Düsseldorf','Leipzig','Dortmund','Essen','Dresden','Nuremberg'],
  France: ['Paris','Marseille','Lyon','Toulouse','Nice','Nantes','Montpellier','Strasbourg','Bordeaux','Lille','Rennes'],
  Netherlands: ['Amsterdam','Rotterdam','The Hague','Utrecht','Eindhoven','Tilburg','Groningen','Almere','Breda','Nijmegen'],
  Australia: ['Sydney','Melbourne','Brisbane','Perth','Adelaide','Gold Coast','Newcastle','Canberra','Wollongong','Hobart'],
}

function RoleIcon({ role, size = 40 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: '#6D28D9', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (role === 'teacher') return (<svg {...common}><path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c0 1 2.5 2.5 6 2.5s6-1.5 6-2.5v-5"/><path d="M22 10v4"/></svg>)
  if (role === 'parent')  return (<svg {...common}><circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.3"/><path d="M2 20c0-3.3 2.7-5.6 6-5.6s6 2.3 6 5.6"/><path d="M15.2 20c0-2.4 1-4 3.3-4.2"/></svg>)
  return (<svg {...common}><path d="M12 6.5C10.5 5 8 4.6 4 5v13c4-.4 6.5 0 8 1.5"/><path d="M12 6.5C13.5 5 16 4.6 20 5v13c-4-.4-6.5 0-8 1.5"/><path d="M12 6.5v13"/></svg>)
}

const ROLES = [
  { key: 'learner', img: learnerImg, title: 'Join as a Learner', desc: 'Find qualified teachers for any subject and level', color: '#0B0B0B', bg: '#F5F5F5', border: '#6D28D9', accent: '#F5F5F5' },
  { key: 'parent',  img: parentImg,  title: 'Join as a Parent',  desc: 'Book tutors for your child and track their progress', color: '#0B0B0B', bg: '#F5F5F5', border: '#6D28D9', accent: '#F5F5F5' },
  { key: 'teacher', img: teacherImg, title: 'Join as a Teacher', desc: 'Apply to teach, set your own schedule and earn income', color: '#0B0B0B', bg: '#F5F5F5', border: '#6D28D9', accent: '#F5F5F5' },
]

// ── Shared styles ─────────────────────────────────────────────────────────────

const inp = { width: '100%', padding: '12px 16px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '15px', color: '#0B0B0B', background: '#fff', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }
const lbl = { fontSize: '13px', fontWeight: '600', color: '#0B0B0B', display: 'block', marginBottom: '6px' }

// ── SearchableDropdown ────────────────────────────────────────────────────────

function SearchableDropdown({ options, value, onChange, placeholder = 'Select...' }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setSearch('') } }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()))

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div onClick={() => { setOpen(o => !o); setSearch('') }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', border: `1.5px solid ${open ? '#0B0B0B' : '#E2E8F0'}`, borderRadius: '10px', background: '#fff', cursor: 'pointer', fontSize: '15px', color: value ? '#0B0B0B' : '#9CA3AF', userSelect: 'none' }}>
        <span>{value || placeholder}</span>
        <span style={{ fontSize: '11px', color: '#9CA3AF', marginLeft: '8px' }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: '10px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 200, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '260px' }}>
          <div style={{ padding: '8px', borderBottom: '1px solid #F5F5F5' }}>
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)} onClick={e => e.stopPropagation()} placeholder="Search..."
              style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', outline: 'none', color: '#0B0B0B', background: '#F5F5F5', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filtered.length === 0
              ? <div style={{ padding: '14px 16px', fontSize: '14px', color: '#9CA3AF', textAlign: 'center' }}>No results</div>
              : filtered.map((o, i) => (
                <div key={i}
                  onMouseDown={() => { onChange(o); setOpen(false); setSearch('') }}
                  style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '14px', color: '#0B0B0B', background: o === value ? '#F5F5F5' : 'transparent', fontWeight: o === value ? '600' : '400', borderBottom: '1px solid #F5F5F5' }}
                  onMouseEnter={e => { if (o !== value) e.currentTarget.style.background = '#F5F5F5' }}
                  onMouseLeave={e => { if (o !== value) e.currentTarget.style.background = 'transparent' }}>
                  {o}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── PhoneInput ────────────────────────────────────────────────────────────────

function PhoneInput({ dialCode, onDialChange, number, onNumberChange }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setSearch('') } }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const filtered = COUNTRY_CODES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.dial.includes(search) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  )

  const sel = COUNTRY_CODES.find(c => c.dial === dialCode) || COUNTRY_CODES[0]

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
        <div onClick={() => { setOpen(o => !o); setSearch('') }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 10px', border: `1.5px solid ${open ? '#0B0B0B' : '#E2E8F0'}`, borderRadius: '10px', background: '#fff', cursor: 'pointer', userSelect: 'none', minWidth: '90px' }}>
          <span style={{ fontSize: '18px' }}>{sel.flag}</span>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#0B0B0B' }}>{dialCode}</span>
          <span style={{ fontSize: '10px', color: '#9CA3AF' }}>{open ? '▲' : '▼'}</span>
        </div>
        {open && (
          <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 200, background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: '10px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', width: '240px', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '260px' }}>
            <div style={{ padding: '8px', borderBottom: '1px solid #F5F5F5' }}>
              <input autoFocus value={search} onChange={e => setSearch(e.target.value)} onClick={e => e.stopPropagation()} placeholder="Search country..."
                style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', outline: 'none', color: '#0B0B0B', background: '#F5F5F5', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {filtered.map((c, i) => (
                <div key={i}
                  onMouseDown={() => { onDialChange(c.dial); setOpen(false); setSearch('') }}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 14px', cursor: 'pointer', background: c.code === sel.code ? '#F5F5F5' : 'transparent', borderBottom: '1px solid #F5F5F5' }}
                  onMouseEnter={e => { if (c.code !== sel.code) e.currentTarget.style.background = '#F5F5F5' }}
                  onMouseLeave={e => { if (c.code !== sel.code) e.currentTarget.style.background = 'transparent' }}>
                  <span style={{ fontSize: '18px' }}>{c.flag}</span>
                  <span style={{ flex: 1, fontSize: '13px', color: '#0B0B0B' }}>{c.name}</span>
                  <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: '600' }}>{c.dial}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <input type="tel" value={number} onChange={e => onNumberChange(e.target.value)} placeholder="XX XXX XXXX"
        style={{ ...inp, flex: 1 }} />
    </div>
  )
}

// ── Register ──────────────────────────────────────────────────────────────────

export default function Register() {
  usePageMeta({ title: 'Create Account — Stuumo', description: 'Join Stuumo as a learner, parent, or teacher' })
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const roleParam = searchParams.get('role')
  const validRole = ['learner', 'parent', 'teacher'].includes(roleParam) ? roleParam : null

  const [step, setStep] = useState(validRole ? 'account' : 'role')
  const [role, setRole] = useState(validRole)

  const [form, setForm]   = useState({ first_name: '', last_name: '', email: '', country: 'Ghana', city: '', password: '', confirm: '' })
  const [dialCode, setDialCode] = useState('+233')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const setE = k => e  => setForm(f => ({ ...f, [k]: e.target.value }))
  const setV = k => v  => setForm(f => ({ ...f, [k]: v }))

  const handleCountryChange = v => setForm(f => ({ ...f, country: v, city: '' }))

  const cityList    = CITIES[form.country] || []
  const hasCityList = cityList.length > 0
  const roleInfo    = ROLES.find(r => r.key === role)

  const submit = async e => {
    e.preventDefault()
    setError('')
    const full_name = `${form.first_name.trim()} ${form.last_name.trim()}`.trim()
    if (!form.first_name.trim() || !form.last_name.trim()) return setError('Please enter your first and last name')
    const isTeacher = role === 'teacher'
    if (!isTeacher) {
      if (form.password !== form.confirm) return setError('Passwords do not match')
      if (form.password.length < 6)       return setError('Password must be at least 6 characters')
    }
    setLoading(true)
    try {
      // Teachers don't choose a password at signup — they set it after approval.
      const signupPassword = isTeacher
        ? ((crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36)) + 'Aa1!')
        : form.password
      const { data, error: authErr } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: signupPassword,
        options: { data: { full_name } },
      })
      if (authErr) throw authErr
      const uid = data.user?.id
      if (!uid) throw new Error('Something went wrong — please try again.')
      const referral_code = 'TM' + Math.random().toString(36).substring(2, 8).toUpperCase()
      const { error: pErr } = await supabase.from('profiles').upsert({
        id: uid, full_name,
        phone: phone ? `${dialCode}${phone}` : '',
        city: form.city, country: form.country,
        role, referral_code, status: 'active',
      })
      if (pErr) throw pErr
      if (isTeacher) {
        await supabase.from('teachers').upsert({ id: uid, application_status: 'draft', is_verified: false, hourly_rate: 0 })
        navigate('/apply')
      } else {
        navigate('/dashboard')
      }
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  // ── Role selection ──────────────────────────────────────────────────────────

  if (step === 'role') {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F5F5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', fontFamily: 'Tahoma, Geneva, sans-serif' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Logo variant="yellow" height={32} />
          <div style={{ fontSize: '16px', color: '#6B7280' }}>How will you use Stuumo?</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', width: '100%', maxWidth: '740px', marginBottom: '1.5rem' }}>          {ROLES.map(r => (
            <div key={r.key}
              onClick={() => { setRole(r.key); setStep('account') }}
              style={{ position: 'relative', overflow: 'hidden', background: '#fff', border: '2px solid #E2E8F0', borderRadius: '16px', padding: '2rem 1.5rem', cursor: 'pointer', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = r.border; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: `url(${r.img})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.08, pointerEvents: 'none' }} />
              <div style={{ position: 'relative' }}>
                <div style={{ marginBottom: '14px' }}><RoleIcon role={r.key} size={44} /></div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#0B0B0B', marginBottom: '8px' }}>{r.title}</div>
                <div style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.6', marginBottom: '18px' }}>{r.desc}</div>
                <div style={{ display: 'inline-block', padding: '7px 20px', background: '#6D28D9', color: '#fff', borderRadius: '20px', fontSize: '13px', fontWeight: '700' }}>Get started →</div>
              </div>
            </div>
          ))}
        </div>

        <p style={{ color: '#6B7280', fontSize: '14px' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#0B0B0B', fontWeight: '600', textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    )
  }

  // ── Account form ────────────────────────────────────────────────────────────

  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', background: '#F5F5F5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', fontFamily: 'Tahoma, Geneva, sans-serif' }}>
      {roleInfo?.img && <div aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: `url(${roleInfo.img})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.07, pointerEvents: 'none' }} />}
      <div style={{ position: 'relative', width: '100%', maxWidth: '480px' }}>

        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <Logo variant="yellow" height={32} />
        </div>

        <div style={{ background: '#fff', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #E2E8F0' }}>

          {/* Role badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            {!validRole && (
              <button onClick={() => setStep('role')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: '22px', padding: '0 4px', lineHeight: 1, flexShrink: 0 }}>
                ←
              </button>
            )}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: roleInfo?.accent || '#F5F5F5', borderRadius: '10px', border: `1.5px solid ${roleInfo?.border || '#E2E8F0'}` }}>
              <RoleIcon role={role} size={24} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#0B0B0B' }}>{roleInfo?.title}</div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>Fill in your details below</div>
              </div>
            </div>
          </div>

          {error && (
            <div style={{ background: '#F5F5F5', color: '#6D28D9', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', marginBottom: '1.25rem', border: '1px solid #E2E8F0' }}>
              {error}
            </div>
          )}

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={lbl}>First name *</label>
                <input style={inp} placeholder="e.g. Kofi" value={form.first_name} onChange={setE('first_name')} required />
              </div>
              <div>
                <label style={lbl}>Last name *</label>
                <input style={inp} placeholder="e.g. Mensah" value={form.last_name} onChange={setE('last_name')} required />
              </div>
            </div>

            <div>
              <label style={lbl}>Email address *</label>
              <input type="email" style={inp} placeholder="you@example.com" value={form.email} onChange={setE('email')} required />
            </div>

            <div>
              <label style={lbl}>Phone number</label>
              <PhoneInput
                dialCode={dialCode}
                onDialChange={setDialCode}
                number={phone}
                onNumberChange={setPhone}
              />
            </div>

            <div>
              <label style={lbl}>Country *</label>
              <SearchableDropdown
                options={COUNTRIES}
                value={form.country}
                onChange={handleCountryChange}
                placeholder="Select your country"
              />
            </div>

            <div>
              <label style={lbl}>City *</label>
              {hasCityList ? (
                <SearchableDropdown
                  options={cityList}
                  value={form.city}
                  onChange={setV('city')}
                  placeholder="Select your city"
                />
              ) : (
                <input style={inp} placeholder="Enter your city" value={form.city} onChange={setE('city')} />
              )}
            </div>

            {role !== 'teacher' && (
              <>
                <div>
                  <label style={lbl}>Password *</label>
                  <input type="password" style={inp} placeholder="At least 6 characters" value={form.password} onChange={setE('password')} required minLength={6} />
                </div>

                <div>
                  <label style={lbl}>Confirm password *</label>
                  <input type="password" style={inp} placeholder="Repeat your password" value={form.confirm} onChange={setE('confirm')} required />
                </div>
              </>
            )}

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '14px', background: loading ? '#E2E8F0' : '#6D28D9', color: loading ? '#9CA3AF' : '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', marginTop: '4px' }}>
              {loading ? 'Creating account...' : role === 'teacher' ? 'Create account & complete profile →' : 'Create my account →'}
            </button>
          </form>

          {role === 'teacher' && (
            <div style={{ marginTop: '1rem', padding: '12px 14px', background: '#F5F5F5', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '13px', color: '#0B0B0B' }}>
              📋 Next you'll complete your teaching profile and submit your application. You'll set your password after your account is approved.
            </div>
          )}

          <p style={{ textAlign: 'center', color: '#6B7280', fontSize: '14px', marginTop: '1.25rem', marginBottom: 0 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#0B0B0B', fontWeight: '600', textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}