import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { Crown, Check, X, Zap, CheckCircle } from 'lucide-react'

const PERKS = [
  'Create & join tournaments',
  'Ball-by-ball live scoring',
  'Career batting, bowling & fielding stats',
  'AI Ground Assistant',
  'Full squad management',
  'CricHeroes stats import',
]

export default function ProSignupSheet() {
  const navigate = useNavigate()
  const { setShowProSheet, setProIntent, addToast, user } = useStore()
  const isPro = user?.subscription === 'pro_active' || user?.subscription === 'pro_cancelled'

  const handleSubscribe = () => {
    setShowProSheet(false)
    setProIntent(true)
    navigate('/pro-payment')
  }

  const handleDismiss = () => {
    setShowProSheet(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={handleDismiss} />

      {/* Sheet */}
      <div className="relative bg-white rounded-t-3xl shadow-modal animate-slide-up max-h-[85dvh] overflow-y-auto">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* Close */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
          aria-label="Close"
        >
          <X size={14} className="text-navy-500" />
        </button>

        <div className="px-5 pt-2 pb-8">
          {isPro ? (
            /* Already Pro — just confirm */
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3" style={{ background:'#F5F3FF' }}>
                <CheckCircle size={28} className="text-brand-500" />
              </div>
              <h2 className="font-extrabold text-navy-900 text-xl mb-1">You're already Pro!</h2>
              <p className="text-navy-500 text-sm mb-5">All features are unlocked. Enjoy the full CricYaar experience.</p>
              <button
                onClick={handleDismiss}
                className="w-full py-4 rounded-2xl font-extrabold text-white active:scale-[0.98] transition-all"
                style={{ background:'linear-gradient(135deg,#7C3AED,#5B21B6)' }}
              >
                Continue →
              </button>
            </div>
          ) : (
            <>
              {/* Crown + headline */}
              <div className="flex flex-col items-center text-center mb-5">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3" style={{ background:'#F5F3FF' }}>
                  <Crown size={28} style={{ color:'#7C3AED' }} />
                </div>
                <h2 className="font-extrabold text-navy-900 text-xl">Want access to everything?</h2>
                <p className="text-navy-500 text-sm mt-1">Upgrade to Pro and unlock the full CricYaar experience.</p>
              </div>

              {/* Perks */}
              <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 mb-5">
                <ul className="space-y-2.5">
                  {PERKS.map((p, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background:'#7C3AED' }}>
                        <Check size={11} className="text-white" strokeWidth={3} />
                      </div>
                      <span className="text-navy-800 text-sm font-medium">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTAs */}
              <button
                onClick={handleSubscribe}
                className="w-full py-4 rounded-2xl font-bold text-white flex flex-col items-center gap-0.5 active:scale-[0.98] transition-all"
                style={{ background:'linear-gradient(135deg,#7C3AED,#5B21B6)' }}
              >
                <span className="flex items-center gap-2 text-base font-extrabold">
                  <Zap size={17} />
                  Start Pro — Just ₹1/month
                </span>
                <span className="text-purple-200 text-xs font-medium opacity-90">UPI / Cards · Cancel anytime</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
