import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Search, User, Bell, Settings, Trophy, LogOut, Activity, Eye, Star, Inbox, Crown, LayoutGrid, Swords, Gift, BarChart3, Shield } from 'lucide-react'
import { useStore } from '../store/useStore'
import { initials } from '../data/mock'
import { getRoleColor } from '../lib/roleColors'

// Base nav items for every logged-in role
const BASE_NAV = [
  { label:'Home',          icon:Home,        path:'/'              },
  { label:'My Cricket',    icon:Activity,    path:'/my-cricket'    },
  { label:'Find a Ground', icon:Search,      path:'/grounds'       },
  { label:'Teams',         icon:Trophy,      path:'/teams'         },
  { label:'Notifications', icon:Bell,        path:'/notifications', badge:'notif' },
  { label:'Settings',      icon:Settings,    path:'/settings'      },
]

// Extra items injected per role
const ROLE_EXTRA = {
  player:    [
    { label:'Join Tournaments',  icon:Trophy,    path:'/open-tournaments',   pro:true },
    { label:'Find Opponent',     icon:Swords,    path:'/opponent-finder',    pro:true },
    { label:'Invite & Earn',     icon:Gift,      path:'/invite' },
  ],
  captain:   [
    { label:'Find Opponent',     icon:Swords,    path:'/opponent-finder',    pro:true },
    { label:'Book a Ground',     icon:Search,    path:'/ground-booking',     pro:true },
    { label:'Invite & Earn',     icon:Gift,      path:'/invite' },
  ],
  umpire:    [
    { label:'Browse Matches',    icon:Eye,       path:'/browse-matches',     pro:true },
    { label:'My Profile',        icon:Star,      path:'/umpire-profile' },
    { label:'Invite & Earn',     icon:Gift,      path:'/invite' },
  ],
  organiser: [
    { label:'Inbox',             icon:Inbox,     path:'/organiser-inbox',    badge:'inbox' },
    { label:'Find Opponent',     icon:Swords,    path:'/opponent-finder',    pro:true },
    { label:'Invite & Earn',     icon:Gift,      path:'/invite' },
  ],
  admin:     [
    { label:'Platform Stats',    icon:LayoutGrid,path:'/profile' },
    { label:'Earnings',          icon:BarChart3, path:'/earnings' },
    { label:'Aadhaar Verify',    icon:Shield,    path:'/aadhaar-verify' },
  ],
  fan:       [{ label:'Invite & Earn', icon:Gift, path:'/invite' }],
}

export default function Sidebar() {
  const { pathname } = useLocation()
  const navigate     = useNavigate()
  const { user, notificationCount, organiserInboxUnread, logout, addToast } = useStore()
  const role      = user?.role || 'fan'
  const isPro     = user?.subscription === 'pro_active' || user?.subscription === 'pro_cancelled'
  const roleColor = getRoleColor(role)

  const handleSignOut = () => {
    logout()
    navigate('/landing?from=signout')
    addToast('Signed out successfully', 'info')
  }

  const roleExtras = ROLE_EXTRA[role] || []
  // Insert role-specific items after "Teams"
  const teamsIdx   = BASE_NAV.findIndex(n => n.path === '/teams')
  const allNav     = [
    ...BASE_NAV.slice(0, teamsIdx + 1),
    ...roleExtras,
    ...BASE_NAV.slice(teamsIdx + 1),
  ]

  return (
    <aside
      className="sidebar"
      style={{ background: `linear-gradient(180deg, ${roleColor.shellBg} 0%, ${roleColor.shellBgLight} 100%)` }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5" style={{ borderBottom: 'rgba(255,255,255,0.08) 1px solid' }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: roleColor.primary }}
        >
          <span className="text-white font-black text-sm">CY</span>
        </div>
        <div className="min-w-0">
          <span className="font-extrabold text-white text-base tracking-tight leading-none">CricYaar</span>
          <p className="text-white/40 text-[8px] font-bold tracking-[0.15em] uppercase mt-0.5">
            {roleColor.emoji} {roleColor.label}
          </p>
        </div>
      </div>

      {/* User info */}
      {user && (
        <div
          className="flex items-center gap-3 px-4 py-3.5 mx-3 mt-3 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: roleColor.primary }}
          >
            <span className="text-white font-bold text-sm">{initials(user.name)}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-semibold text-white text-sm truncate">{user.name}</p>
              {isPro && (
                <span
                  className="flex-shrink-0 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold text-white leading-none"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                >
                  👑 PRO
                </span>
              )}
            </div>
            <p className="text-white/45 text-xs truncate">@{user.username}</p>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {allNav.map(({ label, icon: Icon, path, badge, pro }) => {
          const active         = pathname === path || (path !== '/' && pathname.startsWith(path))
          const showNotifBadge = badge === 'notif' && notificationCount > 0
          const showInboxBadge = badge === 'inbox' && organiserInboxUnread > 0
          const badgeCount     = showNotifBadge ? notificationCount : showInboxBadge ? organiserInboxUnread : 0
          const showProTag     = pro && !isPro
          return (
            <button
              key={path + label}
              onClick={() => navigate(path)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
              style={{
                background:  active ? 'rgba(255,255,255,0.12)' : 'transparent',
                color:       active ? '#fff' : 'rgba(255,255,255,0.6)',
                borderLeft:  active ? `3px solid ${roleColor.primary}` : '3px solid transparent',
              }}
            >
              <div className="relative flex-shrink-0">
                <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                {badgeCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">
                    {badgeCount}
                  </span>
                )}
              </div>
              <span className="flex-1 text-sm font-medium">{label}</span>
              {showProTag && (
                <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-400 bg-amber-400/15 rounded-full px-1.5 py-0.5 flex-shrink-0">
                  <Crown size={8} className="fill-amber-400 text-amber-400" />
                  PRO
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Pro status strip */}
      <div className="px-3 pb-2">
        {isPro ? (
          <div
            className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl"
            style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}
          >
            <Crown size={16} className="text-amber-600 fill-amber-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-bold text-amber-900 text-sm leading-none">CricYaar Pro ✓</p>
              <p className="text-amber-700 text-xs mt-0.5">All premium features unlocked</p>
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate('/pro')}
            className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-left transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}
          >
            <Crown size={16} className="text-amber-600 fill-amber-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-bold text-amber-900 text-sm leading-none">Upgrade to Pro ₹1/month</p>
              <p className="text-amber-700 text-xs mt-0.5">Cancel anytime</p>
            </div>
          </button>
        )}
      </div>

      {/* Logout */}
      <div className="px-3 pb-6 pt-1">
        <button
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all hover:bg-white/10"
          style={{ color: 'rgba(248,113,113,0.85)' }}
          onClick={handleSignOut}
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
