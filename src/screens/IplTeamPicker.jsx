import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { IPL_TEAMS } from '../lib/iplTeams'
import IplCelebrationOverlay from '../components/IplCelebrationOverlay'

export default function IplTeamPicker({ onDone, skipRoute = '/city-select' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { setIplTeam, iplTeam: currentTeamId } = useStore()
  const currentTeam = IPL_TEAMS.find(t => t.id === currentTeamId) || null
  const [selected, setSelected] = useState(null)
  const [celebrating, setCelebrating] = useState(false)
  const [showAll, setShowAll] = useState(false)

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

  const visibleTeams = showAll ? IPL_TEAMS : IPL_TEAMS.slice(0, 8)
  const hiddenCount = IPL_TEAMS.length - 8

  return (
    <>
      {/* Full-screen dark overlay */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(10, 1, 24, 0.72)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'flex-end',
        }}
        onClick={handleSkip}
      >
        {/* Modal card — stop propagation so tapping inside doesn't dismiss */}
        <div
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%',
            background: 'linear-gradient(160deg, #120520 0%, #0a0118 100%)',
            borderRadius: '24px 24px 0 0',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            padding: '0 16px 32px',
            maxHeight: '90dvh',
            overflowY: 'auto',
          }}
        >
          {/* Drag handle */}
          <div style={{
            width: 36, height: 4,
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 4,
            margin: '10px auto 16px',
          }} />

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'linear-gradient(135deg,#7C3AED,#5B21B6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 900, color: '#fff',
                boxShadow: '0 0 12px rgba(124,58,237,0.5)',
              }}>CY</div>
              <span style={{ color: '#fff', fontSize: 16, fontWeight: 800, letterSpacing: '-0.01em' }}>
                Your IPL Team 🏏
              </span>
            </div>
            <button
              onClick={handleSkip}
              style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.6)', fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >✕</button>
          </div>

          {/* Current team pill */}
          {currentTeam ? (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(79,163,247,0.1)',
              border: '1px solid rgba(79,163,247,0.3)',
              borderRadius: 20, padding: '4px 12px 4px 8px',
              marginBottom: 14,
            }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4FA3F7' }} />
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 500 }}>Currently:</span>
              <span style={{ color: currentTeam.primary, fontSize: 11, fontWeight: 700 }}>
                {currentTeam.emoji} {currentTeam.short} · {currentTeam.name}
              </span>
            </div>
          ) : (
            <p style={{ color: '#A78BFA', fontSize: 12, marginBottom: 14 }}>
              Pick a team · it changes your app theme ✨
            </p>
          )}

          {/* 4-column compact team grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 8, marginBottom: 10,
          }}>
            {visibleTeams.map(team => {
              const isCurrent = team.id === currentTeamId
              return (
                <button
                  key={team.id}
                  onClick={() => handlePick(team)}
                  style={{
                    background: `linear-gradient(135deg,${team.darkBg},${team.midBg})`,
                    border: isCurrent
                      ? `1.5px solid ${team.primary}`
                      : `1.5px solid ${team.primary}44`,
                    borderRadius: 12,
                    padding: '10px 6px 9px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 3,
                    position: 'relative',
                    boxShadow: isCurrent
                      ? `0 0 0 1.5px ${team.primary}30, 0 2px 12px ${team.glow}`
                      : `0 1px 8px ${team.glow}30`,
                    transition: 'transform .12s',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                  onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.94)' }}
                  onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)' }}
                  onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.94)' }}
                  onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
                >
                  {isCurrent && (
                    <div style={{
                      position: 'absolute', top: 5, right: 5,
                      width: 14, height: 14, borderRadius: '50%',
                      background: team.primary,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 8, color: '#fff', fontWeight: 900,
                    }}>✓</div>
                  )}
                  {/* Color swatch */}
                  <div style={{
                    width: '100%', height: 3, borderRadius: 3,
                    background: `linear-gradient(90deg,${team.primary},${team.secondary})`,
                    marginBottom: 2,
                  }} />
                  <span style={{ fontSize: 20, lineHeight: 1 }}>{team.emoji}</span>
                  <span style={{
                    color: team.primary, fontWeight: 900, fontSize: 11,
                    letterSpacing: '0.03em',
                    textShadow: `0 0 8px ${team.glow}`,
                  }}>{team.short}</span>
                  <span style={{
                    color: 'rgba(255,255,255,0.5)', fontSize: 8,
                    fontWeight: 500, lineHeight: 1.2,
                  }}>{team.name.split(' ').slice(-1)[0]}</span>
                </button>
              )
            })}
          </div>

          {/* See all / collapse */}
          {!showAll && hiddenCount > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: 14,
            }}>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>
                Showing 8 of {IPL_TEAMS.length} teams
              </span>
              <button
                onClick={() => setShowAll(true)}
                style={{
                  color: '#A78BFA', fontSize: 11, fontWeight: 600,
                  background: 'rgba(124,58,237,0.15)',
                  border: '1px solid rgba(124,58,237,0.3)',
                  borderRadius: 10, padding: '4px 12px',
                  cursor: 'pointer',
                }}
              >See All {IPL_TEAMS.length} →</button>
            </div>
          )}

          {showAll && (
            <div style={{ marginBottom: 14, textAlign: 'right' }}>
              <button
                onClick={() => setShowAll(false)}
                style={{
                  color: 'rgba(255,255,255,0.4)', fontSize: 11,
                  background: 'none', border: 'none',
                  cursor: 'pointer',
                }}
              >Show less ↑</button>
            </div>
          )}

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 8 }}>
            {currentTeamId ? (
              <button
                onClick={finish}
                style={{
                  flex: 1, padding: '13px 0',
                  background: '#7C3AED',
                  borderRadius: 13, border: 'none',
                  color: '#fff', fontSize: 14, fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(124,58,237,0.5)',
                }}
              >
                Keep {currentTeam?.short || 'Team'} ✓
              </button>
            ) : (
              <button
                onClick={finish}
                style={{
                  flex: 1, padding: '13px 0',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1.5px solid rgba(255,255,255,0.15)',
                  borderRadius: 13,
                  color: 'rgba(255,255,255,0.55)', fontSize: 14, fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Skip for now
              </button>
            )}
            {currentTeamId && (
              <button
                onClick={finish}
                style={{
                  padding: '13px 20px',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1.5px solid rgba(255,255,255,0.15)',
                  borderRadius: 13,
                  color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Skip
              </button>
            )}
            {!currentTeamId && null}
          </div>
        </div>
      </div>

      {celebrating && selected && (
        <IplCelebrationOverlay team={selected} onDone={handleCelebrationDone} />
      )}
    </>
  )
}
