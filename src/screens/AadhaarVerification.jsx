import { useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft, Shield, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function AadhaarVerification() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fromGroundOwner = searchParams.get('from') === 'ground_owner'
  const { addToast, user, setUser } = useStore()
  const [step, setStep] = useState(1)
  const [aadhaar, setAadhaar] = useState('')
  const [showAadhaar, setShowAadhaar] = useState(false)
  const [otp, setOtp] = useState(['','','','','',''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(3)
  const refs = useRef([])

  const maskedAadhaar = aadhaar.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3')
  const displayAadhaar = showAadhaar ? maskedAadhaar : aadhaar.replace(/\d(?=\d{4})/g, 'X').replace(/(\w{4})(\w{4})(\w{4})/, '$1-$2-$3')

  const handleSendOtp = async () => {
    if (aadhaar.length !== 12) { setError('Enter a valid 12-digit Aadhaar number'); return }
    setLoading(true); setError('')
    await new Promise(r => setTimeout(r, 1500))
    setLoading(false); setStep(2)
  }

  const handleVerifyOtp = async () => {
    const code = otp.join('')
    if (code.length < 6) { setError('Enter all 6 digits'); return }
    setLoading(true); setError('')
    await new Promise(r => setTimeout(r, 1500))
    if (code === '123456') {
      setLoading(false); setStep(3)
    } else {
      setLoading(false)
      const left = attempts - 1
      setAttempts(left)
      if (left === 0) { setError('Too many incorrect attempts. Please try again in 30 minutes.') }
      else { setError(`Incorrect OTP. ${left} attempt${left !== 1 ? 's' : ''} remaining.`) }
    }
  }

  const handleConfirm = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false); setStep(4)
    if (fromGroundOwner) {
      // Mark user as verified ground owner
      setUser({ ...user, groundOwnerVerified: true })
      addToast('Identity verified! You can now list your ground.', 'success')
      setTimeout(() => navigate('/ground-owner'), 1500)
    } else {
      addToast('Aadhaar verified! Your ground is under admin review.')
    }
  }

  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]; next[i] = val; setOtp(next)
    if (val && i < 5) refs.current[i+1]?.focus()
  }

  const handleOtpKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i-1]?.focus()
  }

  return (
    <div className="min-h-dvh bg-navy-50 flex flex-col">
      <div className="bg-white border-b border-navy-200 sticky top-0 z-10">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => step > 1 && step < 4 ? setStep(s => s-1) : navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-navy-100 text-navy-700">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="font-bold text-navy-900 text-base">Aadhaar Verification</h1>
            <p className="text-navy-500 text-xs">Powered by Digio · NSDL-backed</p>
          </div>
          {step < 4 && (
            <div className="ml-auto flex gap-1.5">
              {[1,2,3].map(s => (
                <div key={s} className={`h-1.5 w-6 rounded-full transition-colors ${step >= s ? 'bg-teal-500' : 'bg-navy-200'}`} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col p-4">

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center">
                  <Shield size={24} className="text-teal-600" />
                </div>
                <div>
                  <h2 className="font-bold text-navy-900">Verify with Aadhaar</h2>
                  <p className="text-navy-500 text-xs">Get a ✓ Verified Owner badge</p>
                </div>
              </div>
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 mb-5 text-xs text-teal-800 leading-relaxed">
                Your Aadhaar number is used only for identity verification. We only store your name and masked address — never the full Aadhaar number.
              </div>
              <label className="block text-sm font-semibold text-navy-700 mb-1.5">Aadhaar Number</label>
              <div className="relative">
                <input
                  type={showAadhaar ? 'text' : 'password'}
                  inputMode="numeric"
                  value={aadhaar}
                  onChange={e => setAadhaar(e.target.value.replace(/\D/g,'').slice(0,12))}
                  placeholder="XXXX XXXX XXXX"
                  className="w-full border border-navy-200 rounded-xl px-3 py-3 pr-10 text-base font-mono tracking-widest text-navy-900 focus:outline-none focus:border-teal-500"
                />
                <button type="button" onClick={() => setShowAadhaar(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400">
                  {showAadhaar ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-navy-400 mt-1.5">Enter 12-digit Aadhaar number. OTP will be sent to your Aadhaar-linked mobile.</p>
              {error && <p className="text-red-600 text-xs mt-2 flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
            </div>
            <button onClick={handleSendOtp} disabled={aadhaar.length !== 12 || loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
              style={{ background: '#0891b2' }}>
              {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending OTP…</> : 'Send OTP to Aadhaar-linked Mobile'}
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="card p-5">
              <h2 className="font-bold text-navy-900 mb-1">Enter OTP</h2>
              <p className="text-navy-500 text-sm mb-5">6-digit OTP sent to your Aadhaar-linked mobile number ending in ****89</p>
              <div className="flex gap-2 justify-center mb-4">
                {otp.map((v, i) => (
                  <input
                    key={i}
                    ref={el => refs.current[i] = el}
                    type="text" inputMode="numeric" maxLength={1}
                    value={v}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className={`w-11 h-12 text-center text-xl font-black border-2 rounded-xl focus:outline-none transition-colors ${v ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-navy-200 text-navy-900'}`}
                  />
                ))}
              </div>
              <p className="text-xs text-navy-400 text-center mb-1">
                <span className="text-teal-600 font-semibold cursor-pointer">Resend OTP</span> · OTP expires in 5 min
              </p>
              {error && <p className="text-red-600 text-xs mt-2 flex items-center gap-1 justify-center"><AlertCircle size={12} />{error}</p>}
            </div>
            <p className="text-xs text-navy-400 text-center">Use OTP <strong>123456</strong> for demo</p>
            <button onClick={handleVerifyOtp} disabled={otp.join('').length < 6 || loading || attempts === 0}
              className="btn-primary w-full flex items-center justify-center gap-2"
              style={{ background: '#0891b2' }}>
              {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Verifying…</> : 'Verify OTP'}
            </button>
          </div>
        )}

        {/* Step 3 — Confirm identity */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="card p-5">
              <h2 className="font-bold text-navy-900 mb-1">Confirm Your Identity</h2>
              <p className="text-navy-500 text-sm mb-4">We found the following details linked to your Aadhaar. Please confirm this is you.</p>
              <div className="bg-navy-50 rounded-xl p-4 space-y-3 mb-5">
                <div>
                  <p className="text-xs text-navy-400">Name</p>
                  <p className="font-bold text-navy-900">Rajesh Kumar Sharma</p>
                </div>
                <div>
                  <p className="text-xs text-navy-400">Address</p>
                  <p className="font-semibold text-navy-900 text-sm">****, ******, Bengaluru, Karnataka</p>
                  <p className="text-xs text-navy-400 mt-0.5">Address masked for privacy</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-navy-700 mb-3">Is this you?</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setStep(1)} className="py-3 rounded-xl border border-navy-200 text-navy-700 font-semibold text-sm">
                  This isn't me
                </button>
                <button onClick={handleConfirm} disabled={loading}
                  className="py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2"
                  style={{ background: '#0891b2' }}>
                  {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                  Yes, Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4 — Done */}
        {step === 4 && (
          <div className="flex flex-col items-center justify-center flex-1 gap-5 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center">
              <CheckCircle size={40} className="text-teal-600" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-extrabold text-navy-900 mb-2">Verification Complete!</h2>
              <p className="text-navy-500 text-sm leading-relaxed max-w-xs">
                Your ground listing is now under admin review. You'll receive a WhatsApp message once it goes live with the <strong>✓ Verified Owner</strong> badge.
              </p>
            </div>
            <div className="card p-4 w-full max-w-xs text-sm space-y-2 text-navy-700">
              <div className="flex justify-between"><span>Aadhaar Status</span><span className="font-semibold text-teal-600">Verified</span></div>
              <div className="flex justify-between"><span>Ground Status</span><span className="font-semibold text-amber-600">Under Review</span></div>
              <div className="flex justify-between"><span>Est. approval</span><span className="font-semibold">Within 24 hours</span></div>
            </div>
            <button onClick={() => navigate(fromGroundOwner ? '/ground-owner' : '/')} className="btn-primary w-full max-w-xs" style={{ background: '#0891b2' }}>
              {fromGroundOwner ? 'Go to My Ground →' : 'Back to Home'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
