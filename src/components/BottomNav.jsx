import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Home, Search, User, Activity, Inbox, Landmark, Trophy } from 'lucide-react'
import { useStore } from '../store/useStore'
import { getRoleColor } from '../lib/roleColors'

const ROLE_FOURTH = {
  player:       { label: 'Tournaments', icon: Trophy,   path: '/open-tournaments'  },
  captain:      { label: 'Tournaments', icon: Trophy,   path: '/open-tournaments'  },
  umpire:       { label: 'Matches',     icon: Activity, path: '/browse-matches'    },
  organiser:    { label: 'Inbox',       icon: Inbox,    path: '/organiser-inbox', badge: 'inbox' },
  admin:        { label: 'Matches',     icon: Activity, path: '/browse-matches'    },
  ground_owner: { label: 'My Ground',  icon: Landmark, path: '/ground-owner'      },
  fan:          { label: 'Live',        icon: Activity, path: '/browse-matches'    },
}

export default function BottomNav() {
  const navigate     = useNavigate()
  const { pathname } = useLocation()
  const { user, organiserInboxUnread } = useStore()
  const role   = user?.role || 'fan'
  const isPro  = user?.subscription === 'pro_active' || user?.subscription === 'pro_cancelled'
  const roleColor = getRoleColor(role)

  const [isDark, setIsDark] = useState(
    document.documentElement.getAttribute('data-theme') === 'dark'
  )
  useEffect(() => {
    const obs = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark')
    })
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])

  const roleItem = ROLE_FOURTH[role] || null
  const baseItems = [
    { label: 'Home',   icon: Home,   path: '/'        },
    { label: 'Search', icon: Search, path: '/grounds' },
  ]
  const tail = [{ label: 'Profile', icon: User, path: '/profile' }]
  const allItems = roleItem ? [...baseItems, roleItem, ...tail] : [...baseItems, ...tail]

  return (
    <nav className="bottom-nav">
      {allItems.map(({ label, icon: Icon, path, badge }) => {
        const active     = pathname === path || (path !== '/' && pathname.startsWith(path))
        const badgeCount = badge === 'inbox' ? organiserInboxUnread : 0

        // Crystal icon bubble styles
        const activeGradient = isDark
          ? `linear-gradient(160deg, ${roleColor.primary}30 0%, ${roleColor.primary}10 100%)`
          : `linear-gradient(160deg, ${roleColor.primary}28 0%, ${roleColor.primary}0f 100%)`
        const inactiveGradient = isDark
          ? 'linear-gradient(160deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 100%)'
          : 'linear-gradient(160deg, rgba(255,255,255,0.90) 0%, rgba(255,255,255,0.50) 100%)'

        const activeShadow = isDark
          ? `inset 0 1px 0 rgba(255,255,255,0.20), inset 0 -1px 0 rgba(0,0,0,0.25), 0 4px 12px ${roleColor.primary}35`
          : `inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -1px 0 rgba(0,0,0,0.06), 0 3px 10px ${roleColor.primary}28`
        const inactiveShadow = isDark
          ? 'inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.25)'
          : 'inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -1px 0 rgba(0,0,0,0.04)'

        const activeBorder = isDark
          ? `1px solid ${roleColor.primary}35`
          : `1px solid ${roleColor.primary}28`
        const inactiveBorder = isDark
          ? '1px solid rgba(255,255,255,0.10)'
          : '1px solid rgba(200,210,230,0.60)'

        return (
          <button
            key={path + label}
            className="bottom-nav-item"
            onClick={() => navigate(path)}
            aria-label={label}
          >
            {/* Crystal icon bubble */}
            <div
              className="relative flex items-center justify-center transition-all duration-200"
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                background: active ? activeGradient : inactiveGradient,
                boxShadow: active ? activeShadow : inactiveShadow,
                border: active ? activeBorder : inactiveBorder,
              }}
            >
              <Icon
                size={18}
                strokeWidth={active ? 2.5 : 1.8}
                style={{ color: active ? roleColor.primary : isDark ? 'rgba(255,255,255,0.45)' : '#94a3b8' }}
              />
              {badgeCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold border border-white">
                  {badgeCount}
                </span>
              )}
              {label === 'Profile' && isPro && (
                <span className="absolute -top-1.5 -right-1.5 text-[10px] leading-none select-none" aria-label="Pro">👑</span>
              )}
            </div>

            <span
              className="transition-colors duration-200"
              style={{
                fontSize: 9,
                fontWeight: active ? 700 : 500,
                color: active ? roleColor.primary : isDark ? 'rgba(255,255,255,0.38)' : '#94a3b8',
                letterSpacing: '0.03em',
              }}
            >
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
