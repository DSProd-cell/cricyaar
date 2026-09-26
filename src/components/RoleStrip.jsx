import { User, Trophy, Eye, Building2 } from 'lucide-react'

const ROLES = [
  { key: 'player',      label: 'Player',    Icon: User,      color: '#a855f7', glow: 'rgba(168,85,247,0.4)' },
  { key: 'organiser',   label: 'Organiser', Icon: Trophy,    color: '#22c55e', glow: 'rgba(34,197,94,0.4)'  },
  { key: 'umpire',      label: 'Umpire',    Icon: Eye,       color: '#f97316', glow: 'rgba(249,115,22,0.4)' },
  { key: 'ground_owner',label: 'Ground',   Icon: Building2, color: '#3b82f6', glow: 'rgba(59,130,246,0.4)' },
]

export default function RoleStrip({ activeRole, setActiveRole }) {
  return (
    <div style={{
      display: 'flex',
      gap: 5,
      background: 'rgba(255,255,255,.05)',
      border: '1px solid rgba(255,255,255,.1)',
      borderRadius: 18,
      padding: 6,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      marginBottom: 20,
    }}>
      {ROLES.map(({ key, label, Icon, color, glow }) => {
        const active = activeRole === key
        return (
          <button
            key={key}
            onClick={() => setActiveRole(key)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
              padding: '8px 2px',
              borderRadius: 13,
              background: active ? `${color}18` : 'rgba(255,255,255,.04)',
              border: active ? `1.5px solid ${color}` : '1.5px solid rgba(255,255,255,.07)',
              boxShadow: active ? `0 0 12px ${glow}` : 'none',
              transition: 'all 0.18s ease',
            }}
          >
            <Icon size={18} color={active ? color : '#6b7280'} />
            <span style={{
              fontSize: 9,
              fontWeight: 700,
              color: active ? color : '#6b7280',
              letterSpacing: '0.02em',
              lineHeight: 1,
            }}>
              {label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
