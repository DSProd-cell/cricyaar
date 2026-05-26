import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { ROLE_META } from '../data/mock'
import { ArrowLeft, ArrowLeftRight, AlertTriangle } from 'lucide-react'

const HIDDEN_DATA = {
  player:    'batting stats, bowling stats, fielding stats, and match records',
  organiser: 'created matches, created tournaments, and scoring history',
  umpire:    'assignment history and umpire ratings',
  fan:       null, // no role-specific data
  admin:     null, // special case
}

export default function RoleWarning() {
  const navigate = useNavigate()
  const { user, setPendingPhone } = useStore()
  const role = user?.role || 'fan'
  const meta = ROLE_META[role] || { label: role, color:'#64748b', bg:'#f1f5f9' }
  const hiddenItems = HIDDEN_DATA[role]

  const handleContinue = () => {
    // Set pendingPhone so OTP screen has the phone to display
    setPendingPhone(user?.phone || '+919876543210')
    navigate('/otp')
  }

  // Admin special case
  if (role === 'admin') {
    return (
      <div className="min-h-dvh bg-gradient-to-br from-brand-50 via-white to-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm animate-slide-up">
          <button onClick={() => navigate('/settings')} className="flex items-center gap-2 text-navy-500 hover:text-navy-900 mb-6 transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back to Settings</span>
          </button>
          <div className="bg-white rounded-2xl shadow-card p-6 text-center">
            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} className="text-purple-600" />
            </div>
            <h2 className="font-bold text-navy-900 text-xl mb-2">Admin role is protected</h2>
            <p className="text-navy-500 text-sm leading-relaxed mb-6">
              Admin role changes must be handled by the platform team. Please contact support if you need to change your role.
            </p>
            <button className="btn-secondary w-full" onClick={() => navigate('/settings')}>
              Back to Settings
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-brand-50 via-white to-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm animate-slide-up">
        <button onClick={() => navigate('/settings')} className="flex items-center gap-2 text-navy-500 hover:text-navy-900 mb-6 transition-colors">
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back to Settings</span>
        </button>

        <div className="bg-white rounded-2xl shadow-card p-6">
          {/* Icon */}
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <ArrowLeftRight size={28} className="text-amber-500" />
          </div>

          {/* Headline */}
          <h2 className="font-bold text-navy-900 text-xl text-center mb-2">
            Switching your role hides some data
          </h2>

          {/* Current role badge */}
          <div className="flex justify-center mb-4">
            <span
              className="px-3 py-1 rounded-full text-sm font-semibold"
              style={{ background: meta.bg, color: meta.color }}
            >
              Currently: {meta.label}
            </span>
          </div>

          {/* What gets hidden */}
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-5">
            {hiddenItems ? (
              <>
                <p className="text-amber-800 text-sm font-semibold mb-1">What will be hidden:</p>
                <p className="text-amber-700 text-sm leading-relaxed">
                  Your {hiddenItems} will be hidden while you use a different role.
                </p>
              </>
            ) : (
              <p className="text-amber-700 text-sm">
                You have no role-specific data — nothing will be hidden when you switch.
              </p>
            )}
            <p className="text-amber-600 text-xs mt-2 font-medium">
              ✓ Your data is never deleted. It reappears when you switch back.
            </p>
          </div>

          <p className="text-navy-500 text-sm text-center mb-5">
            We'll send an OTP to your registered number to confirm the role change.
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button className="btn-secondary flex-1" onClick={() => navigate('/settings')}>
              Cancel
            </button>
            <button className="btn-primary flex-1" onClick={handleContinue}>
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
