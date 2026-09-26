import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

export default function Welcome() {
  const navigate = useNavigate()
  const { user } = useStore()

  // If already authenticated, skip to home (must be in useEffect — not render phase)
  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const FLOATERS = [
    { icon: '🏏', x: '12%',  animDur: '6s',   animDelay: '0s',   size: 28, opacity: 0.18 },
    { icon: '🏆', x: '78%',  animDur: '8s',   animDelay: '1.2s', size: 22, opacity: 0.14 },
    { icon: '⭐', x: '30%',  animDur: '7s',   animDelay: '2.5s', size: 18, opacity: 0.20 },
    { icon: '🎯', x: '62%',  animDur: '9s',   animDelay: '0.8s', size: 16, opacity: 0.15 },
    { icon: '✨', x: '88%',  animDur: '5.5s', animDelay: '3.1s', size: 14, opacity: 0.22 },
    { icon: '🏏', x: '50%',  animDur: '10s',  animDelay: '1.8s', size: 20, opacity: 0.10 },
    { icon: '⭐', x: '8%',   animDur: '7.5s', animDelay: '4s',   size: 12, opacity: 0.18 },
    { icon: '🏆', x: '42%',  animDur: '6.5s', animDelay: '2s',   size: 26, opacity: 0.10 },
  ]

  return (
    <div className="min-h-dvh bg-gradient-to-br from-brand-50 via-white to-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Floating cricket icons */}
      {FLOATERS.map((f, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: f.x,
            bottom: '-40px',
            fontSize: f.size,
            opacity: f.opacity,
            pointerEvents: 'none',
            animation: `floatUp ${f.animDur} ${f.animDelay} ease-in-out infinite`,
            userSelect: 'none',
          }}
        >
          {f.icon}
        </div>
      ))}
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0)    rotate(0deg);  opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(-110vh) rotate(25deg); opacity: 0; }
        }
      `}</style>
      {/* Logo area */}
      <div className="flex flex-col items-center mb-12 animate-fade-in">
        <div className="w-20 h-20 bg-brand-500 rounded-3xl flex items-center justify-center mb-5 shadow-xl shadow-brand-500/30">
          <span className="text-white font-black text-3xl tracking-tight">CY</span>
        </div>
        <h1 className="text-4xl font-extrabold text-navy-900 tracking-tight">CricYaar</h1>
        <p className="text-brand-500 mt-2 text-[11px] font-extrabold tracking-[0.2em] uppercase">Your Game. Your Record. For Real.</p>
      </div>

      {/* Action buttons */}
      <div className="w-full max-w-sm space-y-3 animate-slide-up">
        <button
          className="btn-primary w-full text-base py-4"
          onClick={() => navigate('/login?mode=signup')}
        >
          Create Account
        </button>
        <button
          className="w-full py-4 rounded-2xl font-bold text-brand-600 border-2 border-brand-400 bg-white hover:bg-brand-50 transition-colors text-base"
          onClick={() => navigate('/login?mode=login')}
        >
          Log In
        </button>
      </div>

      {/* Legal */}
      <p className="mt-8 text-center text-xs text-navy-400 max-w-xs leading-relaxed animate-fade-in" style={{ animationDelay:'0.2s' }}>
        By continuing you agree to our{' '}
        <button className="text-brand-500 font-medium underline-offset-2 hover:underline">Terms of Service</button>
        {' '}and{' '}
        <button className="text-brand-500 font-medium underline-offset-2 hover:underline">Privacy Policy</button>
      </p>
    </div>
  )
}

