import { useNavigate, useLocation } from 'react-router-dom'
import { Bell, Settings, ArrowLeft } from 'lucide-react'
import { useStore } from '../store/useStore'

const TITLES = {
  '/':              '',
  '/my-cricket':    'My Cricket',
  '/grounds':       'Find a Ground',
  '/teams':         'Teams & Tournaments',
  '/notifications': 'Notifications',
  '/settings':      'Settings',
  '/profile':       'My Profile',
}

export default function TopBar({ title, showBack }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { notificationCount } = useStore()

  const label = title || TITLES[pathname] || ''

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-100 flex items-center h-14 px-4 gap-3">
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors -ml-1 flex-shrink-0"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
      )}

      {!showBack && (
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xs">CY</span>
          </div>
          <span className="font-extrabold text-navy-900 text-base tracking-tight md:hidden">CricYaar</span>
        </div>
      )}

      <h1 className="flex-1 font-bold text-navy-900 text-base truncate">{label}</h1>

      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => navigate('/notifications')}
          className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors"
          aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} unread)` : ''}`}
        >
          <Bell size={20} className="text-navy-600" />
          {notificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">
              {notificationCount}
            </span>
          )}
        </button>
        <button
          onClick={() => navigate('/settings')}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors"
          aria-label="Settings"
        >
          <Settings size={20} className="text-navy-600" />
        </button>
      </div>
    </header>
  )
}
