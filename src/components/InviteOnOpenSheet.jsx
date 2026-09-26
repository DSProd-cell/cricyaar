import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Gift, X, Share2, Sparkles } from 'lucide-react'
import { useStore } from '../store/useStore'

const SKIP_PATHS = [
  '/landing', '/welcome', '/login', '/otp', '/setup', '/profile-match',
  '/celebration', '/city-select', '/role-select', '/player-match', '/role-onboard',
  '/player-setup', '/invite',
]

export default function InviteOnOpenSheet() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user, addToast } = useStore()
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!user) return
    if (SKIP_PATHS.some(p => pathname.startsWith(p))) return
    const shown = sessionStorage.getItem('cy_invite_popup_shown')
    if (shown) return
    sessionStorage.setItem('cy_invite_popup_shown', '1')
    const t = setTimeout(() => { setOpen(true); requestAnimationFrame(() => setVisible(true)) }, 2500)
    return () => clearTimeout(t)
  }, [user?.id]) // eslint-disable-line

  const code = user?.username?.toUpperCase().slice(0, 6) || 'CY21'

  const handleShare = () => {
    const msg = `🏏 Join CricYaar — India's fraud-free cricket app!\n\nSign up with my code *${code}* and get your first Pro month FREE:\nhttps://cricyaar.app/join?ref=${code}\n\n✅ Verified stats · Live scoring · Tournaments`
    if (navigator.share) {
      navigator.share({ title: 'Join CricYaar', text: msg })
    } else {
      navigator.clipboard?.writeText(msg)
      addToast('Referral link copied!')
    }
    setOpen(false)
  }

  const handleClose = () => {
    setVisible(false)
    setTimeout(() => setOpen(false), 300)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[75] flex flex-col justify-end" onClick={handleClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease' }} />
      <div
        className="relative rounded-t-3xl overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(160deg, #061a10 0%, #0d3d26 60%, #071a10 100%)',
          border: '1px solid rgba(34,197,94,0.2)',
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Floating dots */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="absolute rounded-full"
              style={{
                width: `${3 + (i % 3) * 2}px`, height: `${3 + (i % 3) * 2}px`,
                background: `rgba(34,197,94,${0.12 + (i % 3) * 0.08})`,
                left: `${(i * 12.5) % 95}%`, top: `${(i * 17 + 5) % 85}%`,
                animation: `floatDot ${2 + (i % 3) * 0.6}s ${i * 0.25}s ease-in-out infinite alternate`,
              }}
            />
          ))}
        </div>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} /></div>

        {/* Close */}
        <button onClick={handleClose} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <X size={14} className="text-white/60" />
        </button>

        <div className="relative px-5 pt-2 pb-8">
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 relative"
            style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', boxShadow: '0 0 28px rgba(22,163,74,0.5)' }}>
            <Gift size={24} className="text-white" />
            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#fbbf24' }}>
              <Sparkles size={9} className="text-white" />
            </div>
          </div>

          <h2 className="text-white font-extrabold text-xl text-center mb-1">🎁 Invite & Earn!</h2>
          <p className="text-green-400 text-sm text-center mb-5 leading-relaxed">
            Share your code — your friend gets Pro FREE,<br />
            <strong className="text-white">you earn a free month too!</strong>
          </p>

          {/* Code */}
          <div className="rounded-2xl p-4 mb-4 text-center" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <p className="text-green-400/60 text-[10px] font-bold uppercase tracking-widest mb-1">Your Code</p>
            <p className="text-3xl font-black text-white tracking-[0.2em]" style={{ textShadow: '0 0 16px rgba(34,197,94,0.4)' }}>{code}</p>
          </div>

          <button onClick={handleShare}
            className="w-full py-3.5 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 mb-3 active:scale-[0.97] transition-all"
            style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', boxShadow: '0 4px 20px rgba(22,163,74,0.35)' }}>
            <Share2 size={16} />
            Share on WhatsApp now
          </button>

          <button onClick={() => { handleClose(); navigate('/invite') }}
            className="w-full py-2.5 text-center text-sm font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>
            View full details →
          </button>
        </div>

        <style>{`
          @keyframes floatDot {
            from { transform: translateY(0); opacity: 0.5; }
            to   { transform: translateY(-10px); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  )
}
