import { useState } from 'react'
import { useStore } from '../store/useStore'
import TopBar from '../components/TopBar'
import { Crown, Check, AlertCircle } from 'lucide-react'

const PRO_FEATURES = [
  'Create and join tournaments',
  'Ball-by-ball live scoring',
  'Full squad management',
  'Career batting, bowling & fielding stats',
  'Umpire & tournament participation requests',
  'Download & share scorecards',
  'List your ground',
]

export default function CricYaarPro() {
  const { user, setSubscription, addToast } = useStore()
  const [loading, setLoading] = useState(false)
  const [showCancel, setShowCancel] = useState(false)

  const isPro = user?.subscription === 'pro_active' || user?.subscription === 'pro_cancelled'
  const isCancelled = user?.subscription === 'pro_cancelled'

  const handleSubscribe = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setSubscription('pro_active')
    addToast('Welcome to CricYaar Pro! 🏏', 'success')
    setLoading(false)
  }

  const handleCancel = () => {
    setSubscription('pro_cancelled')
    addToast('Subscription cancelled. Pro access continues until renewal.', 'info')
    setShowCancel(false)
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <TopBar title="CricYaar Pro" showBack />
      <main className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full space-y-4">

        {/* Hero card */}
        <div className="rounded-3xl overflow-hidden animate-fade-in" style={{ background:'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)' }}>
          <div className="px-6 py-8 text-center">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl"
              style={{ background:'linear-gradient(135deg, #f59e0b, #d97706)' }}>
              <Crown size={36} className="text-white fill-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-amber-900 mb-1">Play the full game</h1>
            <p className="text-amber-700 text-sm">Everything you need to organise, play, and score cricket.</p>
          </div>
        </div>

        {/* Features */}
        <div className="card animate-slide-up">
          <h3 className="font-bold text-navy-900 mb-4">What's included with Pro</h3>
          <div className="space-y-3">
            {PRO_FEATURES.map(f => (
              <div key={f} className="flex items-start gap-3">
                <div className="w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={11} className="text-white" strokeWidth={3} />
                </div>
                <span className="text-navy-700 text-sm leading-snug">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status / CTA */}
        {isPro ? (
          <div className="card animate-slide-up">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background:'#fef3c7' }}>
                <Crown size={18} className="text-amber-500 fill-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-navy-900">CricYaar Pro</span>
                  <span className="badge text-xs px-2 py-0.5 rounded-md"
                    style={{ background: isCancelled ? '#fee2e2' : '#fef3c7', color: isCancelled ? '#dc2626' : '#d97706' }}>
                    {isCancelled ? 'Cancelling' : 'Active'}
                  </span>
                </div>
                <p className="text-navy-400 text-xs mt-0.5">
                  {isCancelled
                    ? 'Access until April 20, 2024 · Not renewing'
                    : 'Renews on April 20, 2024 · ₹99/month'}
                </p>
              </div>
            </div>
            {!isCancelled && (
              <button
                onClick={() => setShowCancel(true)}
                className="text-red-500 text-sm font-medium hover:text-red-700 transition-colors mt-1"
              >
                Cancel subscription
              </button>
            )}
            {isCancelled && (
              <button
                onClick={handleSubscribe}
                className="btn-primary w-full mt-2"
                style={{ background:'linear-gradient(135deg, #f59e0b, #d97706)' }}
                disabled={loading}
              >
                {loading ? 'Reactivating…' : 'Reactivate Pro'}
              </button>
            )}
          </div>
        ) : (
          <div className="card animate-slide-up">
            <div className="text-center mb-5">
              <span className="text-4xl font-extrabold text-navy-900 tabular-nums">₹99</span>
              <span className="text-navy-400 text-sm"> / month</span>
              <p className="text-navy-400 text-xs mt-1">Cancel anytime · No lock-in</p>
            </div>
            <button
              className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2 transition-opacity hover:opacity-90 active:opacity-80"
              style={{ background: loading ? '#94a3b8' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
              onClick={handleSubscribe}
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Activating Pro…
                </span>
              ) : (
                <>
                  <Crown size={17} className="fill-white text-white" />
                  Subscribe to Pro — ₹99/month
                </>
              )}
            </button>
            <p className="text-center text-xs text-navy-400 mt-3">
              Demo mode — instant activation, no payment form
            </p>
          </div>
        )}
      </main>

      {/* Cancel confirm modal */}
      {showCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowCancel(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-modal animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle size={22} className="text-red-500" />
            </div>
            <h3 className="font-bold text-navy-900 text-lg text-center mb-2">Cancel subscription?</h3>
            <p className="text-navy-500 text-sm text-center mb-1">
              You'll lose Pro access at the end of your current billing period (April 20, 2024).
            </p>
            <p className="text-navy-400 text-xs text-center mb-5">No refunds for partial months.</p>
            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setShowCancel(false)}>Keep Pro</button>
              <button className="btn-danger flex-1" onClick={handleCancel}>Yes, cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
