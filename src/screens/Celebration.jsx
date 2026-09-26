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
    <div style={{ minHeight:'100dvh', background:'linear-gradient(160deg,#1a0533 0%,#2D1B69 40%,#4C1D95 75%,#1a0533 100%)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px', position:'relative', overflow:'hidden' }}>
      <Confetti />

      {/* Glowing orbs */}
      <div style={{ position:'absolute', top:'15%', left:'50%', transform:'translateX(-50%)', width:320, height:320, borderRadius:'50%', background:'radial-gradient(ellipse,rgba(124,58,237,0.18) 0%,transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'10%', left:'20%', width:180, height:180, borderRadius:'50%', background:'radial-gradient(ellipse,rgba(196,181,253,0.08) 0%,transparent 70%)', pointerEvents:'none' }} />

      <div
        style={{
          position:'relative', zIndex:20, display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', maxWidth:300,
          opacity: show ? 1 : 0,
          transform: show ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
          transition: 'all 0.55s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* CY Logo */}
        <div style={{ width:56, height:56, background:'linear-gradient(135deg,#7C3AED,#5B21B6)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20, boxShadow:'0 0 0 2px rgba(196,181,253,0.2), 0 0 28px rgba(124,58,237,0.5)' }}>
          <span style={{ color:'#fff', fontWeight:900, fontSize:20, letterSpacing:'-0.04em' }}>CY</span>
        </div>

        {/* Emoji */}
        <div style={{ fontSize:64, marginBottom:16, animation:'celebBounce 1s ease-in-out infinite alternate' }}>
          🏏
        </div>
        <style>{`@keyframes celebBounce{from{transform:translateY(0)}to{transform:translateY(-10px)}}`}</style>

        {/* Headline */}
        <h1 style={{ color:'#fff', fontWeight:900, fontSize:30, lineHeight:1.2, marginBottom:8 }}>
          Pitch Pe Mil Gaye,<br />
          <span style={{ color:'#C4B5FD' }}>{firstName}! 🤝</span>
        </h1>
        <p style={{ color:'#A78BFA', fontSize:10, fontWeight:800, letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:4 }}>
          CricYaar — Your Game. Your Record. For Real.
        </p>

        {/* Subtext */}
        <p style={{ color:'rgba(255,255,255,0.65)', fontSize:14, lineHeight:1.6, marginTop:12, marginBottom:8 }}>
          Every run, wicket & catch you play is now<br />
          <span style={{ color:'#C4B5FD', fontWeight:600 }}>verified and fraud-proof</span> — for life.
        </p>

        {/* Trust badges */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16, margin:'12px 0' }}>
          {['✅ Verified Stats', '🏏 Live Scoring', '🏆 Tournaments'].map(b => (
            <span key={b} style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.5)', textAlign:'center', lineHeight:1.3 }}>{b}</span>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/ipl-pick')}
          style={{ width:'100%', padding:'16px', background:'var(--cy-primary,#7C3AED)', color:'#fff', fontWeight:900, borderRadius:16, fontSize:15, border:'none', cursor:'pointer', boxShadow:'0 4px 24px var(--cy-glow,rgba(124,58,237,0.55))', marginBottom:12, transition:'transform 0.1s', }}
          onMouseDown={e=>e.currentTarget.style.transform='scale(0.98)'}
          onMouseUp={e=>e.currentTarget.style.transform='scale(1)'}
        >
          🏏 Choose Your IPL Team — See the Magic!
        </button>

        <button
          onClick={() => navigate('/city-select')}
          style={{ width:'100%', padding:'14px', background:'transparent', border:'1px solid rgba(196,181,253,0.2)', color:'rgba(255,255,255,0.6)', fontWeight:500, borderRadius:16, fontSize:14, cursor:'pointer' }}
        >
          Skip — Pick My City →
        </button>
      </div>
    </div>
  )
}
