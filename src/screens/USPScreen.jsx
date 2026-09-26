import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { Check, Crown, Shield, Lock, Star } from 'lucide-react'

const FREE_FEATURES = [
  { text: 'Follow live match scores in your city' },
  { text: 'Browse grounds, teams & tournaments' },
  { text: 'Basic verified player profile' },
  { text: 'Find & challenge opponents' },
  { text: 'View player stats & scorecards' },
]

const PRO_FEATURES = [
  { text: "Don't lose what you've earned — full career stats, scorecards & match history, protected forever", highlight: true },
  { text: 'Ball-by-ball live scoring with verified records' },
  { text: 'Squad management & career analytics' },
  { text: 'Create & run tournaments with official results' },
  { text: 'Ground booking with payment & weather' },
  { text: 'Download & share verified scorecards' },
  { text: 'Umpire assignment & tournament requests' },
]

function FeatureItem({ text, highlight, gold }) {
  return (
    <li className="flex items-start gap-2.5">
      <Check
        size={13}
        className={`flex-shrink-0 mt-0.5 ${gold ? 'text-amber-400' : 'text-slate-400'}`}
        strokeWidth={2.5}
      />
      <span className={`text-sm leading-snug ${
        highlight
          ? 'text-amber-200 font-semibold'
          : gold ? 'text-amber-100' : 'text-slate-300'
      }`}>{text}</span>
    </li>
  )
}

export default function USPScreen() {
  const navigate = useNavigate()
  const { setProIntent, user } = useStore()

  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Show the landing page briefly, then move on to login/signup on its own —
  // cancelled if the user taps anything here first (unmounts before it fires).
  useEffect(() => {
    if (user) return
    const t = setTimeout(() => navigate('/login'), 3000)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const go = (pro) => {
    setProIntent(!!pro)
    navigate('/login?mode=signup')
  }

  return (
    <div className="min-h-dvh flex flex-col bg-navy-900 overflow-y-auto">

      {/* ── Hero ── */}
      <div className="flex flex-col items-center pt-10 pb-4 px-5 animate-fade-in">

        {/* Logo */}
        <div className="w-[72px] h-[72px] bg-brand-500 rounded-[22px] flex items-center justify-center mb-4 shadow-xl shadow-brand-500/40">
          <span className="text-white font-black text-2xl tracking-tight">CY</span>
        </div>

        <h1 className="text-[32px] font-extrabold text-white tracking-tight">CricYaar</h1>

        {/* THE tagline */}
        <p className="text-brand-400 mt-1.5 text-[11px] font-bold tracking-[0.18em] uppercase">
          Your Game. Your Record. For Real.
        </p>

        {/* Mission line */}
        <div className="mt-4 max-w-[280px] text-center">
          <p className="text-navy-300 text-[13px] leading-relaxed">
            India's verified cricket record system — so everything you've earned on the field is safe,
            real, and{' '}
            <span className="text-white font-semibold">impossible to fake or dispute.</span>
          </p>
        </div>

        {/* Trust pills */}
        <div className="flex items-center gap-3 mt-4 text-[11px]">
          <div className="flex items-center gap-1 bg-navy-800 border border-navy-700 rounded-full px-2.5 py-1 text-navy-400">
            <Shield size={10} className="text-brand-500" />
            50,000+ players
          </div>
          <div className="flex items-center gap-1 bg-navy-800 border border-navy-700 rounded-full px-2.5 py-1 text-navy-400">
            <Star size={10} className="text-amber-400 fill-amber-400" />
            India's #1 club app
          </div>
          <div className="flex items-center gap-1 bg-navy-800 border border-navy-700 rounded-full px-2.5 py-1 text-navy-400">
            <Lock size={10} className="text-green-400" />
            Fraud-proof records
          </div>
        </div>
      </div>

      {/* ── Plan Cards ── */}
      <div className="px-4 pb-4 flex flex-col gap-3 max-w-lg mx-auto w-full animate-slide-up">

        {/* Free Card */}
        <button
          onClick={() => go(false)}
          className="w-full text-left bg-navy-800 border border-navy-700 rounded-2xl p-5 hover:border-slate-500 transition-all active:scale-[0.99]"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center">
                <span className="text-slate-200 font-black text-base">F</span>
              </div>
              <div>
                <p className="text-white font-extrabold text-base">Free</p>
                <span className="inline-block bg-slate-700 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5">FOREVER FREE</span>
              </div>
            </div>
            <span className="text-slate-300 font-extrabold text-xl">₹0</span>
          </div>

          <ul className="space-y-2.5 mb-4">
            {FREE_FEATURES.map((f, i) => <FeatureItem key={i} text={f.text} />)}
          </ul>

          <div className="pt-3 border-t border-navy-700">
            <div className="py-2.5 rounded-xl bg-slate-700 text-center">
              <span className="text-white font-bold text-sm">Get started free →</span>
            </div>
          </div>
        </button>

        {/* Pro Card */}
        <button
          onClick={() => go(true)}
          className="w-full text-left rounded-2xl p-5 relative overflow-hidden hover:brightness-105 active:scale-[0.99] transition-all"
          style={{
            background: 'linear-gradient(145deg, #1c1209 0%, #2d1a00 60%, #1c1209 100%)',
            border: '1.5px solid #d97706',
          }}
        >
          {/* Ambient glow */}
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, #f59e0b 0%, transparent 65%)' }} />

          <div className="flex items-center justify-between mb-4 relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#fef3c7' }}>
                <Crown size={18} className="text-amber-500 fill-amber-400" />
              </div>
              <div>
                <p className="text-amber-100 font-extrabold text-base">Pro</p>
                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5"
                  style={{ background: '#f59e0b', color: '#1c1209' }}>MOST POPULAR</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-amber-400 font-extrabold text-2xl">₹99</span>
              <span className="text-amber-600 text-xs">/mo</span>
            </div>
          </div>

          {/* Record protection hero callout */}
          <div className="relative mb-3 rounded-xl px-3 py-2.5"
            style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}>
            <div className="flex items-start gap-2">
              <Lock size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-amber-200 text-[12px] leading-snug font-semibold">
                Don't lose what you've earned — your entire career on record, safe and verified forever.
              </p>
            </div>
          </div>

          <ul className="space-y-2.5 mb-4 relative">
            {PRO_FEATURES.map((f, i) => (
              <FeatureItem key={i} text={f.text} highlight={f.highlight} gold />
            ))}
          </ul>

          <div className="pt-3 border-t border-amber-900 relative">
            <p className="text-amber-700 text-[11px] text-center mb-2">Cancel anytime · Razorpay & UPI</p>
            <div className="py-3 rounded-xl text-center"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
              <span className="text-white font-bold text-sm">Upgrade to Pro →</span>
            </div>
          </div>
        </button>

        {/* Sign in */}
        <button
          onClick={() => { setProIntent(false); navigate('/login?mode=login') }}
          className="py-4 text-center text-navy-400 text-sm hover:text-brand-400 transition-colors"
        >
          Already have an account?{' '}
          <span className="text-brand-400 font-semibold underline underline-offset-2">Sign in →</span>
        </button>
      </div>
    </div>
  )
}
