import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Bell, ArrowLeft, Home, LogOut } from 'lucide-react'
import { useStore } from '../store/useStore'

/**
 * Universal TopBar — PRD v2 Global Navigation Standard
 *
 * Three-zone layout:
 *   LEFT  — ← Back  (or ⌂ Home icon if showHome prop, or nothing on root screens)
 *   CENTRE — CY logo mark (always tappable → Home, except on Home screen itself)
 *   RIGHT  — Bell + LogOut
 *
 * Props:
 *   title     — screen title shown below the bar (if provided, shown in left zone after back btn)
 *   showBack  — show ← back button (calls navigate(-1))
 *   showHome  — replace back button with ⌂ Home icon (for root tab screens with no back)
 *   isHome    — current screen IS Home; CY logo tap is inactive
 */
export default function TopBar({ title, showBack, showHome, isHome }) {
  const navigate = useNavigate()
  const { notificationCount, user, setUser, addToast } = useStore()
  const [confirmLogout, setConfirmLogout] = useState(false)

  const handleLogout = () => {
    setUser(null)
    setConfirmLogout(false)
    addToast('Logged out successfully', 'info')
    navigate('/usp')
  }

  return (
    <>
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
        <div className="flex-1 flex justify-center">
          <button
            onClick={() => !isHome && navigate('/')}
            className={`flex items-center gap-1.5 ${isHome ? 'cursor-default' : 'hover:opacity-80 transition-opacity'}`}
            aria-label={isHome ? 'CricYaar' : 'Go to Home'}
          >
            <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-black text-sm tracking-tight">CY</span>
            </div>
            {title && (
              <span className="font-bold text-navy-900 text-sm truncate max-w-[140px]">{title}</span>
            )}
          </button>
        </div>

        {/* RIGHT — Bell + Logout */}
        <div className="w-20 flex-shrink-0 flex items-center justify-end gap-0.5">
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

          {user && (
            <button
              onClick={() => setConfirmLogout(true)}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-red-50 transition-colors"
              aria-label="Log out"
            >
              <LogOut size={17} className="text-red-400" />
            </button>
          )}
        </div>
      </header>

      {/* Logout confirmation dialog */}
      {confirmLogout && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-6"
          onClick={() => setConfirmLogout(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LogOut size={22} className="text-red-500" />
            </div>
            <h3 className="font-bold text-navy-900 text-lg text-center mb-1">Log out?</h3>
            <p className="text-navy-500 text-sm text-center mb-5 leading-relaxed">
              You'll need to verify your phone number again to log back in.
            </p>
            <div className="flex gap-3">
              <button
                className="btn-secondary flex-1"
                onClick={() => setConfirmLogout(false)}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 rounded-xl font-bold text-white text-sm transition-colors active:scale-95"
                style={{ background: '#ef4444' }}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
