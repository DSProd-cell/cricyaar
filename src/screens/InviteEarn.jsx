import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Copy, Share2, Gift, Users, Crown, Sparkles, Star, Zap } from 'lucide-react'
import { useStore } from '../store/useStore'
import { getRoleColor } from '../lib/roleColors'

const HISTORY = [
  { name: 'Priya Sharma', action: 'signed up', date: 'May 2025', reward: null },
  { name: 'Amit Patel', action: 'upgraded to Pro', date: 'Apr 2025', reward: '1 free month' },
  { name: 'Ravi Kumar', action: 'upgraded to Pro', date: 'Mar 2025', reward: '1 free month' },
]

const STEPS = [
  { step: '1', icon: '📤', title: 'Share your code', desc: 'Send via WhatsApp in seconds' },
  { step: '2', icon: '🙋', title: 'Friend signs up', desc: 'They join CricYaar with your link' },
  { step: '3', icon: '👑', title: 'They go Pro', desc: 'First Pro month FREE with your code' },
  { step: '4', icon: '🎁', title: 'You earn FREE month', desc: 'Stacks indefinitely!' },
]

export default function InviteEarn() {
  const navigate = useNavigate()
  const { user, addToast } = useStore()
  const [copied, setCopied] = useState(false)
  const [pulse, setPulse] = useState(false)
  const role = user?.role || 'fan'
  const roleColor = getRoleColor(role)
  const code = user?.username?.toUpperCase().slice(0, 6) || 'CY21'
  const referralLink = `https://cricyaar.app/join?ref=${code}`

  useEffect(() => {
    const t = setInterval(() => setPulse(p => !p), 2000)
    return () => clearInterval(t)
  }, [])

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
    <div className="min-h-dvh flex flex-col" style={{ background: '#06111a' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 sticky top-0 z-10" style={{ background: 'rgba(6,17,26,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M5 12l7-7M5 12l7 7"/></svg>
        </button>
        <h1 className="font-extrabold text-white text-base">Invite & Earn</h1>
        <div className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold" style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)' }}>
          <Crown size={10} />
          FREE PRO
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* ── Hero banner ── */}
        <div className="relative overflow-hidden mx-4 mt-4 rounded-3xl" style={{ background: 'linear-gradient(135deg, #0d3d26 0%, #0f2d1a 50%, #071a10 100%)', border: '1px solid rgba(34,197,94,0.2)' }}>
          {/* Animated dots */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="absolute rounded-full"
                style={{
                  width: `${4 + (i % 3) * 3}px`,
                  height: `${4 + (i % 3) * 3}px`,
                  background: `rgba(34,197,94,${0.15 + (i % 4) * 0.08})`,
                  left: `${(i * 8.3) % 100}%`,
                  top: `${(i * 13.7 + 10) % 90}%`,
                  animation: `floatDot ${2.5 + (i % 3) * 0.8}s ${i * 0.3}s ease-in-out infinite alternate`,
                }}
              />
            ))}
          </div>

          <div className="relative p-5">
            {/* Glow ring */}
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 relative"
              style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', boxShadow: pulse ? '0 0 32px rgba(34,197,94,0.6)' : '0 0 16px rgba(34,197,94,0.3)', transition: 'box-shadow 0.8s ease' }}>
              <Gift size={26} className="text-white" />
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#fbbf24' }}>
                <Sparkles size={10} className="text-white" />
              </div>
            </div>

            <h2 className="text-white font-extrabold text-xl text-center mb-1">Refer. Earn. Repeat.</h2>
            <p className="text-green-400 text-xs font-bold tracking-widest uppercase text-center mb-5">Each referral = 1 FREE Pro month 🎁</p>

            {/* Code box */}
            <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(34,197,94,0.25)' }}>
              <p className="text-green-400/70 text-[10px] font-bold uppercase tracking-wider mb-2 text-center">Your Referral Code</p>
              <div className="flex items-center justify-between gap-3">
                <span className="text-3xl font-black text-white tracking-[0.18em] flex-1 text-center" style={{ textShadow: '0 0 20px rgba(34,197,94,0.4)' }}>{code}</span>
                <button onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 flex-shrink-0"
                  style={{ background: copied ? '#16a34a' : 'rgba(34,197,94,0.15)', color: copied ? '#fff' : '#22c55e', border: `1px solid ${copied ? '#16a34a' : 'rgba(34,197,94,0.3)'}` }}>
                  <Copy size={13} />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <button onClick={handleShare}
              className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
              style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#fff', boxShadow: '0 4px 20px rgba(22,163,74,0.4)' }}>
              <Share2 size={16} />
              Share on WhatsApp
            </button>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-3 gap-3 mx-4 mt-4">
          {[
            { label: 'Friends joined', value: '3', color: '#22c55e' },
            { label: 'Gone Pro', value: '2', color: '#fbbf24' },
            { label: 'Free months', value: '2', color: '#a78bfa' },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="font-black text-2xl tabular-nums" style={{ color: s.color }}>{s.value}</p>
              <p className="text-white/40 text-[10px] mt-0.5 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Next reward nudge ── */}
        <div className="mx-4 mt-3 rounded-2xl p-3.5 flex items-center gap-3" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.18)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(251,191,36,0.15)' }}>
            <Zap size={16} className="text-amber-400" />
          </div>
          <div className="min-w-0">
            <p className="text-amber-300 text-xs font-bold">Next reward almost there!</p>
            <p className="text-amber-500/70 text-[11px] mt-0.5">1 free month when <strong className="text-amber-400">Priya Sharma</strong> goes Pro</p>
          </div>
        </div>

        {/* ── How it works ── */}
        <div className="mx-4 mt-4 mb-2">
          <p className="text-white/50 text-[11px] font-bold uppercase tracking-widest mb-3">How it works</p>
          <div className="space-y-2">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: 'rgba(34,197,94,0.1)' }}>{s.icon}</div>
                <div className="min-w-0">
                  <p className="text-white font-semibold text-sm">{s.title}</p>
                  <p className="text-white/40 text-xs mt-0.5">{s.desc}</p>
                </div>
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0" style={{ background: 'rgba(34,197,94,0.2)', color: '#22c55e' }}>{s.step}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Rewards history ── */}
        <div className="mx-4 mt-4 mb-8">
          <p className="text-white/50 text-[11px] font-bold uppercase tracking-widest mb-3">Rewards History</p>
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
            {HISTORY.map((h, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: i < HISTORY.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', background: 'rgba(255,255,255,0.02)' }}>
                <div>
                  <p className="font-semibold text-white text-sm">{h.name}</p>
                  <p className="text-white/35 text-xs mt-0.5">{h.action} · {h.date}</p>
                </div>
                {h.reward ? (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}>{h.reward}</span>
                ) : (
                  <span className="text-[10px] text-white/25">Pending</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes floatDot {
          from { transform: translateY(0) scale(1); opacity: 0.6; }
          to   { transform: translateY(-12px) scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
