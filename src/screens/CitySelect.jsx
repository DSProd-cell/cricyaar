import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { MapPin, CheckCircle } from 'lucide-react'
import { getRoleColor } from '../lib/roleColors'

const CITIES = [
  { name: 'Bengaluru', active: true,  emoji: '🏙️' },
  { name: 'Mumbai',    active: false, emoji: '🌊' },
  { name: 'Delhi',     active: false, emoji: '🏛️' },
  { name: 'Chennai',   active: false, emoji: '🌞' },
  { name: 'Hyderabad', active: false, emoji: '💎' },
  { name: 'Kolkata',   active: false, emoji: '🎭' },
  { name: 'Pune',      active: false, emoji: '🏯' },
  { name: 'Ahmedabad', active: false, emoji: '🪁' },
]

export default function CitySelect() {
  const navigate  = useNavigate()
  const { user, setUser, addToast } = useStore()
  const roleColor = getRoleColor(user?.role)
  // Bengaluru is the only live city, so start with it chosen: Continue is
  // enabled straight away instead of looking greyed out and unclickable.
  const [selected, setSelected] = useState('Bengaluru')
  const [saving,   setSaving]   = useState(false)

  const handleContinue = async () => {
    if (!selected || saving) return
    setSaving(true)
    const defaultRole = user?.role && user.role !== 'fan' ? user.role : 'player'
    setUser({ ...user, city: selected, role: defaultRole })
    try {
      const { supabase } = await import('../lib/supabase')
      if (user?.id) {
        await supabase.from('profiles').update({ city: selected, role: defaultRole, onboarded: true }).eq('id', user.id)
      }
    } catch {}
    navigate('/ipl-pick', { state: { returnTo: '/fetch-past-record' } })
  }

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--cy-bg)' }}>
      {/* Header */}
      <div
        className="pt-12 pb-8 px-6 text-center"
        style={{ background: `linear-gradient(135deg, ${roleColor.gradientFrom}, ${roleColor.gradientTo})` }}
      >
        <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center mx-auto mb-4">
          <MapPin size={22} className="text-white" />
        </div>
        <h1 className="text-white font-black text-2xl mb-1">Your City</h1>
        <p className="text-white/75 text-sm">Where do you play cricket?</p>
      </div>

      {/* City grid */}
      <div className="flex-1 px-4 pt-6 pb-6">
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          {CITIES.map(city => {
            const isSel = selected === city.name
            return (
              <button
                key={city.name}
                onClick={() => {
                  if (city.active) { setSelected(city.name) }
                  else { addToast('Currently available in Bangalore only', 'info') }
                }}
                disabled={false}
                className="relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all"
                style={{
                  borderColor: isSel ? roleColor.primary : city.active ? 'var(--cy-border)' : 'transparent',
                  background:  isSel ? roleColor.light   : 'var(--cy-surface)',
                  opacity:     city.active ? 1 : 0.8,
                  cursor:      'pointer',
                  transform:   isSel ? 'scale(1.03)' : 'scale(1)',
                }}
              >
                <span className="text-2xl">{city.emoji}</span>
                <span
                  className="font-bold text-sm"
                  style={{ color: isSel ? roleColor.primary : city.active ? 'var(--cy-text)' : 'var(--cy-muted)' }}
                >
                  {city.name}
                </span>
                {!city.active && (
                  <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--cy-muted)' }}>
                    Coming Soon
                  </span>
                )}
                {isSel && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle size={14} style={{ color: roleColor.primary }} />
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Continue */}
        <div className="max-w-sm mx-auto mt-6 px-1 space-y-3">
          <button
            onClick={handleContinue}
            disabled={!selected || saving}
            className="w-full py-4 rounded-2xl font-bold text-white text-[15px] transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: selected ? `linear-gradient(135deg, ${roleColor.gradientFrom}, ${roleColor.gradientTo})` : 'var(--cy-muted)',
              boxShadow: selected ? '0 6px 20px rgba(0,0,0,0.25)' : 'none',
            }}
          >
            {saving ? 'Saving…' : 'Continue →'}
          </button>
          <button
            onClick={() => navigate('/ipl-pick', { state: { returnTo: '/fetch-past-record' } })}
            className="w-full py-3 font-medium text-sm"
            style={{ color: 'var(--cy-muted)' }}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}
