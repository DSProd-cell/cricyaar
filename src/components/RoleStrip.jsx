import { User, Trophy, Eye, Building2, Lock } from 'lucide-react'
import { useStore } from '../store/useStore'

// Order: Player → Umpire → Organiser → Ground Owner
const ALL_ROLES = [
  { key: 'player',       label: 'Player',    Icon: User,      color: '#a855f7', glow: 'rgba(168,85,247,0.4)' },
  { key: 'umpire',       label: 'Umpire',    Icon: Eye,       color: '#f97316', glow: 'rgba(249,115,22,0.4)' },
  { key: 'organiser',    label: 'Organiser', Icon: Trophy,    color: '#22c55e', glow: 'rgba(34,197,94,0.4)'  },
  { key: 'ground_owner', label: 'Ground',    Icon: Building2, color: '#3b82f6', glow: 'rgba(59,130,246,0.4)' },
]

function isPro(user) {
  return user?.subscription === 'pro_active' ||
    (user?.subscription === 'pro_cancelled' && user?.pro_renewal_date && new Date(user.pro_renewal_date) > new Date())
}

// KYC valid = approved AND approved within the last 3 months
export function isKycValid(user) {
  if (user?.kycStatus !== 'approved') return false
  if (!user?.kycApprovedAt) return true // approved but no timestamp → treat as valid
  const approvedAt = new Date(user.kycApprovedAt)
  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
  return approvedAt > threeMonthsAgo
}

// Umpire = Pro only. Organiser & Ground Owner = Pro + valid KYC (within 3 months).
function isRoleUnlocked(roleKey, user) {
  if (roleKey === 'player') return true
  const proOk = isPro(user)
  if (roleKey === 'umpire') return proOk
  return proOk && isKycValid(user)
}

export default function RoleStrip({ activeRole, setActiveRole, onLockedTap }) {
  const { user } = useStore()

  return (
    <div style={{
      display: 'flex', gap: 5,
      background: 'rgba(255,255,255,.05)',
      border: '1px solid rgba(255,255,255,.1)',
      borderRadius: 18, padding: 6,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      marginBottom: 20,
    }}>
      {ALL_ROLES.map(({ key, label, Icon, color, glow }) => {
        const active   = activeRole === key
        const unlocked = isRoleUnlocked(key, user)

        const handleTap = () => {
          if (!unlocked) {
            onLockedTap?.(key)
          } else {
            setActiveRole(key)
          }
        }

        return (
          <button
            key={key}
            onClick={handleTap}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 4, cursor: 'pointer', padding: '8px 2px', borderRadius: 13,
              background: active ? `${color}18` : 'rgba(255,255,255,.04)',
              border: active ? `1.5px solid ${color}` : '1.5px solid rgba(255,255,255,.07)',
              boxShadow: active ? `0 0 12px ${glow}` : 'none',
              transition: 'all 0.18s ease',
              position: 'relative',
              opacity: (!unlocked && !active) ? 0.6 : 1,
            }}
          >
            <Icon size={18} color={active ? color : '#6b7280'} />
            <span style={{
              fontSize: 9, fontWeight: 700,
              color: active ? color : '#6b7280',
              letterSpacing: '0.02em', lineHeight: 1,
            }}>{label}</span>

            {/* Lock badge on non-player locked roles */}
            {!unlocked && (
              <div style={{
                position: 'absolute', top: 3, right: 3,
                width: 12, height: 12, borderRadius: '50%',
                background: 'rgba(239,68,68,0.9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Lock size={7} color="#fff" strokeWidth={3} />
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
