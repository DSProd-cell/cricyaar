import { useEffect, useState } from 'react'

// ─── Team Sound Engine ─────────────────────────────────────────────────────
// Each team gets a completely unique sonic identity built from the Web Audio API.

function makeDistortion(ctx, amount = 20) {
  const ws = ctx.createWaveShaper()
  const n = 256, curve = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1
    curve[i] = ((Math.PI + amount) * x) / (Math.PI + amount * Math.abs(x))
  }
  ws.curve = curve
  return ws
}

function makeReverb(ctx, duration = 0.6) {
  const len = ctx.sampleRate * duration
  const buf = ctx.createBuffer(2, len, ctx.sampleRate)
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5)
  }
  const conv = ctx.createConvolver()
  conv.buffer = buf
  return conv
}

function tone(ctx, dest, freq, type, startT, dur, vol = 0.22, attack = 0.04) {
  const osc = ctx.createOscillator()
  const g   = ctx.createGain()
  osc.connect(g); g.connect(dest)
  osc.frequency.value = freq
  osc.type = type
  g.gain.setValueAtTime(0, startT)
  g.gain.linearRampToValueAtTime(vol, startT + attack)
  g.gain.exponentialRampToValueAtTime(0.001, startT + dur)
  osc.start(startT); osc.stop(startT + dur + 0.05)
}

function playFanfare(teamId) {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)()
    const now  = ctx.currentTime
    const rev  = makeReverb(ctx, 0.8)
    const dist = makeDistortion(ctx, 18)
    const master = ctx.createGain()
    master.gain.value = 0.9
    rev.connect(master); dist.connect(master); master.connect(ctx.destination)

    if (teamId === 'mi') {
      // Mumbai Indians — Deep ocean bass wave + thunderous power chords + "Duniya Hila Denge" triumphant blast
      for (let i = 0; i < 3; i++) {
        tone(ctx, dist, 55 - i * 5, 'sine', now + i * 0.12, 0.55, 0.7)          // sub bass hits
      }
      ;[293.66, 440.00, 587.33, 880.00].forEach((f, i) => {
        tone(ctx, dist, f, 'square', now + 0.38 + i * 0.10, 0.55, 0.22)
      })
      // Ocean wave sweep
      const sweep = ctx.createOscillator(); const sG = ctx.createGain()
      sweep.connect(sG); sG.connect(master)
      sweep.type = 'sine'
      sweep.frequency.setValueAtTime(120, now + 0.8); sweep.frequency.linearRampToValueAtTime(40, now + 1.8)
      sG.gain.setValueAtTime(0.5, now + 0.8); sG.gain.exponentialRampToValueAtTime(0.001, now + 1.9)
      sweep.start(now + 0.8); sweep.stop(now + 2.0)

    } else if (teamId === 'csk') {
      // CSK — Iconic Whistle Podu! — shrill referee whistle trill + brass horn fanfare
      const wFreqs = [2637, 2637, 2093, 2637, 2637, 3136, 2637]
      wFreqs.forEach((f, i) => {
        const lfo = ctx.createOscillator(); const lfoG = ctx.createGain()
        const whistle = ctx.createOscillator(); const wG = ctx.createGain()
        lfo.frequency.value = 8; lfo.type = 'sine'
        lfoG.gain.value = 60
        lfo.connect(lfoG); lfoG.connect(whistle.frequency)
        whistle.connect(wG); wG.connect(master)
        whistle.type = 'sine'; whistle.frequency.value = f
        const t = now + i * 0.13
        wG.gain.setValueAtTime(0, t); wG.gain.linearRampToValueAtTime(0.28, t + 0.02)
        wG.gain.exponentialRampToValueAtTime(0.001, t + 0.11)
        lfo.start(t); lfo.stop(t + 0.13)
        whistle.start(t); whistle.stop(t + 0.13)
      })
      // Brass fanfare after whistle
      ;[261.63, 329.63, 392.00, 523.25, 659.25].forEach((f, i) => {
        tone(ctx, rev, f, 'sawtooth', now + 0.95 + i * 0.11, 0.6, 0.18)
      })

    } else if (teamId === 'rcb') {
      // RCB — Distorted rock power chord crash + crowd roar rise
      const chordFreqs = [[110, 138.59, 164.81], [220, 277.18, 329.63]]
      chordFreqs.forEach((chord, ci) => {
        chord.forEach(f => tone(ctx, dist, f, 'sawtooth', now + ci * 0.35, 0.8, 0.25))
      })
      // Noise burst = crowd roar
      const bufLen = ctx.sampleRate * 0.8
      const noiseBuf = ctx.createBuffer(1, bufLen, ctx.sampleRate)
      const nd = noiseBuf.getChannelData(0)
      for (let i = 0; i < bufLen; i++) nd[i] = (Math.random() * 2 - 1) * Math.pow(i / bufLen, 0.3) * Math.pow(1 - i / bufLen, 0.5)
      const noiseS = ctx.createBufferSource(); const nG = ctx.createGain()
      const lpf = ctx.createBiquadFilter(); lpf.type = 'lowpass'; lpf.frequency.value = 800
      noiseS.buffer = noiseBuf; noiseS.connect(lpf); lpf.connect(nG); nG.connect(master)
      nG.gain.value = 0.6
      noiseS.start(now + 0.75)

    } else if (teamId === 'kkr') {
      // KKR — War drums: Korbo Lorbo Jeetbo thunder — deep taiko drums + dark bass horn
      const drumTimes = [0, 0.22, 0.44, 0.55, 0.66, 0.88]
      drumTimes.forEach(t => {
        const d = ctx.createOscillator(); const dG = ctx.createGain()
        d.connect(dG); dG.connect(dist)
        d.type = 'sine'; d.frequency.setValueAtTime(120, now + t); d.frequency.exponentialRampToValueAtTime(40, now + t + 0.18)
        dG.gain.setValueAtTime(0.9, now + t); dG.gain.exponentialRampToValueAtTime(0.001, now + t + 0.22)
        d.start(now + t); d.stop(now + t + 0.25)
      })
      // Dark bass horn
      ;[98, 123.47, 146.83, 196.00].forEach((f, i) => {
        tone(ctx, rev, f, 'square', now + 1.0 + i * 0.13, 0.7, 0.3)
      })

    } else if (teamId === 'dc') {
      // DC — Sharp Delhi capital bugle call — bright ascending trumpet fanfare
      ;[523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((f, i) => {
        tone(ctx, rev, f, 'sawtooth', now + i * 0.09, 0.5, 0.2, 0.02)
      })
      // Punchy drum accent
      for (let i = 0; i < 3; i++) {
        tone(ctx, dist, 80 - i * 8, 'sine', now + 0.5 + i * 0.15, 0.18, 0.5)
      }

    } else if (teamId === 'rr') {
      // RR — Halla Bol — royal Rajasthani folk instrument feel + festive fanfare
      const folkNotes = [392, 440, 493.88, 587.33, 493.88, 659.25, 587.33, 783.99]
      folkNotes.forEach((f, i) => {
        tone(ctx, rev, f, 'triangle', now + i * 0.10, 0.45, 0.2)
        tone(ctx, rev, f * 2, 'sine', now + i * 0.10, 0.35, 0.08)   // octave shimmer
      })

    } else if (teamId === 'srh') {
      // SRH — Rise Up Orange Army — fast climbing sunrise crescendo
      const riseFreqs = [220, 261.63, 329.63, 392, 493.88, 587.33, 739.99, 987.77]
      riseFreqs.forEach((f, i) => {
        tone(ctx, rev, f, 'sawtooth', now + i * 0.075, 0.45 + i * 0.02, 0.14 + i * 0.015)
      })
      tone(ctx, dist, 65, 'sine', now + 0.65, 0.5, 0.7)   // orange boom

    } else if (teamId === 'pbks') {
      // PBKS — Sher Di Dhaad — bhangra dhol pattern: ta-ta-ta-DHUM
      const dholPattern = [[0, 160, 0.12], [0.14, 180, 0.10], [0.26, 200, 0.10], [0.36, 90, 0.30],
                           [0.68, 160, 0.12], [0.82, 180, 0.10], [0.94, 200, 0.10], [1.04, 90, 0.30]]
      dholPattern.forEach(([t, f, dur]) => {
        const d = ctx.createOscillator(); const dG = ctx.createGain()
        d.connect(dG); dG.connect(dist)
        d.type = 'triangle'; d.frequency.setValueAtTime(f, now + t); d.frequency.exponentialRampToValueAtTime(f * 0.5, now + t + dur)
        dG.gain.setValueAtTime(0.6, now + t); dG.gain.exponentialRampToValueAtTime(0.001, now + t + dur)
        d.start(now + t); d.stop(now + t + dur + 0.05)
      })
      // Pungi (folk flute) melody on top
      ;[659.25, 783.99, 987.77, 783.99].forEach((f, i) => {
        tone(ctx, rev, f, 'triangle', now + 0.4 + i * 0.14, 0.35, 0.15)
      })

    } else if (teamId === 'lsg') {
      // LSG — Nawabi Lucknow — stately clarion call, regal ascending arpeggio
      ;[261.63, 329.63, 392.00, 523.25, 659.25, 783.99].forEach((f, i) => {
        tone(ctx, rev, f, 'sine', now + i * 0.13, 0.65, 0.2 + i * 0.01)
        if (i > 1) tone(ctx, rev, f * 1.5, 'triangle', now + i * 0.13 + 0.06, 0.3, 0.1)
      })
      tone(ctx, dist, 60, 'sine', now + 0.9, 0.45, 0.55)   // nawabi bass

    } else if (teamId === 'gt') {
      // GT — Aava Do Titans — clash of titans: anvil-style power + triumphant rise
      for (let i = 0; i < 4; i++) {
        tone(ctx, dist, 55 + i * 8, 'square', now + i * 0.08, 0.35, 0.55 - i * 0.05)
      }
      ;[392, 493.88, 587.33, 739.99, 987.77].forEach((f, i) => {
        tone(ctx, rev, f, 'sawtooth', now + 0.45 + i * 0.09, 0.55, 0.2)
      })
      tone(ctx, dist, 70, 'sine', now + 1.0, 0.35, 0.65)

    } else {
      // Default — generic cricket fanfare
      ;[261.63, 329.63, 392.00, 523.25, 659.25].forEach((f, i) => {
        tone(ctx, rev, f, 'square', now + i * 0.12, 0.55, 0.2)
      })
      tone(ctx, dist, 80, 'sine', now + 0.7, 0.35, 0.6)
    }
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
    playFanfare(team.id)
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
