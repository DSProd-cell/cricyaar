import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

// ── Config ─────────────────────────────────────────────────────────────────
const FRIEND_COUNT = 2  // mock — will come from backend

function currentLevel(n) {
  if (n >= 15) return 4
  if (n >= 7)  return 3
  if (n >= 3)  return 2
  if (n >= 1)  return 1
  return 0
}

const LEVELS = [
  {
    level: 1, friendsNeeded: 1, earn: '₹1',
    bg: 'linear-gradient(150deg,#7C3AED 0%,#4C1D95 100%)',
    activeLabel: 'refer 1 friend and earn ₹1',
    activeSub: '1 month Pro free for both of you',
    reached: FRIEND_COUNT >= 1,
  },
  {
    level: 2, friendsNeeded: 3, earn: '₹2',
    bg: 'linear-gradient(150deg,#2563EB 0%,#1E3A8A 100%)',
    reached: FRIEND_COUNT >= 3,
  },
  {
    level: 3, friendsNeeded: 7, earn: '₹3',
    bg: 'linear-gradient(150deg,#059669 0%,#064E3B 100%)',
    reached: FRIEND_COUNT >= 7,
  },
  {
    level: 4, friendsNeeded: 15, earn: '₹4',
    bg: 'linear-gradient(150deg,#9333EA 0%,#581C87 100%)',
    reached: FRIEND_COUNT >= 15,
  },
]

const myLevel = currentLevel(FRIEND_COUNT)

// ── Gift Box ────────────────────────────────────────────────────────────────
function GiftBox() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
      {/* Glow ring */}
      <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,215,0,0.18) 0%, transparent 70%)' }} />
      {/* Sparkles */}
      {[
        { top: '8%',  left: '20%', size: 10, delay: '0s' },
        { top: '12%', right: '18%', size: 7,  delay: '0.4s' },
        { top: '60%', left: '10%', size: 6,  delay: '0.8s' },
        { top: '5%',  left: '55%', size: 8,  delay: '1.2s' },
      ].map((sp, i) => (
        <div key={i} className="absolute" style={{ top: sp.top, left: sp.left, right: sp.right, animation: `sparkle 2s ${sp.delay} ease-in-out infinite` }}>
          <svg width={sp.size} height={sp.size} viewBox="0 0 10 10">
            <polygon points="5,0 6,4 10,5 6,6 5,10 4,6 0,5 4,4" fill="#FFD700" />
          </svg>
        </div>
      ))}
      {/* Box body */}
      <div style={{ animation: 'giftFloat 3s ease-in-out infinite', fontSize: 0, position: 'relative' }}>
        {/* CSS isometric gift box */}
        <div style={{ width: 90, height: 90, position: 'relative' }}>
          {/* Front face */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: 90, height: 70, background: '#111', border: '2px solid #333', borderRadius: 4 }}>
            {/* Ribbon horizontal */}
            <div style={{ position: 'absolute', top: '45%', left: 0, right: 0, height: 14, background: '#FFD700', transform: 'translateY(-50%)' }} />
            {/* Ribbon vertical */}
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 14, background: '#FFD700', transform: 'translateX(-50%)' }} />
          </div>
          {/* Lid */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: 90, height: 22, background: '#1a1a1a', border: '2px solid #444', borderRadius: '4px 4px 0 0' }}>
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 14, background: '#FFD700', transform: 'translateX(-50%)' }} />
          </div>
          {/* Bow left */}
          <div style={{ position: 'absolute', top: -8, left: '30%', width: 20, height: 14, background: '#FFD700', borderRadius: '50% 0 0 50%', transform: 'rotate(-20deg)' }} />
          {/* Bow right */}
          <div style={{ position: 'absolute', top: -8, right: '30%', width: 20, height: 14, background: '#FFD700', borderRadius: '0 50% 50% 0', transform: 'rotate(20deg)' }} />
        </div>
      </div>
    </div>
  )
}

// ── Money Stack Illustration ────────────────────────────────────────────────
function MoneyStack() {
  return (
    <div style={{ position: 'relative', width: 90, height: 70, animation: 'giftFloat 3s 0.5s ease-in-out infinite' }}>
      {[3, 2, 1, 0].map(i => (
        <div key={i} style={{
          position: 'absolute',
          bottom: i * 6,
          left: i * 3,
          width: 80 - i * 4,
          height: 48,
          background: i === 0 ? '#C084FC' : '#A855F7',
          border: '1.5px solid rgba(255,255,255,0.2)',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {i === 0 && <span style={{ color: '#fff', fontSize: 16, fontWeight: 900 }}>₹1</span>}
        </div>
      ))}
    </div>
  )
}

// ── Level Card ──────────────────────────────────────────────────────────────
function LevelCard({ lvl }) {
  const locked = !lvl.reached
  const needed = Math.max(0, lvl.friendsNeeded - FRIEND_COUNT)

  return (
    <div style={{
      minWidth: 'calc(100% - 64px)',
      flexShrink: 0,
      scrollSnapAlign: 'center',
      borderRadius: 16,
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Yellow diagonal level badge */}
      <div style={{
        position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)',
        background: '#FFD700',
        padding: '5px 28px',
        clipPath: 'polygon(8px 0%, calc(100% - 8px) 0%, 100% 100%, 0% 100%)',
        zIndex: 2,
      }}>
        <span style={{ fontSize: 11, fontWeight: 900, color: '#000', letterSpacing: '0.12em' }}>LEVEL {lvl.level}</span>
      </div>

      {/* Card body */}
      <div style={{ background: lvl.bg, padding: '40px 24px 28px', minHeight: 200 }}>
        {locked ? (
          <div className="flex flex-col items-center justify-center text-center" style={{ minHeight: 140 }}>
            {/* Lock icon */}
            <svg width="32" height="38" viewBox="0 0 32 38" fill="none" style={{ marginBottom: 12, opacity: 0.8 }}>
              <rect x="4" y="18" width="24" height="18" rx="4" fill="white" fillOpacity="0.6"/>
              <path d="M9 18V13a7 7 0 0 1 14 0v5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.6"/>
              <circle cx="16" cy="27" r="2.5" fill="rgba(0,0,0,0.4)"/>
            </svg>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 17, fontWeight: 700, lineHeight: 1.4, marginBottom: 8 }}>
              earn assured {lvl.earn} on every referral
            </p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
              complete {needed} referral{needed !== 1 ? 's' : ''} to unlock level
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div style={{ flex: 1 }}>
              <p style={{ color: '#fff', fontSize: 18, fontWeight: 800, lineHeight: 1.35, marginBottom: 6 }}>
                {lvl.activeLabel || `earn assured ${lvl.earn} on every referral`}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                {lvl.activeSub || `${lvl.earn} cashback per Pro referral`}
              </p>
            </div>
            {lvl.level === 1 && <MoneyStack />}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Progress Bar ────────────────────────────────────────────────────────────
function ProgressBar({ active }) {
  return (
    <div style={{ padding: '0 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {LEVELS.map((lvl, i) => (
          <div key={lvl.level} style={{ display: 'flex', alignItems: 'center', flex: i < LEVELS.length - 1 ? 1 : 'none' }}>
            {/* Dot */}
            <div style={{
              width: lvl.level === active ? 16 : 10,
              height: lvl.level === active ? 16 : 10,
              borderRadius: '50%',
              background: lvl.reached ? '#FFD700' : '#333',
              border: lvl.level === active ? '3px solid #FFD700' : 'none',
              boxShadow: lvl.level === active ? '0 0 8px rgba(255,215,0,0.6)' : 'none',
              flexShrink: 0,
              transition: 'all 0.3s',
            }} />
            {/* Line */}
            {i < LEVELS.length - 1 && (
              <div style={{ flex: 1, height: 2, background: LEVELS[i + 1].reached ? '#FFD700' : '#333', margin: '0 3px' }} />
            )}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        {LEVELS.map(lvl => (
          <span key={lvl.level} style={{
            fontSize: 9, fontWeight: lvl.level === active ? 700 : 500,
            color: lvl.level === active ? '#FFD700' : 'rgba(255,255,255,0.3)',
            letterSpacing: '0.05em',
          }}>
            LEVEL {lvl.level}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Scrolling Ticker ────────────────────────────────────────────────────────
function Ticker() {
  const text = '🏏  OVER 10,000 CRICKETERS HAVE JOINED CRICYAAR VIA REFERRAL  •  '
  const repeated = text.repeat(4)
  return (
    <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '10px 0' }}>
      <span style={{ display: 'inline-block', animation: 'tickerScroll 18s linear infinite', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em' }}>
        {repeated}
      </span>
    </div>
  )
}

// ── How It Works Modal ──────────────────────────────────────────────────────
function HowItWorksSheet({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70" />
      <div
        className="relative"
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0a0a0a',
          borderRadius: '20px 20px 0 0',
          padding: '24px 24px 40px',
          maxHeight: '85vh',
          overflowY: 'auto',
        }}
      >
        {/* Handle */}
        <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2, margin: '0 auto 20px' }} />

        {/* Close + Title */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <p style={{ color: '#fff', fontWeight: 800, fontSize: 15, letterSpacing: '0.02em' }}>
            CricYaar <span style={{ color: '#FFD700', fontStyle: 'italic' }}>referral</span>
          </p>
          <div style={{ width: 36 }} />
        </div>

        {/* Gift box animation */}
        <div className="flex justify-center my-6">
          <GiftBox />
        </div>

        {/* Steps */}
        {[
          { step: 'STEP 1', text: 'Get your friends to sign up on CricYaar using your invite link' },
          { step: 'STEP 2', text: 'For each friend that goes Pro (₹1/mo), you earn ₹1 — they get 1 month free' },
          { step: 'STEP 3', text: 'Keep referring to reach Level 4 and earn ₹4 on every referral' },
        ].map(({ step, text }, i) => (
          <div key={i} className="flex flex-col items-center text-center mb-8">
            <div style={{
              background: '#FFD700',
              color: '#000',
              fontSize: 11,
              fontWeight: 900,
              padding: '5px 20px',
              borderRadius: 40,
              letterSpacing: '0.1em',
              marginBottom: 14,
              clipPath: 'polygon(6px 0%, calc(100% - 6px) 0%, 100% 50%, calc(100% - 6px) 100%, 6px 100%, 0% 50%)',
            }}>
              {step}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, lineHeight: 1.6, maxWidth: 280 }}>{text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main ────────────────────────────────────────────────────────────────────
export default function InviteEarn() {
  const navigate = useNavigate()
  const { user, addToast } = useStore()
  const [activeCard, setActiveCard] = useState(Math.max(myLevel - 1, 0))
  const [showInfo, setShowInfo] = useState(false)
  const [copied, setCopied] = useState(false)
  const carouselRef = useRef(null)

  const code = user?.username?.toUpperCase().slice(0, 6) || 'CY21'
  const referralLink = `https://cricyaar.app/join?ref=${code}`
  const initials = (user?.name || 'CY').slice(0, 2).toUpperCase()

  // Sync active card to scroll position
  useEffect(() => {
    const el = carouselRef.current
    if (!el) return
    const onScroll = () => {
      const cardW = el.querySelector('[data-card]')?.offsetWidth || el.offsetWidth
      setActiveCard(Math.round(el.scrollLeft / (cardW + 12)))
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  // Scroll to current level card on mount
  useEffect(() => {
    const el = carouselRef.current
    if (!el) return
    setTimeout(() => {
      const cards = el.querySelectorAll('[data-card]')
      if (cards[activeCard]) cards[activeCard].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }, 100)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleShare = () => {
    const msg = `🏏 Join CricYaar — India's fraud-free cricket app!\n\nUse my code *${code}* to get your first Pro month FREE (₹1 off!):\n${referralLink}\n\n✅ Verified stats · Live scoring · Tournaments`
    if (navigator.share) {
      navigator.share({ title: 'Join CricYaar', text: msg, url: referralLink })
    } else {
      navigator.clipboard?.writeText(referralLink)
      addToast('Referral link copied!')
    }
  }

  const handleCopy = () => {
    navigator.clipboard?.writeText(code)
    setCopied(true)
    addToast('Code copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#000', display: 'flex', flexDirection: 'column' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 0', position: 'sticky', top: 0, zIndex: 10, background: '#000' }}>
        <button onClick={() => navigate(-1)} style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M5 12l7-7M5 12l7 7"/></svg>
        </button>

        {/* CY Logo + Tagline */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 48, height: 48, borderRadius: 13, background: 'linear-gradient(135deg,#22c55e,#16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 2px #000, 0 0 18px rgba(34,197,94,0.5)' }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 19, letterSpacing: '-0.04em' }}>CY</span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap', margin: 0 }}>
            Your Game. Your Record.
          </p>
        </div>

        {/* Info button */}
        <button onClick={() => setShowInfo(true)} style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        </button>
      </div>

      {/* ── Level Cards Carousel ── */}
      <div
        ref={carouselRef}
        style={{
          display: 'flex',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth',
          gap: 12,
          padding: '20px 32px 16px',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        {LEVELS.map(lvl => (
          <div key={lvl.level} data-card style={{ minWidth: 'calc(100% - 64px)', scrollSnapAlign: 'center', flexShrink: 0 }}>
            <LevelCard lvl={lvl} />
          </div>
        ))}
      </div>

      {/* ── Level up pill ── */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
        <div style={{ background: '#111', borderRadius: 40, padding: '7px 18px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80' }} />
          <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>
            <span style={{ color: '#4ade80', fontWeight: 800 }}>level up.</span> earn more Pro months.
          </span>
        </div>
      </div>

      {/* ── Progress Bar ── */}
      <div style={{ padding: '4px 16px 16px' }}>
        <ProgressBar active={myLevel || 1} />
      </div>

      {/* ── Invite via WhatsApp ── */}
      <div style={{ padding: '4px 20px 12px' }}>
        <button
          onClick={handleShare}
          style={{
            width: '100%', padding: '16px', borderRadius: 40, background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            fontWeight: 800, fontSize: 15, color: '#000',
            boxShadow: '0 4px 20px rgba(255,255,255,0.08)',
            border: 'none', cursor: 'pointer',
          }}
        >
          {/* WhatsApp green logo */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="12" fill="#25D366"/>
            <path d="M17.4 6.6A7.1 7.1 0 0 0 12 4.4a7.1 7.1 0 0 0-6.2 10.6l-1 3.5 3.6-1a7.1 7.1 0 0 0 3.6.9 7.1 7.1 0 0 0 5.4-11.8zm-5.4 10.9a5.9 5.9 0 0 1-3-.8l-.2-.1-2.2.6.6-2.1-.1-.2a5.9 5.9 0 1 1 5 2.6zm3.2-4.4c-.2-.1-1-.5-1.1-.5-.2-.1-.3-.1-.4.1l-.5.7c-.1.1-.2.1-.3 0a5 5 0 0 1-1.4-.9 5.3 5.3 0 0 1-1-1.3c-.1-.2 0-.3.1-.3l.3-.3.2-.3v-.3l-.5-1.2c-.1-.3-.3-.3-.4-.3h-.3c-.1 0-.4.1-.5.4-.2.2-.7.7-.7 1.7s.7 2 .8 2.1c.1.1 1.4 2.1 3.3 3 .5.2.8.3 1.1.4.5.1.9.1 1.2.1.4 0 1-.4 1.2-.8.1-.4.1-.7 0-.8z" fill="white"/>
          </svg>
          invite via whatsapp
        </button>
      </div>

      {/* ── Ticker ── */}
      <Ticker />

      {/* ── Referral Code Section ── */}
      <div style={{ padding: '20px 20px 12px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
          your referral code
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.07)' }}>
          <span style={{ flex: 1, fontWeight: 900, fontSize: 22, color: '#fff', letterSpacing: '0.2em' }}>{code}</span>
          <button
            onClick={handleCopy}
            style={{
              padding: '8px 18px', borderRadius: 10, fontWeight: 700, fontSize: 13,
              background: copied ? '#4ade80' : 'rgba(74,222,128,0.1)',
              color: copied ? '#000' : '#4ade80',
              border: `1px solid ${copied ? '#4ade80' : 'rgba(74,222,128,0.3)'}`,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* ── Bottom tagline ── */}
      <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.15)', padding: '4px 20px 24px', letterSpacing: '0.04em' }}>
        each referral = 1 month Pro · stack them all.
      </p>

      {/* ── How It Works Sheet ── */}
      {showInfo && <HowItWorksSheet onClose={() => setShowInfo(false)} />}

      <style>{`
        @keyframes giftFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes tickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        [data-card]::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}
