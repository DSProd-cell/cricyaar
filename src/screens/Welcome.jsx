import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

export default function Welcome() {
  const navigate = useNavigate()
  const { isAuthenticated } = useStore()

  // If already authenticated, skip to home
  if (isAuthenticated) {
    navigate('/', { replace: true })
    return null
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-brand-50 via-white to-slate-50 flex flex-col items-center justify-center p-6">
      {/* Logo area */}
      <div className="flex flex-col items-center mb-12 animate-fade-in">
        <div className="w-20 h-20 bg-brand-500 rounded-3xl flex items-center justify-center mb-5 shadow-xl shadow-brand-500/30">
          <span className="text-white font-black text-3xl tracking-tight">CY</span>
        </div>
        <h1 className="text-4xl font-extrabold text-navy-900 tracking-tight">CricYaar</h1>
        <p className="text-navy-400 mt-2 text-lg font-medium">Cricket. Organised.</p>
      </div>

      {/* Action buttons */}
      <div className="w-full max-w-sm space-y-3 animate-slide-up">
        <button
          className="btn-primary w-full text-base py-4"
          onClick={() => navigate('/login?mode=signup')}
        >
          Sign Up
        </button>
        <button
          className="w-full py-4 rounded-2xl font-bold text-brand-600 border-2 border-brand-400 bg-white hover:bg-brand-50 transition-colors text-base"
          onClick={() => navigate('/login?mode=login')}
        >
          Sign In
        </button>
      </div>

      {/* Legal */}
      <p className="mt-8 text-center text-xs text-navy-400 max-w-xs leading-relaxed animate-fade-in" style={{ animationDelay:'0.2s' }}>
        By continuing you agree to our{' '}
        <button className="text-brand-500 font-medium underline-offset-2 hover:underline">Terms of Service</button>
        {' '}and{' '}
        <button className="text-brand-500 font-medium underline-offset-2 hover:underline">Privacy Policy</button>
      </p>

      {/* Demo hint */}
      <p className="mt-4 text-xs text-navy-300 animate-fade-in" style={{ animationDelay:'0.3s' }}>
        Demo mode — tap either button to continue
      </p>
    </div>
  )
}
