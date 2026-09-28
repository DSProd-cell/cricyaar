import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { supabase, toE164 } from '../lib/supabase'
import { LEGAL_URL } from '../lib/constants'
import { Phone, ArrowLeft, Check } from 'lucide-react'

const LANGUAGES = [
  'Odia', 'Kannada', 'Hindi', 'Tamil', 'Telugu',
  'Marathi', 'Bengali', 'Gujarati', 'Punjabi', 'Malayalam', 'Other',
]

function StepDots({ active }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 0 8px', background: 'linear-gradient(135deg,#7C3AED,#5B21B6)' }}>
      {[1, 2, 3].map(n => (
        <div key={n} style={{
          width: n === active ? 28 : 20,
          height: 6,
          borderRadius: 4,
          background: n === active ? '#fff' : n < active ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.28)',
          transition: 'all .2s',
        }} />
      ))}
      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginLeft: 4 }}>
        Step {active} of 3
      </span>
    </div>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode') || 'signup'
  const isSignup = mode === 'signup'
  const { setPendingPhone, setPendingSignup, addToast } = useStore()

  const [firstName,    setFirstName]    = useState('')
  const [lastName,     setLastName]     = useState('')
  const [cricketName,  setCricketName]  = useState('')
  const [motherTongue, setMotherTongue] = useState('')
  const [phone,        setPhone]        = useState('')
  const code = '+91'
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => { setErrors({}) }, [mode])

  const clearErr = (key) => setErrors(e => ({ ...e, [key]: '' }))

  const validate = () => {
    const e = {}
    if (isSignup) {
      if (!firstName.trim() || firstName.trim().length < 2) e.firstName = 'Enter your first name.'
      if (!lastName.trim()) e.lastName = 'Enter your last name.'
      if (cricketName.trim() && cricketName.trim().length < 3) e.cricketName = 'Min. 3 characters.'
      if (cricketName.trim() && !/^[a-z0-9_.]+$/.test(cricketName)) e.cricketName = 'Letters, numbers, _ and . only.'
    }
    const cleaned = phone.replace(/\D/g, '')
    if (code === '+91' && cleaned.length !== 10) e.phone = 'Enter a valid 10-digit number.'
    else if (cleaned.length < 7) e.phone = 'Enter a valid phone number.'
    return e
  }

  const handleSend = async () => {
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) return

    setLoading(true)
    const cleaned = phone.replace(/\D/g, '')
    const fullPhone = `${code} ${cleaned}`

    if (isSignup) {
      setPendingSignup({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        cricketName: cricketName.trim().toLowerCase().replace(/[^a-z0-9_.]/g, ''),
        fullName: `${firstName.trim()} ${lastName.trim()}`,
        motherTongue: motherTongue || '',
      })
    }

    const { error: sendError } = await supabase.auth.signInWithOtp({ phone: toE164(fullPhone) })
    setLoading(false)

    if (sendError) {
      setErrors({ phone: sendError.message })
      return
    }
    setPendingPhone(fullPhone)
    navigate('/otp')
  }

  const cricketNameValid = cricketName.length >= 3 && !errors.cricketName

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6">
      <button
        onClick={() => navigate('/welcome')}
        className="absolute top-5 left-4 flex items-center gap-1.5 text-navy-500 hover:text-navy-700 transition-colors text-sm font-medium"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="w-full max-w-sm animate-fade-in mb-6">
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,#7C3AED,#5B21B6)', borderRadius: isSignup ? '20px 20px 0 0' : 20, padding: '20px 20px 16px', textAlign: 'center', color: '#fff' }}>
          <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 10px' }}>
            🏏
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.3px' }}>CricYaar</h1>
          <p style={{ fontSize: 10, opacity: 0.75, marginTop: 2, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            {isSignup ? 'Your cricket identity, built to last' : 'Welcome back, cricketer'}
          </p>
        </div>

        {/* Step dots — only on sign-up */}
        {isSignup && <StepDots active={1} />}

        {/* Card */}
        <div
          className="bg-[var(--cy-surface)] shadow-card p-5 space-y-4"
          style={{ borderRadius: isSignup ? '0 0 20px 20px' : '0 0 20px 20px' }}
        >
          {/* Mode toggle */}
          <div className="flex bg-slate-100 rounded-2xl p-1">
            <button
              onClick={() => navigate('/login?mode=signup')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${isSignup ? 'bg-[var(--cy-surface)] shadow-sm text-navy-900' : 'text-navy-500 hover:text-navy-700'}`}
            >
              Sign Up
            </button>
            <button
              onClick={() => navigate('/login?mode=login')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${!isSignup ? 'bg-[var(--cy-surface)] shadow-sm text-navy-900' : 'text-navy-500 hover:text-navy-700'}`}
            >
              Log In
            </button>
          </div>

          {isSignup ? (
            <>
              {/* First + Last Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-navy-700 mb-1.5">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={`cm-input ${errors.firstName ? 'error' : ''}`}
                    placeholder="Rohit"
                    value={firstName}
                    onChange={e => { setFirstName(e.target.value); clearErr('firstName') }}
                    autoFocus
                    maxLength={30}
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-700 mb-1.5">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={`cm-input ${errors.lastName ? 'error' : ''}`}
                    placeholder="Sharma"
                    value={lastName}
                    onChange={e => { setLastName(e.target.value); clearErr('lastName') }}
                    maxLength={30}
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>
              </div>

              {/* Cricket Name */}
              <div>
                <label className="block text-sm font-semibold text-navy-700 mb-1 flex items-center gap-2">
                  Cricket / playing name
                  <span style={{ background: '#ede9fe', color: '#5b21b6', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 6 }}>
                    Links your records
                  </span>
                </label>
                <input
                  className={`cm-input ${errors.cricketName ? 'error' : cricketNameValid ? 'border-green-400 bg-green-50' : ''}`}
                  style={cricketNameValid ? { borderColor: '#4ade80', background: '#f0fdf4' } : {}}
                  placeholder="e.g. Rohit S · RS Sharma · Debu"
                  value={cricketName}
                  onChange={e => {
                    setCricketName(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))
                    clearErr('cricketName')
                  }}
                  maxLength={30}
                />
                {errors.cricketName ? (
                  <p className="text-red-500 text-xs mt-1">{errors.cricketName}</p>
                ) : cricketNameValid ? (
                  <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                    <Check size={11} /> Looks good — we'll search records under "{cricketName}"
                  </p>
                ) : (
                  <p style={{ fontSize: 10, color: '#64748b', marginTop: 5, lineHeight: 1.45, background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 8, padding: '6px 9px' }}>
                    <strong style={{ color: '#5b21b6' }}>🏆 This links your match history.</strong>{' '}
                    Use the name your scorers wrote — a nickname, initials, or short form — so <em>Fetch Past Records</em> can find you.
                  </p>
                )}
              </div>

              {/* Mother Tongue */}
              <div>
                <label className="block text-xs font-semibold text-navy-700 mb-1 flex items-center gap-2">
                  Mother tongue
                  <span style={{ background: '#dcfce7', color: '#15803d', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 6 }}>
                    Team matching
                  </span>
                </label>
                <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '4px 0 6px', scrollbarWidth: 'none' }}>
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setMotherTongue(t => t === lang ? '' : lang)}
                      style={{
                        padding: '6px 13px',
                        borderRadius: 20,
                        border: '1.5px solid',
                        borderColor: motherTongue === lang ? '#7C3AED' : '#e2e8f0',
                        background: motherTongue === lang ? '#f5f3ff' : '#fff',
                        color: motherTongue === lang ? '#7C3AED' : '#64748b',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        transition: 'all .12s',
                      }}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
                {motherTongue ? (
                  <p style={{ fontSize: 10, color: '#92400e', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '5px 9px', marginTop: 2 }}>
                    Teams where {motherTongue} speakers play will be highlighted for you.
                  </p>
                ) : (
                  <p className="text-[10px] text-navy-400 mt-0.5">Optional — helps match you with teams that speak your language.</p>
                )}
              </div>
            </>
          ) : (
            <div>
              <h2 className="font-bold text-navy-900 text-lg mb-1">Welcome back!</h2>
              <p className="text-navy-500 text-sm mb-2">We'll send a 6-digit OTP to your number.</p>
            </div>
          )}

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-navy-700 mb-1.5">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="h-12 px-3 border-[1.5px] border-slate-200 rounded-xl bg-slate-50 flex items-center flex-shrink-0">
                <span className="text-sm font-semibold text-navy-900">🇮🇳 +91</span>
              </div>
              <div className="relative flex-1">
                <input
                  type="tel"
                  inputMode="numeric"
                  className={`cm-input h-12 pl-10 ${errors.phone ? 'error' : ''}`}
                  placeholder="9876543210"
                  value={phone}
                  onChange={e => { setPhone(e.target.value); clearErr('phone') }}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  autoComplete="tel-national"
                  maxLength={15}
                />
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
            {errors.phone && <p className="text-red-600 text-sm mt-1" role="alert">{errors.phone}</p>}
          </div>

          <button
            className="btn-primary w-full mt-1"
            onClick={handleSend}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Sending OTP…
              </span>
            ) : isSignup ? 'Continue →' : 'Send OTP →'}
          </button>

          <p className="text-center text-xs text-navy-400 pt-1">
            By continuing you agree to our{' '}
            <a href={`${LEGAL_URL}#terms`} target="_blank" rel="noopener noreferrer" className="text-brand-600 font-medium hover:underline">Terms</a>
            {' '}and{' '}
            <a href={`${LEGAL_URL}#privacy`} target="_blank" rel="noopener noreferrer" className="text-brand-600 font-medium hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  )
}
