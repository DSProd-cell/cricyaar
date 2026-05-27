import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { ROLE_META } from '../data/mock'
import {
  AlertTriangle, Zap, CheckCircle, RefreshCw,
  Eye, Activity, BarChart2, MapPin, Tv
} from 'lucide-react'

const ROLE_ICONS = {
  player:       Activity,
  organiser:    BarChart2,
  umpire:       Eye,
  ground_owner: MapPin,
  fan:          Tv,
}

const ROLE_READ_ONLY_PERKS = {
  player:       ['View match schedules & results', 'Browse teams & tournaments', 'See live scores'],
  organiser:    ['Browse existing matches & tournaments', 'View ground listings', 'See live scores'],
  umpire:       ['Browse open match requests', 'View umpire assignments', 'See live scores'],
  ground_owner: ['View other ground listings', 'Browse match schedules', 'See live scores'],
}

export default function RoleWelcomeModal() {
  const navigate = useNavigate()
  const { user, setShowRoleModal, setShowProSheet } = useStore()

  if (!user) return null

  const role     = user?.role || 'fan'
  const isFan    = role === 'fan'
  const isPro    = user?.subscription === 'pro_active'
  const meta     = ROLE_META[role] || ROLE_META.fan
  const RoleIcon = ROLE_ICONS[role] || Tv
  const perks    = ROLE_READ_ONLY_PERKS[role] || []

  const handleClose = () => setShowRoleModal(false)

  const handleChangeRole = () => {
    setShowRoleModal(false)
    navigate('/role-select')
  }

  const handleUpgradePro = () => {
    setShowRoleModal(false)
    setShowProSheet(true)
  }

  // ── FAN MODAL ──────────────────────────────────────────────────────────────
  if (isFan) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

        {/* Card */}
        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up">
          {/* Top colour band */}
          <div className="h-1.5 w-full bg-gradient-to-r from-slate-300 to-slate-400" />

          <div className="px-6 pt-6 pb-7 flex flex-col items-center text-center">
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: meta.bg }}>
              <RoleIcon size={28} style={{ color: meta.color }} />
            </div>

            {/* Heading */}
            <h2 className="font-extrabold text-navy-900 text-xl mb-2">
              You're in as a Fan 👋
            </h2>

            {/* Warning box */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-4 w-full text-left">
              <div className="flex items-start gap-2.5">
                <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-amber-800 text-sm leading-relaxed">
                  In this role, you <strong>won't be able to access all the facilities</strong> of CricYaar — scoring, squad management, tournaments, ground booking and more are unavailable.
                </p>
              </div>
            </div>

            <p className="text-navy-500 text-sm mb-6">
              Do you want to change your role to unlock the full experience?
            </p>

            {/* Buttons */}
            <button
              onClick={handleChangeRole}
              className="w-full py-3.5 rounded-2xl font-bold text-white text-sm mb-3 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}
            >
              <RefreshCw size={15} />
              Yes, Change My Role
            </button>
            <button
              onClick={handleClose}
              className="w-full py-3 text-navy-400 text-sm font-medium hover:text-navy-600 transition-colors"
            >
              Continue as Fan
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── NON-FAN MODAL ──────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up">
        {/* Top colour band matching role colour */}
        <div className="h-1.5 w-full" style={{ background: `linear-gradient(to right, ${meta.color}, ${meta.color}99)` }} />

        <div className="px-6 pt-6 pb-7 flex flex-col items-center text-center">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: meta.bg }}>
            <RoleIcon size={28} style={{ color: meta.color }} />
          </div>

          {/* Heading */}
          <h2 className="font-extrabold text-navy-900 text-xl mb-1">
            {isPro ? `Welcome, ${meta.label}! 🎉` : `You're a ${meta.label}`}
          </h2>

          {isPro ? (
            /* Pro user — full access */
            <div className="w-full mb-5">
              <p className="text-navy-500 text-sm mb-3">You have <strong>full Pro access</strong>. Edit, upload, and manage everything.</p>
              <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 text-left space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-600 flex-shrink-0" />
                  <span className="text-green-800 text-xs font-medium">Full edit & upload access</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-600 flex-shrink-0" />
                  <span className="text-green-800 text-xs font-medium">All {meta.label} features unlocked</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-600 flex-shrink-0" />
                  <span className="text-green-800 text-xs font-medium">Live scoring, stats & more</span>
                </div>
              </div>
            </div>
          ) : (
            /* Free user — read-only */
            <div className="w-full mb-5">
              <p className="text-navy-500 text-sm mb-3">
                You can <strong>see and read everything</strong> on CricYaar.
                To edit, upload or manage content, you'll need <strong>Pro access</strong>.
              </p>

              {/* What you can see */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-left space-y-2 mb-3">
                <p className="text-navy-500 text-[10px] font-bold uppercase tracking-wider mb-1">You can view</p>
                {perks.map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Eye size={12} className="text-slate-400 flex-shrink-0" />
                    <span className="text-navy-600 text-xs">{p}</span>
                  </div>
                ))}
              </div>

              {/* What needs Pro */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-left">
                <div className="flex items-start gap-2">
                  <Zap size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-800 text-xs leading-relaxed">
                    <strong>Pro required</strong> to edit, upload, or manage content as a {meta.label}.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          {isPro ? (
            <button
              onClick={handleClose}
              className="w-full py-3.5 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={{ background: `linear-gradient(135deg, ${meta.color}, ${meta.color}cc)` }}
            >
              <CheckCircle size={15} />
              Let's Go!
            </button>
          ) : (
            <>
              <button
                onClick={handleUpgradePro}
                className="w-full py-3.5 rounded-2xl font-bold text-white text-sm mb-3 flex flex-col items-center gap-0.5 transition-all active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
              >
                <span className="flex items-center gap-2 font-extrabold">
                  <Zap size={15} />
                  Upgrade to Pro — Unlock Everything
                </span>
                <span className="text-amber-100 text-[11px] font-medium opacity-90">₹99/month · Cancel anytime</span>
              </button>
              <button
                onClick={handleClose}
                className="w-full py-3 text-navy-400 text-sm font-medium hover:text-navy-600 transition-colors"
              >
                Continue — Browse Freely
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
