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

  return (
    <div className="min-h-dvh bg-gradient-to-br from-brand-50 via-white to-slate-50 flex flex-col items-center justify-center p-6">
      {/* Logo area */}
      <div className="flex flex-col items-center mb-12 animate-fade-in">
        <div className="w-20 h-20 bg-brand-500 rounded-3xl flex items-center justify-center mb-5 shadow-xl shadow-brand-500/30">
          <span className="text-white font-black text-3xl tracking-tight">CY</span>
        </div>
        <h1 className="text-4xl font-extrabold text-navy-900 tracking-tight">CricYaar</h1>
        <p className="text-brand-500 mt-2 text-[11px] font-bold tracking-[0.2em] uppercase">Your Game. Your Record. For Real.</p>
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
