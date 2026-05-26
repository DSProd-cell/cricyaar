import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { Check, Crown, Zap, Shield } from 'lucide-react'

const FREE_FEATURES = [
  'Schedule friendly matches',
  'View live scores in your city',
  'Browse & search grounds',
  'Browse open teams & tournaments',
  'Follow any live match',
  'Find opponents (browse only)',
  'Basic player profile',
]

const PRO_FEATURES = [
  'Everything in Free',
  'Ground booking with payment',
  'Ball-by-ball live scoring',
  'Squad management & career stats',
  'Create & join tournaments',
  'AI Ground Assistant',
  'Umpire & tournament requests',
  'Ground owner details + weather',
  'Download & share scorecards',
  'CricHeroes import',
  'Referral rewards',
]

export default function USPScreen() {
  const navigate = useNavigate()
  const { setProIntent, user } = useStore()

  // If already logged in, skip straight to home
  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFree = () => {
    setProIntent(false)
    navigate('/welcome')
  }

  const handlePro = () => {
    setProIntent(true)
    navigate('/welcome')
  }

  const handleSignIn = () => {
    setProIntent(false)
    navigate('/welcome?mode=signin')
  }

  return (
    <div className="min-h-dvh flex flex-col bg-navy-900 overflow-y-auto">

      {/* ── Hero ── */}
      <div className="flex flex-col items-center pt-10 pb-5 px-5 animate-fade-in">
        <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-brand-500/40">
          <span className="text-white font-black text-2xl tracking-tight">CY</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">CricYaar</h1>
        <p className="text-brand-400 mt-1 text-sm font-semibold tracking-wide uppercase">Cricket. Organised.</p>
        <p className="text-navy-300 mt-3 text-sm text-center max-w-xs leading-relaxed">
          Manage matches, teams, grounds and stats — all in one place for amateur cricket in India.
        </p>
      </div>

      {/* ── Trust strip ── */}
      <div className="flex items-center justify-center gap-5 pb-5 text-navy-400 text-xs">
        <div className="flex items-center gap-1.5"><Shield size={12} className="text-brand-500" />Trusted by 50,000+ players</div>
        <div className="w-px h-4 bg-navy-700" />
        <div className="flex items-center gap-1.5"><Zap size={12} className="text-amber-400" />India's #1 club cricket app</div>
      </div>

      {/* ── Plan cards ── */}
      <div className="flex-1 px-4 pb-6 flex flex-col gap-3 max-w-lg mx-auto w-full animate-slide-up">

        {/* Free Card */}
        <button
          onClick={handleFree}
          className="w-full text-left bg-navy-800 border border-navy-700 rounded-2xl p-5 hover:border-slate-500 hover:bg-navy-750 transition-all active:scale-[0.99]"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center">
                <span className="text-slate-200 font-black text-base">F</span>
              </div>
              <div>
                <p className="text-white font-extrabold text-base">Free Plan</p>
                <span className="inline-block bg-slate-600 text-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5">FOREVER FREE</span>
              </div>
            </div>
            <span className="text-slate-300 font-extrabold text-xl">₹0</span>
          </div>

          <ul className="space-y-2 mb-4">
            {FREE_FEATURES.map((f, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <Check size={13} className="text-slate-400 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <span className="text-slate-300 text-sm">{f}</span>
              </li>
            ))}
          </ul>

          <div className="pt-3 border-t border-navy-700 mt-2">
            <div className="py-2.5 rounded-xl bg-slate-700 text-center">
              <span className="text-white font-bold text-sm">Get started for free →</span>
            </div>
          </div>
        </button>

        {/* Pro Card */}
        <button
          onClick={handlePro}
          className="w-full text-left rounded-2xl p-5 relative overflow-hidden hover:brightness-105 active:scale-[0.99] transition-all"
          style={{ background: 'linear-gradient(145deg, #1c1209 0%, #2d1a00 50%, #1c1209 100%)', border: '1.5px solid #d97706' }}
        >
          {/* Ambient glow */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, #f59e0b 0%, transparent 70%)' }} />

          <div className="flex items-center justify-between mb-4 relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#fef3c7' }}>
                <Crown size={18} className="text-amber-500 fill-amber-400" />
              </div>
              <div>
                <p className="text-amber-100 font-extrabold text-base">Pro Plan</p>
                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5" style={{ background: '#f59e0b', color: '#1c1209' }}>MOST POPULAR</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-amber-400 font-extrabold text-2xl">₹99</span>
              <span className="text-amber-600 text-xs">/mo</span>
            </div>
          </div>

          <ul className="space-y-2 mb-4 relative">
            {PRO_FEATURES.map((f, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <Check size={13} className="text-amber-400 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <span className="text-amber-100 text-sm">{i === 0 ? <span className="font-semibold">{f}</span> : f}</span>
              </li>
            ))}
          </ul>

          <div className="pt-3 border-t border-amber-900 mt-2 relative">
            <p className="text-amber-700 text-xs text-center mb-2">Cancel anytime · Razorpay & UPI</p>
            <div className="py-2.5 rounded-xl text-center" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
              <span className="text-white font-bold text-sm">Upgrade to Pro →</span>
            </div>
          </div>
        </button>

        {/* Sign in link */}
        <button
          onClick={handleSignIn}
          className="py-4 text-center text-navy-400 text-sm hover:text-brand-400 transition-colors"
        >
          Already have an account?{' '}
          <span className="text-brand-400 font-semibold underline underline-offset-2">Sign in →</span>
        </button>
      </div>
    </div>
  )
}
