import { useNavigate } from 'react-router-dom'
import { Bell, ArrowLeft, Home } from 'lucide-react'
import { useStore } from '../store/useStore'

/**
 * Universal TopBar — PRD v2 Global Navigation Standard
 *
 * Three-zone layout:
 *   LEFT  — ← Back  (or ⌂ Home icon if showHome prop, or nothing on root screens)
 *   CENTRE — CY logo mark (always tappable → Home, except on Home screen itself)
 *   RIGHT  — PRO badge + Bell
 *
 * Logging out lives in My Profile, not here — it's a rare, deliberate action,
 * not something that needs a permanent slot on every screen.
 *
 * Props:
 *   title     — screen title shown below the bar (if provided, shown in left zone after back btn)
 *   showBack  — show ← back button (calls navigate(-1))
 *   showHome  — replace back button with ⌂ Home icon (for root tab screens with no back)
 *   isHome    — current screen IS Home; CY logo tap is inactive
 */
export default function TopBar({ title, showBack, showHome, isHome }) {
  const navigate = useNavigate()
  const { notificationCount, user } = useStore()

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-100 h-14 px-4 flex items-center">
      {/* LEFT — back / home icon / empty */}
      <div className="w-20 flex-shrink-0 flex items-center">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-navy-700" />
          </button>
        )}
        {showHome && !showBack && (
          <button
            onClick={() => navigate('/')}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Go to Home"
          >
            <Home size={20} className="text-navy-700" />
          </button>
        )}
      </div>

      {/* CENTRE — CY Logo (tap = Home, inactive when already on Home) */}
      <div className="flex-1 flex justify-center min-w-0">
        <button
          onClick={() => !isHome && navigate('/')}
          className={`flex items-center gap-1.5 min-w-0 ${isHome ? 'cursor-default' : 'hover:opacity-80 transition-opacity'}`}
          aria-label={isHome ? 'CricYaar' : 'Go to Home'}
        >
          <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
            <span className="text-white font-black text-sm tracking-tight">CY</span>
          </div>
          {title && (
            <span className="font-bold text-navy-900 text-sm truncate max-w-[180px]">{title}</span>
          )}
        </button>
      </div>

      {/* RIGHT — PRO badge + Bell */}
      <div className="w-24 flex-shrink-0 flex items-center justify-end gap-1">
        {(user?.subscription === 'pro_active' || user?.subscription === 'pro_cancelled') && (
          <span
            className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold text-white tracking-wide select-none flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 1px 4px rgba(245,158,11,0.4)' }}
            aria-label="Pro member"
          >
            👑 PRO
          </span>
        )}
        <button
          onClick={() => navigate('/notifications')}
          className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors flex-shrink-0"
          aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} unread)` : ''}`}
        >
          <Bell size={20} className="text-navy-600" />
          {notificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">
              {notificationCount}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
