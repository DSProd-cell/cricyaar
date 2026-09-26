import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabase'
import { Check, Users, Shield } from 'lucide-react'
import PageHeader from '../components/PageHeader'

// ── Option pill ──────────────────────────────────────────────────────────────
function Pill({ label, selected, onClick, color = '#16a34a' }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all"
      style={{
        borderColor: selected ? color : '#e2e8f0',
        background: selected ? `${color}14` : 'white',
        color: selected ? color : '#475569',
      }}
    >
      {selected && <Check size={13} strokeWidth={3} />}
      {label}
    </button>
  )
}

// ── Section ──────────────────────────────────────────────────────────────────
function Section({ label, children }) {
  return (
    <div className="mb-5">
      <p className="text-xs font-bold text-navy-500 uppercase tracking-wider mb-2.5">{label}</p>
      {children}
    </div>
  )
}

export default function PlayerSetup() {
  const navigate = useNavigate()
  const { user, setUser, addToast } = useStore()

  const [captain, setCaptain]         = useState(null)    // true | false
  const [hasTeam, setHasTeam]         = useState(null)    // true | false
  const [teamName, setTeamName]       = useState('')
  const [playingRole, setPlayingRole] = useState('')      // 'batsman' | 'bowler' | 'allrounder'
  const [battingHand, setBattingHand] = useState('')      // 'right' | 'left'
  const [bowlingArm, setBowlingArm]   = useState('')      // 'right' | 'left'
  const [bowlingStyle, setBowlingStyle] = useState('')    // 'fast' | 'medium' | 'spin'
  const [allrounderType, setAllrounderType] = useState('')// 'batting' | 'bowling'
  const [consent, setConsent]         = useState(false)
  const [saving, setSaving]           = useState(false)

  const canSave = consent

  const handleSave = async () => {
    if (!consent) return
    setSaving(true)

    const updates = {
      captain: captain === true,
      team_name: hasTeam && teamName.trim() ? teamName.trim() : null,
      playing_role: playingRole || null,
      batting_hand: battingHand || null,
      bowling_arm: bowlingArm || null,
      bowling_style: bowlingStyle || null,
      allrounder_type: allrounderType || null,
      player_setup_done: true,
    }

    if (user?.id) {
      await supabase.from('profiles').update(updates).eq('id', user.id)
      setUser({ ...user, ...updates })
    }

    setSaving(false)
    addToast('Profile set up! Welcome to the field.', 'success')
    navigate('/')
  }

  const handleSkip = () => {
    addToast('You can update your profile anytime from Settings.', 'info')
    navigate('/')
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <PageHeader
        backTo="/role-onboard"
        showTagline
        rightSlot={
          <button onClick={handleSkip} className="text-navy-400 text-sm font-medium hover:text-navy-700 transition-colors">
            Fill Later
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto px-4 pb-36">
        {/* Hero */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-navy-900 leading-tight">
            Tell us about<br />your cricket
          </h1>
          <p className="text-navy-500 text-sm mt-1">
            Helps teams find the right player. Skip anything — you can fill it later.
          </p>
        </div>

        {/* Captain */}
        <Section label="Are you a captain?">
          <div className="flex gap-2 flex-wrap">
            <Pill label="Yes, I captain a team" selected={captain === true}  onClick={() => setCaptain(true)} />
            <Pill label="No, I'm a team player"  selected={captain === false} onClick={() => setCaptain(false)} />
          </div>
        </Section>

        {/* Team membership */}
        <Section label="Part of a team?">
          <div className="flex gap-2 flex-wrap mb-3">
            <Pill label="Yes, I have a team" selected={hasTeam === true}  onClick={() => setHasTeam(true)} />
            <Pill label="Not yet"            selected={hasTeam === false} onClick={() => setHasTeam(false)} />
          </div>
          {hasTeam === true && (
            <input
              className="cm-input"
              placeholder="Team name (e.g. Mumbai Warriors)"
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              autoFocus
              maxLength={60}
            />
          )}
        </Section>

        {/* Playing role */}
        <Section label="Your playing role">
          <div className="flex gap-2 flex-wrap mb-3">
            {[
              { id: 'batsman',    label: '🏏 Batsman' },
              { id: 'bowler',     label: '🎳 Bowler' },
              { id: 'allrounder', label: '⚡ All-rounder' },
            ].map(r => (
              <Pill
                key={r.id}
                label={r.label}
                selected={playingRole === r.id}
                onClick={() => {
                  setPlayingRole(r.id)
                  setBattingHand(''); setBowlingArm(''); setBowlingStyle(''); setAllrounderType('')
                }}
              />
            ))}
          </div>

          {/* Batsman sub-options */}
          {playingRole === 'batsman' && (
            <div className="bg-[var(--cy-surface)] rounded-xl border border-slate-100 p-4 space-y-3">
              <p className="text-xs font-bold text-navy-500 uppercase tracking-wider">Batting hand</p>
              <div className="flex gap-2">
                <Pill label="Right-hand" selected={battingHand === 'right'} onClick={() => setBattingHand('right')} />
                <Pill label="Left-hand"  selected={battingHand === 'left'}  onClick={() => setBattingHand('left')} />
              </div>
            </div>
          )}

          {/* Bowler sub-options */}
          {playingRole === 'bowler' && (
            <div className="bg-[var(--cy-surface)] rounded-xl border border-slate-100 p-4 space-y-3">
              <div>
                <p className="text-xs font-bold text-navy-500 uppercase tracking-wider mb-2">Bowling arm</p>
                <div className="flex gap-2">
                  <Pill label="Right-arm" selected={bowlingArm === 'right'} onClick={() => setBowlingArm('right')} />
                  <Pill label="Left-arm"  selected={bowlingArm === 'left'}  onClick={() => setBowlingArm('left')} />
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-navy-500 uppercase tracking-wider mb-2">Bowling style</p>
                <div className="flex gap-2 flex-wrap">
                  <Pill label="Fast"   selected={bowlingStyle === 'fast'}   onClick={() => setBowlingStyle('fast')} />
                  <Pill label="Medium" selected={bowlingStyle === 'medium'} onClick={() => setBowlingStyle('medium')} />
                  <Pill label="Spin"   selected={bowlingStyle === 'spin'}   onClick={() => setBowlingStyle('spin')} />
                </div>
              </div>
            </div>
          )}

          {/* Allrounder sub-options */}
          {playingRole === 'allrounder' && (
            <div className="bg-[var(--cy-surface)] rounded-xl border border-slate-100 p-4 space-y-3">
              <div>
                <p className="text-xs font-bold text-navy-500 uppercase tracking-wider mb-2">Allrounder type</p>
                <div className="flex gap-2 flex-wrap">
                  <Pill label="Batting Allrounder" selected={allrounderType === 'batting'} onClick={() => setAllrounderType('batting')} />
                  <Pill label="Bowling Allrounder" selected={allrounderType === 'bowling'} onClick={() => setAllrounderType('bowling')} />
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-navy-500 uppercase tracking-wider mb-2">Batting hand</p>
                <div className="flex gap-2">
                  <Pill label="Right-hand" selected={battingHand === 'right'} onClick={() => setBattingHand('right')} />
                  <Pill label="Left-hand"  selected={battingHand === 'left'}  onClick={() => setBattingHand('left')} />
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-navy-500 uppercase tracking-wider mb-2">Bowling arm</p>
                <div className="flex gap-2">
                  <Pill label="Right-arm" selected={bowlingArm === 'right'} onClick={() => setBowlingArm('right')} />
                  <Pill label="Left-arm"  selected={bowlingArm === 'left'}  onClick={() => setBowlingArm('left')} />
                </div>
              </div>
            </div>
          )}
        </Section>
      </div>

      {/* ── Sticky footer: Consent + Save ───────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--cy-surface)] border-t border-slate-100 px-4 pt-4 pb-safe">
        {/* Consent */}
        <button
          onClick={() => setConsent(v => !v)}
          className="flex items-start gap-3 mb-4 w-full text-left"
        >
          <div className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all mt-0.5 ${
            consent ? 'bg-brand-500 border-brand-500' : 'border-slate-300'
          }`}>
            {consent && <Check size={11} color="white" strokeWidth={3} />}
          </div>
          <p className="text-[12px] text-navy-500 leading-relaxed">
            <span className="flex items-center gap-1 mb-0.5">
              <Shield size={12} className="text-brand-500 flex-shrink-0" />
              <span className="font-semibold text-navy-700">Your consent matters</span>
            </span>
            I agree to CricYaar's Privacy Policy and give my consent to share my cricket profile
            with teams, organisers, and the cricket community for legitimate cricket purposes.
          </p>
        </button>

        {/* Save / Skip */}
        <div className="flex gap-2">
          <button
            onClick={handleSkip}
            className="py-3.5 px-5 rounded-2xl border-2 border-slate-200 text-navy-600 font-semibold text-sm hover:border-slate-300 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className="flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
            style={{
              background: canSave ? '#16a34a' : '#e2e8f0',
              color: canSave ? 'white' : '#94a3b8',
              boxShadow: canSave ? '0 6px 20px rgba(22,163,74,0.35)' : 'none',
            }}
            aria-busy={saving}
          >
            {saving ? (
              <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Saving…</>
            ) : (
              <><Users size={15} /> Save My Profile</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
