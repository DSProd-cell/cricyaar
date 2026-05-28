import { useNavigate } from 'react-router-dom'
import { Lock, X } from 'lucide-react'
import { ROLE_META } from '../data/mock'

/**
 * Standard role-locked prompt modal.
 * Props:
 *   currentRole   – string, the user's current role
 *   featureName   – string, human-readable feature name
 *   eligibleRoles – string[], roles that CAN access the feature
 *   onClose       – fn
 */
export default function RoleLockedModal({ currentRole, featureName, eligibleRoles = [], onClose }) {
  const navigate = useNavigate()
  const roleMeta = ROLE_META[currentRole] || { label: currentRole }
  const eligibleLabels = eligibleRoles
    .map(r => ROLE_META[r]?.label || r)
    .join(' or ')

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative bg-white rounded-2xl w-full max-w-sm shadow-modal animate-slide-up p-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
          aria-label="Close"
        >
          <X size={14} className="text-navy-600" />
        </button>

        {/* Icon */}
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <Lock size={22} className="text-navy-400" />
        </div>

        {/* Content */}
        <h3 className="font-bold text-navy-900 text-lg mb-2 pr-8">
          Not available for your role
        </h3>
        <p className="text-navy-500 text-sm leading-relaxed mb-1">
          You're signed in as{' '}
          <span
            className="font-semibold px-1.5 py-0.5 rounded-md text-xs inline-block"
            style={{ background: ROLE_META[currentRole]?.bg, color: ROLE_META[currentRole]?.color }}
          >
            {roleMeta.label}
          </span>
          .
        </p>
        <p className="text-navy-500 text-sm leading-relaxed mb-4">
          <strong className="text-navy-700">{featureName}</strong> is available for{' '}
          <span className="font-semibold">{eligibleLabels}</span> roles.
          Your current data won't be deleted — it will be hidden until you switch back.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button className="btn-secondary flex-1 text-sm py-3" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary flex-1 text-sm py-3"
            onClick={() => { onClose(); navigate('/role-select') }}
          >
            Change Role
          </button>
        </div>
      </div>
    </div>
  )
}
