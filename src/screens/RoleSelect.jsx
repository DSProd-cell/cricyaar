import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { ROLE_META } from '../data/mock'
import { Check, Activity, BarChart2, Eye, Tv } from 'lucide-react'

// Admin is NOT a user-selectable role — provisioned server-side only
const ROLES = [
  { id:'fan',       label:'Fan',       Icon:Tv,        desc:'Follow live scores in your city. Free forever.' },
  { id:'player',    label:'Player',    Icon:Activity,  desc:'Track your career stats, join teams and tournaments.' },
  { id:'organiser', label:'Organiser', Icon:BarChart2, desc:'Create and manage matches, tournaments, and registrations.' },
  { id:'umpire',    label:'Umpire',    Icon:Eye,       desc:'Manage your officiating profile and request assignments.' },
]

export default function RoleSelect() {
  const navigate = useNavigate()
  const { user, setRole, addToast, proIntent, setProIntent, setShowProSheet } = useStore()
  const currentRole = user?.role || 'fan'
  // Fan is pre-selected by default (PRD v2: Fan is the default lowest-friction entry role)
  const [chosen, setChosen] = useState('fan')
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    if (!chosen || chosen === currentRole) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setRole(chosen)
    addToast(`Role changed to ${ROLE_META[chosen]?.label}`, 'success')
    setLoading(false)
    // Pro intent: show Pro subscription sheet before home loads
    if (proIntent) {
      setProIntent(false)
      setShowProSheet(true)
    }
    navigate('/')
  }

  const isSameRole = chosen === currentRole
  const chosenMeta = ROLE_META[chosen]

  return (
    <div className="min-h-dvh bg-gradient-to-br from-brand-50 via-white to-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm animate-slide-up">

        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-brand-500/25">
            <span className="text-white font-black text-xl">CY</span>
          </div>
          <h2 className="font-bold text-navy-900 text-xl">Who are you?</h2>
          <p className="text-navy-500 text-sm mt-1">You can change your role at any time — no OTP needed.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-6 space-y-4">
          {/* Role cards */}
          <div className="grid grid-cols-2 gap-2">
            {ROLES.map(r => {
              const isCurrent = r.id === currentRole
              const isSelected = chosen === r.id
              const meta = ROLE_META[r.id]

              return (
                <button
                  key={r.id}
                  className="relative border-2 rounded-xl p-4 text-center cursor-pointer transition-all"
                  style={{
                    borderColor: isSelected
                      ? (meta?.color || '#22c55e')
                      : isCurrent && !isSelected
                        ? '#f59e0b'
                        : '#e2e8f0',
                    background: isSelected
                      ? `${meta?.color || '#22c55e'}12`
                      : isCurrent && !isSelected
                        ? '#fefce8'
                        : '#fff',
                  }}
                  onClick={() => setChosen(r.id)}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1.5"
                    style={{ background: isSelected ? `${meta?.color || '#22c55e'}20` : isCurrent ? '#fef3c7' : '#f8fafc' }}
                  >
                    <r.Icon size={16} style={{ color: isSelected ? (meta?.color || '#22c55e') : isCurrent ? '#d97706' : '#94a3b8' }} />
                  </div>
                  <p className="font-semibold text-sm text-navy-900">{r.label}</p>
                  <p className="text-[10px] text-navy-400 mt-0.5 leading-tight line-clamp-2">{r.desc}</p>
                  {isCurrent && (
                    <span className="block text-[10px] font-medium mt-0.5" style={{ color:'#d97706' }}>Current</span>
                  )}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: meta?.color || '#22c55e' }}>
                      <Check size={11} className="text-white" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Description of chosen role */}
          {chosen && chosenMeta && (
            <div className="px-3 py-2.5 rounded-xl text-sm" style={{ background: chosenMeta.bg, color: chosenMeta.color }}>
              <span className="font-semibold">{chosenMeta.label}:</span> {chosenMeta.desc}
            </div>
          )}

          {/* Same role notice */}
          {isSameRole && chosen && (
            <p className="text-amber-600 text-sm text-center font-medium">
              You're already a {ROLE_META[chosen]?.label}. No change needed.
            </p>
          )}

          {/* Confirm */}
          <button
            className="btn-primary w-full"
            onClick={handleConfirm}
            disabled={!chosen || isSameRole || loading}
            aria-busy={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Switching role…
              </span>
            ) : isSameRole && chosen
              ? `You're already a ${ROLE_META[chosen]?.label}`
              : 'Confirm Role Change'}
          </button>
        </div>
      </div>
    </div>
  )
}
