import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { supabase, toE164 } from '../lib/supabase'
import { LEGAL_URL } from '../lib/constants'
import { Phone, ChevronDown, ArrowLeft } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode') || 'login' // 'login' | 'signup'
  const isSignup = mode === 'signup'
  const { setPendingPhone, addToast } = useStore()
  const [phone, setPhone]   = useState('')
  const [code, setCode]     = useState('+91')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    const cleaned = phone.replace(/\D/g, '')
    if (code === '+91' && cleaned.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.')
      return
    }
    if (cleaned.length < 7) {
      setError('Please enter a valid phone number.')
      return
    }
    setError('')
    setLoading(true)
    const fullPhone = `${code} ${cleaned}`
    const { error: sendError } = await supabase.auth.signInWithOtp({ phone: toE164(fullPhone) })
    setLoading(false)
    if (sendError) {
      setError(sendError.message)
      return
    }
    setPendingPhone(fullPhone)
    navigate('/otp')
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-brand-50 via-white to-slate-50 flex flex-col items-center justify-center p-6">
      {/* Back to Welcome */}
      <button
        onClick={() => navigate('/welcome')}
        className="absolute top-5 left-4 flex items-center gap-1.5 text-navy-500 hover:text-navy-700 transition-colors text-sm font-medium"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Logo */}
      <div className="mb-8 flex flex-col items-center animate-fade-in">
        <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-brand-500/25">
          <span className="text-white font-black text-2xl">CY</span>
        </div>
        <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">CricYaar</h1>
        <p className="text-navy-500 mt-1 font-medium">Cricket. Done right.</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-card p-6 animate-slide-up">
        <h2 className="font-bold text-navy-900 text-lg mb-1">
          {isSignup ? 'Create your account' : 'Log in to continue'}
        </h2>
        <p className="text-navy-500 text-sm mb-6">We'll send a 6-digit OTP to your number.</p>

        <label className="block text-sm font-semibold text-navy-700 mb-2">Mobile number</label>
        <div className="flex gap-2 mb-1">
          {/* Country code */}
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
          {/* Phone */}
          <div className="relative flex-1">
            <input
              type="tel"
              inputMode="numeric"
              className={`cm-input h-12 pl-10 ${error ? 'error' : ''}`}
              placeholder="9876543210"
              value={phone}
              onChange={e => { setPhone(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              autoFocus
              autoComplete="tel-national"
              maxLength={15}
            />
            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
        {error && <p className="text-red-600 text-sm mt-1" role="alert">{error}</p>}

        <button
          className="btn-primary w-full mt-5"
          onClick={handleSend}
          disabled={loading || phone.length < 7}
          aria-busy={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Sending OTP…
            </span>
          ) : isSignup ? 'Create Account' : 'Send OTP'}
        </button>

        {/* Toggle mode */}
        <p className="text-center text-sm text-navy-500 mt-4">
          {isSignup ? (
            <>Already have an account?{' '}
              <button
                className="text-brand-600 font-semibold hover:text-brand-700 transition-colors"
                onClick={() => navigate('/login?mode=login')}
              >Log in</button>
            </>
          ) : (
            <>New to CricYaar?{' '}
              <button
                className="text-brand-600 font-semibold hover:text-brand-700 transition-colors"
                onClick={() => navigate('/login?mode=signup')}
              >Sign up</button>
            </>
          )}
        </p>

        <p className="text-center text-xs text-navy-400 mt-3">
          By continuing you agree to our{' '}
          <a href={`${LEGAL_URL}#terms`} target="_blank" rel="noopener noreferrer" className="text-brand-600 font-medium underline-offset-2 hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href={`${LEGAL_URL}#privacy`} target="_blank" rel="noopener noreferrer" className="text-brand-600 font-medium underline-offset-2 hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}
