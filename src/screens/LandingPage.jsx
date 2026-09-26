import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../store/useStore'

const STATS = [
  { value: '142K+', label: 'Matches'  },
  { value: '15K+',  label: 'Players'  },
  { value: '1.2K+', label: 'Teams'    },
  { value: '98%',   label: 'Verified' },
]

export default function LandingPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { user }  = useStore()
  const [visible, setVisible] = useState(false)
  // ?from=signout means we just logged out — don't redirect to app
  const fromSignout = new URLSearchParams(location.search).get('from') === 'signout'

  useEffect(() => {
    if (user && !fromSignout) {
      navigate('/', { replace: true })
      return
    }
    const t1 = setTimeout(() => setVisible(true), 120)
    const t2 = setTimeout(() => navigate('/welcome', { replace: true }), 2800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, []) // eslint-disable-line

  return (
    <div className="min-h-dvh bg-[#09111f] flex flex-col items-center justify-center px-6 relative overflow-hidden select-none">
      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-[80px] pointer-events-none" style={{ background:'rgba(124,58,237,0.18)' }} />
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-[60px] pointer-events-none" style={{ background:'rgba(92,33,182,0.12)' }} />

      {/* Pitch line overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
        {[15, 29, 43, 57, 71].map(pct => (
          <div key={pct} className="absolute w-full h-px bg-white" style={{ top: `${pct}%` }} />
        ))}
      </div>

      <div
        className="relative z-10 flex flex-col items-center text-center"
        style={{
          opacity:   visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(22px)',
          transition: 'opacity 0.6s ease, transform 0.7s cubic-bezier(0.34,1.4,0.64,1)',
        }}
      >
        {/* Logo mark */}
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
            boxShadow: '0 0 48px rgba(124,58,237,0.5), 0 8px 24px rgba(0,0,0,0.5)',
          }}
        >
          <span className="text-white font-black text-3xl tracking-tight">CY</span>
        </div>

        <h1 className="text-white font-black text-[2.6rem] leading-none tracking-tight mb-2">
          CricYaar
        </h1>

        <p
          className="font-extrabold text-[10px] tracking-[0.28em] uppercase mb-10"
          style={{ color: '#7C3AED' }}
        >
          Your Game. Your Record. For Real.
        </p>

        {/* Stats row */}
        <div className="flex gap-7">
          {STATS.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center gap-0.5">
              <span className="text-white font-black text-lg tabular-nums leading-none">{value}</span>
              <span className="text-white/35 text-[9px] uppercase tracking-wider">{label}</span>
            </div>
          ))}
        </div>

        {/* Pulse dots */}
        <div className="flex gap-2 mt-14">
          {[0, 0.3, 0.6].map((d, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: 'rgba(255,255,255,0.25)',
                animation: `ldPulse 1.3s ${d}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>
        <style>{`
          @keyframes ldPulse {
            0%,100%{opacity:0.25;transform:scale(1)}
            50%{opacity:0.9;transform:scale(1.5)}
          }
        `}</style>
      </div>
    </div>
  )
}
