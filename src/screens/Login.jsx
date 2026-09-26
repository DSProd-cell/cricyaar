import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { supabase, toE164 } from '../lib/supabase'
import { LEGAL_URL } from '../lib/constants'
import { Phone, ChevronDown, ArrowLeft, User, AtSign } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode') || 'signup'
  const isSignup = mode === 'signup'
  const { setPendingPhone, setPendingSignup, addToast } = useStore()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName]   = useState('')
  const [cricketName, setCricketName] = useState('')
  const [phone, setPhone]   = useState('')
  const [code, setCode]     = useState('+91')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const clearErr = (key) => setErrors(e => ({ ...e, [key]: '' }))

  const validate = () => {
    const e = {}
    if (isSignup) {
      if (!firstName.trim() || firstName.trim().length < 2) e.firstName = 'Enter your first name.'
      if (!lastName.trim()) e.lastName = 'Enter your last name.'
      if (!cricketName.trim() || cricketName.trim().length < 3) e.cricketName = 'Min. 3 characters.'
      if (!/^[a-z0-9_.]+$/.test(cricketName)) e.cricketName = 'Letters, numbers, _ and . only.'
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

  return (
    <div className="min-h-dvh bg-gradient-to-br from-brand-50 via-white to-slate-50 flex flex-col items-center justify-center p-6">
      <button
        onClick={() => navigate('/welcome')}
        className="absolute top-5 left-4 flex items-center gap-1.5 text-navy-500 hover:text-navy-700 transition-colors text-sm font-medium"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Logo */}
      <div className="mb-7 flex flex-col items-center animate-fade-in">
        <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-brand-500/25">
          <span className="text-white font-black text-2xl">CY</span>
        </div>
        <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">CricYaar</h1>
        <p className="text-navy-500 mt-1 font-medium">Cricket. Organised.</p>
      </div>

      {/* Toggle tabs */}
      <div className="w-full max-w-sm mb-4 animate-fade-in">
        <div className="flex bg-slate-100 rounded-2xl p-1">
          <button
            onClick={() => navigate('/login?mode=signup')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${isSignup ? 'bg-white shadow-sm text-navy-900' : 'text-navy-500 hover:text-navy-700'}`}
          >
            Sign Up
          </button>
          <button
            onClick={() => navigate('/login?mode=login')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${!isSignup ? 'bg-white shadow-sm text-navy-900' : 'text-navy-500 hover:text-navy-700'}`}
          >
            Log In
          </button>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-card p-6 animate-slide-up space-y-4">
        {isSignup ? (
          <>
            <div>
              <p className="text-navy-500 text-sm mb-4">Tell us who you are — we'll get your cricket life sorted.</p>

              {/* First + Last Name row */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-700 mb-1.5">First Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      className={`cm-input pl-9 ${errors.firstName ? 'error' : ''}`}
                      placeholder="Rohit"
                      value={firstName}
                      onChange={e => { setFirstName(e.target.value); clearErr('firstName') }}
                      autoFocus
                      maxLength={30}
                    />
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-700 mb-1.5">Last Name <span className="text-red-500">*</span></label>
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
              <div className="mb-4">
                <label className="block text-sm font-semibold text-navy-700 mb-1">
                  Your Cricket Name <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-navy-400 mb-1.5">How scoreboards and teammates will know you</p>
                <div className="relative">
                  <input
                    className={`cm-input pl-9 ${errors.cricketName ? 'error' : ''}`}
                    placeholder="rohit_the_wall"
                    value={cricketName}
                    onChange={e => {
                      setCricketName(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))
                      clearErr('cricketName')
                    }}
                    maxLength={20}
                  />
                  <AtSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
                {errors.cricketName
                  ? <p className="text-red-500 text-xs mt-1">{errors.cricketName}</p>
                  : cricketName.length >= 3 && (
                    <p className="text-brand-600 text-xs mt-1">@{cricketName} · looks good!</p>
                  )
                }
              </div>
            </div>
          </>
        ) : (
          <div>
            <h2 className="font-bold text-navy-900 text-lg mb-1">Welcome back!</h2>
            <p className="text-navy-500 text-sm mb-4">We'll send a 6-digit OTP to your number.</p>
          </div>
        )}

        {/* Phone input */}
        <div>
          <label className="block text-sm font-semibold text-navy-700 mb-1.5">Mobile Number <span className="text-red-500">*</span></label>
          <div className="flex gap-2">
            <div className="relative flex-shrink-0">
              <select
                value={code}
                onChange={e => setCode(e.target.value)}
                className="h-12 pl-3 pr-8 border-[1.5px] border-slate-200 rounded-xl bg-slate-50 text-sm font-medium text-navy-900 outline-none appearance-none focus:border-brand-500 transition-colors"
                aria-label="Country code"
              >
                <option value="+91">🇮🇳 +91</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
                <option value="+61">🇦🇺 +61</option>
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
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
          ) : isSignup ? 'Send OTP →' : 'Send OTP →'}
        </button>

        <p className="text-center text-xs text-navy-400 pt-1">
          By continuing you agree to our{' '}
          <a href={`${LEGAL_URL}#terms`} target="_blank" rel="noopener noreferrer" className="text-brand-600 font-medium hover:underline">Terms</a>
          {' '}and{' '}
          <a href={`${LEGAL_URL}#privacy`} target="_blank" rel="noopener noreferrer" className="text-brand-600 font-medium hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}
