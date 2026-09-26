import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

// Called by the sign-out handler to force the splash to show again.
export function resetSplash() { useStore.getState().setShowSplash(true) }

const TAGLINE = "India's First Fraud-Free Cricket Platform"

// Deterministic particles — no Math.random so no layout shift
const PARTICLES = [
  { size: 6,  left: '7%',  delay: 0,   dur: 9  },
  { size: 10, left: '22%', delay: 2.5, dur: 12 },
  { size: 5,  left: '38%', delay: 5,   dur: 10 },
  { size: 8,  left: '55%', delay: 1,   dur: 14 },
  { size: 11, left: '70%', delay: 3.5, dur: 8  },
  { size: 7,  left: '84%', delay: 6,   dur: 11 },
  { size: 9,  left: '15%', delay: 4,   dur: 13 },
  { size: 5,  left: '63%', delay: 7,   dur: 9  },
  { size: 7,  left: '46%', delay: 8,   dur: 10 },
]

export default function SplashOverlay() {
  const { user, showSplash, setShowSplash } = useStore()
  const navigate = useNavigate()
  const [fading, setFading] = useState(false)
  const [ready, setReady]   = useState(false)

  const dismissTo = (path) => {
    setFading(true)
    if (path) navigate(path)
    setTimeout(() => { setShowSplash(false); setFading(false) }, 600)
  }

  useEffect(() => {
    if (!showSplash) return
    setReady(false)
    const t = setTimeout(() => setReady(true), 500)
    return () => clearTimeout(t)
  }, [showSplash])

  if (!showSplash) return null

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden select-none touch-none"
      style={{
        zIndex: 9999,
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.65s ease',
        background: 'linear-gradient(160deg, #0a0118 0%, #120520 55%, #07021a 100%)',
      }}
    >
      {/* ── Background animations ─────────────────────────────── */}

      {/* Rotating outer ring glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 500, height: 500,
          top: '50%', left: '50%',
          marginTop: -250, marginLeft: -250,
          borderRadius: '50%',
          background: 'conic-gradient(from 0deg, transparent 60%, rgba(124,58,237,0.10) 75%, transparent 90%)',
          animation: 'splashRotate 12s linear infinite',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: 320, height: 320,
          top: '50%', left: '50%',
          marginTop: -160, marginLeft: -160,
          borderRadius: '50%',
          background: 'conic-gradient(from 180deg, transparent 60%, rgba(167,139,250,0.07) 75%, transparent 90%)',
          animation: 'splashRotate 18s linear infinite reverse',
        }}
      />

      {/* Cricket ground grid */}
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

      {/* Center pitch glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 55% 38% at 50% 38%, rgba(124,58,237,0.12) 0%, transparent 70%)' }}
      />

      {/* Light sweep */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ opacity: 0.5 }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0, bottom: 0,
            left: 0, width: '45%',
            background: 'linear-gradient(105deg, transparent 20%, rgba(124,58,237,0.08) 50%, transparent 80%)',
            animation: 'splashSweep 9s ease-in-out infinite',
            animationDelay: '2s',
          }}
        />
      </div>

      {/* Floating cricket ball particles */}
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: p.size,
            height: p.size,
            left: p.left,
            bottom: '-16px',
            background: `radial-gradient(circle at 35% 35%, rgba(167,139,250,0.85), rgba(91,33,182,0.5))`,
            boxShadow: '0 0 6px rgba(124,58,237,0.6)',
            animation: `splashFloat ${p.dur}s ease-in infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* ── Top content: logo + brand + taglines ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        {/* Logo with pulse glow */}
        <div
          style={{
            width: 84, height: 84,
            borderRadius: 22,
            background: '#7C3AED',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
            animation: 'splashPulse 3s ease-in-out infinite',
            opacity: 1,
            transform: ready ? 'scale(1) translateY(0)' : 'scale(0.4) translateY(24px)',
            transition: 'transform 0.75s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          <span style={{ color: '#fff', fontWeight: 900, fontSize: 32, letterSpacing: '-0.03em', lineHeight: 1 }}>CY</span>
        </div>

        {/* Brand name */}
        <h1
          style={{
            color: '#fff',
            fontSize: 44,
            fontWeight: 800,
            letterSpacing: '-0.025em',
            lineHeight: 1,
            marginBottom: 14,
            opacity: ready ? 1 : 0,
            transform: ready ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s ease 0.3s, transform 0.6s ease 0.3s',
          }}
        >
          CricYaar
        </h1>

        {/* Static tagline */}
        <p
          style={{
            color: 'rgba(255,255,255,0.72)',
            fontSize: 15,
            lineHeight: 1.45,
            textAlign: 'center',
            padding: '0 16px',
            opacity: ready ? 1 : 0,
            transform: ready ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}
        >
          {TAGLINE}
        </p>
      </div>

      {/* ── Bottom: CTA ── */}
      <div className="px-5 pb-12 pt-2 flex flex-col gap-3 max-w-sm mx-auto w-full relative z-10">
        {/* CTAs */}
        <div
          style={{
            opacity: ready ? 1 : 0,
            transform: ready ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.55s ease 0.2s, transform 0.55s ease 0.2s',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {user ? (
            <button
              onClick={() => dismissTo('/')}
              style={{
                width: '100%', padding: '16px', borderRadius: 16,
                background: '#7C3AED',
                color: '#fff', fontSize: 16, fontWeight: 700,
                border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 24px rgba(124,58,237,0.55)',
              }}
            >
              Continue to App →
            </button>
          ) : (
            <>
              <button
                onClick={() => dismissTo('/login?mode=signup')}
                style={{
                  width: '100%', padding: '16px', borderRadius: 16,
                  background: '#7C3AED',
                  color: '#fff', fontSize: 16, fontWeight: 700,
                  border: 'none', cursor: 'pointer',
                  boxShadow: '0 4px 24px rgba(124,58,237,0.55)',
                }}
              >
                Create Account
              </button>
              <button
                onClick={() => dismissTo('/login?mode=login')}
                style={{
                  width: '100%', padding: '16px', borderRadius: 16,
                  background: 'transparent',
                  color: 'var(--cy-secondary,#C4B5FD)', fontSize: 16, fontWeight: 700,
                  border: '2px solid var(--cy-secondary-50, rgba(196,181,253,0.5))',
                  cursor: 'pointer',
                }}
              >
                Log In
              </button>
              <p style={{
                textAlign: 'center', fontSize: 11,
                color: 'rgba(255,255,255,0.38)', lineHeight: 1.6, marginTop: 4,
              }}>
                By continuing you agree to our{' '}
                <span style={{ color: '#A78BFA', textDecoration: 'underline' }}>Terms of Service</span>
                {' '}and{' '}
                <span style={{ color: '#A78BFA', textDecoration: 'underline' }}>Privacy Policy</span>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
