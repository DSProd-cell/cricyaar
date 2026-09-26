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
  const { user, setUser } = useStore()
  const roleColor = getRoleColor(user?.role)
  const [selected, setSelected] = useState('')
  const [saving,   setSaving]   = useState(false)

  const handleContinue = async () => {
    if (!selected || saving) return
    setSaving(true)
    setUser({ ...user, city: selected })
    try {
      const { supabase } = await import('../lib/supabase')
      if (user?.id) {
        await supabase.from('profiles').update({ city: selected }).eq('id', user.id)
      }
    } catch {}
    navigate('/role-select')
  }

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50">
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
                onClick={() => city.active && setSelected(city.name)}
                disabled={!city.active}
                className="relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all"
                style={{
                  borderColor: isSel ? roleColor.primary : city.active ? '#e2e8f0' : '#f1f5f9',
                  background:  isSel ? roleColor.light   : city.active ? '#fff'    : '#f8fafc',
                  opacity:     city.active ? 1 : 0.6,
                  cursor:      city.active ? 'pointer' : 'not-allowed',
                  transform:   isSel ? 'scale(1.03)' : 'scale(1)',
                }}
              >
                <span className="text-2xl">{city.emoji}</span>
                <span
                  className="font-bold text-sm"
                  style={{ color: isSel ? roleColor.primary : city.active ? '#1e293b' : '#94a3b8' }}
                >
                  {city.name}
                </span>
                {!city.active && (
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
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
            className="w-full py-4 rounded-2xl font-bold text-white text-[15px] transition-all active:scale-[0.98] disabled:opacity-40"
            style={{
              background: selected
                ? `linear-gradient(135deg, ${roleColor.gradientFrom}, ${roleColor.gradientTo})`
                : '#94a3b8',
            }}
          >
            {saving ? 'Saving…' : 'Continue →'}
          </button>
          <button
            onClick={() => navigate('/role-select')}
            className="w-full py-3 text-slate-400 font-medium text-sm"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}
