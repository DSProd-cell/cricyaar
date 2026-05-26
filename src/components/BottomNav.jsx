import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Search, User, Trophy, Eye, Inbox } from 'lucide-react'
import { useStore } from '../store/useStore'

// Role-specific 4th nav item
const ROLE_FOURTH = {
  player:    { label:'Teams',    icon:Trophy, path:'/open-tournaments' },
  umpire:    { label:'Matches',  icon:Eye,    path:'/browse-matches'   },
  organiser: { label:'Inbox',    icon:Inbox,  path:'/organiser-inbox', badge:'inbox' },
  admin:     { label:'Teams',    icon:Trophy, path:'/teams'            },
  fan:       null,
}

export default function BottomNav() {
  const navigate     = useNavigate()
  const { pathname } = useLocation()
  const { user, organiserInboxUnread } = useStore()
  const role = user?.role || 'fan'

  const roleItem = ROLE_FOURTH[role] || null

  const baseItems = [
    { label:'Home',   icon:Home,   path:'/'        },
    { label:'Search', icon:Search, path:'/grounds' },
  ]

  const tail = [{ label:'Profile', icon:User, path:'/profile' }]

  const allItems = roleItem
    ? [...baseItems, roleItem, ...tail]
    : [...baseItems, ...tail]

  return (
    <nav className="bottom-nav">
      {allItems.map(({ label, icon: Icon, path, badge }) => {
        const active     = pathname === path || (path !== '/' && pathname.startsWith(path))
        const badgeCount = badge === 'inbox' ? organiserInboxUnread : 0
        return (
          <button
            key={path + label}
            className={`bottom-nav-item ${active ? 'active' : ''}`}
            onClick={() => navigate(path)}
            aria-label={label}
          >
            <div className="relative">
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              {badgeCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">
                  {badgeCount}
                </span>
              )}
            </div>
            <span>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
