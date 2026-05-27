import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { Crown, Check, Shield, Zap, Lock } from 'lucide-react'

const PRO_HIGHLIGHTS = [
  'Ball-by-ball live scorecard (read-only)',
  'Squad management & career stats',
  'Create & join tournaments',
  'Ground booking with payment',
  'AI Ground Assistant',
  'Download & share scorecards',
  'CricHeroes stats import',
  'Referral rewards',
]

const UPI_APPS = ['GPay', 'PhonePe', 'Paytm', 'BHIM']

export default function ProPayment() {
  const navigate   = useNavigate()
  const { setSubscription, setProIntent, addToast } = useStore()
  const [loading, setLoading] = useState(false)
  const [paid, setPaid]       = useState(false)

  const handlePay = async () => {
    setLoading(true)
    // Simulate Razorpay processing
    await new Promise(r => setTimeout(r, 2000))
    setLoading(false)
    setPaid(true)
    setSubscription('pro_active')
    setProIntent(false)
    addToast('🎉 Welcome to CricYaar Pro!', 'success')
    // Brief success screen, then role select
    setTimeout(() => navigate('/role-select'), 1200)
  }

  // ── Payment success screen ──────────────────────────────────────────────────
  if (paid) {
    return (
      <div className="min-h-dvh bg-navy-900 flex flex-col items-center justify-center px-6 text-center">
        <div
          className="w-28 h-28 rounded-full flex items-center justify-center mb-6 border-2"
          style={{ background: '#fef3c7', borderColor: '#d97706' }}
        >
          <Check size={48} className="text-amber-500" strokeWidth={2.5} />
        </div>
        <h2 className="text-white font-extrabold text-2xl mb-2">You're Pro!</h2>
        <p className="text-amber-400 text-sm font-medium">Setting up your account…</p>
        <div className="mt-4 w-8 h-1 bg-amber-500 rounded-full animate-pulse" />
      </div>
    )
  }

  // ── Payment screen ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-dvh bg-navy-900 flex flex-col overflow-y-auto">

      {/* Top bar */}
      <div className="flex items-center justify-center h-14 px-4 flex-shrink-0">
        <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center shadow-sm">
          <span className="text-white font-black text-sm">CY</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center px-5 pb-8">

        {/* Crown + heading */}
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 mt-2"
          style={{ background: '#fef3c7', border: '1.5px solid #d97706' }}
        >
          <Crown size={34} className="text-amber-500 fill-amber-400" />
        </div>
        <h1 className="text-white font-extrabold text-2xl mb-1 text-center">One last step</h1>
        <p className="text-navy-400 text-sm text-center mb-6 max-w-xs">
          Start your CricYaar Pro subscription and unlock the full experience.
        </p>

        {/* Plan card */}
        <div
          className="w-full max-w-sm rounded-2xl p-5 mb-4 relative overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #1c1209 0%, #2d1a00 50%, #1c1209 100%)',
            border: '1.5px solid #d97706',
          }}
        >
          {/* Ambient glow */}
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, #f59e0b 0%, transparent 70%)' }}
          />

          {/* Price row */}
          <div className="flex items-center justify-between mb-4 relative">
            <div>
              <p className="text-amber-100 font-extrabold text-base">Pro Plan</p>
              <p className="text-amber-700 text-xs mt-0.5">Billed monthly · Cancel anytime</p>
            </div>
            <div className="text-right">
              <span className="text-amber-400 font-extrabold text-3xl tabular-nums">₹99</span>
              <span className="text-amber-600 text-sm">/mo</span>
            </div>
          </div>

          {/* Features */}
          <div className="border-t border-amber-900/60 pt-4 space-y-2 relative">
            {PRO_HIGHLIGHTS.map((f, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <Check size={12} className="text-amber-400 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <span className="text-amber-200 text-xs">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* UPI logos strip */}
        <div className="flex items-center gap-2 mb-5">
          {UPI_APPS.map(app => (
            <div key={app} className="px-2.5 py-1 bg-navy-800 border border-navy-700 rounded-lg">
              <span className="text-navy-400 text-[10px] font-semibold">{app}</span>
            </div>
          ))}
          <div className="px-2.5 py-1 bg-navy-800 border border-navy-700 rounded-lg">
            <span className="text-navy-400 text-[10px] font-semibold">Cards</span>
          </div>
        </div>

        {/* Pay CTA */}
        <div className="w-full max-w-sm space-y-3">
          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-80"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff' }}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Processing payment…
              </>
            ) : (
              <>
                <Zap size={18} />
                Pay ₹99 · Start Pro
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-navy-500 text-xs">
            <Shield size={11} />
            <span>Secured by Razorpay · 256-bit encryption</span>
          </div>

          <button
            onClick={() => navigate('/usp')}
            className="w-full py-3 text-navy-500 text-sm hover:text-navy-400 transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>

      {/* Demo note */}
      <p className="text-center text-xs text-navy-700 pb-5">
        Demo mode — no real payment is charged
      </p>
    </div>
  )
}
