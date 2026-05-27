import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { ArrowLeft, RefreshCw } from 'lucide-react'

export default function OtpVerify() {
  const navigate = useNavigate()
  const { pendingPhone, setUser, addToast, otpMode, proIntent, user } = useStore()
  const [digits, setDigits]     = useState(['','','','','',''])
  const [error, setError]       = useState('')
  const [attempts, setAttempts] = useState(0)
  const [locked, setLocked]     = useState(false)
  const [lockEnd, setLockEnd]   = useState(null)
  const [countdown, setCountdown] = useState(60)
  const [loading, setLoading]   = useState(false)
  const refs = Array.from({length:6}, () => useRef(null))

  useEffect(() => {
    if (!pendingPhone && otpMode !== 'role-switch') navigate('/login')
    refs[0]?.current?.focus()
  }, [])

  // Resend countdown
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  // Lock countdown
  useEffect(() => {
    if (!locked || !lockEnd) return
    const t = setInterval(() => {
      if (Date.now() >= lockEnd) { setLocked(false); setAttempts(0); clearInterval(t) }
    }, 1000)
    return () => clearInterval(t)
  }, [locked, lockEnd])

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...digits]
    next[i] = val
    setDigits(next)
    setError('')
    if (val && i < 5) refs[i+1]?.current?.focus()
    if (next.every(d => d !== '') && !val) return
    if (val && i === 5) handleVerify(next.join(''))
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs[i-1]?.current?.focus()
    if (e.key === 'ArrowLeft'  && i > 0) refs[i-1]?.current?.focus()
    if (e.key === 'ArrowRight' && i < 5) refs[i+1]?.current?.focus()
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6)
    if (pasted.length === 6) {
      setDigits(pasted.split(''))
      handleVerify(pasted)
    }
  }

  const handleVerify = async (code) => {
    if (locked) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 700))
    setLoading(false)

    // Any 6-digit code is accepted in mock mode
    if (code.length === 6) {
      if (otpMode === 'role-switch') {
        // Upgrade guest user with real phone → then role select with limited access
        if (!user?.phone) {
          setUser({ ...user, phone: pendingPhone, id: 'p1', name: user?.name || 'Cricket Fan' })
        }
        addToast('Account created! Now choose your role.', 'success')
        navigate('/role-select')
      } else {
        setUser({ id:'p1', phone: pendingPhone, name:'Rohit Sharma', username:'rohit_s', city:'Mumbai', role:'fan', roles:['player'], isNew:false, avatar:null, lastRoleChangedAt:null, subscription:'free' })
        if (proIntent) {
          addToast('Phone verified! Complete your Pro setup.', 'success')
          navigate('/pro-payment')
        } else {
          addToast('Welcome back, Rohit! 🏏', 'success')
          navigate('/')
        }
      }
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      if (newAttempts >= 3) {
        const end = Date.now() + 10 * 60 * 1000
        setLocked(true)
        setLockEnd(end)
        setError('Too many failed attempts. Try again in 10 minutes.')
      } else {
        setError(`Incorrect code. ${3 - newAttempts} attempt(s) remaining.`)
      }
      setDigits(['','','','','',''])
      refs[0]?.current?.focus()
    }
  }

  const lockMinutes = lockEnd ? Math.ceil((lockEnd - Date.now()) / 60000) : 0

  return (
    <div className="min-h-dvh bg-gradient-to-br from-brand-50 via-white to-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm animate-slide-up">
        {/* Back */}
        <button onClick={() => navigate('/login')} className="flex items-center gap-2 text-navy-500 hover:text-navy-900 mb-6 transition-colors">
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="font-bold text-navy-900 text-xl mb-1">Enter OTP</h2>
          <p className="text-navy-500 text-sm mb-6">
            We sent a 6-digit code to <span className="font-semibold text-navy-900">{pendingPhone}</span>
          </p>

          {/* OTP inputs */}
          <div className="flex gap-2 justify-between mb-2" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={refs[i]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                disabled={locked || loading}
                aria-label={`OTP digit ${i+1}`}
                className={`otp-input ${d ? 'filled' : ''} ${error ? 'error' : ''} ${locked ? 'opacity-40 cursor-not-allowed' : ''}`}
              />
            ))}
          </div>

          {error && <p className="text-red-600 text-sm mt-2" role="alert">{error}</p>}

          {locked && (
            <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-red-700 text-sm font-medium">Account locked for ~{lockMinutes} min</p>
            </div>
          )}

          <button
            className="btn-primary w-full mt-5"
            onClick={() => handleVerify(digits.join(''))}
            disabled={digits.join('').length < 6 || locked || loading}
            aria-busy={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Verifying…
              </span>
            ) : 'Verify OTP'}
          </button>

          {/* Resend */}
          <div className="mt-4 text-center">
            {countdown > 0 ? (
              <p className="text-sm text-navy-400">Resend OTP in <span className="font-semibold">{countdown}s</span></p>
            ) : (
              <button
                onClick={() => { setCountdown(60); addToast('OTP resent!', 'info') }}
                className="flex items-center gap-1.5 text-brand-600 font-medium text-sm mx-auto hover:text-brand-700 transition-colors"
              >
                <RefreshCw size={14} />
                Resend OTP
              </button>
            )}
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-navy-400">
          Demo mode — any 6-digit code works
        </p>
      </div>
    </div>
  )
}
