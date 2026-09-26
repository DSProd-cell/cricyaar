import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Copy, Share2 } from 'lucide-react'
import { useStore } from '../store/useStore'

const LEVELS = [
  { level: 1, friends: 1,  reward: '1 month FREE',   amount: '₹99',   color: '#4ade80' },
  { level: 2, friends: 3,  reward: '3 months FREE',  amount: '₹297',  color: '#4ade80' },
  { level: 3, friends: 7,  reward: '6 months FREE',  amount: '₹594',  color: '#facc15' },
  { level: 4, friends: 15, reward: 'LIFETIME PRO',   amount: '∞',     color: '#a78bfa' },
]

function getLevelFromCount(count) {
  if (count >= 15) return 4
  if (count >= 7)  return 3
  if (count >= 3)  return 2
  if (count >= 1)  return 1
  return 0
}

export default function InviteEarn() {
  const navigate = useNavigate()
  const { user, addToast } = useStore()
  const [copied, setCopied] = useState(false)

  const code = user?.username?.toUpperCase().slice(0, 6) || 'CY21'
  const referralLink = `https://cricyaar.app/join?ref=${code}`
  const friendsCount = 2
  const currentLevel = getLevelFromCount(friendsCount)

  const handleCopy = () => {
    navigator.clipboard?.writeText(code)
    setCopied(true)
    addToast('Referral code copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = () => {
    const msg = `🏏 Join CricYaar — India's fraud-free cricket app!\n\nSign up with my code *${code}* and get your first Pro month FREE:\n${referralLink}\n\n✅ Verified stats · Live scoring · Tournaments`
    if (navigator.share) {
      navigator.share({ title: 'Join CricYaar', text: msg, url: referralLink })
    } else {
      navigator.clipboard?.writeText(msg)
      addToast('Referral link copied!')
    }
  }

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: '#000000' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 sticky top-0 z-10"
        style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl"
          style={{ background: 'rgba(255,255,255,0.06)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M5 12l7-7M5 12l7 7"/>
          </svg>
        </button>
        <h1 className="font-bold text-white text-base tracking-wide">Refer &amp; Earn</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-10">
        {/* Floating emoji hero */}
        <div className="flex flex-col items-center pt-8 pb-6">
          <div className="text-7xl mb-4" style={{ animation: 'cyFloat 3s ease-in-out infinite' }}>
            🏏
          </div>
          <h2 className="text-white font-black text-2xl text-center leading-tight mb-1">
            Invite friends.<br />Earn Pro free.
          </h2>
          <p className="text-white/40 text-sm text-center mt-1">
            {friendsCount} friend{friendsCount !== 1 ? 's' : ''} joined · Level {Math.max(currentLevel, 1)} reached
          </p>
        </div>

        {/* Level tiers */}
        <div className="space-y-2 mb-8">
          {LEVELS.map((lvl) => {
            const reached  = currentLevel >= lvl.level
            const isCurrent = currentLevel === lvl.level || (currentLevel === 0 && lvl.level === 1)
            const isNext    = lvl.level === currentLevel + 1

            return (
              <div
                key={lvl.level}
                className="flex items-center gap-4 px-4 py-4 rounded-2xl transition-all"
                style={{
                  background: isCurrent
                    ? 'rgba(255,255,255,0.07)'
                    : reached
                    ? 'rgba(255,255,255,0.03)'
                    : 'rgba(255,255,255,0.02)',
                  border: isCurrent
                    ? `1px solid rgba(255,255,255,0.12)`
                    : '1px solid rgba(255,255,255,0.04)',
                }}
              >
                {/* Level indicator */}
                <div
                  className="flex-shrink-0 flex items-center justify-center rounded-full font-black text-xs"
                  style={{
                    width: 32,
                    height: 32,
                    background: reached
                      ? lvl.color
                      : 'rgba(255,255,255,0.06)',
                    color: reached ? '#000' : 'rgba(255,255,255,0.25)',
                    fontSize: 11,
                  }}
                >
                  {reached ? '✓' : lvl.level}
                </div>

                {/* Level info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm" style={{ color: reached ? '#fff' : 'rgba(255,255,255,0.35)' }}>
                      Level {lvl.level}
                    </span>
                    {isCurrent && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em' }}>
                        YOU ARE HERE
                      </span>
                    )}
                    {isNext && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80', letterSpacing: '0.06em' }}>
                        NEXT
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] mt-0.5" style={{ color: reached ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)' }}>
                    {lvl.friends} friend{lvl.friends !== 1 ? 's' : ''} go Pro
                  </p>
                </div>

                {/* Reward amount */}
                <div className="text-right flex-shrink-0">
                  <p className="font-black text-base tabular-nums" style={{ color: reached ? lvl.color : 'rgba(255,255,255,0.2)' }}>
                    {lvl.amount}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: reached ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.15)' }}>
                    {lvl.reward}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Progress nudge */}
        {currentLevel < 4 && (
          <div className="mb-6 px-4 py-3.5 rounded-2xl flex items-center gap-3"
            style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.12)' }}>
            <span className="text-xl">🎯</span>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {LEVELS[currentLevel]
                ? <><span style={{ color: '#4ade80', fontWeight: 700 }}>{LEVELS[currentLevel].friends - friendsCount} more friend{LEVELS[currentLevel].friends - friendsCount !== 1 ? 's' : ''}</span> to unlock Level {LEVELS[currentLevel].level}</>
                : 'Keep inviting to earn more months!'
              }
            </p>
          </div>
        )}

        {/* Divider */}
        <div className="h-px mb-6" style={{ background: 'rgba(255,255,255,0.06)' }} />

        {/* Referral code */}
        <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Your referral code
        </p>
        <div className="flex items-center gap-3 px-4 py-4 rounded-2xl mb-4"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <span className="flex-1 font-black text-2xl tracking-[0.22em] text-white">
            {code}
          </span>
          <button onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-sm active:scale-95 transition-all"
            style={{
              background: copied ? '#4ade80' : 'rgba(74,222,128,0.12)',
              color: copied ? '#000' : '#4ade80',
              border: `1px solid ${copied ? '#4ade80' : 'rgba(74,222,128,0.25)'}`,
            }}>
            <Copy size={13} />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Share CTA */}
        <button onClick={handleShare}
          className="w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all mb-4"
          style={{ background: 'rgba(255,255,255,0.92)', color: '#000' }}>
          <Share2 size={16} />
          Share with Friends
        </button>

        {/* Bottom tagline */}
        <p className="text-center text-[11px]" style={{ color: 'rgba(255,255,255,0.18)', letterSpacing: '0.04em' }}>
          each referral = 1 month Pro · stack them all.
        </p>
      </div>

      <style>{`
        @keyframes cyFloat {
          0%, 100% { transform: translateY(0px) rotate(-3deg); }
          50% { transform: translateY(-14px) rotate(3deg); }
        }
      `}</style>
    </div>
  )
}
