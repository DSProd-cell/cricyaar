import { useNavigate } from 'react-router-dom'
import { Bell, ArrowLeft, Home, Gift } from 'lucide-react'
import { useStore } from '../store/useStore'
import { getRoleColor } from '../lib/roleColors'

/**
 * Universal TopBar — CricYaar PRD v3
 *
 * Layout:
 *   LEFT  — [CY logo] + "CricYaar" + tagline (root screens)
 *           [← Back] + [CY logo] + title (sub-screens with showBack)
 *           [⌂ Home] + [CY logo] on showHome screens
 *   RIGHT — PRO badge + Refer & Earn (gift icon) + Bell
 *
 * Settings gear removed — lives inside Profile page now.
 */
export default function TopBar({ title, showBack, showHome, isHome }) {
  const navigate = useNavigate()
  const { notificationCount, user } = useStore()
  const isPro     = user?.subscription === 'pro_active' || user?.subscription === 'pro_cancelled'
  const isRoot    = !showBack && !showHome
  const roleColor = getRoleColor(user?.role)

  return (
    <header
      className="sticky top-0 z-20 flex flex-col"
      style={{
        background: 'var(--cy-surface)',
        borderBottom: `2px solid ${roleColor.primary}`,
      }}
    >
      {/* Status-bar spacer — fills the safe area so content isn't hidden under the notch.
          Floored at 24px: some Android builds report env(safe-area-inset-top) as 0 even
          though the status bar still overlays the WebView, which left this header flush
          against the notification tray. */}
      <div style={{ height: 'max(env(safe-area-inset-top, 0px), 24px)' }} />
    <div className="h-[60px] px-4 flex items-center justify-between gap-2">
      {/* LEFT: back/home + logo + name/title */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors flex-shrink-0 -ml-1"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-navy-700" />
          </button>
        )}
        {showHome && !showBack && (
          <button
            onClick={() => navigate('/')}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors flex-shrink-0 -ml-1"
            aria-label="Go to Home"
          >
            <Home size={20} className="text-navy-700" />
          </button>
        )}

        <button
          onClick={() => !isHome && navigate('/')}
          className={`flex items-center gap-2 min-w-0 ${isHome ? 'cursor-default' : 'active:opacity-70 transition-opacity'}`}
          aria-label={isHome ? 'CricYaar' : 'Go to Home'}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
            style={{ background: roleColor.primary }}
          >
            <span className="text-white font-black text-sm tracking-tight">CY</span>
          </div>

          <div className="flex flex-col justify-center min-w-0">
            {title && showBack ? (
              <p className="font-bold text-navy-900 text-sm truncate leading-tight">{title}</p>
            ) : (
              isRoot && (
                <p className="text-brand-500 text-[8px] font-extrabold tracking-[0.15em] uppercase leading-none">
                  Your Game. Your Record.
                </p>
              )
            )}
          </div>
        </button>
      </div>

      {/* RIGHT: PRO + Refer + Bell */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
        <button
          onClick={() => navigate('/invite')}
          className="flex items-center gap-1.5 h-8 rounded-full flex-shrink-0 active:scale-95 transition-all"
          style={{
            padding: '0 12px',
            background: 'linear-gradient(135deg,#7C3AED,#5B21B6)',
            boxShadow: '0 2px 10px rgba(124,58,237,0.4)',
          }}
          aria-label="Refer &amp; Earn"
        >
          <Gift size={13} strokeWidth={2.5} color="#fff" />
          <span style={{ fontSize: 11, fontWeight: 800, color: '#fff', letterSpacing: '0.01em' }}>Refer &amp; Earn</span>
        </button>
        <button
          onClick={() => navigate('/notifications')}
          className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors flex-shrink-0"
          aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} unread)` : ''}`}
        >
          <Bell size={20} className="text-navy-600" />
          {notificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>
      </div>
    </div>
    </header>
  )
}
