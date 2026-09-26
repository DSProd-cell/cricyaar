import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

// Confetti particle colors
const COLORS = ['#16a34a','#2563eb','#d97706','#dc2626','#7c3aed','#0891b2','#be185d']
const SHAPES = ['●','■','▲','★','♦']

function Confetti() {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    const p = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 1.5,
      duration: 2.5 + Math.random() * 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      size: 8 + Math.random() * 10,
      drift: (Math.random() - 0.5) * 120,
    }))
    setParticles(p)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: '-20px',
            color: p.color,
            fontSize: `${p.size}px`,
            animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
            '--drift': `${p.drift}px`,
          }}
        >
          {p.shape}
        </div>
      ))}
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(0) translateX(0) rotate(0deg); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(110vh) translateX(var(--drift)) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

export default function Celebration() {
  const navigate = useNavigate()
  const { user, pendingSignup } = useStore()
  const firstName = pendingSignup?.firstName || user?.name?.split(' ')[0] || 'Yaar'
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Small delay for dramatic entrance
    const t = setTimeout(() => setShow(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-dvh bg-gradient-to-br from-brand-900 via-brand-800 to-navy-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <Confetti />

      {/* Cricket pitch lines decoration */}
      <div className="absolute inset-0 opacity-5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute w-full h-px bg-white" style={{ top: `${15 + i * 14}%` }} />
        ))}
      </div>

      {/* Content */}
      <div
        className="relative z-20 text-center max-w-sm"
        style={{
          opacity: show ? 1 : 0,
          transform: show ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
          transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Cricket ball emoji celebration */}
        <div className="text-7xl mb-4" style={{ animation: 'bounce 1s ease-in-out infinite alternate' }}>
          🏏
        </div>
        <style>{`@keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-12px); } }`}</style>

        <h1 className="text-white font-black text-3xl leading-tight mb-2">
          Now you're a<br />
          <span className="text-brand-300">Yaar of Mine,</span><br />
          {firstName}! 🎉
        </h1>

        <p className="text-brand-200 text-sm leading-relaxed mt-4 mb-8">
          Your jersey's hanging in the dugout.<br />
          Before we hit the field — there's a chance<br />
          <span className="text-white font-semibold">your cricket story is already here.</span>{' '}
          Let's see if your records, stats, and seasons<br />
          are waiting to be claimed.
        </p>

        <button
          onClick={() => navigate('/player-match')}
          className="w-full py-4 bg-white text-navy-900 font-bold rounded-2xl text-base shadow-xl shadow-black/30 hover:bg-brand-50 transition-colors mb-3"
        >
          Find My Cricket Story →
        </button>

        <button
          onClick={() => navigate('/setup')}
          className="w-full py-3 text-brand-300 font-medium text-sm hover:text-white transition-colors"
        >
          I'm new here — start fresh
        </button>
      </div>
    </div>
  )
}
