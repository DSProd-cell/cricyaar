import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { supabase } from '../lib/supabase'
import { Check } from 'lucide-react'

export default function ProfileSetup() {
  const navigate = useNavigate()
  const { user, setUser, addToast } = useStore()
  const [name, setName]         = useState('')
  const [username, setUsername] = useState('')
  const [errors, setErrors]     = useState({})
  const [loading, setLoading]   = useState(false)

  const validate = () => {
    const e = {}
    if (!name.trim() || name.trim().length < 2) e.name = 'Please enter your full name (2+ characters).'
    if (!username.trim() || username.length < 3) e.username = 'Username must be 3–20 characters.'
    if (!/^[a-z0-9_]+$/.test(username)) e.username = 'Letters, numbers, and underscores only.'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) return
    setLoading(true)

    const { error } = await supabase
      .from('profiles')
      .update({
        name: name.trim(),
        username,
        city: 'Bengaluru',
        role: 'player',
        roles: ['player'],
        onboarded: true,
        last_role_changed_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    setLoading(false)
    if (error) {
      if (error.code === '23505') setErrors({ username: `@${username} is already taken — try another.` })
      else addToast(error.message || 'Something went wrong saving your profile.', 'error')
      return
    }

    setUser({
      ...user,
      name: name.trim(), username, city: 'Bengaluru',
      role: 'player', roles: ['player'],
      isNew: false,
    })
    localStorage.setItem('cricyaar_last_role', 'player')
    localStorage.setItem('whats_new_seen_version', 'v3')
    addToast(`Welcome to CricYaar, ${name.trim().split(' ')[0]}! 🏏`, 'success')
    // Go to cricket style setup (one-time), then IPL pick → home
    navigate('/player-setup')
  }

  const canSubmit = name.trim().length >= 2 && username.length >= 3

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-brand-500/25">
            <span className="text-white font-black text-xl">CY</span>
          </div>
          <h2 className="font-bold text-navy-900 text-xl">Set up your profile</h2>
          <p className="text-navy-500 text-sm mt-1">Tell us a bit about yourself to get started.</p>
        </div>

        <div className="bg-[var(--cy-surface)] rounded-2xl shadow-card p-6 space-y-5">
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
              <p className="text-brand-600 text-xs mt-1 flex items-center gap-1"><Check size={12} /> @{username}</p>
            )}
          </div>

          {/* City — locked to Bengaluru (only live city) */}
          <div>
            <label className="block text-sm font-semibold text-navy-700 mb-1.5">City</label>
            <div className="cm-input flex items-center justify-between bg-slate-50 cursor-not-allowed select-none">
              <span className="font-semibold text-navy-800">Bengaluru</span>
              <span className="text-[10px] font-bold text-brand-600 bg-brand-50 border border-brand-200 rounded-full px-2 py-0.5 uppercase tracking-wide">Live</span>
            </div>
            <p className="text-navy-400 text-xs mt-1">Other cities coming soon — currently available in Bengaluru only.</p>
          </div>

          {/* Role info — always Player, no selection needed */}
          <div className="px-3 py-3 rounded-xl bg-purple-50 border border-purple-100">
            <p className="text-sm font-semibold text-purple-700">🏏 You'll start as a Player</p>
            <p className="text-xs text-purple-500 mt-0.5">Unlock Umpire, Organiser &amp; Ground Owner roles anytime inside the app after KYC + Pro.</p>
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
