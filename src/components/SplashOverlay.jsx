import { useState, useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'

// Shows once per JS session (resets on page reload / app reopen)
let _shown = false

const TAGLINES = [
  "India's First Fraud-Free Cricket Platform",
  "Every Match Recorded. Every Player Verified.",
  "Your Innings Deserve to Be Remembered.",
]

const PLATFORM_STATS = [
  { emoji: '🏏', label: 'Matches Live',       value: 142   },
  { emoji: '🏆', label: 'Tournaments Active', value: 28    },
  { emoji: '👤', label: 'Players',            value: 15420 },
  { emoji: '⚖️', label: 'Umpires',            value: 892   },
  { emoji: '🌐', label: 'Total Users',        value: 24680 },
]

function easeOut(t) { return 1 - Math.pow(1 - t, 3) }

export default function SplashOverlay() {
  const { user } = useStore()
  const [visible, setVisible] = useState(!_shown)
  const [fading, setFading]   = useState(false)
  const [phase, setPhase]     = useState(0)   // 0 logo, 1 tagline-1, 2 tagline-2, 3 stats
  const [progress, setProgress] = useState(0) // 0→1 for stats counter
  const rafRef = useRef(null)

  const dismiss = () => {
    setFading(true)
    setTimeout(() => setVisible(false), 600)
  }

  // Stats counter animation
  useEffect(() => {
    if (phase < 3) return
    const start = performance.now()
    const dur   = 1600
    const tick  = (now) => {
      const p = Math.min((now - start) / dur, 1)
      setProgress(easeOut(p))
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [phase])

  useEffect(() => {
    if (!visible) return
    _shown = true
    const T = [
      setTimeout(() => setPhase(1), 600),
      setTimeout(() => setPhase(2), 1900),
      setTimeout(() => setPhase(3), 3000),
      setTimeout(() => dismiss(),   6000),
    ]
    return () => T.forEach(clearTimeout)
  }, [visible]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) return null

  const show = (minPhase) => phase >= minPhase

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden select-none touch-none"
      style={{
        zIndex: 9999,
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.6s ease',
        background: 'linear-gradient(160deg, #071420 0%, #0c1f10 55%, #0a1628 100%)',
      }}
    >
      {/* Cricket ground grid texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: [
            'repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(255,255,255,0.025) 60px)',
            'repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(255,255,255,0.025) 60px)',
          ].join(', '),
          backgroundSize: '60px 60px',
        }}
      />
      {/* Pitch center glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 35%, rgba(34,197,94,0.07) 0%, transparent 70%)' }}
      />

      {/* ── Top content: logo + brand + taglines ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-0">
        {/* Logo */}
        <div
          className="flex items-center justify-center rounded-3xl mb-4"
          style={{
            width: 80, height: 80,
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            boxShadow: '0 0 60px rgba(34,197,94,0.40), 0 8px 32px rgba(0,0,0,0.5)',
            opacity: 1,
            transform: show(0) ? 'scale(1) translateY(0)' : 'scale(0.4) translateY(20px)',
            transition: 'transform 0.7s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          <span style={{ color: '#fff', fontWeight: 900, fontSize: 30, letterSpacing: '-0.03em', lineHeight: 1 }}>CY</span>
        </div>

        {/* Brand name */}
        <h1
          style={{
            color: '#fff',
            fontSize: 42,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            marginBottom: 12,
            opacity: show(0) ? 1 : 0,
            transform: show(0) ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.6s ease 0.25s, transform 0.6s ease 0.25s',
          }}
        >
          CricYaar
        </h1>

        {/* Rotating taglines */}
        <div className="relative h-12 w-full flex items-center justify-center overflow-hidden">
          {TAGLINES.map((line, i) => {
            const active = (i === 0 && phase === 1) || (i === 1 && phase === 2) || (i === 2 && phase >= 3)
            return (
              <p
                key={i}
                className="absolute inset-x-4 text-center font-medium"
                style={{
                  color: 'rgba(255,255,255,0.75)',
                  fontSize: 15,
                  lineHeight: 1.4,
                  opacity: active ? 1 : 0,
                  transform: active ? 'translateY(0)' : 'translateY(8px)',
                  transition: 'opacity 0.55s ease, transform 0.55s ease',
                }}
              >
                {line}
              </p>
            )
          })}
        </div>
      </div>

      {/* ── Bottom content: stats + CTA ── */}
      <div className="px-5 pb-12 pt-2 flex flex-col gap-3 max-w-sm mx-auto w-full">
        {/* Stats section */}
        <div
          style={{
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.5s ease, transform 0.5s ease',
          }}
        >
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', textAlign: 'center', marginBottom: 10 }}>
            Live Platform
          </p>

          <div className="grid grid-cols-5 gap-1.5">
            {PLATFORM_STATS.map((s, i) => {
              const val = Math.floor(progress * s.value)
              const display = val >= 1000
                ? (val / 1000).toFixed(val >= 10000 ? 0 : 1) + 'K+'
                : val + (s.value >= 100 ? '+' : '')
              return (
                <div
                  key={s.label}
                  className="flex flex-col items-center gap-1 py-3 rounded-2xl"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    opacity: progress > (i * 0.15) ? 1 : 0,
                    transform: progress > (i * 0.15) ? 'scale(1)' : 'scale(0.85)',
                    transition: 'opacity 0.35s ease, transform 0.35s ease',
                  }}
                >
                  <span style={{ fontSize: 18, lineHeight: 1 }}>{s.emoji}</span>
                  <span style={{ color: '#fff', fontWeight: 800, fontSize: 15, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                    {display}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center', lineHeight: 1.2 }}>
                    {s.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* CTA button */}
        <button
          onClick={dismiss}
          className="w-full py-4 rounded-2xl font-bold text-base transition-all active:scale-[0.97]"
          style={{
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: '#fff',
            fontSize: 16,
            fontWeight: 700,
            boxShadow: '0 4px 24px rgba(34,197,94,0.45)',
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 1 ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.5s ease 1.0s, transform 0.5s ease 1.0s',
          }}
        >
          {user ? 'Continue to App  →' : 'Get Started  →'}
        </button>
      </div>
    </div>
  )
}
