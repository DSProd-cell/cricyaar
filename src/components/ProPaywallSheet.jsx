import { X, Crown, Check } from 'lucide-react'
import { useStore } from '../store/useStore'
import { useNavigate } from 'react-router-dom'

const PRO_BULLETS = [
  'Create and join tournaments',
  'Ball-by-ball live scoring',
  'Full squad management & career stats',
  'Umpire & tournament participation requests',
]

export default function ProPaywallSheet({ featureName, featureDesc, onClose }) {
  const { setSubscription, addToast } = useStore()
  const navigate = useNavigate()

  const handleSubscribe = () => {
    setSubscription('pro_active')
    addToast('Welcome to CricYaar Pro! 🏏', 'success')
    onClose()
  }

  const handleManage = () => {
    onClose()
    navigate('/pro')
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div
        className="relative bg-white rounded-t-3xl px-5 pt-4 pb-10 w-full max-w-lg mx-auto animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
          aria-label="Close"
        >
          <X size={15} className="text-navy-600" />
        </button>

        {/* Gold badge */}
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5">
            <Crown size={16} className="text-amber-500 fill-amber-400" />
            <span className="font-extrabold text-amber-700 text-sm tracking-wide">CricYaar Pro</span>
          </div>
        </div>

        {/* Headline */}
        <h3 className="font-extrabold text-navy-900 text-xl text-center mb-1">
          This is a CricYaar Pro feature
        </h3>
        <p className="text-navy-500 text-sm text-center mb-4 px-2">
          {featureDesc || `${featureName || 'This feature'} is available with a Pro subscription.`}
        </p>

        {/* Feature bullets */}
        <div className="bg-slate-50 rounded-2xl px-4 py-3 mb-5 space-y-2.5">
          {PRO_BULLETS.map(f => (
            <div key={f} className="flex items-center gap-2.5">
              <div className="w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Check size={11} className="text-white" strokeWidth={3} />
              </div>
              <span className="text-navy-700 text-sm font-medium">{f}</span>
            </div>
          ))}
        </div>

        {/* Price */}
        <p className="text-center mb-4">
          <span className="text-3xl font-extrabold text-navy-900">₹99</span>
          <span className="text-navy-400 text-sm"> / month — cancel anytime</span>
        </p>

        {/* CTA */}
        <button
          className="w-full py-3.5 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2 mb-2.5 transition-opacity hover:opacity-90 active:opacity-80"
          style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
          onClick={handleSubscribe}
        >
          <Crown size={17} className="fill-white text-white" />
          Subscribe to Pro — ₹99/month
        </button>

        <button
          onClick={onClose}
          className="w-full text-center text-navy-400 text-sm hover:text-navy-600 transition-colors py-2"
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}
