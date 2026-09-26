import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

/**
 * Shared auth/onboarding page header.
 * Shows: [← Back] [CY logo] [title or tagline] [rightSlot]
 *
 * Used on Login, OtpVerify, PlayerSetup, and any future onboarding screen.
 */
export default function PageHeader({
  title,
  showTagline = false,
  onBack,
  backTo,
  rightSlot,
  className = '',
}) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) { onBack(); return }
    if (backTo) { navigate(backTo); return }
    navigate(-1)
  }

  return (
    <div className={`flex items-center gap-2 px-4 pt-12 pb-4 ${className}`}>
      <button
        onClick={handleBack}
        className="w-9 h-9 flex items-center justify-center rounded-xl text-navy-500 hover:text-navy-900 hover:bg-white/60 transition-colors -ml-1 flex-shrink-0"
        aria-label="Go back"
      >
        <ArrowLeft size={20} />
      </button>

      {/* CY Logo */}
      <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center shadow-md shadow-brand-500/30 flex-shrink-0">
        <span className="text-white font-black text-xs tracking-tight">CY</span>
      </div>

      {/* Title or tagline */}
      <div className="flex-1 min-w-0">
        {title && (
          <p className="font-bold text-navy-900 text-sm truncate">{title}</p>
        )}
        {showTagline && (
          <p className="text-brand-500 text-[10px] font-bold tracking-[0.18em] uppercase">
            Your Game. Your Record. For Real.
          </p>
        )}
      </div>

      {rightSlot && <div className="flex-shrink-0">{rightSlot}</div>}
    </div>
  )
}
