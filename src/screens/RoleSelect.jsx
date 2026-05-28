import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { ROLE_META } from '../data/mock'
import { Check, Activity, BarChart2, Eye, Tv, MapPin, ChevronRight, ArrowLeft, Users, Trophy } from 'lucide-react'

const PLAY_POSITIONS = ['Batsman', 'Bowler', 'Wicketkeeper', 'All-rounder']

const ROLES = [
  {
    id: 'fan',
    label: 'Fan',
    Icon: Tv,
    tagline: 'Follow cricket. Free forever.',
    gradient: 'linear-gradient(145deg, #334155 0%, #0f172a 100%)',
    accentColor: '#64748b',
    features: ['Watch live scores in your city', 'View match results & scorecards', 'Explore grounds & teams'],
    desc: 'Follow live scores and match results.',
  },
  {
    id: 'player',
    label: 'Player',
    Icon: Activity,
    tagline: 'Play. Track. Grow.',
    gradient: 'linear-gradient(145deg, #1d4ed8 0%, #1e3a8a 100%)',
    accentColor: '#3b82f6',
    features: ['Read live scorecards for any match', 'Join teams & tournaments', 'Find & book grounds'],
    desc: 'Track stats, join teams, play in matches.',
  },
  {
    id: 'organiser',
    label: 'Organiser',
    Icon: BarChart2,
    tagline: 'Create. Manage. Organise.',
    gradient: 'linear-gradient(145deg, #15803d 0%, #14532d 100%)',
    accentColor: '#16a34a',
    features: ['Run tournaments & matches', 'Browse & request grounds', 'Manage teams & registrations'],
    desc: 'Create matches, tournaments and manage teams.',
  },
  {
    id: 'umpire',
    label: 'Umpire',
    Icon: Eye,
    tagline: 'Officiate. Earn. Rise.',
    gradient: 'linear-gradient(145deg, #b45309 0%, #78350f 100%)',
    accentColor: '#d97706',
    features: ['Get assigned to matches', 'Set your charges per match', 'Track your umpiring record'],
    desc: 'Manage your officiating profile and assignments.',
  },
  {
    id: 'ground_owner',
    label: 'Ground Owner',
    Icon: MapPin,
    tagline: 'List. Earn. Grow.',
    gradient: 'linear-gradient(145deg, #0e7490 0%, #164e63 100%)',
    accentColor: '#0891b2',
    features: ['List your ground with photos & pricing', 'Accept match booking requests', 'Receive payments via Razorpay'],
    desc: 'List your ground, set pricing, and manage bookings.',
  },
]

export default function RoleSelect() {
  const navigate = useNavigate()
  const { user, setRole, addToast, setShowRoleModal, setProIntent, setOtpMode } = useStore()
  const currentRole = user?.role || 'fan'
  const [chosen, setChosen] = useState(currentRole)
  const [loading, setLoading] = useState(false)
  // Player sub-step
  const [step, setStep] = useState(1)           // 1 = role pick, 2 = player questions
  const [playerType, setPlayerType] = useState(null) // 'captain' | 'individual'
  const [playPositions, setPlayPositions] = useState([])
  const [inTeam, setInTeam] = useState(false)
  const [teamName, setTeamName] = useState('')

  const selectedRole = ROLES.find(r => r.id === chosen) || ROLES[0]
  const isSameRole = chosen === currentRole

  const togglePosition = (pos) => {
    setPlayPositions(prev =>
      prev.includes(pos) ? prev.filter(p => p !== pos) : [...prev, pos]
    )
  }

  const doConfirm = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 700))
    setRole(chosen)
    setLoading(false)
    setShowRoleModal(true)
    setProIntent(false)
    setOtpMode('login')
    navigate('/')
  }

  const handleConfirm = () => {
    if (!chosen || isSameRole) return
    // Player role → show sub-questions first
    if (chosen === 'player' && step === 1) {
      setStep(2)
      return
    }
    doConfirm()
  }

  const handlePlayerConfirm = () => {
    if (!playerType || playPositions.length === 0) return
    doConfirm()
  }

  // ── Step 2: Player sub-questions ────────────────────────────────────────────
  if (step === 2) {
    return (
      <div
        className="min-h-dvh flex flex-col transition-all duration-500"
        style={{ background: selectedRole.gradient }}
      >
        {/* Header */}
        <div className="px-5 pt-12 pb-4 flex-shrink-0">
          <button
            onClick={() => setStep(1)}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="text-sm">Back</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Activity size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-extrabold text-xl leading-tight">Tell us about yourself</h1>
              <p className="text-white/60 text-xs">Help teams find the right fit for you</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-5">

          {/* Q1: Captain or Individual? */}
          <div>
            <p className="text-white font-bold text-sm mb-2.5">Are you a Captain of a team or an Individual player?</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'captain', label: 'Team Captain', icon: Trophy, desc: 'I lead a team' },
                { key: 'individual', label: 'Individual Player', icon: Users, desc: 'Looking for a team' },
              ].map(opt => {
                const sel = playerType === opt.key
                return (
                  <button
                    key={opt.key}
                    onClick={() => setPlayerType(opt.key)}
                    className="rounded-2xl p-4 text-left transition-all active:scale-[0.97]"
                    style={{
                      background: sel ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.07)',
                      border: sel ? '2px solid rgba(255,255,255,0.8)' : '2px solid rgba(255,255,255,0.15)',
                    }}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2"
                      style={{ background: sel ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)' }}>
                      <opt.icon size={18} className="text-white" />
                    </div>
                    <p className="text-white font-bold text-sm leading-tight">{opt.label}</p>
                    <p className="text-white/60 text-xs mt-0.5">{opt.desc}</p>
                    {sel && (
                      <div className="mt-2 w-5 h-5 rounded-full bg-white flex items-center justify-center">
                        <Check size={11} style={{ color: selectedRole.accentColor }} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Q2: Playing Positions (multi-select) */}
          <div>
            <p className="text-white font-bold text-sm mb-1">What do you play? <span className="text-white/50 font-normal">(select all that apply)</span></p>
            <p className="text-white/50 text-xs mb-2.5">You can pick more than one, e.g. Wicketkeeper + Batsman</p>
            <div className="grid grid-cols-2 gap-2.5">
              {PLAY_POSITIONS.map(pos => {
                const sel = playPositions.includes(pos)
                return (
                  <button
                    key={pos}
                    onClick={() => togglePosition(pos)}
                    className="flex items-center gap-2 rounded-xl px-4 py-3 transition-all active:scale-[0.97]"
                    style={{
                      background: sel ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.07)',
                      border: sel ? '2px solid rgba(255,255,255,0.8)' : '2px solid rgba(255,255,255,0.15)',
                    }}
                  >
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${sel ? 'bg-white border-white' : 'border-white/30'}`}>
                      {sel && <Check size={12} style={{ color: selectedRole.accentColor }} strokeWidth={3} />}
                    </div>
                    <span className="text-white font-semibold text-sm">{pos}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Q3: Part of any team? */}
          <div>
            <p className="text-white font-bold text-sm mb-2.5">Are you part of any existing team?</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              {[
                { val: true,  label: 'Yes, I have a team' },
                { val: false, label: "No, I'm free to join" },
              ].map(opt => {
                const sel = inTeam === opt.val
                return (
                  <button
                    key={String(opt.val)}
                    onClick={() => setInTeam(opt.val)}
                    className="rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all active:scale-[0.97]"
                    style={{
                      background: sel ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.07)',
                      border: sel ? '2px solid rgba(255,255,255,0.8)' : '2px solid rgba(255,255,255,0.15)',
                    }}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
            {inTeam && (
              <input
                className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-navy-900 bg-white/90 placeholder-slate-400 outline-none focus:ring-2 focus:ring-white/50"
                placeholder="Enter your team name…"
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                autoFocus
              />
            )}
          </div>
        </div>

        {/* Confirm */}
        <div className="px-5 pb-10 pt-3 flex-shrink-0">
          <button
            onClick={handlePlayerConfirm}
            disabled={!playerType || playPositions.length === 0 || loading}
            className="w-full py-4 rounded-2xl font-extrabold text-base transition-all active:scale-[0.98] disabled:opacity-50"
            style={{ background: 'rgba(255,255,255,0.95)', color: selectedRole.accentColor }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Setting up your profile…
              </span>
            ) : 'Start as Player →'}
          </button>
          <p className="text-center text-white/40 text-xs mt-3">Your data is safe — switch back anytime.</p>
        </div>
      </div>
    )
  }

  // ── Step 1: Role picker ──────────────────────────────────────────────────────
  return (
    <div
      className="min-h-dvh flex flex-col transition-all duration-500"
      style={{ background: selectedRole.gradient }}
    >
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex-shrink-0">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-sm">CY</span>
          </div>
          <div>
            <h1 className="text-white font-extrabold text-xl leading-tight">Who are you?</h1>
            <p className="text-white/60 text-xs">Choose your role — change anytime, no OTP needed.</p>
          </div>
        </div>
      </div>

      {/* Role cards */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-3">
        {ROLES.map(role => {
          const isSelected = chosen === role.id
          const isCurrent  = role.id === currentRole

          return (
            <button
              key={role.id}
              onClick={() => setChosen(role.id)}
              className="w-full text-left rounded-2xl p-4 transition-all duration-300 active:scale-[0.98]"
              style={{
                background: isSelected ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.07)',
                border: isSelected ? '2px solid rgba(255,255,255,0.7)' : '2px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: isSelected ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)' }}
                >
                  <role.Icon size={20} className="text-white" />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-white font-extrabold text-base">{role.label}</p>
                    {isCurrent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white/80">
                        Current
                      </span>
                    )}
                    {role.id === 'player' && !isCurrent && isSelected && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white/80">
                        + Setup required
                      </span>
                    )}
                  </div>
                  <p className="text-white/60 text-xs mb-2">{role.tagline}</p>

                  {/* Features — only show for selected */}
                  {isSelected && (
                    <ul className="space-y-1 mt-1">
                      {role.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-white/80 text-xs">
                          <ChevronRight size={10} className="text-white/50 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Checkmark */}
                {isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={13} style={{ color: selectedRole.accentColor }} strokeWidth={3} />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-white/20 flex-shrink-0 mt-0.5" />
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Confirm button */}
      <div className="px-5 pb-10 pt-3 flex-shrink-0">
        <button
          onClick={handleConfirm}
          disabled={!chosen || isSameRole || loading}
          className="w-full py-4 rounded-2xl font-extrabold text-base transition-all active:scale-[0.98] disabled:opacity-50"
          style={{ background: isSameRole ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.95)', color: selectedRole.accentColor }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Setting up…
            </span>
          ) : isSameRole
            ? `You're already a ${selectedRole.label}`
            : chosen === 'player' && !isSameRole
              ? 'Continue as Player — Next →'
              : `Continue as ${selectedRole.label} →`
          }
        </button>
        {!isSameRole && (
          <p className="text-center text-white/40 text-xs mt-3">
            Your data is safe — switch back anytime.
          </p>
        )}
      </div>
    </div>
  )
}
