import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

// ── Config ─────────────────────────────────────────────────────────────────
const FRIEND_COUNT = 2

// Pythagorean numerology: reduce name to single digit
function numerologyNumber(name = '') {
  const MAP = {A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,I:9,J:1,K:2,L:3,M:4,N:5,O:6,P:7,Q:8,R:9,S:1,T:2,U:3,V:4,W:5,X:6,Y:7,Z:8}
  let sum = name.toUpperCase().replace(/[^A-Z]/g,'').split('').reduce((a,c) => a + (MAP[c] || 0), 0)
  while (sum > 9) sum = String(sum).split('').reduce((a, b) => a + Number(b), 0)
  return sum || 7
}

function currentLevel(n) {
  if (n >= 15) return 4
  if (n >= 7)  return 3
  if (n >= 3)  return 2
  if (n >= 1)  return 1
  return 0
}

const LEVELS = [
  {
    level: 1, friendsNeeded: 1, earn: 'Get 1 month Pro',
    bg: 'linear-gradient(150deg,#7C3AED 0%,#4C1D95 100%)',
    activeSub: '1 month Pro free for both of you',
    reached: FRIEND_COUNT >= 1,
    steps: [
      { label: 'STEP 1', text: 'Share your unique CricYaar code with a cricket-playing friend' },
      { label: 'STEP 2', text: 'Your friend signs up on CricYaar and activates Pro (just ₹1/month)' },
      { label: 'STEP 3', text: 'You both get 1 month Pro FREE — start playing, scoring & winning!' },
    ],
  },
  {
    level: 2, friendsNeeded: 3, earn: 'Get 2 months Pro',
    bg: 'linear-gradient(150deg,#2563EB 0%,#1E3A8A 100%)',
    activeSub: '2 months Pro on every referral',
    reached: FRIEND_COUNT >= 3,
    steps: [
      { label: 'STEP 1', text: 'Invite 3 friends using your referral code or link' },
      { label: 'STEP 2', text: 'Each friend activates their Pro plan (₹1/month)' },
      { label: 'STEP 3', text: 'You unlock 2 months Pro on every single referral — stack them up!' },
    ],
  },
  {
    level: 3, friendsNeeded: 7, earn: 'Get 3 months Pro',
    bg: 'linear-gradient(150deg,#059669 0%,#064E3B 100%)',
    activeSub: '3 months Pro on every referral',
    reached: FRIEND_COUNT >= 7,
    steps: [
      { label: 'STEP 1', text: 'Build your cricket squad — get 7 friends on CricYaar' },
      { label: 'STEP 2', text: 'Each of your 7 referrals joins CricYaar Pro' },
      { label: 'STEP 3', text: 'Every new referral now earns you 3 months Pro — free forever!' },
    ],
  },
  {
    level: 4, friendsNeeded: 15, earn: 'Get 4 months Pro',
    bg: 'linear-gradient(150deg,#9333EA 0%,#581C87 100%)',
    activeSub: '4 months Pro on every referral',
    reached: FRIEND_COUNT >= 15,
    steps: [
      { label: 'STEP 1', text: 'Become the ultimate CricYaar ambassador — invite 15 friends' },
      { label: 'STEP 2', text: 'All 15 friends activate their Pro plans' },
      { label: 'STEP 3', text: 'You earn 4 months Pro on EVERY referral — for life. Maximum rewards!' },
    ],
  },
]

const myLevel = currentLevel(FRIEND_COUNT)

// ── Isometric 3D Gift Box (CRED style) ─────────────────────────────────────
function IsoCube({ accentColor = '#FFD700', size = 170 }) {
  // Isometric cube with ribbon
  const s  = size * 0.38       // half-width of top face
  const h  = size * 0.50       // height of side faces
  const cx = size / 2
  const ty = size * 0.15       // top Y of top face center

  // Top face rhombus points
  const top   = [cx,    ty]
  const right = [cx+s,  ty + s*0.52]
  const bot   = [cx,    ty + s*1.04]
  const left  = [cx-s,  ty + s*0.52]

  // Left face  (top-left → bot-left → bot-center → bot-of-top)
  const lBL = [left[0],  left[1]+h]
  const lBC = [bot[0],   bot[1]+h]

  // Right face
  const rBR = [right[0], right[1]+h]

  // Shadow ellipse
  const shY = lBC[1] + size*0.04

  const poly = (pts) => pts.map(p => p.join(',')).join(' ')
  const rw = s * 0.18  // ribbon width

  // Diagonal ribbon lines on top face (X pattern)
  // Top-left to bot-right: left→right
  // Top-right to bot-left: top→bot
  const ribbonTopPath = `
    M ${left[0]+rw*0.5} ${left[1]}
    L ${left[0]+rw} ${left[1] - rw*0.26}
    L ${right[0]} ${right[1] - rw*0.26}
    L ${right[0] - rw*0.5} ${right[1]}
    Z
    M ${left[0]+rw*0.5} ${left[1]}
    L ${left[0]} ${left[1] + rw*0.26}
    L ${right[0] - rw} ${right[1] + rw*0.26}
    L ${right[0] - rw*0.5} ${right[1]}
    Z
  `
  // Simpler: two parallelograms on top
  const ribbonT1 = [
    [left[0],         left[1]],
    [left[0]+rw*1.1,  left[1]-rw*0.3],
    [right[0]+rw*0.1, right[1]-rw*0.3],
    [right[0]-rw,     right[1]],
  ]
  const ribbonT2 = [
    [top[0]-rw*0.55,  top[1]],
    [top[0]+rw*0.55,  top[1]],
    [bot[0]+rw*0.55,  bot[1]],
    [bot[0]-rw*0.55,  bot[1]],
  ]
  // Vertical ribbon on left face
  const midLeftX = (left[0]+bot[0])/2
  const ribbonL = [
    [midLeftX-rw*0.5, left[1]],
    [midLeftX+rw*0.5, left[1]],
    [lBC[0]+rw*0.5,   lBC[1]],
    [lBC[0]-rw*0.5,   lBC[1]],
  ]
  // Vertical ribbon on right face
  const midRightX = (right[0]+bot[0])/2
  const ribbonR = [
    [midRightX-rw*0.5, right[1]],
    [midRightX+rw*0.5, right[1]],
    [lBC[0]+rw*0.5,    lBC[1]],
    [lBC[0]-rw*0.5,    lBC[1]],
  ]

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible', animation: 'cubeFloat 3.5s ease-in-out infinite' }}>
      {/* Shadow */}
      <ellipse cx={cx} cy={shY} rx={s*1.1} ry={s*0.28} fill="rgba(0,0,0,0.45)" />

      {/* Left face */}
      <polygon points={poly([left,lBL,lBC,bot])} fill="#1a1a1a" />
      {/* Right face */}
      <polygon points={poly([right,rBR,lBC,bot])} fill="#222" />
      {/* Top face */}
      <polygon points={poly([top,right,bot,left])} fill="#2d2d2d" />

      {/* Edge lines */}
      <polygon points={poly([left,lBL,lBC,bot])}  fill="none" stroke="#444" strokeWidth="0.8" />
      <polygon points={poly([right,rBR,lBC,bot])} fill="none" stroke="#444" strokeWidth="0.8" />
      <polygon points={poly([top,right,bot,left])} fill="none" stroke="#555" strokeWidth="0.8" />

      {/* Ribbon – left face vertical */}
      <polygon points={poly(ribbonL)} fill={accentColor} opacity="0.9" />
      {/* Ribbon – right face vertical */}
      <polygon points={poly(ribbonR)} fill={accentColor} opacity="0.85" />
      {/* Ribbon – top face diagonals */}
      <polygon points={poly(ribbonT1)} fill={accentColor} />
      <polygon points={poly(ribbonT2)} fill={accentColor} />

      {/* Horizontal lid seam on left face */}
      <line x1={left[0]} y1={left[1]+h*0.28} x2={lBC[0]} y2={lBC[1]-h*0.72} stroke={accentColor} strokeWidth={rw*0.55} opacity="0.7" />
      {/* Horizontal lid seam on right face */}
      <line x1={right[0]} y1={right[1]+h*0.28} x2={lBC[0]} y2={lBC[1]-h*0.72} stroke={accentColor} strokeWidth={rw*0.55} opacity="0.65" />

      {/* Sparkles */}
      {[
        {x: cx-s*0.6, y: ty-12, r:2, delay:'0s'},
        {x: cx+s*0.7, y: ty-8,  r:1.5, delay:'0.6s'},
        {x: cx+s*1.1, y: ty+h*0.3, r:1.5, delay:'1.1s'},
        {x: cx-s*1.0, y: ty+h*0.4, r:2, delay:'0.3s'},
      ].map((sp, i) => (
        <circle key={i} cx={sp.x} cy={sp.y} r={sp.r} fill="#fff"
          style={{ animation: `sparkleOp 2.5s ${sp.delay} ease-in-out infinite` }} />
      ))}
    </svg>
  )
}

// ── Confetti burst (entrance animation) ────────────────────────────────────
function ConfettiBurst() {
  const pieces = [
    { color:'#7C3AED', x: 50, y: -40, rot: 45 },
    { color:'#FFD700', x: -60, y: -30, rot: -30 },
    { color:'#C4B5FD', x: 80, y: -20, rot: 60 },
    { color:'#FFD700', x: -40, y: -60, rot: 15 },
    { color:'#7C3AED', x: 30, y: -70, rot: -45 },
    { color:'#fff',    x:-70, y: -50, rot: 90 },
    { color:'#A78BFA', x: 60, y: -60, rot: -20 },
    { color:'#FFD700', x:-20, y: -80, rot: 35 },
  ]
  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:99, overflow:'hidden' }}>
      {pieces.map((p,i)=>(
        <div key={i} style={{
          position:'absolute', left:'50%', top:'40%',
          width:8, height:8,
          background: p.color,
          borderRadius: i%2===0 ? '50%' : 2,
          transform: `translate(${p.x}px,${p.y}px) rotate(${p.rot}deg)`,
          animation: `confettiBurst 1s ${i*0.06}s ease-out forwards`,
          opacity: 0,
        }} />
      ))}
    </div>
  )
}

// ── Level Card ──────────────────────────────────────────────────────────────
function LevelCard({ lvl, onClick }) {
  const locked = !lvl.reached
  const needed = Math.max(0, lvl.friendsNeeded - FRIEND_COUNT)

  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', flexShrink: 0, scrollSnapAlign: 'center',
        borderRadius: 18, overflow: 'hidden', position: 'relative',
        border: 'none', cursor: 'pointer', display: 'block', textAlign: 'left',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Level badge */}
      <div style={{
        position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)',
        background: '#FFD700', padding: '5px 28px', zIndex: 2, whiteSpace: 'nowrap',
        clipPath: 'polygon(8px 0%,calc(100% - 8px) 0%,100% 100%,0% 100%)',
      }}>
        <span style={{ fontSize:11, fontWeight:900, color:'#000', letterSpacing:'0.12em' }}>LEVEL {lvl.level}</span>
      </div>

      {/* Tap hint */}
      <div style={{
        position:'absolute', bottom:10, right:14, zIndex:2,
        fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.35)', letterSpacing:'0.08em',
        display:'flex', alignItems:'center', gap:4,
      }}>
        TAP TO LEARN MORE ›
      </div>

      {/* Card body */}
      <div style={{ background:lvl.bg, padding:'44px 20px 36px', width:'100%', boxSizing:'border-box' }}>
        {locked ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', height:128 }}>
            <svg width="26" height="32" viewBox="0 0 32 38" fill="none" style={{ marginBottom:10, opacity:0.65 }}>
              <rect x="4" y="18" width="24" height="18" rx="4" fill="white" fillOpacity="0.6"/>
              <path d="M9 18V13a7 7 0 0 1 14 0v5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.6"/>
              <circle cx="16" cy="27" r="2.5" fill="rgba(0,0,0,0.4)"/>
            </svg>
            <p style={{ color:'rgba(255,255,255,0.95)', fontSize:22, fontWeight:900, lineHeight:1.25, marginBottom:8 }}>
              {lvl.earn}
            </p>
            <p style={{ color:'rgba(255,255,255,0.45)', fontSize:13, lineHeight:1.4 }}>
              refer {lvl.friendsNeeded} friend{lvl.friendsNeeded>1?'s':''} to unlock
              {needed>0 && ` · ${needed} more to go`}
            </p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', height:128 }}>
            <div style={{ fontSize:32, lineHeight:1, marginBottom:6 }}>🎉</div>
            <p style={{ color:'#FFD700', fontSize:11, fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:5 }}>Unlocked!</p>
            <p style={{ color:'#fff', fontSize:24, fontWeight:900, lineHeight:1.2, marginBottom:5 }}>{lvl.earn}</p>
            <p style={{ color:'rgba(255,255,255,0.5)', fontSize:12, lineHeight:1.4 }}>{lvl.activeSub}</p>
          </div>
        )}
      </div>
    </button>
  )
}

// ── Step Animations ──────────────────────────────────────────────────────────
function JerseyAnim({ num, accent }) {
  return (
    <svg width="130" height="140" viewBox="0 0 130 140" style={{ overflow:'visible', marginBottom:4 }}>
      {/* glow */}
      <ellipse cx="65" cy="120" rx="42" ry="10" fill="rgba(124,58,237,0.18)" />
      {/* jersey body */}
      <path d="M30 45 L14 75 L42 70 L42 122 L88 122 L88 70 L116 75 L100 45 Q82 30 65 24 Q48 30 30 45 Z"
        fill={accent} style={{ animation:'jerseyGlow 2s ease-in-out infinite alternate' }} />
      {/* sleeve shading */}
      <path d="M30 45 L14 75 L28 72 L38 50 Z" fill="rgba(0,0,0,0.18)" />
      <path d="M100 45 L116 75 L102 72 L92 50 Z" fill="rgba(0,0,0,0.18)" />
      {/* collar */}
      <path d="M46 33 Q65 44 84 33" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="3" strokeLinecap="round" />
      {/* horizontal stripe */}
      <path d="M42 78 L88 78" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
      {/* number */}
      <text x="65" y="102" textAnchor="middle" fontSize="38" fontWeight="900" fill="#FFD700"
        style={{ animation:'numReveal 1.8s cubic-bezier(0.34,1.56,0.64,1) infinite alternate', fontFamily:'system-ui,sans-serif' }}>
        {num}
      </text>
      {/* sparkles around number */}
      {[[-28,-18],[28,-18],[0,-30],[34,6],[-34,6]].map(([dx,dy],i)=>(
        <circle key={i} cx={65+dx} cy={82+dy} r="2.5" fill="#FFD700"
          style={{ animation:`sparkleOp 2s ${i*0.38}s ease-in-out infinite` }} />
      ))}
    </svg>
  )
}

function StumpsAnim({ accent }) {
  return (
    <svg width="130" height="110" viewBox="0 0 130 110" style={{ overflow:'visible', marginBottom:4 }}>
      {/* ground */}
      <line x1="10" y1="98" x2="120" y2="98" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
      {/* stumps */}
      <g style={{ animation:'stumpsShakeS .25s ease-in-out 0.85s infinite alternate', transformOrigin:'65px 98px' }}>
        <rect x="50" y="52" width="7" height="46" rx="2.5" fill="#c8a05a" />
        <rect x="62" y="52" width="7" height="46" rx="2.5" fill="#c8a05a" />
        <rect x="74" y="52" width="7" height="46" rx="2.5" fill="#c8a05a" />
        <rect x="46" y="46" width="20" height="7" rx="2.5" fill="#e0c07a" />
        <rect x="69" y="46" width="20" height="7" rx="2.5" fill="#e0c07a" />
      </g>
      {/* ball */}
      <circle r="11" fill="#cc2200" stroke="#ff6655" strokeWidth="1"
        style={{ animation:'ballStrikeS 1.6s ease-in infinite' }}>
        <animateMotion dur="1.6s" repeatCount="indefinite" path="M18,68 Q40,62 62,65" />
      </circle>
      {/* seam on ball */}
      <ellipse cx="0" cy="0" rx="6" ry="11" fill="none" stroke="#fff" strokeWidth="1" opacity=".35"
        style={{ animation:'ballStrikeS 1.6s ease-in infinite' }}>
        <animateMotion dur="1.6s" repeatCount="indefinite" path="M18,68 Q40,62 62,65" />
      </ellipse>
      {/* explosion sparks */}
      <g style={{ animation:'explodeS 1.6s ease-out infinite', transformOrigin:'65px 56px' }}>
        {[[-22,-26],[22,-26],[0,-36],[28,-10],[-28,-10],[14,-34],[-14,-34]].map(([dx,dy],i)=>(
          <line key={i} x1="65" y1="56" x2={65+dx} y2={56+dy}
            stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round" />
        ))}
        <circle cx="65" cy="56" r="8" fill="rgba(255,215,0,0.2)" />
      </g>
    </svg>
  )
}

function SixAnim({ accent }) {
  return (
    <svg width="130" height="110" viewBox="0 0 130 110" style={{ overflow:'visible', marginBottom:4 }}>
      {/* ground line */}
      <line x1="10" y1="100" x2="120" y2="100" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
      {/* arc trail */}
      <path d="M18 92 Q55 10 112 30" fill="none" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round"
        strokeDasharray="140" strokeDashoffset="140"
        style={{ animation:'trailDrawS 1.8s ease-in-out infinite' }} />
      {/* SIX! text */}
      <text x="112" y="26" textAnchor="middle" fontSize="15" fontWeight="900" fill="#FFD700"
        opacity="0" style={{ animation:'sixPopS 1.8s ease-in-out infinite', fontFamily:'system-ui,sans-serif' }}>
        SIX!
      </text>
      {/* stars on impact */}
      {[[6,-8],[14,-4],[9,-16]].map(([dx,dy],i)=>(
        <circle key={i} cx={112+dx} cy={26+dy} r="2" fill="#FFD700" opacity="0"
          style={{ animation:`sixPopS 1.8s ${i*0.1}s ease-in-out infinite` }} />
      ))}
      {/* cricket ball */}
      <g style={{ animation:'ballArcS 1.8s ease-in-out infinite' }}>
        <circle r="10" fill="#cc2200" stroke="#ff6655" strokeWidth="1">
          <animateMotion dur="1.8s" repeatCount="indefinite" path="M18,92 Q55,10 112,30" />
        </circle>
        <ellipse cx="0" cy="0" rx="5" ry="10" fill="none" stroke="#fff" strokeWidth="1" opacity=".35">
          <animateMotion dur="1.8s" repeatCount="indefinite" path="M18,92 Q55,10 112,30" />
        </ellipse>
      </g>
      {/* bat silhouette at start */}
      <g style={{ animation:'batSwingS 1.8s ease-out infinite', transformOrigin:'14px 95px' }}>
        <rect x="10" y="72" width="8" height="26" rx="3" fill="#c8860a" />
        <rect x="8" y="60" width="12" height="14" rx="4" fill="#a06408" />
      </g>
    </svg>
  )
}

// ── CRED-style Level Detail Sheet ───────────────────────────────────────────
function LevelDetailSheet({ lvl, onClose, onShare, jerseyNum }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const accent = lvl.level===1 ? '#A78BFA' : lvl.level===2 ? '#60A5FA' : lvl.level===3 ? '#34D399' : '#C084FC'
  const stepAnims = [
    <JerseyAnim key="j" num={jerseyNum} accent={accent} />,
    <StumpsAnim key="s" accent={accent} />,
    <SixAnim    key="6" accent={accent} />,
  ]

  return (
    <div
      style={{ position:'fixed', inset:0, zIndex:60, background:'rgba(0,0,0,0.85)', display:'flex', flexDirection:'column', justifyContent:'flex-end' }}
      onClick={onClose}
    >
      <div
        style={{
          background:'#0a0a0a', borderRadius:'24px 24px 0 0',
          padding:'0 0 env(safe-area-inset-bottom,24px)',
          maxHeight:'92dvh', overflowY:'auto',
          animation:'slideUpSheet 0.32s cubic-bezier(0.34,1.36,0.64,1) both',
        }}
        onClick={e=>e.stopPropagation()}
      >
        {/* Handle */}
        <div style={{ display:'flex', justifyContent:'center', paddingTop:12, paddingBottom:4 }}>
          <div style={{ width:40, height:4, background:'rgba(255,255,255,0.12)', borderRadius:2 }} />
        </div>

        {/* Close + Title */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 20px 0' }}>
          <button
            onClick={onClose}
            style={{ width:36, height:36, borderRadius:8, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <p style={{ color:'#fff', fontWeight:900, fontSize:16, letterSpacing:'-0.01em' }}>
            CricYaar{' '}
            <span style={{ color:'#FFD700', fontStyle:'italic', fontWeight:700 }}>referral</span>
          </p>
          <div style={{ width:36 }} />
        </div>

        {/* Level badge */}
        <div style={{ display:'flex', justifyContent:'center', marginTop:16 }}>
          <span style={{
            background:'#FFD700', color:'#000', fontSize:11, fontWeight:900,
            padding:'5px 24px', borderRadius:40, letterSpacing:'0.12em',
            clipPath:'polygon(6px 0%,calc(100% - 6px) 0%,100% 50%,calc(100% - 6px) 100%,6px 100%,0% 50%)',
          }}>
            LEVEL {lvl.level} · {lvl.earn}
          </span>
        </div>

        {/* Animated steps */}
        <div style={{ padding:'20px 28px 24px' }}>
          {lvl.steps.map(({ label, text }, i) => (
            <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', marginBottom: i < lvl.steps.length-1 ? 44 : 0 }}>
              {/* Cricket animation per step */}
              <div style={{ marginBottom:8 }}>{stepAnims[i]}</div>

              {/* Step pill */}
              <div style={{
                background:'#FFD700', color:'#000', fontSize:11, fontWeight:900,
                padding:'5px 22px', borderRadius:40, letterSpacing:'0.1em',
                marginBottom:14,
                clipPath:'polygon(6px 0%,calc(100% - 6px) 0%,100% 50%,calc(100% - 6px) 100%,6px 100%,0% 50%)',
              }}>
                {label}
              </div>
              <p style={{ color:'rgba(255,255,255,0.7)', fontSize:15, lineHeight:1.65, maxWidth:280 }}>
                {text.split(/(₹[0-9]+\/month|Pro|FREE|CricYaar)/g).map((part, pi) =>
                  /₹[0-9]+\/month|Pro|FREE/.test(part)
                    ? <strong key={pi} style={{ color: accent, fontWeight:800 }}>{part}</strong>
                    : part
                )}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ padding:'0 20px 28px', display:'flex', flexDirection:'column', gap:10 }}>
          <button
            onClick={() => { onClose(); onShare() }}
            style={{
              width:'100%', padding:'16px', borderRadius:40,
              background:'#fff', color:'#000',
              fontWeight:800, fontSize:15,
              border:'none', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', gap:10,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="12" fill="#25D366"/>
              <path d="M17.4 6.6A7.1 7.1 0 0 0 12 4.4a7.1 7.1 0 0 0-6.2 10.6l-1 3.5 3.6-1a7.1 7.1 0 0 0 3.6.9 7.1 7.1 0 0 0 5.4-11.8zm-5.4 10.9a5.9 5.9 0 0 1-3-.8l-.2-.1-2.2.6.6-2.1-.1-.2a5.9 5.9 0 1 1 5 2.6zm3.2-4.4c-.2-.1-1-.5-1.1-.5-.2-.1-.3-.1-.4.1l-.5.7c-.1.1-.2.1-.3 0a5 5 0 0 1-1.4-.9 5.3 5.3 0 0 1-1-1.3c-.1-.2 0-.3.1-.3l.3-.3.2-.3v-.3l-.5-1.2c-.1-.3-.3-.3-.4-.3h-.3c-.1 0-.4.1-.5.4-.2.2-.7.7-.7 1.7s.7 2 .8 2.1c.1.1 1.4 2.1 3.3 3 .5.2.8.3 1.1.4.5.1.9.1 1.2.1.4 0 1-.4 1.2-.8.1-.4.1-.7 0-.8z" fill="white"/>
            </svg>
            invite via whatsapp
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Progress Bar ────────────────────────────────────────────────────────────
function ProgressBar({ active }) {
  return (
    <div style={{ padding:'0 16px' }}>
      <div style={{ display:'flex', alignItems:'center' }}>
        {LEVELS.map((lvl, i) => (
          <div key={lvl.level} style={{ display:'flex', alignItems:'center', flex: i < LEVELS.length-1 ? 1 : 'none' }}>
            <div style={{
              width: lvl.level===active ? 16 : 10,
              height: lvl.level===active ? 16 : 10,
              borderRadius:'50%',
              background: lvl.reached ? '#FFD700' : '#333',
              border: lvl.level===active ? '3px solid #FFD700' : 'none',
              boxShadow: lvl.level===active ? '0 0 8px rgba(255,215,0,0.6)' : 'none',
              flexShrink:0, transition:'all 0.3s',
            }} />
            {i < LEVELS.length-1 && (
              <div style={{ flex:1, height:2, background: LEVELS[i+1].reached ? '#FFD700' : '#333', margin:'0 3px' }} />
            )}
          </div>
        ))}
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
        {LEVELS.map(lvl => (
          <span key={lvl.level} style={{
            fontSize:9, fontWeight: lvl.level===active ? 700 : 500,
            color: lvl.level===active ? '#FFD700' : 'rgba(255,255,255,0.3)',
            letterSpacing:'0.05em',
          }}>LEVEL {lvl.level}</span>
        ))}
      </div>
    </div>
  )
}

// ── Ticker ──────────────────────────────────────────────────────────────────
function Ticker() {
  const text = '🏏  OVER 10,000 CRICKETERS HAVE JOINED CRICYAAR VIA REFERRAL  •  '
  return (
    <div style={{ overflow:'hidden', whiteSpace:'nowrap', borderTop:'1px solid rgba(255,255,255,0.06)', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'10px 0' }}>
      <span style={{ display:'inline-block', animation:'tickerScroll 18s linear infinite', fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.35)', letterSpacing:'0.08em' }}>
        {text.repeat(4)}
      </span>
    </div>
  )
}

// ── Main ────────────────────────────────────────────────────────────────────
export default function InviteEarn() {
  const navigate    = useNavigate()
  const { user, addToast } = useStore()
  const [activeCard, setActiveCard]   = useState(Math.max(myLevel-1, 0))
  const [detailLevel, setDetailLevel] = useState(null)
  const [copied, setCopied]           = useState(false)
  const [showBurst, setShowBurst]     = useState(false)
  const carouselRef = useRef(null)

  const jerseyNum  = numerologyNumber(user?.name)
  const firstName  = (user?.name || '').split(' ')[0].toUpperCase().replace(/[^A-Z]/g,'').slice(0,5) || 'CY'
  const codeBase   = (user?.username || user?.id || 'CY').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,4) || 'CYAR'
  const code       = firstName + codeBase
  const referralLink = `https://cricyaar.app/join?ref=${code}`

  // Confetti burst on mount (simulates "Refer & Earn" button click animation)
  useEffect(() => {
    setShowBurst(true)
    const t = setTimeout(() => setShowBurst(false), 1100)
    return () => clearTimeout(t)
  }, [])

  // Sync active card to scroll
  useEffect(() => {
    const el = carouselRef.current
    if (!el) return
    const onScroll = () => {
      const cardW = el.querySelector('[data-card]')?.offsetWidth || el.offsetWidth
      setActiveCard(Math.round(el.scrollLeft / (cardW + 12)))
    }
    el.addEventListener('scroll', onScroll, { passive:true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const el = carouselRef.current
    if (!el) return
    setTimeout(() => {
      const cards = el.querySelectorAll('[data-card]')
      if (cards[activeCard]) cards[activeCard].scrollIntoView({ behavior:'smooth', block:'nearest', inline:'center' })
    }, 200)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleShare = () => {
    const msg = `🏏 Join CricYaar — India's fraud-free cricket app!\n\nUse my code *${code}* to get your first Pro month FREE:\n${referralLink}\n\n✅ Verified stats · Live scoring · Tournaments`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer')
  }

  const handleCopy = () => {
    navigator.clipboard?.writeText(code)
    setCopied(true)
    addToast('Code copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ minHeight:'100dvh', background:'#000', display:'flex', flexDirection:'column' }}>

      {/* Confetti burst entrance */}
      {showBurst && <ConfettiBurst />}

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 16px 0', position:'sticky', top:0, zIndex:10, background:'#000' }}>
        <button onClick={() => navigate(-1)} style={{ width:38, height:38, borderRadius:8, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M5 12l7-7M5 12l7 7"/></svg>
        </button>

        {/* CY Logo + Tagline */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
          <div style={{ width:48, height:48, borderRadius:13, background:'linear-gradient(135deg,#7C3AED,#5B21B6)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 0 2px #000, 0 0 18px rgba(124,58,237,0.5)' }}>
            <span style={{ color:'#fff', fontWeight:900, fontSize:19, letterSpacing:'-0.04em' }}>CY</span>
          </div>
          <p style={{ color:'rgba(255,255,255,0.5)', fontSize:8, fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', whiteSpace:'nowrap', margin:0 }}>
            Your Game. Your Record.
          </p>
        </div>

        {/* Info button */}
        <button
          onClick={() => setDetailLevel(LEVELS[activeCard])}
          style={{ width:38, height:38, borderRadius:8, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        </button>
      </div>

      {/* Level Cards Carousel */}
      <div
        ref={carouselRef}
        style={{
          display:'flex', overflowX:'auto', scrollSnapType:'x mandatory',
          scrollBehavior:'smooth', gap:12, padding:'20px 16px 16px',
          msOverflowStyle:'none', scrollbarWidth:'none',
        }}
      >
        {LEVELS.map(lvl => (
          <div key={lvl.level} data-card style={{ minWidth:'100%', scrollSnapAlign:'center', flexShrink:0 }}>
            <LevelCard lvl={lvl} onClick={() => setDetailLevel(lvl)} />
          </div>
        ))}
      </div>

      {/* Level up pill */}
      <div style={{ display:'flex', justifyContent:'center', marginBottom:12 }}>
        <div style={{ background:'#111', borderRadius:40, padding:'7px 18px', display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:'#4ade80' }} />
          <span style={{ color:'#fff', fontSize:12, fontWeight:600 }}>
            <span style={{ color:'#4ade80', fontWeight:800 }}>level up.</span> earn more Pro months.
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ padding:'4px 16px 16px' }}>
        <ProgressBar active={myLevel || 1} />
      </div>

      {/* Invite via WhatsApp */}
      <div style={{ padding:'4px 20px 12px' }}>
        <button
          onClick={handleShare}
          style={{
            width:'100%', padding:'16px', borderRadius:40, background:'#fff',
            display:'flex', alignItems:'center', justifyContent:'center', gap:10,
            fontWeight:800, fontSize:15, color:'#000',
            border:'none', cursor:'pointer',
            boxShadow:'0 4px 20px rgba(255,255,255,0.08)',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="12" fill="#25D366"/>
            <path d="M17.4 6.6A7.1 7.1 0 0 0 12 4.4a7.1 7.1 0 0 0-6.2 10.6l-1 3.5 3.6-1a7.1 7.1 0 0 0 3.6.9 7.1 7.1 0 0 0 5.4-11.8zm-5.4 10.9a5.9 5.9 0 0 1-3-.8l-.2-.1-2.2.6.6-2.1-.1-.2a5.9 5.9 0 1 1 5 2.6zm3.2-4.4c-.2-.1-1-.5-1.1-.5-.2-.1-.3-.1-.4.1l-.5.7c-.1.1-.2.1-.3 0a5 5 0 0 1-1.4-.9 5.3 5.3 0 0 1-1-1.3c-.1-.2 0-.3.1-.3l.3-.3.2-.3v-.3l-.5-1.2c-.1-.3-.3-.3-.4-.3h-.3c-.1 0-.4.1-.5.4-.2.2-.7.7-.7 1.7s.7 2 .8 2.1c.1.1 1.4 2.1 3.3 3 .5.2.8.3 1.1.4.5.1.9.1 1.2.1.4 0 1-.4 1.2-.8.1-.4.1-.7 0-.8z" fill="white"/>
          </svg>
          invite via whatsapp
        </button>
      </div>

      {/* Ticker */}
      <Ticker />

      {/* Referral Code */}
      <div style={{ padding:'20px 20px 12px', borderTop:'1px solid rgba(255,255,255,0.04)' }}>
        <p style={{ color:'rgba(255,255,255,0.25)', fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:10 }}>
          your referral code
        </p>
        <div style={{ display:'flex', alignItems:'center', gap:10, background:'rgba(255,255,255,0.04)', borderRadius:14, padding:'14px 16px', border:'1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ flex:1, minWidth:0 }}>
            <span style={{ display:'block', fontWeight:900, fontSize:20, color:'#fff', letterSpacing:'0.18em', lineHeight:1 }}>{code}</span>
            <span style={{ fontSize:10, color:'rgba(255,255,255,0.3)', letterSpacing:'0.06em', marginTop:3, display:'block' }}>your referral code</span>
          </div>
          <button
            onClick={handleCopy}
            style={{
              flexShrink:0, padding:'8px 18px', borderRadius:10, fontWeight:700, fontSize:13,
              background: copied ? '#4ade80' : 'rgba(124,58,237,0.15)',
              color: copied ? '#000' : '#C4B5FD',
              border: `1px solid ${copied ? '#4ade80' : 'rgba(124,58,237,0.35)'}`,
              cursor:'pointer', transition:'all 0.15s',
            }}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Bottom tagline */}
      <p style={{ textAlign:'center', fontSize:11, color:'rgba(255,255,255,0.15)', padding:'4px 20px 24px', letterSpacing:'0.04em' }}>
        each referral = Pro months · stack them all.
      </p>

      {/* Level Detail Sheet */}
      {detailLevel && (
        <LevelDetailSheet
          lvl={detailLevel}
          onClose={() => setDetailLevel(null)}
          onShare={handleShare}
          jerseyNum={jerseyNum}
        />
      )}

      <style>{`
        @keyframes cubeFloat {
          0%,100% { transform:translateY(0); }
          50% { transform:translateY(-14px); }
        }
        @keyframes sparkleOp {
          0%,100% { opacity:0.2; transform:scale(0.7); }
          50% { opacity:1; transform:scale(1.3); }
        }
        @keyframes slideUpSheet {
          from { transform:translateY(100%); opacity:0; }
          to   { transform:translateY(0);    opacity:1; }
        }
        @keyframes confettiBurst {
          0%   { opacity:0; transform:translate(0,0) scale(0.3) rotate(0deg); }
          30%  { opacity:1; }
          100% { opacity:0; transform:translate(var(--cx,60px),var(--cy,-100px)) scale(1.2) rotate(360deg); }
        }
        @keyframes tickerScroll {
          0%   { transform:translateX(0); }
          100% { transform:translateX(-50%); }
        }
        @keyframes jerseyGlow {
          from { filter:drop-shadow(0 0 6px rgba(124,58,237,0.5)); }
          to   { filter:drop-shadow(0 0 18px rgba(167,139,250,0.9)); }
        }
        @keyframes numReveal {
          from { opacity:0.3; transform:scale(0.7); }
          to   { opacity:1;   transform:scale(1.08); }
        }
        @keyframes stumpsShakeS {
          from { transform:rotate(-5deg); }
          to   { transform:rotate(5deg); }
        }
        @keyframes ballStrikeS {
          0%   { opacity:1; }
          70%  { opacity:1; }
          100% { opacity:0; }
        }
        @keyframes explodeS {
          0%   { opacity:0; transform:scale(0); }
          30%  { opacity:1; }
          85%  { opacity:1; transform:scale(1.2); }
          100% { opacity:0; transform:scale(1.5); }
        }
        @keyframes trailDrawS {
          0%   { stroke-dashoffset:140; opacity:0; }
          20%  { opacity:1; }
          100% { stroke-dashoffset:0; opacity:1; }
        }
        @keyframes sixPopS {
          0%,60%  { opacity:0; transform:scale(0.4); }
          80%     { opacity:1; transform:scale(1.2); }
          100%    { opacity:1; transform:scale(1); }
        }
        @keyframes ballArcS {
          0%   { opacity:1; }
          95%  { opacity:1; }
          100% { opacity:0; }
        }
        @keyframes batSwingS {
          0%   { transform:rotate(0deg); }
          25%  { transform:rotate(-38deg); }
          45%  { transform:rotate(12deg); }
          100% { transform:rotate(0deg); }
        }
      `}</style>
    </div>
  )
}
