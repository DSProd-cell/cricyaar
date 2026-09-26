import { useEffect, useState } from 'react'

function playFanfare(primary) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25]
    notes.forEach((freq, i) => {
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      const dist = ctx.createWaveShaper()
      const curve = new Float32Array(256)
      for (let j = 0; j < 256; j++) { const x = (j * 2) / 256 - 1; curve[j] = (3 + 20) * x * 20 * (Math.PI / 180) / (Math.PI + 20 * Math.abs(x)) }
      dist.curve = curve
      osc.connect(dist); dist.connect(gain); gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = i < 4 ? 'square' : 'sawtooth'
      const t = ctx.currentTime + i * 0.13
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.18, t + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
      osc.start(t); osc.stop(t + 0.45)
    })
    // boom on beat 2
    const boom = ctx.createOscillator()
    const bGain = ctx.createGain()
    boom.connect(bGain); bGain.connect(ctx.destination)
    boom.frequency.setValueAtTime(80, ctx.currentTime + 0.52)
    boom.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.72)
    bGain.gain.setValueAtTime(0.5, ctx.currentTime + 0.52)
    bGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.72)
    boom.start(ctx.currentTime + 0.52); boom.stop(ctx.currentTime + 0.75)
  } catch (_) {}
}

const SHAPES = ['●','■','▲','★','♦','✦','◆']

function Confetti({ colors }) {
  const [particles] = useState(() =>
    Array.from({ length: 70 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 1.5,
      dur: 2.4 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      size: 8 + Math.random() * 12,
      drift: (Math.random() - 0.5) * 160,
    }))
  )
  return (
    <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden', zIndex:1 }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position:'absolute', left:`${p.x}%`, top:'-20px',
          color: p.color, fontSize:`${p.size}px`,
          animation:`iplCfFall ${p.dur}s ${p.delay}s ease-in forwards`,
          '--d':`${p.drift}px`,
        }}>{p.shape}</div>
      ))}
    </div>
  )
}

export default function IplCelebrationOverlay({ team, onDone }) {
  const [phase, setPhase] = useState(0) // 0=enter, 1=tagline, 2=ready

  useEffect(() => {
    playFanfare(team.primary)
    const t1 = setTimeout(() => setPhase(1), 500)
    const t2 = setTimeout(() => setPhase(2), 1800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      background: team.gradient,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <Confetti colors={[team.primary, team.secondary, '#ffffff', '#FFD700']} />

      {/* Glow orbs */}
      <div style={{ position:'absolute', top:'10%', left:'50%', transform:'translateX(-50%)', width:400, height:400, borderRadius:'50%', background:`radial-gradient(ellipse,${team.glow} 0%,transparent 70%)`, pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'5%', right:'10%', width:240, height:240, borderRadius:'50%', background:`radial-gradient(ellipse,${team.secondaryGlow} 0%,transparent 70%)`, pointerEvents:'none' }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        padding: '0 28px', maxWidth: 340,
        opacity: phase >= 0 ? 1 : 0,
        transform: phase >= 0 ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
        transition: 'all 0.6s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        {/* Team emoji big */}
        <div style={{
          fontSize: 80, lineHeight: 1, marginBottom: 12,
          animation: 'iplBounce 0.8s cubic-bezier(0.34,1.56,0.64,1) both',
          filter: `drop-shadow(0 0 30px ${team.glow})`,
        }}>
          {team.emoji}
        </div>

        {/* Short name */}
        <div style={{
          fontSize: 56, fontWeight: 900, letterSpacing: '0.1em',
          color: team.primary,
          textShadow: `0 0 40px ${team.glow}, 0 0 80px ${team.glow}`,
          animation: 'iplSlideUp 0.5s 0.1s cubic-bezier(0.34,1.36,0.64,1) both',
          marginBottom: 4,
        }}>
          {team.short}
        </div>

        {/* Full name */}
        <div style={{
          color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 600,
          letterSpacing: '0.08em', marginBottom: 28,
          animation: 'iplSlideUp 0.5s 0.2s cubic-bezier(0.34,1.36,0.64,1) both',
        }}>
          {team.name.toUpperCase()}
        </div>

        {/* Tagline */}
        <div style={{
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.9)',
          transition: 'all 0.55s cubic-bezier(0.34,1.56,0.64,1)',
          marginBottom: 8,
        }}>
          <p style={{
            color: '#fff', fontSize: 22, fontWeight: 900,
            margin: '0 0 6px', letterSpacing: '-0.01em',
            textShadow: `0 2px 20px ${team.glow}`,
          }}>
            {team.tagline}
          </p>
          <p style={{ color: team.secondary, fontSize: 12, margin: 0, fontStyle:'italic', opacity: 0.85 }}>
            {team.taglineSub}
          </p>
        </div>

        {/* Divider */}
        <div style={{
          width: 60, height: 2,
          background: `linear-gradient(90deg,transparent,${team.primary},${team.secondary},transparent)`,
          margin: '20px auto 24px',
          opacity: phase >= 1 ? 1 : 0,
          transition: 'opacity 0.4s 0.2s',
        }} />

        {/* App theme changed note */}
        <p style={{
          color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: '0 0 24px',
          opacity: phase >= 1 ? 1 : 0,
          transition: 'opacity 0.4s 0.3s',
        }}>
          ✨ CricYaar now wears your team's colours
        </p>

        {/* CTA */}
        <button
          onClick={onDone}
          style={{
            padding: '16px 40px', borderRadius: 40,
            background: team.primary, color: team.textOnPrimary,
            fontWeight: 900, fontSize: 16, border: 'none', cursor: 'pointer',
            boxShadow: `0 6px 32px ${team.glow}`,
            opacity: phase >= 2 ? 1 : 0,
            transform: phase >= 2 ? 'scale(1)' : 'scale(0.85)',
            transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
            letterSpacing: '0.02em',
          }}
        >
          🏏 Let's Play!
        </button>
      </div>

      <style>{`
        @keyframes iplCfFall{0%{transform:translateY(0) translateX(0) rotate(0deg);opacity:1}80%{opacity:1}100%{transform:translateY(110vh) translateX(var(--d)) rotate(720deg);opacity:0}}
        @keyframes iplBounce{0%{transform:scale(0) rotate(-20deg);opacity:0}60%{transform:scale(1.2) rotate(5deg);opacity:1}100%{transform:scale(1) rotate(0deg);opacity:1}}
        @keyframes iplSlideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
      `}</style>
    </div>
  )
}
