import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

const COLORS = ['#16a34a','#2563eb','#d97706','#dc2626','#7c3aed','#0891b2','#be185d','#f59e0b']
const SHAPES = ['●','■','▲','★','♦','✦']

function Confetti() {
  const [particles, setParticles] = useState([])
  useEffect(() => {
    setParticles(Array.from({ length: 55 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 1.8,
      duration: 2.4 + Math.random() * 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      size: 7 + Math.random() * 10,
      drift: (Math.random() - 0.5) * 130,
    })))
  }, [])
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {particles.map(p => (
        <div key={p.id} style={{
          position:'absolute', left:`${p.x}%`, top:'-20px',
          color: p.color, fontSize:`${p.size}px`,
          animation:`cfFall ${p.duration}s ${p.delay}s ease-in forwards`,
          '--d':`${p.drift}px`,
        }}>{p.shape}</div>
      ))}
      <style>{`@keyframes cfFall{0%{transform:translateY(0) translateX(0) rotate(0deg);opacity:1}80%{opacity:1}100%{transform:translateY(110vh) translateX(var(--d)) rotate(720deg);opacity:0}}`}</style>
    </div>
  )
}

export default function Celebration() {
  const navigate = useNavigate()
  const { user, pendingSignup } = useStore()
  const firstName = pendingSignup?.firstName || user?.name?.split(' ')[0] || 'Yaar'
  const [show, setShow] = useState(false)

  useEffect(() => { const t = setTimeout(() => setShow(true), 80); return () => clearTimeout(t) }, [])

  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#0f4c1e] via-[#166534] to-[#14532d] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <Confetti />

      {/* Subtle pitch lines */}
      <div className="absolute inset-0 opacity-[0.06]">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="absolute w-full h-px bg-white" style={{ top:`${18 + i * 16}%` }} />
        ))}
      </div>

      <div
        className="relative z-20 flex flex-col items-center text-center max-w-xs"
        style={{
          opacity: show ? 1 : 0,
          transform: show ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
          transition: 'all 0.55s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* CY Logo */}
        <div className="w-14 h-14 bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center mb-5 shadow-xl">
          <span className="text-white font-black text-xl tracking-tight">CY</span>
        </div>

        {/* Emoji */}
        <div className="text-6xl mb-4" style={{ animation:'celebBounce 1s ease-in-out infinite alternate' }}>
          🏏
        </div>
        <style>{`@keyframes celebBounce{from{transform:translateY(0)}to{transform:translateY(-10px)}}`}</style>

        {/* Headline */}
        <h1 className="text-white font-black text-2xl leading-snug mb-1">
          You're officially in,<br />
          <span className="text-emerald-300">{firstName}!</span>
        </h1>
        <p className="text-white/60 text-sm mb-1">Welcome to CricYaar</p>

        {/* Subtext */}
        <p className="text-white/75 text-sm leading-relaxed mt-3 mb-8">
          Your cricket story might already be<br />
          waiting — let's find your records.
        </p>

        {/* Primary CTA */}
        <button
          onClick={() => navigate('/player-match')}
          className="w-full py-4 bg-white text-[#166534] font-bold rounded-2xl text-[15px] shadow-2xl shadow-black/40 hover:bg-emerald-50 transition-colors mb-3"
        >
          Find Me &amp; My Records →
        </button>

        {/* Secondary CTA */}
        <button
          onClick={() => navigate('/role-onboard')}
          className="w-full py-3.5 border border-white/25 text-white/80 font-medium rounded-2xl text-sm hover:bg-white/10 transition-colors"
        >
          I'm New to Any Cricketing Tool — Start Fresh
        </button>
      </div>
    </div>
  )
}
