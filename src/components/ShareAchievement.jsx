import { useState } from 'react'
import { Share2, X, MessageCircle, Instagram, Copy, CheckCircle } from 'lucide-react'
import { useStore } from '../store/useStore'
import { getRoleColor } from '../lib/roleColors'

export default function ShareAchievement({ title, stats, matchName, tournamentName }) {
  const { user } = useStore()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const role = user?.role || 'fan'
  const roleColor = getRoleColor(role)

  const shareText = [
    `🏏 ${title || 'Match Performance'} — ${user?.name || 'CricYaar Player'}`,
    matchName ? `📋 Match: ${matchName}` : '',
    tournamentName ? `🏆 Tournament: ${tournamentName}` : '',
    stats ? stats.map(s => `${s.icon || '•'} ${s.label}: ${s.value}`).join('\n') : '',
    '',
    '✅ Verified on CricYaar — India\'s Fraud-Free Cricket Platform',
    '📲 Download: cricyaar.app',
  ].filter(Boolean).join('\n')

  const waText = encodeURIComponent(shareText)

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${waText}`, '_blank', 'noopener,noreferrer')
  }

  const handleInstagram = () => {
    // Copy text first, then open Instagram (no direct story URL scheme from browser)
    navigator.clipboard?.writeText(shareText).catch(() => {})
    window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer')
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  const handleCopy = () => {
    navigator.clipboard?.writeText(shareText).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({ title: title || 'My Cricket Performance', text: shareText })
        .catch(() => {})
    } else {
      handleCopy()
    }
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-xs transition-all active:scale-95"
        style={{
          background: `${roleColor.primary}15`,
          color: roleColor.primary,
          border: `1px solid ${roleColor.border}`,
        }}
      >
        <Share2 size={14} />
        Share Achievement
      </button>

      {/* Bottom sheet */}
      {open && (
        <div
          className="fixed inset-0 z-[70] flex flex-col justify-end"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          <div
            className="relative bg-white rounded-t-3xl w-full max-w-lg mx-auto shadow-2xl animate-slide-up pb-safe"
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-slate-200 rounded-full" />
            </div>

            <div className="px-5 pb-8 pt-3">
              {/* Header */}
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h3 className="font-extrabold text-navy-900 text-lg">Celebrate Your Win 🏆</h3>
                  <p className="text-navy-500 text-xs mt-0.5">
                    Share your verified performance — let your game do the talking
                  </p>
                </div>
                <button onClick={() => setOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 flex-shrink-0 ml-3">
                  <X size={15} className="text-navy-500" />
                </button>
              </div>

              {/* Preview card */}
              <div
                className="rounded-2xl p-4 my-4 text-white relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${roleColor.gradientFrom}, ${roleColor.gradientTo})` }}
              >
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                }} />
                <p className="font-extrabold text-base relative">{title || 'Match Performance'}</p>
                {matchName && <p className="text-white/75 text-xs mt-0.5 relative">📋 {matchName}</p>}
                {stats?.length > 0 && (
                  <div className="flex gap-4 mt-3 relative">
                    {stats.slice(0, 3).map((s, i) => (
                      <div key={i} className="text-center">
                        <p className="font-extrabold text-xl tabular-nums">{s.value}</p>
                        <p className="text-white/65 text-[10px] uppercase tracking-wide">{s.label}</p>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-white/50 text-[10px] mt-3 relative">✅ Verified · cricyaar.app</p>
              </div>

              {/* Share options */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <button
                  onClick={handleWhatsApp}
                  className="flex flex-col items-center gap-2 py-4 rounded-2xl bg-green-50 border border-green-200 active:scale-95 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
                    <MessageCircle size={20} className="text-white" />
                  </div>
                  <span className="text-green-700 font-semibold text-xs">WhatsApp</span>
                  <span className="text-green-500 text-[10px]">Status / Chat</span>
                </button>

                <button
                  onClick={handleInstagram}
                  className="flex flex-col items-center gap-2 py-4 rounded-2xl bg-pink-50 border border-pink-200 active:scale-95 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>
                    <Instagram size={20} className="text-white" />
                  </div>
                  <span className="text-pink-700 font-semibold text-xs">Instagram</span>
                  <span className="text-pink-500 text-[10px]">Story / Post</span>
                </button>

                <button
                  onClick={handleCopy}
                  className="flex flex-col items-center gap-2 py-4 rounded-2xl bg-slate-50 border border-slate-200 active:scale-95 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center">
                    {copied ? <CheckCircle size={20} className="text-green-600" /> : <Copy size={20} className="text-slate-600" />}
                  </div>
                  <span className="text-slate-700 font-semibold text-xs">{copied ? 'Copied!' : 'Copy Text'}</span>
                  <span className="text-slate-400 text-[10px]">Paste anywhere</span>
                </button>
              </div>

              {/* Native share */}
              <button
                onClick={handleNativeShare}
                className="w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-all active:scale-[0.98]"
                style={{ background: `linear-gradient(135deg, ${roleColor.gradientFrom}, ${roleColor.gradientTo})` }}
              >
                <Share2 size={15} className="inline mr-2 -mt-0.5" />
                More sharing options
              </button>

              {/* Why share */}
              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[11px] font-bold text-navy-600 mb-1">Why share your performance?</p>
                <p className="text-[11px] text-navy-400 leading-relaxed">
                  Your stats are verified and fraud-proof. Every run, wicket and catch is recorded on CricYaar —
                  sharing them builds your cricket reputation and helps you get noticed by teams and organisers.
                </p>
              </div>

              {copied && (
                <p className="text-center text-xs text-green-600 font-semibold mt-3 animate-fade-in">
                  ✅ Text copied — open Instagram and paste into your Story caption
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
