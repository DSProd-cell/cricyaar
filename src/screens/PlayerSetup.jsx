import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabase'
import { getRoleColor } from '../lib/roleColors'
import { Check, X, ChevronDown } from 'lucide-react'

// ── Option pill ───────────────────────────────────────────────────────────────
function Pill({ emoji, label, selected, onClick, roleColor }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 16px', borderRadius: 50,
        border: selected ? `1.5px solid ${roleColor.primary}` : '1.5px solid rgba(255,255,255,0.18)',
        background: selected ? `${roleColor.primary}22` : 'rgba(255,255,255,0.07)',
        cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
        transition: 'all 0.15s',
        flex: '0 0 auto',
      }}
    >
      <span style={{ fontSize: 16 }}>{emoji}</span>
      <span style={{
        fontSize: 13, fontWeight: 600,
        color: selected ? '#fff' : 'rgba(255,255,255,0.65)',
        letterSpacing: '0.01em', whiteSpace: 'nowrap',
      }}>{label}</span>
      {selected && (
        <div style={{
          width: 16, height: 16, borderRadius: '50%',
          background: roleColor.primary,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Check size={9} color="#fff" strokeWidth={3} />
        </div>
      )}
    </button>
  )
}

// ── Accordion section ─────────────────────────────────────────────────────────
function Section({ title, open, onToggle, children, complete }) {
  return (
    <div style={{
      borderRadius: 16,
      border: complete ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(255,255,255,0.09)',
      background: 'rgba(255,255,255,0.04)',
      overflow: 'hidden', marginBottom: 10,
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '14px 16px',
          background: 'none', border: 'none', cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {complete && (
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: '#4ade80', flexShrink: 0,
            }} />
          )}
          <span style={{
            fontSize: 12, fontWeight: 700, color: complete ? '#fff' : 'rgba(255,255,255,0.5)',
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>{title}</span>
        </div>
        <ChevronDown
          size={16}
          color="rgba(255,255,255,0.4)"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        />
      </button>
      {open && (
        <div style={{
          padding: '0 14px 14px',
          display: 'flex', flexWrap: 'wrap', gap: 8,
        }}>
          {children}
        </div>
      )}
    </div>
  )
}

export default function PlayerSetup() {
  const navigate = useNavigate()
  const { user, setUser, addToast } = useStore()
  const roleColor = getRoleColor(user?.role)

  const [playingRole, setPlayingRole] = useState('')
  const [battingHand, setBattingHand] = useState('')
  const [bowlingStyle, setBowlingStyle] = useState('')
  const [saving, setSaving] = useState(false)

  // Accordion open state — all start open
  const [openSections, setOpenSections] = useState({ role: true, hand: true, bowling: true })
  const toggle = (k) => setOpenSections(p => ({ ...p, [k]: !p[k] }))

  const hasAnySelection = !!(playingRole || battingHand || bowlingStyle)

  const buildBio = () => {
    const parts = []
    if (battingHand === 'right') parts.push('Right-hand')
    if (battingHand === 'left')  parts.push('Left-hand')
    const roleMap = { batsman: 'Batsman', bowler: 'Bowler', allrounder: 'All-rounder', wk: 'WK-Batter' }
    if (playingRole) parts.push(roleMap[playingRole] || playingRole)
    const styleMap = { fast: 'Fast', medium: 'Medium-pace', spin: 'Spinner' }
    if (bowlingStyle && bowlingStyle !== 'none') parts.push(styleMap[bowlingStyle])
    return parts.join(' · ')
  }

  const handleSave = async () => {
    setSaving(true)
    const bio = buildBio()
    const updates = {
      playing_role:    playingRole  || null,
      batting_hand:    battingHand  || null,
      bowling_style:   bowlingStyle !== 'none' ? (bowlingStyle || null) : null,
      bio:             bio || user?.bio || '',
      player_setup_done: true,
    }
    if (user?.id) {
      await supabase.from('profiles').update(updates).eq('id', user.id)
      setUser({ ...user, ...updates, playerSetupDone: true })
    }
    setSaving(false)
    addToast('Cricket style saved 🏏', 'success')
    navigate('/')
  }

  const handleSkip = () => {
    supabase.from('profiles').update({ player_setup_done: true }).eq('id', user?.id).then(() => {})
    setUser({ ...user, playerSetupDone: true })
    navigate('/')
  }

  const previewBio = buildBio()

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }}>
      <div style={{
        background: 'linear-gradient(170deg, #1a0e35 0%, #0d0620 100%)',
        borderRadius: '24px 24px 0 0',
        borderTop: `1.5px solid ${roleColor.primary}30`,
        display: 'flex', flexDirection: 'column',
        maxHeight: '90dvh',
      }}>
        {/* Drag pill */}
        <div style={{ width: 36, height: 4, borderRadius: 2, margin: '12px auto 0', background: 'rgba(255,255,255,0.2)' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px 10px' }}>
          <div>
            <p style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Your cricket style</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', marginTop: 2 }}>Saved once. Never asked again.</p>
          </div>
          <button onClick={handleSkip} style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <X size={15} color="rgba(255,255,255,0.5)" />
          </button>
        </div>

        {/* Bio preview */}
        <div style={{ margin: '0 18px 14px', padding: '10px 14px', borderRadius: 12,
          background: `${roleColor.primary}14`, border: `1px solid ${roleColor.primary}28`,
          minHeight: 36, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6,
        }}>
          {previewBio ? previewBio.split(' · ').map((p, i) => (
            <span key={i} style={{
              fontSize: 12, fontWeight: 700, color: roleColor.primary,
              padding: '3px 10px', borderRadius: 20,
              background: `${roleColor.primary}1a`, border: `1px solid ${roleColor.primary}30`,
            }}>{p}</span>
          )) : (
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', fontStyle: 'italic' }}>
              Tap below to build your profile
            </span>
          )}
        </div>

        {/* Scrollable sections */}
        <div style={{ overflowY: 'auto', padding: '0 14px', flex: 1 }}>

          <Section title="Playing role" open={openSections.role} onToggle={() => toggle('role')} complete={!!playingRole}>
            {[
              { id:'batsman',    emoji:'🏏', label:'Batsman'    },
              { id:'bowler',     emoji:'🎯', label:'Bowler'     },
              { id:'allrounder', emoji:'⚡', label:'All-rounder'},
              { id:'wk',         emoji:'🧤', label:'WK-Batter'  },
            ].map(r => (
              <Pill key={r.id} emoji={r.emoji} label={r.label} roleColor={roleColor}
                selected={playingRole === r.id}
                onClick={() => setPlayingRole(playingRole === r.id ? '' : r.id)} />
            ))}
          </Section>

          <Section title="Batting hand" open={openSections.hand} onToggle={() => toggle('hand')} complete={!!battingHand}>
            {[
              { id:'right', emoji:'🤜', label:'Right-hand' },
              { id:'left',  emoji:'🤛', label:'Left-hand'  },
            ].map(r => (
              <Pill key={r.id} emoji={r.emoji} label={r.label} roleColor={roleColor}
                selected={battingHand === r.id}
                onClick={() => setBattingHand(battingHand === r.id ? '' : r.id)} />
            ))}
          </Section>

          <Section title="Bowling" open={openSections.bowling} onToggle={() => toggle('bowling')} complete={!!bowlingStyle}>
            {[
              { id:'fast',   emoji:'💨', label:'Fast'       },
              { id:'medium', emoji:'🌀', label:'Medium-pace'},
              { id:'spin',   emoji:'🌪️', label:'Spinner'    },
              { id:'none',   emoji:'🚫', label:"Don't bowl" },
            ].map(r => (
              <Pill key={r.id} emoji={r.emoji} label={r.label} roleColor={roleColor}
                selected={bowlingStyle === r.id}
                onClick={() => setBowlingStyle(bowlingStyle === r.id ? '' : r.id)} />
            ))}
          </Section>

          <div style={{ height: 8 }} />
        </div>

        {/* Sticky CTA */}
        <div style={{
          padding: '12px 16px',
          paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(13,6,32,0.98)',
        }}>
          <button
            onClick={hasAnySelection ? handleSave : undefined}
            disabled={saving}
            style={{
              width: '100%', padding: '15px', borderRadius: 14,
              border: 'none', cursor: hasAnySelection ? 'pointer' : 'default',
              fontWeight: 800, fontSize: 15, color: '#fff',
              background: hasAnySelection
                ? `linear-gradient(135deg, ${roleColor.gradientFrom}, ${roleColor.gradientTo})`
                : 'rgba(255,255,255,0.10)',
              boxShadow: hasAnySelection ? `0 6px 22px ${roleColor.primary}40` : 'none',
              opacity: saving ? 0.7 : 1,
              transition: 'all 0.2s',
            }}
          >
            {saving ? 'Saving…' : hasAnySelection ? 'Save to profile →' : 'Select options above to save'}
          </button>
        </div>
      </div>
    </div>
  )
}
