import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../store/useStore'

function easeOut(t) { return 1 - Math.pow(1 - t, 3) }

export default function YareinWelcome() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useStore()
  const record = location.state?.record || null

  const [show, setShow] = useState(false)
  const [progress, setProgress] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 200)
    return () => clearTimeout(t)
  }, [])

  // Animate stats counter
  useEffect(() => {
    if (!show) return
    const start = performance.now()
    const dur = 1400
    const tick = now => {
      const p = Math.min((now - start) / dur, 1)
      setProgress(easeOut(p))
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [show])

  const stats = record
    ? [
        { label: 'Matches', value: record.matches },
        { label: 'Runs', value: record.runs },
        { label: 'MoMs', value: record.mom },
      ]
    : [
        { label: 'Matches', value: 0 },
        { label: 'Runs', value: 0 },
        { label: 'MoMs', value: 0 },
      ]

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg, #0a0118 0%, #120520 55%, #07021a 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center',
      overflow: 'hidden',
      position: 'relative',
    }}>

      {/* Stadium glow from top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 260,
        background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(124,58,237,0.35) 0%, transparent 80%)',
        pointerEvents: 'none',
      }} />

      {/* Floating particles */}
      {['15%','35%','55%','75%','90%'].map((left, i) => (
        <div key={i} style={{
          position: 'absolute',
          left, bottom: '-10px',
          width: 6 + i * 2, height: 6 + i * 2,
          borderRadius: '50%',
          background: `rgba(167,139,250,${0.4 + i * 0.1})`,
          animation: `floatUp ${8 + i * 2}s ease-in infinite`,
          animationDelay: `${i * 1.5}s`,
          pointerEvents: 'none',
        }} />
      ))}

      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0); opacity: 0.8 }
          100% { transform: translateY(-100vh); opacity: 0 }
        }
        @keyframes scaleIn {
          0% { transform: scale(0.5) translateY(20px); opacity: 0 }
          100% { transform: scale(1) translateY(0); opacity: 1 }
        }
        @keyframes slideUp {
          0% { transform: translateY(30px); opacity: 0 }
          100% { transform: translateY(0); opacity: 1 }
        }
      `}</style>

      {/* Main content */}
      <div style={{
        flex: 1, width: '100%', maxWidth: 420,
        padding: '48px 20px 0',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        position: 'relative', zIndex: 1,
      }}>

        {/* Pitch strip */}
        <div style={{
          width: 48, height: 5, borderRadius: 5,
          background: 'linear-gradient(90deg, #7C3AED, #A78BFA)',
          marginBottom: 20,
          opacity: show ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }} />

        {/* Main icon */}
        <div style={{
          fontSize: 64, lineHeight: 1, marginBottom: 16,
          opacity: show ? 1 : 0,
          transform: show ? 'scale(1) translateY(0)' : 'scale(0.4) translateY(20px)',
          transition: 'all 0.7s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          🏟️
        </div>

        {/* Heading */}
        <h1 style={{
          color: '#fff', fontSize: 28, fontWeight: 900,
          letterSpacing: '-0.02em', textAlign: 'center',
          marginBottom: 6, lineHeight: 1.2,
          opacity: show ? 1 : 0,
          transform: show ? 'translateY(0)' : 'translateY(16px)',
          transition: 'all 0.6s ease 0.15s',
        }}>
          You're On The Field!
        </h1>

        <p style={{
          color: '#A78BFA', fontSize: 13, fontWeight: 600,
          textAlign: 'center', marginBottom: 4,
          opacity: show ? 1 : 0,
          transition: 'opacity 0.6s ease 0.25s',
        }}>
          Welcome to CricYaar Family · Yarein Group
        </p>

        {user?.name && (
          <p style={{
            color: 'rgba(255,255,255,0.45)', fontSize: 11,
            textAlign: 'center', marginBottom: 24,
            opacity: show ? 1 : 0,
            transition: 'opacity 0.6s ease 0.3s',
          }}>
            Congrats, {user.name}! Your innings deserve to be remembered.
          </p>
        )}

        {/* Stats row — animated counter */}
        {record && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
            gap: 10, width: '100%', marginBottom: 20,
            opacity: show ? 1 : 0,
            transform: show ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s ease 0.4s',
          }}>
            {stats.map((s, i) => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 14, padding: '14px 8px', textAlign: 'center',
                opacity: progress > i * 0.2 ? 1 : 0,
                transform: progress > i * 0.2 ? 'scale(1) translateY(0)' : 'scale(0.85) translateY(8px)',
                transition: 'opacity 0.4s ease, transform 0.4s ease',
              }}>
                <div style={{
                  color: '#fff', fontSize: 22, fontWeight: 900, lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {Math.floor(progress * s.value)}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Claimed match cards */}
        {record && (
          <div style={{
            width: '100%', marginBottom: 20,
            opacity: show ? 1 : 0,
            transform: show ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s ease 0.5s',
          }}>
            <p style={{
              color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10,
              textAlign: 'center',
            }}>
              Records linked to your profile
            </p>

            {/* Primary match card */}
            <div style={{
              background: 'rgba(124,58,237,0.1)',
              border: '1.5px solid rgba(124,58,237,0.4)',
              borderRadius: 14, padding: '12px 14px',
              display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'linear-gradient(135deg,#7C3AED,#5B21B6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, flexShrink: 0,
              }}>🏏</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#fff', fontSize: 13, fontWeight: 800 }}>{record.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10 }}>{record.club}</div>
              </div>
              <div style={{
                background: '#7C3AED', color: '#fff',
                fontSize: 9, fontWeight: 800, letterSpacing: '0.05em',
                borderRadius: 6, padding: '3px 8px', flexShrink: 0,
              }}>YAREIN</div>
            </div>

            {/* Match count note */}
            {record.matches > 1 && (
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, textAlign: 'center' }}>
                + {record.matches - 1} more match{record.matches - 1 > 1 ? 'es' : ''} linked
              </p>
            )}
          </div>
        )}

        {/* Yarein group badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 20, padding: '6px 16px',
          marginBottom: 28,
          opacity: show ? 1 : 0,
          transition: 'opacity 0.6s ease 0.6s',
        }}>
          <span style={{ fontSize: 14 }}>⚡</span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 600 }}>
            CricYaar Family · Yarein Group
          </span>
          <span style={{ fontSize: 14 }}>🏏</span>
        </div>
      </div>

      {/* CTAs */}
      <div style={{
        width: '100%', maxWidth: 420, padding: '0 20px 40px',
        display: 'flex', flexDirection: 'column', gap: 10,
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.6s ease 0.7s',
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            width: '100%', padding: '15px',
            background: 'linear-gradient(135deg,#7C3AED,#5B21B6)',
            border: 'none', borderRadius: 14,
            color: '#fff', fontSize: 15, fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 6px 24px rgba(124,58,237,0.5)',
          }}
        >
          Enter The Stadium →
        </button>
        <button
          onClick={() => navigate('/profile')}
          style={{
            width: '100%', padding: '13px',
            background: 'rgba(255,255,255,0.07)',
            border: '1.5px solid rgba(255,255,255,0.15)',
            borderRadius: 14,
            color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          View My Profile
        </button>
      </div>
    </div>
  )
}
