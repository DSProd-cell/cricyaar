import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { IPL_TEAMS } from '../lib/iplTeams'
import IplCelebrationOverlay from '../components/IplCelebrationOverlay'

export default function IplTeamPicker({ onDone, skipRoute = '/city-select' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { setIplTeam } = useStore()
  const [selected, setSelected] = useState(null)
  const [celebrating, setCelebrating] = useState(false)

  // When reached mid-onboarding, fall through to city-select/role-select.
  // When reached from Profile or login, the caller passes returnTo via state.
  const returnTo = location.state?.returnTo

  const finish = () => {
    if (onDone) onDone()
    else if (returnTo === 'back') navigate(-1)
    else navigate(returnTo || skipRoute)
  }

  const handlePick = (team) => {
    setSelected(team)
    setIplTeam(team.id)
    setCelebrating(true)
  }

  const handleCelebrationDone = () => {
    setCelebrating(false)
    finish()
  }

  const handleSkip = finish

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg,#0a0118 0%,#120520 55%,#07021a 100%)',
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{ padding: '28px 20px 0', textAlign: 'center' }}>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:16 }}>
          <div style={{ width:48, height:48, borderRadius:14, background:'linear-gradient(135deg,#7C3AED,#5B21B6)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 24px rgba(124,58,237,0.5)' }}>
            <span style={{ color:'#fff', fontWeight:900, fontSize:19, letterSpacing:'-0.04em' }}>CY</span>
          </div>
        </div>
        <h1 style={{ color:'#fff', fontWeight:900, fontSize:26, margin:'0 0 8px', letterSpacing:'-0.02em' }}>
          Choose Your Team 🏏
        </h1>
        <p style={{ color:'#A78BFA', fontSize:14, margin:'0 0 4px' }}>
          Choose and see the Magic ✨
        </p>
        <p style={{ color:'rgba(255,255,255,0.4)', fontSize:12, margin:0 }}>
          Optional — you can change it anytime from Profile
        </p>
      </div>

      {/* Team grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2,1fr)',
        gap: 12, padding: '24px 16px 8px',
      }}>
        {IPL_TEAMS.map(team => (
          <button
            key={team.id}
            onClick={() => handlePick(team)}
            style={{
              background: `linear-gradient(135deg,${team.darkBg},${team.midBg})`,
              border: `1.5px solid ${team.primary}55`,
              borderRadius: 16,
              padding: '16px 12px',
              cursor: 'pointer',
              textAlign: 'center',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              transition: 'transform .15s, box-shadow .15s',
              boxShadow: `0 2px 16px ${team.glow}30`,
              WebkitTapHighlightColor: 'transparent',
            }}
            onMouseDown={e => { e.currentTarget.style.transform='scale(0.96)'; e.currentTarget.style.boxShadow=`0 4px 24px ${team.glow}` }}
            onMouseUp={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow=`0 2px 16px ${team.glow}30` }}
            onTouchStart={e => { e.currentTarget.style.transform='scale(0.96)'; e.currentTarget.style.boxShadow=`0 4px 24px ${team.glow}` }}
            onTouchEnd={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow=`0 2px 16px ${team.glow}30` }}
          >
            {/* Color swatch bar */}
            <div style={{
              width: '100%', height: 4, borderRadius: 4,
              background: `linear-gradient(90deg,${team.primary},${team.secondary})`,
              marginBottom: 4,
            }} />
            <span style={{ fontSize: 28, lineHeight: 1 }}>{team.emoji}</span>
            <span style={{
              color: team.primary, fontWeight: 900, fontSize: 18,
              letterSpacing: '0.04em',
              textShadow: `0 0 12px ${team.glow}`,
            }}>{team.short}</span>
            <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: 600, lineHeight: 1.3, textAlign:'center' }}>
              {team.name}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9, fontStyle:'italic', lineHeight:1.3, textAlign:'center' }}>
              "{team.tagline.replace(/[🌊🎺🏆⚔️🦁💪🌅❤️🩵⚡]/gu,'').trim()}"
            </span>
          </button>
        ))}
      </div>

      {/* Skip */}
      <div style={{ padding: '16px 20px 36px', textAlign: 'center' }}>
        <button
          onClick={handleSkip}
          style={{ background:'transparent', border:'none', color:'rgba(255,255,255,0.35)', fontSize:13, cursor:'pointer', padding:'8px 20px' }}
        >
          Skip for now →
        </button>
      </div>

      {/* Celebration overlay */}
      {celebrating && selected && (
        <IplCelebrationOverlay team={selected} onDone={handleCelebrationDone} />
      )}
    </div>
  )
}
