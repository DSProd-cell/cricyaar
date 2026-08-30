import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { Check, Swords, ClipboardList, Shield, Scale, Megaphone } from 'lucide-react'
import { ROLE_META } from '../data/mock'

const ROLES = [
  { id:'player',    label:'Player',    Icon:Swords,        desc:'Track your stats, join teams, and play in matches.' },
  { id:'organiser', label:'Organiser', Icon:ClipboardList, desc:'Create matches and tournaments, manage teams, and score live.' },
  { id:'umpire',    label:'Umpire',    Icon:Scale,          desc:'Get assigned to matches and track your umpiring record.' },
  { id:'fan',       label:'Fan',       Icon:Megaphone,      desc:'Follow live scores and match results.' },
  { id:'admin',     label:'Admin',     Icon:Shield,         desc:'Full access to all features and the admin panel.' },
]

export default function ProfileSetup() {
  const navigate = useNavigate()
  const { setUser, addToast } = useStore()
  const [name, setName]         = useState('')
  const [username, setUsername] = useState('')
  const [city, setCity]         = useState('Bengaluru')
  const [selectedRole, setSelectedRole] = useState('')   // v1: single string
  const [errors, setErrors]     = useState({})
  const [loading, setLoading]   = useState(false)

  const selectedMeta = ROLE_META[selectedRole]

  const validate = () => {
    const e = {}
    if (!name.trim() || name.trim().length < 2) e.name = 'Please enter your full name (2+ characters).'
    if (!username.trim() || username.length < 3) e.username = 'Username must be 3–20 characters.'
    if (!/^[a-z0-9_]+$/.test(username)) e.username = 'Letters, numbers, and underscores only.'
    if (!selectedRole) e.roles = 'Please select a role to continue.'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    setUser({
      id: 'p_new',
      name: name.trim(),
      username,
      city,
      role: selectedRole,
      roles: [selectedRole],
      isNew: false,
      avatar: null,
      lastRoleChangedAt: null,
    })
    addToast(`Welcome to CricYaar, ${name.split(' ')[0]}!`, 'success')
    // New users don't need to see "What's New" — everything is new to them
    localStorage.setItem('whats_new_seen_version', 'v3')
    setLoading(false)
    navigate('/role-select')
  }

  const canSubmit = name.trim().length >= 2 && username.length >= 3 && !!selectedRole

  return (
    <div className="min-h-dvh bg-gradient-to-br from-brand-50 via-white to-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-brand-500/25">
            <span className="text-white font-black text-xl">CY</span>
          </div>
          <h2 className="font-bold text-navy-900 text-xl">Set up your profile</h2>
          <p className="text-navy-500 text-sm mt-1">Tell us a bit about yourself to get started.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-6 space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-navy-700 mb-1.5">Full name <span className="text-red-500">*</span></label>
            <input className={`cm-input ${errors.name ? 'error' : ''}`} placeholder="Rohit Sharma" value={name}
              onChange={e => { setName(e.target.value); setErrors(x => ({...x, name:''})) }} autoFocus maxLength={60} />
            {errors.name && <p className="text-red-600 text-xs mt-1" role="alert">{errors.name}</p>}
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-navy-700 mb-1.5">Username <span className="text-red-500">*</span></label>
            <input className={`cm-input ${errors.username ? 'error' : ''}`} placeholder="rohit_s" value={username}
              onChange={e => { setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,'')); setErrors(x => ({...x, username:''})) }} maxLength={20} />
            {errors.username && <p className="text-red-600 text-xs mt-1" role="alert">{errors.username}</p>}
            {username.length >= 3 && !errors.username && (
              <p className="text-brand-600 text-xs mt-1 flex items-center gap-1"><Check size={12} /> @{username} is available</p>
            )}
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-semibold text-navy-700 mb-1.5">City <span className="text-navy-400 font-normal">(optional)</span></label>
            <input className="cm-input" placeholder="Bengaluru" value={city} onChange={e => setCity(e.target.value)} maxLength={40} />
            <p className="text-navy-400 text-xs mt-1">CricYaar is live in Bengaluru only for now — more cities coming soon.</p>
          </div>

          {/* Single-select role */}
          <div>
            <label className="block text-sm font-semibold text-navy-700 mb-2">
              I am a <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map(r => {
                const isSelected = selectedRole === r.id
                const meta = ROLE_META[r.id]
                return (
                  <button
                    key={r.id}
                    className={`role-card relative ${isSelected ? 'selected' : ''}`}
                    onClick={() => { setSelectedRole(r.id); setErrors(x => ({...x, roles:''})) }}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1.5"
                      style={{ background: isSelected ? `${meta.color}20` : '#f8fafc' }}
                    >
                      <r.Icon size={16} style={{ color: isSelected ? meta.color : '#94a3b8' }} />
                    </div>
                    <p className="font-semibold text-sm text-navy-900">{r.label}</p>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center">
                        <Check size={11} className="text-white" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Selected role description */}
            {selectedRole && selectedMeta && (
              <div className="mt-3 px-3 py-2.5 rounded-xl text-sm" style={{ background: selectedMeta.bg, color: selectedMeta.color }}>
                <span className="font-semibold">{ROLE_META[selectedRole]?.label}:</span> {selectedMeta.desc}
              </div>
            )}
            {errors.roles && <p className="text-red-600 text-xs mt-1" role="alert">{errors.roles}</p>}
          </div>

          <button className="btn-primary w-full" onClick={handleSubmit} disabled={!canSubmit || loading} aria-busy={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Creating profile…
              </span>
            ) : 'Get Started →'}
          </button>
        </div>
      </div>
    </div>
  )
}
