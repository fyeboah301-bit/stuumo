import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import usePageMeta from '../hooks/usePageMeta'

const BLUE = '#2563EB'
const YELLOW = '#FFD700'

const LEVELS = ['Primary (1–6)', 'JHS (7–9)', 'SHS (10–12)', 'University', 'Professional']

// ── Curriculum by country & level ────────────────────────────────────────────
const CURRICULUM = {
  Ghana: {
    'Primary (1–6)': [
      'English Language', 'Mathematics', 'Science', 'Social Studies',
      'Creative Arts', 'Computing/ICT', 'Religious & Moral Education',
      'Ghanaian Language', 'French', 'Physical Education',
    ],
    'JHS (7–9)': [
      'English Language', 'Mathematics', 'Integrated Science', 'Social Studies',
      'Computing/ICT', 'French', 'Religious & Moral Education', 'Ghanaian Language',
      'Creative Arts & Design', 'Career Technology', 'Physical Education',
      'Basic Design & Technology',
    ],
    'SHS (10–12)': [
      'English', 'Core Mathematics', 'Elective Mathematics', 'Integrated Science',
      'Social Studies', 'Physics', 'Chemistry', 'Biology', 'Geography', 'History',
      'Economics', 'Business Management', 'Accounting', 'Government',
      'Literature in English', 'French', 'Visual Arts', 'Music', 'Computing/ICT',
      'Technical Drawing', 'Food & Nutrition', 'Physical Education',
    ],
    'University': [
      'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
      'Statistics', 'Economics', 'Accounting', 'Finance', 'Business Administration',
      'Law', 'Education', 'Psychology', 'Sociology', 'Political Science',
      'History', 'Geography', 'Literature', 'French', 'Engineering',
    ],
    'Professional': [
      'Accounting & Taxation', 'Finance & Investment', 'Project Management',
      'Human Resources', 'Marketing & Sales', 'IT & Programming',
      'Data Analysis', 'Business Analysis', 'Banking', 'Insurance',
      'Real Estate', 'Entrepreneurship', 'Supply Chain & Logistics',
    ],
  },
  Nigeria: {
    'Primary (1–6)': [
      'English Language', 'Mathematics', 'Basic Science & Technology',
      'Social Studies', 'Civic Education', 'Cultural & Creative Arts',
      'Physical & Health Education', 'Religious Studies (CRS/IRS)',
      'Agricultural Science', 'Yoruba', 'Igbo', 'Hausa',
    ],
    'JHS (7–9)': [
      'English Language', 'Mathematics', 'Basic Science', 'Basic Technology',
      'Social Studies', 'Civic Education', 'Cultural & Creative Arts',
      'Computer Studies', 'Agricultural Science', 'Home Economics',
      'Physical & Health Education', 'Religious Studies (CRS/IRS)',
      'Business Studies', 'French',
    ],
    'SHS (10–12)': [
      'English Language', 'Mathematics', 'Further Mathematics', 'Physics',
      'Chemistry', 'Biology', 'Agricultural Science', 'Economics', 'Commerce',
      'Accounting', 'Government', 'History', 'Geography',
      'Literature in English', 'Computer Studies', 'Technical Drawing',
      'Food & Nutrition', 'Civic Education', 'Religious Studies (CRS/IRS)', 'French',
    ],
    'University': [
      'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
      'Economics', 'Accounting', 'Finance', 'Business Administration', 'Law',
      'Medicine', 'Engineering', 'Education', 'Psychology', 'Sociology',
      'Political Science', 'History', 'Geography', 'Literature', 'Statistics',
    ],
    'Professional': [
      'Accounting & Taxation', 'Finance & Investment', 'Project Management',
      'IT & Programming', 'Data Analysis', 'Marketing & Sales', 'Human Resources',
      'Banking', 'Insurance', 'Entrepreneurship', 'Real Estate',
    ],
  },
  Kenya: {
    'Primary (1–6)': [
      'English', 'Kiswahili', 'Mathematics', 'Science & Technology',
      'Social Studies', 'Religious Education (CRE/IRE/HRE)',
      'Creative Arts', 'Physical & Health Education',
    ],
    'JHS (7–9)': [
      'English', 'Kiswahili', 'Mathematics', 'Integrated Science', 'Social Studies',
      'Creative Arts & Sports', 'Pre-Technical & Pre-Career Education',
      'Agriculture & Nutrition', 'Religious Education (CRE/IRE/HRE)', 'Computer Studies',
    ],
    'SHS (10–12)': [
      'English', 'Kiswahili', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
      'Geography', 'History', 'Economics', 'Business Studies', 'Computer Studies',
      'Agriculture', 'Religious Education (CRE/IRE)', 'French',
    ],
    'University': [
      'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
      'Economics', 'Business', 'Law', 'Medicine', 'Engineering', 'Education',
      'Psychology', 'History', 'Geography', 'Literature', 'Agriculture', 'Statistics',
    ],
    'Professional': [
      'Accounting & Taxation', 'Finance & Investment', 'Project Management',
      'IT & Programming', 'Data Analysis', 'Marketing & Sales',
      'Human Resources', 'Banking', 'Entrepreneurship',
    ],
  },
  'South Africa': {
    'Primary (1–6)': [
      'English', 'Afrikaans', 'Home Language', 'Mathematics', 'Life Skills',
      'Natural Sciences & Technology', 'Social Sciences', 'Arts & Culture', 'Physical Education',
    ],
    'JHS (7–9)': [
      'English', 'Afrikaans', 'Home Language', 'Mathematics', 'Natural Sciences',
      'Social Sciences', 'Life Orientation', 'Arts & Culture', 'Technology',
      'Economic & Management Sciences',
    ],
    'SHS (10–12)': [
      'English', 'Mathematics', 'Mathematical Literacy', 'Physical Sciences',
      'Life Sciences', 'Accounting', 'Business Studies', 'Economics', 'History',
      'Geography', 'Computer Applications Technology', 'Information Technology',
      'Life Orientation', 'Visual Arts', 'Music', 'Dramatic Arts',
    ],
    'University': [
      'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
      'Economics', 'Accounting', 'Business', 'Law', 'Medicine',
      'Engineering', 'Education', 'Psychology', 'History', 'Geography', 'Statistics',
    ],
    'Professional': [
      'Accounting & Taxation', 'Finance', 'Project Management', 'IT & Programming',
      'Data Analysis', 'Marketing', 'Human Resources', 'Banking', 'Real Estate',
    ],
  },
  Uganda: {
    'Primary (1–6)': [
      'English', 'Mathematics', 'Science', 'Social Studies',
      'Religious Education', 'Arts & Crafts', 'Physical Education', 'Local Language',
    ],
    'JHS (7–9)': [
      'English', 'Mathematics', 'Biology', 'Chemistry', 'Physics', 'History',
      'Geography', 'Religious Education', 'Computer Studies', 'Physical Education',
      'Agriculture', 'Home Economics', 'French',
    ],
    'SHS (10–12)': [
      'English', 'Mathematics', 'Biology', 'Chemistry', 'Physics', 'History',
      'Geography', 'Economics', 'Accounting', 'Computer Science', 'Agriculture',
      'Religious Education', 'Art', 'Physical Education', 'French',
    ],
    'University': [
      'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
      'Economics', 'Accounting', 'Business', 'Law', 'Medicine',
      'Engineering', 'Education', 'Psychology', 'Agriculture', 'Statistics',
    ],
    'Professional': [
      'Accounting', 'Finance', 'Project Management', 'IT & Programming',
      'Data Analysis', 'Marketing', 'Human Resources', 'Banking', 'Entrepreneurship',
    ],
  },
  Tanzania: {
    'Primary (1–6)': [
      'Kiswahili', 'English', 'Mathematics', 'Science', 'Social Studies',
      'Religious Education', 'Arts & Crafts', 'Physical Education',
    ],
    'JHS (7–9)': [
      'Kiswahili', 'English', 'Mathematics', 'Biology', 'Chemistry', 'Physics',
      'History', 'Geography', 'Civics', 'Religious Education', 'Computer Studies',
      'Agriculture', 'Home Economics', 'French',
    ],
    'SHS (10–12)': [
      'Kiswahili', 'English', 'Mathematics', 'Biology', 'Chemistry', 'Physics',
      'History', 'Geography', 'Economics', 'Accounting', 'Computer Science',
      'Agriculture', 'Civics', 'French',
    ],
    'University': [
      'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
      'Economics', 'Accounting', 'Business', 'Law', 'Medicine',
      'Engineering', 'Education', 'Agriculture', 'Statistics',
    ],
    'Professional': [
      'Accounting', 'Finance', 'Project Management', 'IT & Programming',
      'Data Analysis', 'Marketing', 'Human Resources', 'Banking', 'Entrepreneurship',
    ],
  },
  'United Kingdom': {
    'Primary (1–6)': [
      'English', 'Mathematics', 'Science', 'History', 'Geography',
      'Art & Design', 'Music', 'Computing', 'Physical Education',
      'Religious Education', 'Design & Technology', 'French', 'Spanish',
    ],
    'JHS (7–9)': [
      'English', 'Mathematics', 'Biology', 'Chemistry', 'Physics', 'History',
      'Geography', 'Art & Design', 'Music', 'Computing', 'Physical Education',
      'Religious Studies', 'Design & Technology', 'French', 'Spanish', 'German', 'Drama',
    ],
    'SHS (10–12)': [
      'English Language', 'English Literature', 'Mathematics', 'Further Mathematics',
      'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Economics',
      'Business Studies', 'Computer Science', 'Art & Design', 'Music',
      'Physical Education', 'Religious Studies', 'Design & Technology',
      'French', 'Spanish', 'German', 'Psychology', 'Sociology',
      'Media Studies', 'Drama & Theatre',
    ],
    'University': [
      'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
      'Economics', 'Business', 'Law', 'Medicine', 'Psychology', 'History',
      'Geography', 'Literature', 'Languages', 'Engineering', 'Philosophy',
      'Sociology', 'Political Science', 'Architecture', 'Education',
    ],
    'Professional': [
      'Accounting', 'Finance', 'Project Management', 'IT & Programming',
      'Data Analysis', 'Marketing', 'Human Resources', 'Law',
      'Banking', 'Real Estate', 'Nursing', 'Entrepreneurship',
    ],
  },
  'United States': {
    'Primary (1–6)': [
      'English Language Arts', 'Mathematics', 'Science', 'Social Studies',
      'Art', 'Music', 'Physical Education', 'Computer Skills', 'Health',
    ],
    'JHS (7–9)': [
      'English Language Arts', 'Mathematics', 'Pre-Algebra', 'Algebra',
      'Life Science', 'Earth Science', 'Physical Science', 'History',
      'Geography', 'Civics', 'Art', 'Music', 'Computer Science',
      'Physical Education', 'Health', 'Spanish', 'French',
    ],
    'SHS (10–12)': [
      'English', 'Algebra', 'Geometry', 'Pre-Calculus', 'Calculus', 'Statistics',
      'Biology', 'Chemistry', 'Physics', 'Environmental Science',
      'US History', 'World History', 'Government', 'Economics', 'Psychology',
      'Computer Science', 'Spanish', 'French', 'Art', 'Music',
      'Physical Education', 'SAT/ACT Prep',
    ],
    'University': [
      'Mathematics', 'Calculus', 'Statistics', 'Physics', 'Chemistry', 'Biology',
      'Computer Science', 'Economics', 'Accounting', 'Finance', 'Business',
      'Law', 'Medicine', 'Engineering', 'Psychology', 'History', 'Literature',
      'Political Science', 'Sociology', 'Philosophy',
    ],
    'Professional': [
      'Accounting & CPA Prep', 'Finance', 'Project Management (PMP)',
      'IT & Programming', 'Data Science', 'Marketing', 'Human Resources',
      'GMAT/GRE Prep', 'Bar Exam Prep', 'Real Estate Licensing', 'Entrepreneurship',
    ],
  },
  Canada: {
    'Primary (1–6)': [
      'English', 'French', 'Mathematics', 'Science', 'Social Studies',
      'Art', 'Music', 'Physical Education', 'Health',
    ],
    'JHS (7–9)': [
      'English', 'French', 'Mathematics', 'Science', 'Social Studies',
      'History', 'Geography', 'Art', 'Music', 'Physical Education', 'Computer Science',
    ],
    'SHS (10–12)': [
      'English', 'French', 'Mathematics', 'Calculus', 'Physics', 'Chemistry',
      'Biology', 'History', 'Geography', 'Economics', 'Computer Science',
      'Business', 'Art', 'Music', 'Physical Education',
    ],
    'University': [
      'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
      'Economics', 'Business', 'Law', 'Medicine', 'Engineering', 'Psychology',
      'History', 'Literature', 'Political Science', 'Statistics',
    ],
    'Professional': [
      'Accounting', 'Finance', 'Project Management', 'IT & Programming',
      'Data Science', 'Marketing', 'Human Resources', 'Banking', 'Real Estate',
    ],
  },
  Germany: {
    'Primary (1–6)': [
      'German', 'Mathematics', 'General Studies (Sachkunde)', 'Art',
      'Music', 'Physical Education', 'Religious Education', 'English',
    ],
    'JHS (7–9)': [
      'German', 'Mathematics', 'English', 'Physics', 'Chemistry', 'Biology',
      'History', 'Geography', 'Social Studies', 'Art', 'Music',
      'Physical Education', 'Computer Science', 'French',
    ],
    'SHS (10–12)': [
      'German', 'Mathematics', 'English', 'Physics', 'Chemistry', 'Biology',
      'History', 'Geography', 'Economics', 'Computer Science', 'Art', 'Music',
      'Physical Education', 'French', 'Latin', 'Philosophy',
    ],
    'University': [
      'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
      'Economics', 'Business', 'Law', 'Medicine', 'Engineering', 'Psychology',
      'History', 'Literature', 'Philosophy', 'Political Science',
    ],
    'Professional': [
      'Accounting', 'Finance', 'Project Management', 'IT & Programming',
      'Data Analysis', 'Marketing', 'Human Resources', 'Engineering', 'Banking',
    ],
  },
  France: {
    'Primary (1–6)': [
      'French', 'Mathematics', 'Sciences & Technology', 'History & Geography',
      'Arts', 'Physical Education', 'Music', 'Civic Education',
    ],
    'JHS (7–9)': [
      'French', 'Mathematics', 'Physics-Chemistry', 'Life & Earth Sciences',
      'History & Geography', 'English', 'Spanish', 'German', 'Art', 'Music',
      'Physical Education', 'Computer Science', 'Technology',
    ],
    'SHS (10–12)': [
      'French', 'Mathematics', 'Physics-Chemistry', 'Life & Earth Sciences',
      'History & Geography', 'Philosophy', 'Economics', 'Computer Science',
      'English', 'Spanish', 'German', 'Art', 'Music', 'Physical Education',
    ],
    'University': [
      'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
      'Economics', 'Law', 'Medicine', 'Engineering', 'Psychology',
      'History', 'Literature', 'Philosophy', 'Political Science',
    ],
    'Professional': [
      'Accounting', 'Finance', 'Project Management', 'IT & Programming',
      'Data Analysis', 'Marketing', 'Human Resources', 'Entrepreneurship',
    ],
  },
  Netherlands: {
    'Primary (1–6)': [
      'Dutch', 'Mathematics', 'Science', 'Social Studies', 'History',
      'Geography', 'English', 'Art', 'Music', 'Physical Education',
    ],
    'JHS (7–9)': [
      'Dutch', 'Mathematics', 'English', 'French', 'German', 'Physics',
      'Chemistry', 'Biology', 'History', 'Geography', 'Economics',
      'Computer Science', 'Art', 'Music', 'Physical Education',
    ],
    'SHS (10–12)': [
      'Dutch', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Economics',
      'History', 'Geography', 'English', 'French', 'German', 'Computer Science',
      'Art', 'Music', 'Physical Education', 'Philosophy',
    ],
    'University': [
      'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
      'Economics', 'Business', 'Law', 'Medicine', 'Engineering', 'Psychology',
      'History', 'Literature', 'Political Science', 'Statistics',
    ],
    'Professional': [
      'Accounting', 'Finance', 'Project Management', 'IT & Programming',
      'Data Analysis', 'Marketing', 'Human Resources', 'Entrepreneurship',
    ],
  },
  Australia: {
    'Primary (1–6)': [
      'English', 'Mathematics', 'Science', 'History', 'Geography',
      'Art', 'Music', 'Physical Education', 'Health', 'Computing',
    ],
    'JHS (7–9)': [
      'English', 'Mathematics', 'Science', 'History', 'Geography', 'Economics',
      'Art', 'Music', 'Computing', 'Physical Education', 'Health', 'Languages',
    ],
    'SHS (10–12)': [
      'English', 'Mathematics', 'Further Mathematics', 'Physics', 'Chemistry',
      'Biology', 'History', 'Geography', 'Economics', 'Business', 'Computer Science',
      'Art', 'Music', 'Physical Education', 'Psychology',
    ],
    'University': [
      'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
      'Economics', 'Accounting', 'Business', 'Law', 'Medicine', 'Engineering',
      'Psychology', 'History', 'Education', 'Architecture', 'Statistics',
    ],
    'Professional': [
      'Accounting', 'Finance', 'Project Management', 'IT & Programming',
      'Data Science', 'Marketing', 'Human Resources', 'Real Estate',
      'Banking', 'Nursing', 'Entrepreneurship',
    ],
  },
  // Fallback for any country not listed above
  default: {
    'Primary (1–6)': [
      'English', 'Mathematics', 'Science', 'Social Studies',
      'Religious Education', 'Arts & Crafts', 'Physical Education',
      'Local Language', 'Music', 'Computing',
    ],
    'JHS (7–9)': [
      'English', 'Mathematics', 'Science', 'Social Studies', 'Computing/ICT',
      'Religious Education', 'Physical Education', 'French', 'Arts',
      'Home Economics', 'Agricultural Science',
    ],
    'SHS (10–12)': [
      'English', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
      'Economics', 'Accounting', 'History', 'Geography', 'Computer Science',
      'Business Studies', 'Literature', 'French', 'Physical Education',
    ],
    'University': [
      'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
      'Economics', 'Accounting', 'Business', 'Law', 'Medicine',
      'Engineering', 'Education', 'Psychology', 'History', 'Geography',
      'Literature', 'Statistics', 'Political Science',
    ],
    'Professional': [
      'Accounting', 'Finance', 'Project Management', 'IT & Programming',
      'Data Analysis', 'Marketing', 'Human Resources', 'Banking', 'Entrepreneurship',
    ],
  },
}

function getSubjectsForLevels(selectedLevels, country) {
  const curriculum = CURRICULUM[country] || CURRICULUM.default
  const subjectSet = new Set()
  selectedLevels.forEach(level => {
    ;(curriculum[level] || []).forEach(s => subjectSet.add(s))
  })
  return [...subjectSet].sort()
}

const STEPS = [
  { number: 1, title: 'Your story',    desc: 'Tell learners about yourself' },
  { number: 2, title: 'What you teach', desc: 'Levels then subjects' },
  { number: 3, title: 'Verification',   desc: 'Documents and certificates' },
  { number: 4, title: 'Review',         desc: 'Submit your application' },
]

const LANGUAGES = ['English','Twi','Ga','Ewe','Hausa','French','Fante','Dagbani','Yoruba','Igbo','Kiswahili','Afrikaans','German','Spanish','Arabic','Other']
const DOC_TYPES  = ["National ID","Passport","Voter ID","Driver's License","NHIS Card"]

const inp = { width: '100%', padding: '12px 16px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '15px', color: '#111', background: '#fff', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }
const lbl = { fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }

export default function TeacherApplication() {
  usePageMeta({ title: 'Teacher Application — TeachMe', description: 'Complete your teaching profile and apply to teach on TeachMe' })
  const navigate = useNavigate()

  const [user, setUser]         = useState(null)
  const [country, setCountry]   = useState('Ghana')
  const [existing, setExisting] = useState(null)
  const [step, setStep]         = useState(1)
  const [done, setDone]         = useState(false)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [uploadMsg, setUploadMsg] = useState('')

  // Step 1
  const [bio, setBio]                   = useState('')
  const [experience, setExperience]     = useState('')
  const [rate, setRate]                 = useState('')
  const [selectedLangs, setSelectedLangs] = useState([])

  // Step 2
  const [levels, setLevels]     = useState([])
  const [subjects, setSubjects] = useState([])

  // Step 3
  const [docFile, setDocFile]       = useState(null)
  const [docType, setDocType]       = useState('National ID')
  const [uploadedDoc, setUploadedDoc]   = useState(null)
  const [certFile, setCertFile]     = useState(null)
  const [certName, setCertName]     = useState('')
  const [certType, setCertType]     = useState('teaching')
  const [uploadedCerts, setUploadedCerts] = useState([])
  const [uploading, setUploading]   = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return navigate('/login')
      setUser(data.user)

      // Get country from profile
      const { data: profile } = await supabase
        .from('profiles').select('country').eq('id', data.user.id).single()
      if (profile?.country) setCountry(profile.country)

      const { data: teacher } = await supabase
        .from('teachers').select('*').eq('id', data.user.id).single()
      if (teacher) {
        setExisting(teacher)
        if (teacher.application_status === 'pending' || teacher.application_status === 'approved') return
        setBio(teacher.bio || '')
        setExperience(teacher.years_experience?.toString() || '')
        setRate(teacher.hourly_rate?.toString() || '')
        setSelectedLangs(teacher.languages || [])
        setLevels(teacher.teaching_levels || [])
        setSubjects(teacher.subjects || [])
      }

      const { data: docs }  = await supabase.from('teacher_documents').select('*').eq('teacher_id', data.user.id)
      const { data: certs } = await supabase.from('certificates').select('*').eq('teacher_id', data.user.id)
      if (docs?.length)  setUploadedDoc(docs[0])
      if (certs?.length) setUploadedCerts(certs)
    })
  }, [])

  // When levels or country changes — auto-remove subjects that are no longer in the curriculum
  useEffect(() => {
    if (levels.length === 0) { setSubjects([]); return }
    const available = getSubjectsForLevels(levels, country)
    setSubjects(prev => prev.filter(s => available.includes(s)))
  }, [levels, country])

  const toggleLevel   = v => setLevels(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v])
  const toggleSubject = v => setSubjects(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v])
  const toggleLang    = v => setSelectedLangs(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v])

  const availableSubjects = getSubjectsForLevels(levels, country)

  const saveStep1 = async () => {
    if (!bio.trim()) return setError('Please write a short bio')
    setSaving(true); setError('')
    await supabase.from('teachers').update({
      bio: bio.trim(),
      years_experience: experience ? parseInt(experience) : null,
      hourly_rate: rate ? parseFloat(rate) : 0,
      languages: selectedLangs,
    }).eq('id', user.id)
    setSaving(false); setStep(2)
  }

  const saveStep2 = async () => {
    if (levels.length === 0)   return setError('Please select at least one teaching level')
    if (subjects.length === 0) return setError('Please select at least one subject')
    setSaving(true); setError('')
    await supabase.from('teachers').update({ subjects, teaching_levels: levels }).eq('id', user.id)
    setSaving(false); setStep(3)
  }

  const uploadDoc = async () => {
    if (!docFile) return setUploadMsg('Please select a file')
    setUploading(true); setUploadMsg('')
    try {
      const ext  = docFile.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('documents').upload(path, docFile)
      if (error) throw error
      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path)
      const { data: doc } = await supabase.from('teacher_documents').insert({
        teacher_id: user.id, document_type: docType, file_url: urlData.publicUrl, status: 'pending'
      }).select().single()
      setUploadedDoc(doc); setDocFile(null)
      setUploadMsg('✅ ID document uploaded')
    } catch (err) { setUploadMsg('Upload failed: ' + err.message) }
    finally { setUploading(false) }
  }

  const uploadCert = async () => {
    if (!certFile || !certName.trim()) return setUploadMsg('Please enter a certificate name and select a file')
    setUploading(true); setUploadMsg('')
    try {
      const ext  = certFile.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('certificates').upload(path, certFile)
      if (error) throw error
      const { data: urlData } = supabase.storage.from('certificates').getPublicUrl(path)
      const { data: cert } = await supabase.from('certificates').insert({
        teacher_id: user.id, certificate_name: certName.trim(), file_url: urlData.publicUrl,
        status: 'pending', certificate_type: certType
      }).select().single()
      setUploadedCerts(prev => [...prev, cert]); setCertFile(null); setCertName('')
      setUploadMsg('✅ Certificate uploaded')
    } catch (err) { setUploadMsg('Upload failed: ' + err.message) }
    finally { setUploading(false) }
  }

  const submitApplication = async () => {
    if (!uploadedDoc) return setError('Please upload at least one ID document before submitting')
    setSaving(true); setError('')
    await supabase.from('teachers').update({
      application_status: 'pending',
      application_submitted_at: new Date().toISOString(),
    }).eq('id', user.id)
    await supabase.from('audit_logs').insert({
      action: 'Application submitted', target_type: 'teacher',
      target_id: user.id, details: 'New teacher application submitted'
    })
    setSaving(false); setDone(true)
  }

  // ── Status screens ────────────────────────────────────────────────────────

  if (existing?.application_status === 'pending' && !done) {
    return (
      <StatusScreen icon="⏳" title="Application under review" color="#D97706" bg="#FEF3C7"
        message="Your application has been submitted and is being reviewed by our team. We'll email you within 48 hours."
        actions={[{ label: 'Go to dashboard', onClick: () => navigate('/dashboard'), primary: true }]} />
    )
  }

  if (existing?.application_status === 'approved' && !done) {
    return (
      <StatusScreen icon="✅" title="Application approved!" color="#059669" bg="#DCFCE7"
        message="Congratulations — your teacher profile is live and learners can now find and book you."
        actions={[
          { label: 'Go to dashboard', onClick: () => navigate('/dashboard'), primary: true },
          { label: 'View my profile',  onClick: () => navigate('/dashboard'), primary: false },
        ]} />
    )
  }

  if (existing?.application_status === 'rejected' && !done) {
    return (
      <StatusScreen icon="❌" title="Application not approved" color="#DC2626" bg="#FEE2E2"
        message={`Your application was not approved${existing.application_notes ? `: ${existing.application_notes}` : '. Please review your profile and resubmit.'}`}
        actions={[
          { label: 'Update & resubmit', onClick: () => setExisting(e => ({ ...e, application_status: 'draft' })), primary: true },
          { label: 'Go to dashboard',   onClick: () => navigate('/dashboard'), primary: false },
        ]} />
    )
  }

  // ── Done ─────────────────────────────────────────────────────────────────

  if (done) {
    return (
      <Wrapper>
        <div style={{ textAlign: 'center', maxWidth: '480px', margin: '0 auto', padding: '3rem 1rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', margin: '0 auto 1.5rem' }}>🎉</div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: '700', color: '#111', marginBottom: '1rem' }}>Application submitted!</h1>
          <p style={{ color: '#64748B', fontSize: '16px', lineHeight: '1.7', marginBottom: '2rem' }}>
            Our team will review your profile and documents within <strong style={{ color: '#111' }}>48 hours</strong>. You'll receive an email notification.
          </p>
          <div style={{ background: '#F8FAFC', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', textAlign: 'left', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' }}>What happens next</div>
            {[
              ['🔍', 'Admin reviews your profile and uploaded documents'],
              ['✉️', 'You receive an email with approval or feedback'],
              ['🚀', 'Once approved, your profile goes live to learners'],
              ['📅', 'Learners can find and book sessions with you'],
            ].map(([icon, text]) => (
              <div key={text} style={{ display: 'flex', gap: '12px', marginBottom: '10px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '18px', flexShrink: 0 }}>{icon}</span>
                <span style={{ fontSize: '14px', color: '#374151', lineHeight: '1.5' }}>{text}</span>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/dashboard')}
            style={{ width: '100%', padding: '14px', background: BLUE, color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
            Go to dashboard
          </button>
        </div>
      </Wrapper>
    )
  }

  // ── Multi-step form ───────────────────────────────────────────────────────

  return (
    <Wrapper>
      <div style={{ maxWidth: '620px', margin: '0 auto', padding: '1rem' }}>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: '700', color: '#111', marginBottom: '6px' }}>
            Teach<span style={{ color: BLUE }}>Me</span>
          </div>
          <div style={{ fontSize: '14px', color: '#64748B' }}>Teacher application — complete all 4 steps</div>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            {STEPS.map(s => (
              <div key={s.number} style={{ textAlign: 'center', flex: 1 }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', margin: '0 auto 6px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', fontWeight: '700', transition: 'all 0.3s',
                  background: step > s.number ? '#059669' : step === s.number ? BLUE : '#E2E8F0',
                  color: step >= s.number ? '#fff' : '#9CA3AF',
                }}>
                  {step > s.number ? '✓' : s.number}
                </div>
                <div style={{ fontSize: '11px', fontWeight: step === s.number ? '700' : '400', color: step === s.number ? '#111' : '#9CA3AF' }}>
                  {s.title}
                </div>
              </div>
            ))}
          </div>
          <div style={{ height: '4px', background: '#E2E8F0', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${((step - 1) / (STEPS.length - 1)) * 100}%`, background: BLUE, borderRadius: '2px', transition: 'width 0.4s ease' }} />
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #E2E8F0' }}>

          {error && (
            <div style={{ background: '#FEF2F2', color: '#DC2626', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', marginBottom: '1.25rem', border: '1px solid #FECACA' }}>
              {error}
            </div>
          )}

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div>
              <StepHeader icon="📖" title="Your story" sub="Tell learners who you are and what makes you a great teacher" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <label style={lbl}>Bio / About you *</label>
                  <textarea style={{ ...inp, height: '120px', resize: 'vertical', lineHeight: '1.6' }}
                    placeholder="Describe your teaching style, experience, and what you love about teaching..."
                    value={bio} onChange={e => setBio(e.target.value)} />
                  <div style={{ fontSize: '12px', color: bio.length < 80 ? '#F59E0B' : '#059669', marginTop: '4px' }}>
                    {bio.length < 80 ? `${80 - bio.length} more characters recommended` : '✓ Good length'}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={lbl}>Years of experience</label>
                    <input type="number" min="0" max="50" style={inp} placeholder="e.g. 3" value={experience} onChange={e => setExperience(e.target.value)} />
                  </div>
                  <div>
                    <label style={lbl}>Hourly rate (GH₵)</label>
                    <input type="number" min="0" step="5" style={inp} placeholder="e.g. 50" value={rate} onChange={e => setRate(e.target.value)} />
                    <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>You can change this anytime</div>
                  </div>
                </div>
                <div>
                  <label style={lbl}>Languages you teach in</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px', border: '1.5px solid #E2E8F0', borderRadius: '10px', background: '#F8FAFC' }}>
                    {LANGUAGES.map(lang => (
                      <button key={lang} type="button" onClick={() => toggleLang(lang)}
                        style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: selectedLangs.includes(lang) ? '700' : '400', background: selectedLangs.includes(lang) ? BLUE : '#fff', color: selectedLangs.includes(lang) ? '#fff' : '#64748B', border: `1.5px solid ${selectedLangs.includes(lang) ? BLUE : '#E2E8F0'}`, transition: 'all 0.15s' }}>
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <NavButtons onNext={saveStep1} saving={saving} nextLabel="Save & continue →" />
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div>
              <StepHeader
                icon="📚"
                title="What you teach"
                sub="Select your teaching levels first — subjects will update automatically to match your selection and your country's curriculum"
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

                {/* Levels — pick first */}
                <div>
                  <label style={{ ...lbl, fontSize: '14px', marginBottom: '12px' }}>Teaching levels *</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {LEVELS.map(l => (
                      <button key={l} type="button" onClick={() => toggleLevel(l)}
                        style={{
                          padding: '10px 20px', borderRadius: '50px', fontSize: '14px', cursor: 'pointer',
                          fontFamily: 'inherit', fontWeight: levels.includes(l) ? '700' : '500',
                          background: levels.includes(l) ? '#7C3AED' : '#fff',
                          color: levels.includes(l) ? '#fff' : '#374151',
                          border: `2px solid ${levels.includes(l) ? '#7C3AED' : '#E2E8F0'}`,
                          transition: 'all 0.15s', boxShadow: levels.includes(l) ? '0 2px 8px rgba(124,58,237,0.3)' : 'none',
                        }}>
                        {l}
                      </button>
                    ))}
                  </div>
                  {levels.length > 0 && (
                    <div style={{ fontSize: '12px', color: '#7C3AED', marginTop: '10px', fontWeight: '600' }}>
                      ✓ {levels.length} level{levels.length !== 1 ? 's' : ''} selected
                    </div>
                  )}
                </div>

                {/* Subjects — driven by level selection */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <label style={{ ...lbl, fontSize: '14px', margin: 0 }}>Subjects *</label>
                    {subjects.length > 0 && (
                      <span style={{ fontSize: '12px', color: '#059669', fontWeight: '700', background: '#DCFCE7', padding: '3px 10px', borderRadius: '20px' }}>
                        {subjects.length} selected
                      </span>
                    )}
                  </div>

                  {levels.length === 0 ? (
                    <div style={{ padding: '2.5rem 1rem', textAlign: 'center', border: '2px dashed #E2E8F0', borderRadius: '12px', background: '#F8FAFC' }}>
                      <div style={{ fontSize: '32px', marginBottom: '10px' }}>👆</div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '4px' }}>
                        Select your teaching levels first
                      </div>
                      <div style={{ fontSize: '13px', color: '#9CA3AF' }}>
                        Subjects will appear automatically based on your selection
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#EFF6FF', borderRadius: '8px', border: '1px solid #BFDBFE', fontSize: '13px', color: '#1E40AF', marginBottom: '12px' }}>
                        <span style={{ flexShrink: 0 }}>📋</span>
                        <span>
                          Showing <strong>{availableSubjects.length} subjects</strong> taught at{' '}
                          <strong>{levels.join(', ')}</strong> level{levels.length !== 1 ? 's' : ''} in <strong>{country}</strong>
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '14px', border: '1.5px solid #E2E8F0', borderRadius: '12px', background: '#F8FAFC', maxHeight: '300px', overflowY: 'auto' }}>
                        {availableSubjects.map(s => (
                          <button key={s} type="button" onClick={() => toggleSubject(s)}
                            style={{
                              padding: '7px 14px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer',
                              fontFamily: 'inherit', fontWeight: subjects.includes(s) ? '700' : '400',
                              background: subjects.includes(s) ? BLUE : '#fff',
                              color: subjects.includes(s) ? '#fff' : '#374151',
                              border: `1.5px solid ${subjects.includes(s) ? BLUE : '#E2E8F0'}`,
                              transition: 'all 0.15s', whiteSpace: 'nowrap',
                              boxShadow: subjects.includes(s) ? '0 2px 6px rgba(37,99,235,0.25)' : 'none',
                            }}>
                            {s}
                          </button>
                        ))}
                      </div>
                      {subjects.length === 0 && (
                        <div style={{ fontSize: '12px', color: '#F59E0B', marginTop: '8px', fontWeight: '600' }}>
                          ⚠️ Select at least one subject to continue
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <NavButtons
                onBack={() => { setError(''); setStep(1) }}
                onNext={saveStep2}
                saving={saving}
                nextLabel="Save & continue →"
              />
            </div>
          )}

          {/* ── STEP 3 ── */}
          {step === 3 && (
            <div>
              <StepHeader icon="🪪" title="Verify your identity" sub="Upload an ID document (required) and any teaching certificates (strongly recommended)" />

              {uploadMsg && (
                <div style={{ background: uploadMsg.startsWith('✅') ? '#F0FDF4' : '#FEF2F2', color: uploadMsg.startsWith('✅') ? '#166534' : '#DC2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', border: `1px solid ${uploadMsg.startsWith('✅') ? '#BBF7D0' : '#FECACA'}` }}>
                  {uploadMsg}
                  <button onClick={() => setUploadMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'inherit', padding: 0 }}>×</button>
                </div>
              )}

              {/* ID document */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111', margin: 0 }}>ID Document</h3>
                  <span style={{ fontSize: '11px', background: '#FEE2E2', color: '#991B1B', padding: '2px 8px', borderRadius: '20px', fontWeight: '700' }}>Required</span>
                </div>
                {uploadedDoc ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#F0FDF4', borderRadius: '10px', border: '1.5px solid #6EE7B7' }}>
                    <span style={{ fontSize: '22px' }}>✅</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#111' }}>{uploadedDoc.document_type}</div>
                      <div style={{ fontSize: '12px', color: '#059669' }}>Uploaded · Pending review</div>
                    </div>
                    <button onClick={() => setUploadedDoc(null)} style={{ fontSize: '12px', color: '#64748B', background: 'none', border: 'none', cursor: 'pointer' }}>Replace</button>
                  </div>
                ) : (
                  <div style={{ border: '1.5px solid #E2E8F0', borderRadius: '12px', padding: '1.25rem', background: '#F8FAFC' }}>
                    <div style={{ marginBottom: '10px' }}>
                      <label style={lbl}>Document type</label>
                      <select style={inp} value={docType} onChange={e => setDocType(e.target.value)}>
                        {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div style={{ border: '2px dashed #CBD5E1', borderRadius: '8px', padding: '16px', background: '#fff', textAlign: 'center', marginBottom: '10px' }}>
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>📎</div>
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setDocFile(e.target.files[0])} style={{ fontSize: '13px', cursor: 'pointer' }} />
                      <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '6px' }}>PDF, JPG or PNG</div>
                      {docFile && <div style={{ fontSize: '13px', color: '#059669', fontWeight: '600', marginTop: '6px' }}>📎 {docFile.name}</div>}
                    </div>
                    <button onClick={uploadDoc} disabled={uploading || !docFile}
                      style={{ width: '100%', padding: '11px', background: uploading || !docFile ? '#E2E8F0' : BLUE, color: uploading || !docFile ? '#9CA3AF' : '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: uploading || !docFile ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                      {uploading ? '⏳ Uploading...' : '⬆ Upload ID document'}
                    </button>
                  </div>
                )}
              </div>

              {/* Certificates */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111', margin: 0 }}>Teaching Certificates</h3>
                  <span style={{ fontSize: '11px', background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '20px', fontWeight: '700' }}>Recommended</span>
                </div>
                {uploadedCerts.length > 0 && (
                  <div style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {uploadedCerts.map(c => (
                      <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: '#F0FDF4', borderRadius: '10px', border: '1.5px solid #6EE7B7' }}>
                        <span style={{ fontSize: '20px' }}>{c.certificate_type === 'academic' ? '🎓' : '📋'}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#111' }}>{c.certificate_name}</div>
                          <div style={{ fontSize: '12px', color: '#059669' }}>Uploaded · Pending review</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ border: '1.5px solid #E2E8F0', borderRadius: '12px', padding: '1.25rem', background: '#F8FAFC' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <div>
                      <label style={lbl}>Certificate name</label>
                      <input style={inp} placeholder="e.g. PGDE — UEW" value={certName} onChange={e => setCertName(e.target.value)} />
                    </div>
                    <div>
                      <label style={lbl}>Type</label>
                      <select style={inp} value={certType} onChange={e => setCertType(e.target.value)}>
                        <option value="teaching">Teaching certificate</option>
                        <option value="academic">Academic degree</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ border: '2px dashed #CBD5E1', borderRadius: '8px', padding: '14px', background: '#fff', textAlign: 'center', marginBottom: '10px' }}>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setCertFile(e.target.files[0])} style={{ fontSize: '13px', cursor: 'pointer' }} />
                    {certFile && <div style={{ fontSize: '13px', color: '#059669', fontWeight: '600', marginTop: '6px' }}>📎 {certFile.name}</div>}
                  </div>
                  <button onClick={uploadCert} disabled={uploading || !certFile || !certName.trim()}
                    style={{ width: '100%', padding: '11px', background: uploading || !certFile || !certName.trim() ? '#E2E8F0' : '#7C3AED', color: uploading || !certFile || !certName.trim() ? '#9CA3AF' : '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                    {uploading ? '⏳ Uploading...' : '⬆ Add certificate'}
                  </button>
                  <p style={{ fontSize: '12px', color: '#9CA3AF', textAlign: 'center', marginTop: '8px', marginBottom: 0 }}>You can add multiple certificates</p>
                </div>
              </div>

              <NavButtons onBack={() => { setError(''); setStep(2) }} onNext={() => { setError(''); setUploadMsg(''); setStep(4) }} nextLabel="Review application →" />
            </div>
          )}

          {/* ── STEP 4 ── */}
          {step === 4 && (
            <div>
              <StepHeader icon="📋" title="Review & submit" sub="Check your application details before submitting" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1.5rem' }}>
                <ReviewSection title="Your story" onEdit={() => setStep(1)}>
                  <ReviewRow label="Bio" value={bio || '—'} />
                  <ReviewRow label="Experience" value={experience ? `${experience} year${experience !== '1' ? 's' : ''}` : '—'} />
                  <ReviewRow label="Rate" value={rate ? `GH₵ ${rate}/hr` : 'Not set'} />
                  <ReviewRow label="Languages" value={selectedLangs.length ? selectedLangs.join(', ') : '—'} />
                </ReviewSection>
                <ReviewSection title="What you teach" onEdit={() => setStep(2)}>
                  <ReviewRow label="Levels" value={levels.length ? levels.join(', ') : '—'} />
                  <ReviewRow label="Subjects" value={subjects.length ? subjects.join(', ') : '—'} />
                </ReviewSection>
                <ReviewSection title="Verification" onEdit={() => setStep(3)}>
                  <ReviewRow label="ID document" value={uploadedDoc ? `${uploadedDoc.document_type} ✓` : '⚠️ Not uploaded (required)'} alert={!uploadedDoc} />
                  <ReviewRow label="Certificates" value={uploadedCerts.length ? `${uploadedCerts.length} uploaded` : 'None (recommended)'} />
                </ReviewSection>
              </div>

              {!uploadedDoc && (
                <div style={{ background: '#FFFBEB', borderRadius: '10px', padding: '12px 14px', border: '1px solid #FCD34D', fontSize: '13px', color: '#92400E', marginBottom: '1rem' }}>
                  ⚠️ Please go back and upload your ID document before submitting.
                </div>
              )}

              <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '1.25rem', border: '1px solid #E2E8F0', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '13px', color: '#374151', lineHeight: '1.7' }}>
                  By submitting, you confirm that all information is accurate and that you consent to TeachMe reviewing your application. You'll hear from us within <strong>48 hours</strong>.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => { setError(''); setStep(3) }}
                  style={{ padding: '13px 20px', background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: '12px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', color: '#64748B', fontWeight: '600' }}>
                  ← Back
                </button>
                <button onClick={submitApplication} disabled={saving || !uploadedDoc}
                  style={{ flex: 1, padding: '13px', background: saving || !uploadedDoc ? '#E2E8F0' : BLUE, color: saving || !uploadedDoc ? '#9CA3AF' : '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: saving || !uploadedDoc ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                  {saving ? 'Submitting...' : '🚀 Submit application'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Wrapper({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9', fontFamily: 'DM Sans, sans-serif', padding: '2rem 1rem' }}>
      {children}
    </div>
  )
}

function StepHeader({ icon, title, sub }) {
  return (
    <div style={{ marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '2px solid #F1F5F9' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
        <span style={{ fontSize: '24px' }}>{icon}</span>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111', margin: 0 }}>{title}</h2>
      </div>
      <p style={{ fontSize: '14px', color: '#64748B', margin: 0, lineHeight: '1.6' }}>{sub}</p>
    </div>
  )
}

function NavButtons({ onBack, onNext, saving, nextLabel = 'Continue →' }) {
  return (
    <div style={{ display: 'flex', gap: '10px', marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '2px solid #F1F5F9' }}>
      {onBack && (
        <button onClick={onBack}
          style={{ padding: '13px 20px', background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: '12px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', color: '#64748B', fontWeight: '600' }}>
          ← Back
        </button>
      )}
      <button onClick={onNext} disabled={saving}
        style={{ flex: 1, padding: '13px', background: saving ? '#E2E8F0' : '#2563EB', color: saving ? '#9CA3AF' : '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
        {saving ? 'Saving...' : nextLabel}
      </button>
    </div>
  )
}

function ReviewSection({ title, onEdit, children }) {
  return (
    <div style={{ border: '1.5px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
        <span style={{ fontSize: '13px', fontWeight: '700', color: '#111' }}>{title}</span>
        <button onClick={onEdit} style={{ fontSize: '12px', color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700', fontFamily: 'inherit' }}>Edit</button>
      </div>
      <div style={{ padding: '4px 0' }}>{children}</div>
    </div>
  )
}

function ReviewRow({ label, value, alert }) {
  return (
    <div style={{ display: 'flex', gap: '12px', padding: '8px 14px', borderBottom: '1px solid #F8FAFC' }}>
      <span style={{ fontSize: '13px', color: '#64748B', width: '110px', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: '13px', color: alert ? '#DC2626' : '#111', fontWeight: alert ? '600' : '400', flex: 1 }}>{value}</span>
    </div>
  )
}

function StatusScreen({ icon, title, color, bg, message, actions }) {
  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: '20px', padding: '2.5rem', maxWidth: '480px', width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #E2E8F0' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', margin: '0 auto 1.25rem' }}>{icon}</div>
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111', marginBottom: '1rem' }}>{title}</h2>
        <p style={{ fontSize: '15px', color: '#64748B', lineHeight: '1.7', marginBottom: '1.5rem' }}>{message}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {actions.map(a => (
            <button key={a.label} onClick={a.onClick}
              style={{ width: '100%', padding: '13px', background: a.primary ? color : '#fff', color: a.primary ? '#fff' : '#64748B', border: a.primary ? 'none' : '1.5px solid #E2E8F0', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}