import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabase'
import { Check, Megaphone, Swords, ClipboardList, Scale, Building2, MapPin, ArrowLeft, ArrowRight, Shield } from 'lucide-react'

const ROLES = [
  {
    id: 'fan',
    label: 'Fan',
    Icon: Megaphone,
    color: '#0891b2',
    bg: '#ecfeff',
    border: '#a5f3fc',
    darkBg: '#164e63',
    emoji: '📣',
    tagline: 'Live the game from the stands',
    desc: 'Follow live scores, cheer for your favourite teams, and track matches happening in your city — no bat or ball required.',
  },
  {
    id: 'player',
    label: 'Player',
    Icon: Swords,
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#86efac',
    darkBg: '#14532d',
    emoji: '🏏',
    tagline: 'Build your cricket career',
    desc: 'Track your batting & bowling stats, join teams, find open matches nearby, and grow your reputation one innings at a time.',
  },
  {
    id: 'organiser',
    label: 'Organiser',
    Icon: ClipboardList,
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#93c5fd',
    darkBg: '#1e3a8a',
    emoji: '📋',
    tagline: 'Run the show',
    desc: 'Create and manage matches, build tournaments, handle team registrations, and keep cricket alive in your city.',
  },
  {
    id: 'umpire',
    label: 'Umpire',
    Icon: Scale,
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fcd34d',
    darkBg: '#78350f',
    emoji: '⚖️',
    tagline: 'Officiate with authority',
    desc: 'Get assigned to matches, build your officiating record, earn trust from teams, and grow your reputation on the field.',
  },
  {
    id: 'ground_owner',
    label: 'Ground Owner',
    Icon: Building2,
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#c4b5fd',
    darkBg: '#4c1d95',
    emoji: '🏟️',
    tagline: 'Open your ground to cricket',
    desc: 'List your ground, set pricing and availability, manage bookings, and fill every slot with cricketing action.',
  },
]

const CITIES = [
  { name: 'Bengaluru', status: 'live' },
  { name: 'Mumbai',    status: 'soon' },
  { name: 'Delhi',     status: 'soon' },
  { name: 'Pune',      status: 'soon' },
  { name: 'Chennai',   status: 'soon' },
  { name: 'Hyderabad', status: 'soon' },
  { name: 'Other',     status: 'other' },
]

export default function RoleOnboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, setUser, addToast } = useStore()

  // Pre-selected role from legacy import
  const preRole = location.state?.preSelectedRole || null

  const [step, setStep] = useState(1)           // 1 = role, 2 = city
  const [selectedRole, setSelectedRole] = useState(preRole || '')
  const [city, setCity] = useState('')
  const [customCity, setCustomCity] = useState('')
  const [consent, setConsent] = useState(false)
  const [loading, setLoading] = useState(false)

  const roleData = ROLES.find(r => r.id === selectedRole)

  const handleRoleContinue = () => {
    if (!selectedRole) return
    setStep(2)
  }

  const handleFinish = async () => {
    const finalCity = city === 'Other' ? customCity.trim() : city
    // city is stored as the city name string, objects in CITIES are just for rendering
    if (!finalCity) return
    setLoading(true)

    const updates = {
      role: selectedRole,
      roles: [selectedRole],
      city: finalCity,
      onboarded: true,
      last_role_changed_at: new Date().toISOString(),
    }
    const { error } = await supabase.from('profiles').update(updates).eq('id', user?.id)

    setLoading(false)
    if (error) {
      addToast('Something went wrong. Please try again.', 'error')
      return
    }

    setUser({ ...user, role: selectedRole, roles: [selectedRole], city: finalCity, isNew: false })
    localStorage.setItem('cricyaar_last_role', selectedRole)
    localStorage.setItem('whats_new_seen_version', 'v3')
    addToast(`Welcome to CricYaar! Let's get started.`, 'success')
    // Players go to profile setup; everyone else goes home
    if (selectedRole === 'player') {
      navigate('/player-setup')
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-brand-50 via-white to-slate-50 flex flex-col">

      {/* Header */}
      <div className="px-4 pt-12 pb-4 flex items-center gap-3">
        {step === 2 && (
          <button onClick={() => setStep(1)} className="text-navy-500 hover:text-navy-900 transition-colors">
            <ArrowLeft size={20} />
          </button>
        )}
        {/* CY Logo */}
        <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-md shadow-brand-500/30">
          <span className="text-white font-black text-sm">CY</span>
        </div>
        {/* Step indicator */}
        <div className="flex gap-1.5 ml-auto">
          {[1, 2].map(s => (
            <div key={s} className={`h-1.5 rounded-full transition-all ${s === step ? 'w-8 bg-brand-500' : s < step ? 'w-4 bg-brand-300' : 'w-4 bg-slate-200'}`} />
          ))}
        </div>
      </div>

      {step === 1 ? (
        /* ── STEP 1: Role Selection ─────────────────────────────────── */
        <div className="flex-1 flex flex-col px-4 pb-6">
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-navy-900 leading-tight">What brings you<br />to CricYaar?</h1>
            <p className="text-navy-500 text-sm mt-1">Pick your role — you can always add more later.</p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto">
            {ROLES.map(role => {
              const isSelected = selectedRole === role.id
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className="w-full text-left rounded-2xl border-2 p-4 transition-all duration-200"
                  style={{
                    borderColor: isSelected ? role.color : '#e2e8f0',
                    background: isSelected ? role.bg : 'white',
                    boxShadow: isSelected ? `0 4px 16px ${role.color}22` : '0 1px 3px rgba(0,0,0,0.04)',
                    transform: isSelected ? 'scale(1.01)' : 'scale(1)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon circle */}
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors text-xl"
                      style={{ background: isSelected ? role.color : '#f1f5f9' }}
                    >
                      {isSelected
                        ? <role.Icon size={18} color="white" />
                        : <span>{role.emoji}</span>
                      }
                    </div>

                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-navy-900 text-[15px]">{role.label}</p>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: role.color }}>
                            <Check size={11} color="white" strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-semibold mt-0.5" style={{ color: isSelected ? role.color : '#64748b' }}>
                        {role.tagline}
                      </p>
                      {isSelected && (
                        <p className="text-[12px] text-navy-600 mt-1.5 leading-relaxed">{role.desc}</p>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          <button
            className="mt-5 w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all"
            style={{
              background: selectedRole ? (roleData?.color || '#16a34a') : '#e2e8f0',
              color: selectedRole ? 'white' : '#94a3b8',
              boxShadow: selectedRole ? `0 6px 20px ${roleData?.color}44` : 'none',
            }}
            onClick={handleRoleContinue}
            disabled={!selectedRole}
          >
            Continue as {roleData?.label || 'a Yaar'}
            <ArrowRight size={18} />
          </button>
        </div>

      ) : (
        /* ── STEP 2: City ───────────────────────────────────────────── */
        <div className="flex-1 flex flex-col px-4 pb-6">
          {/* Role badge */}
          {roleData && (
            <div
              className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full text-sm font-semibold mb-5"
              style={{ background: roleData.bg, color: roleData.color, border: `1.5px solid ${roleData.border}` }}
            >
              <span>{roleData.emoji}</span>
              {roleData.label}
            </div>
          )}

          <h1 className="text-2xl font-extrabold text-navy-900 leading-tight mb-1">
            Where do you<br />play your cricket?
          </h1>
          <p className="text-navy-500 text-sm mb-6">We'll show you matches, grounds & players near you.</p>

          <div className="flex items-center gap-2 mb-4">
            <MapPin size={16} className="text-brand-500 flex-shrink-0" />
            <p className="text-navy-700 font-semibold text-sm">Select your city</p>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {CITIES.filter(c => c.status !== 'other').map(c => {
              const isSelected = city === c.name
              const isLive = c.status === 'live'
              const isSoon = c.status === 'soon'
              return (
                <button
                  key={c.name}
                  onClick={() => setCity(c.name)}
                  className="relative py-3 px-3 rounded-xl text-sm border-2 transition-all text-left"
                  style={{
                    borderColor: isSelected ? (roleData?.color || '#16a34a') : isLive ? '#bbf7d0' : '#e2e8f0',
                    background: isSelected ? (roleData?.bg || '#f0fdf4') : isLive ? '#f0fdf4' : '#fafafa',
                    color: isSelected ? (roleData?.color || '#16a34a') : isSoon ? '#94a3b8' : '#374151',
                    fontWeight: isSelected ? 700 : 500,
                  }}
                >
                  <span className="block leading-tight">{c.name}</span>
                  {isLive && (
                    <span className="inline-flex items-center gap-0.5 mt-1 text-[9px] font-bold text-green-600 bg-green-100 rounded-full px-1.5 py-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                      LIVE NOW
                    </span>
                  )}
                  {isSoon && (
                    <span className="inline-flex items-center gap-0.5 mt-1 text-[9px] font-semibold text-slate-400 bg-slate-100 rounded-full px-1.5 py-0.5">
                      Soon
                    </span>
                  )}
                </button>
              )
            })}
            <button
              onClick={() => setCity('Other')}
              className="py-3 rounded-xl text-sm font-medium border-2 transition-all col-span-2"
              style={{
                borderColor: city === 'Other' ? (roleData?.color || '#16a34a') : '#e2e8f0',
                background: city === 'Other' ? (roleData?.bg || '#f0fdf4') : 'white',
                color: city === 'Other' ? (roleData?.color || '#16a34a') : '#475569',
                fontWeight: city === 'Other' ? 700 : 500,
              }}
            >
              Other city
            </button>
          </div>

          {city === 'Other' && (
            <input
              className="cm-input mb-4"
              placeholder="Type your city…"
              value={customCity}
              onChange={e => setCustomCity(e.target.value)}
              autoFocus
            />
          )}

          <div className="mt-auto">
            {/* Consent */}
            <button
              onClick={() => setConsent(v => !v)}
              className="flex items-start gap-3 w-full text-left mb-4"
            >
              <div className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all mt-0.5 ${
                consent ? 'bg-brand-500 border-brand-500' : 'border-slate-300'
              }`}>
                {consent && <Check size={11} color="white" strokeWidth={3} />}
              </div>
              <p className="text-[11.5px] text-navy-500 leading-relaxed">
                <span className="flex items-center gap-1 mb-0.5">
                  <Shield size={11} className="text-brand-500 flex-shrink-0" />
                  <span className="font-semibold text-navy-700 text-xs">One quick thing</span>
                </span>
                I agree to CricYaar's Privacy Policy and consent to sharing my cricket profile
                with teams, organisers, and the cricket community for legitimate cricket use.
              </p>
            </button>

            <button
              className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all"
              style={{
                background: (city && (city !== 'Other' || customCity.trim()) && consent) ? (roleData?.color || '#16a34a') : '#e2e8f0',
                color: (city && (city !== 'Other' || customCity.trim()) && consent) ? 'white' : '#94a3b8',
                boxShadow: (city && (city !== 'Other' || customCity.trim()) && consent) ? `0 6px 20px ${roleData?.color}44` : 'none',
              }}
              onClick={handleFinish}
              disabled={!city || (city === 'Other' && !customCity.trim()) || !consent || loading}
              aria-busy={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Setting up…
                </span>
              ) : (
                <>Let's Play Cricket! 🏏</>
              )}
            </button>
            <p className="text-center text-xs text-navy-400 mt-3">
              CricYaar is currently live in Bengaluru — more cities coming soon!
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
