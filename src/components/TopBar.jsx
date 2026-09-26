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
        background: '#fff',
        borderBottom: `2px solid ${roleColor.primary}`,
      }}
    >
      {/* Status-bar spacer — fills the safe area so content isn't hidden under the notch */}
      <div style={{ height: 'env(safe-area-inset-top, 0px)' }} />
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
              <>
                <p className="font-extrabold text-navy-900 text-sm leading-none">CricYaar</p>
                {isRoot && (
                  <p className="text-brand-500 text-[8px] font-bold tracking-[0.15em] uppercase leading-none mt-[3px]">
                    Your Game. Your Record. For Real.
                  </p>
                )}
              </>
            )}
          </div>
        </button>
      </div>

      {/* RIGHT: PRO + Refer + Bell */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
        {isPro && (
          <span
            className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold text-white tracking-wide select-none mr-1"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 1px 4px rgba(245,158,11,0.35)' }}
          >
            👑 PRO
          </span>
        )}
        <button
          onClick={() => navigate('/invite')}
          className="flex items-center gap-1 px-2.5 h-9 rounded-xl hover:bg-slate-100 text-navy-600 transition-colors flex-shrink-0"
          aria-label="Refer & Earn"
        >
          <Gift size={17} strokeWidth={2} />
          <span className="text-[11px] font-semibold">Refer &amp; Earn</span>
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
